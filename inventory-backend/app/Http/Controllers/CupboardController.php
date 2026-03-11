<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Cupboard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CupboardController extends Controller
{
    public function index() {
        return Cupboard::with('places')->get();
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required|string']);

        $cupboard = DB::transaction(function () use ($request) {
            $cupboard = Cupboard::create($request->all());
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'CREATE',
                'table_name' => 'cupboards',
                'record_id' => $cupboard->id,
                'old_value' => null,
                'new_value' => $cupboard->toArray(),
            ]);
            return $cupboard;
        });

        return response()->json($cupboard, 201);
    }

    public function show($id) {
        return Cupboard::with('places')->findOrFail($id);
    }

    public function update(Request $request, $id) {
        $cupboard = Cupboard::findOrFail($id);
        $old = $cupboard->toArray();

        $request->validate(['name' => 'required|string']);

        DB::transaction(function () use ($cupboard, $request, $old) {
            $cupboard->update($request->all());
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'UPDATE',
                'table_name' => 'cupboards',
                'record_id' => $cupboard->id,
                'old_value' => $old,
                'new_value' => $cupboard->toArray(),
            ]);
        });

        return response()->json($cupboard);
    }

    public function destroy($id) {
        $cupboard = Cupboard::findOrFail($id);

        DB::transaction(function () use ($cupboard) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'DELETE',
                'table_name' => 'cupboards',
                'record_id' => $cupboard->id,
                'old_value' => $cupboard->toArray(),
                'new_value' => null,
            ]);
            $cupboard->delete();
        });

        return response()->json(['message' => 'Cupboard deleted']);
    }
}