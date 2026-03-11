<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Item;
use App\Models\BorrowRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BorrowController extends Controller
{
    public function index()
    {
        return BorrowRecord::with(['item', 'user'])->get();
    }

    public function show($id)
    {
        $record = BorrowRecord::with(['item', 'user'])->findOrFail($id);
        return response()->json($record);
    }

    public function borrow(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'borrower_name' => 'required|string',
            'contact' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'expected_return_date' => 'required|date|after:today',
        ]);

        $borrow = DB::transaction(function () use ($request) {
            $item = Item::lockForUpdate()->findOrFail($request->item_id);

            if ($item->quantity < $request->quantity) {
                abort(422, 'Not enough stock. Available: ' . $item->quantity);
            }

            $oldQuantity = $item->quantity;
            $oldStatus = $item->status;

            $item->quantity -= $request->quantity;

            // Set status to BORROWED if all quantity is now borrowed out
            if ($item->quantity === 0) {
                $item->status = Item::STATUS_BORROWED;
            }

            $item->save();

            $borrow = BorrowRecord::create([
                'item_id' => $item->id,
                'user_id' => Auth::id(),
                'borrower_name' => $request->borrower_name,
                'contact' => $request->contact,
                'quantity' => $request->quantity,
                'borrow_date' => Carbon::today(),
                'expected_return_date' => $request->expected_return_date,
                'status' => BorrowRecord::STATUS_BORROWED,
            ]);

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'BORROW',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => ['quantity' => $oldQuantity, 'status' => $oldStatus],
                'new_value' => ['quantity' => $item->quantity, 'status' => $item->status],
            ]);

            return $borrow->load('item');
        });

        return response()->json($borrow, 201);
    }

    public function returnItem(Request $request)
    {
        $request->validate([
            'borrow_id' => 'required|exists:borrow_records,id',
        ]);

        $borrow = DB::transaction(function () use ($request) {
            $borrow = BorrowRecord::where('status', BorrowRecord::STATUS_BORROWED)
                ->findOrFail($request->borrow_id);

            $item = Item::lockForUpdate()->findOrFail($borrow->item_id);

            $oldQuantity = $item->quantity;
            $oldStatus = $item->status;

            $item->quantity += $borrow->quantity;

            // Check if there are still other active borrows for this item
            $activeBorrows = BorrowRecord::where('item_id', $item->id)
                ->where('id', '!=', $borrow->id)
                ->where('status', BorrowRecord::STATUS_BORROWED)
                ->exists();

            if (!$activeBorrows) {
                $item->status = Item::STATUS_IN_STORE;
            }

            $item->save();

            $borrow->status = BorrowRecord::STATUS_RETURNED;
            $borrow->return_date = Carbon::today();
            $borrow->save();

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'RETURN',
                'table_name' => 'items',
                'record_id' => $item->id,
                'old_value' => ['quantity' => $oldQuantity, 'status' => $oldStatus],
                'new_value' => ['quantity' => $item->quantity, 'status' => $item->status],
            ]);

            return $borrow->load('item');
        });

        return response()->json($borrow);
    }
}