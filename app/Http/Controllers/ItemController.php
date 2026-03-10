<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Item;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    //List all items
    public function index()
    {
        return Item::all();
    }

    //Create new item
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:items,code',
            'quantity' => 'required|integer|min:0',
            'place_id' => 'required|exists:places,id',
            'status' => 'required|string',
        ]);
        $item = Item::create($request->all());

        // Audit log
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'items',
            'record_id' => $item->id,
            'old_value' => null,
            'new_value' => $item->toJson(),
        ]);

        return response()->json([
            'message' => 'Item created successfully',
            'item' => $item,
        ], 201);
    }

    //Show single item
    public function show($id)
    {
        $item = Item::findOrFail($id);
    }

    //Update item
    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);

        $old = $item->toJson();

        $item->update($request->all());

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'items',
            'record_id' => $item->id,
            'old_value' => $old,
            'new_value' => $item->toJson(),
        ]);

        return response()->json($item);
    }

    //Delete item
    public function destroy($id)
    {
        $item = Item::findOrFail($id);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'items',
            'record_id' => $item->id,
            'old_value' => $item->toJson(),
            'new_value' => null,
        ]);

        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully',
        ]);

    }
}