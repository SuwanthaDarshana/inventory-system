<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Item;
use Illuminate\Http\Request;

class BorrowController extends Controller
{

    // Borrow item
    public function borrow(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'borrower_name' => 'required|string',
            'contact' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'expected_return_date' => 'required|date',
        ]);

        $item = Item::lockForUpdate()->findOrFail($request->item_id);

        if ($item->quantity < $request->quantity) {
            return response()->json(['error' => 'Not enough stock'], 400);
        }

        $item->quantity -= $request->quantity;
        $item->status = 'BORROWED';
        $item->save();

        $borrow = $item->borrowRecords()->create($request->all() + ['status' => 'BORROWED']);

        // Audit log
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'BORROW',
            'table_name' => 'items',
            'record_id' => $item->id,
            'old_value' => json_encode(['quantity' => $item->quantity + $request->quantity]),
            'new_value' => json_encode(['quantity' => $item->quantity]),
        ]);

        return response()->json($borrow);
    }

    // Return item
    public function returnItem(Request $request)
    {
        $request->validate([
            'borrow_id' => 'required|exists:borrow_records,id'
        ]);

        $borrow = $request->user()->borrowRecords()->findOrFail($request->borrow_id);
        $item = Item::lockForUpdate()->findOrFail($borrow->item_id);

        $item->quantity += $borrow->quantity;
        $item->status = 'IN_STORE';
        $item->save();

        $borrow->status = 'RETURNED';
        $borrow->save();

        // Audit log
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'RETURN',
            'table_name' => 'items',
            'record_id' => $item->id,
            'old_value' => json_encode(['quantity' => $item->quantity - $borrow->quantity]),
            'new_value' => json_encode(['quantity' => $item->quantity]),
        ]);

        return response()->json($borrow);
    }
}
