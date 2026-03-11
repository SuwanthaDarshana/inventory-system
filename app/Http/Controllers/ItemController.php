<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Item;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{

// list all items
    public function index()
    {
        return Item::with('place')->get();
    }

    // create new item
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:items,code',
            'quantity' => 'required|integer|min:0',
            'place_id' => 'required|exists:places,id',
            'status' => 'required|in:IN_STORE,BORROWED,DAMAGED,MISSING',
        ]);

        $item = DB::transaction(function () use ($request) {
            $item = Item::create($request->all());
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'CREATE',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => null,
                'new_value' => $item->toArray(),
            ]);
            return $item;
        });

        return response()->json(['message' => 'Item created', 'item' => $item], 201);
    }

    public function show($id)
    {
        $item = Item::with('place')->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        $old = $item->toArray();

        $request->validate([
            'name' => 'sometimes|required|string',
            'code' => 'sometimes|required|string|unique:items,code,' . $id,
            'quantity' => 'sometimes|required|integer|min:0',
            'place_id' => 'sometimes|required|exists:places,id',
            'status' => 'sometimes|required|in:IN_STORE,BORROWED,DAMAGED,MISSING',
        ]);

        DB::transaction(function () use ($item, $request, $old) {
            $item->update($request->all());
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'UPDATE',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => $old,
                'new_value' => $item->toArray(),
            ]);
        });

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = Item::findOrFail($id);

        DB::transaction(function () use ($item) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'DELETE',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => $item->toArray(),
                'new_value' => null,
            ]);
            $item->delete();
        });

        return response()->json(['message' => 'Item deleted']);
    }

    public function incrementQuantity(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $item = DB::transaction(function () use ($request, $id) {
            $item = Item::lockForUpdate()->findOrFail($id);
            $oldQuantity = $item->quantity;

            $item->quantity += $request->amount;
            $item->save();

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'INCREMENT_QUANTITY',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => ['quantity' => $oldQuantity],
                'new_value' => ['quantity' => $item->quantity],
            ]);

            return $item;
        });

        return response()->json($item);
    }

    public function decrementQuantity(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $item = DB::transaction(function () use ($request, $id) {
            $item = Item::lockForUpdate()->findOrFail($id);

            if ($item->quantity < $request->amount) {
                abort(422, 'Cannot decrement below zero. Available: ' . $item->quantity);
            }

            $oldQuantity = $item->quantity;
            $item->quantity -= $request->amount;
            $item->save();

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'DECREMENT_QUANTITY',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => ['quantity' => $oldQuantity],
                'new_value' => ['quantity' => $item->quantity],
            ]);

            return $item;
        });

        return response()->json($item);
    }
}