<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaceController extends Controller
{
     public function index() {
        return Place::with('cupboard')->get();
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'cupboard_id' => 'required|exists:cupboards,id'
        ]);

        $place = Place::create($request->all());

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'places',
            'record_id' => $place->id,
            'old_value' => null,
            'new_value' => $place->toJson(),
        ]);

        return response()->json($place, 201);
    }

    public function show($id) {
        return Place::with('cupboard')->findOrFail($id);
    }

    public function update(Request $request, $id) {
        $place = Place::findOrFail($id);
        $old = $place->toJson();

        $place->update($request->all());

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'places',
            'record_id' => $place->id,
            'old_value' => $old,
            'new_value' => $place->toJson(),
        ]);

        return response()->json($place);
    }

     public function destroy($id) {
        $place = Place::findOrFail($id);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'places',
            'record_id' => $place->id,
            'old_value' => $place->toJson(),
            'new_value' => null,
        ]);

        $place->delete();

        return response()->json(['message' => 'Place deleted']);
    }
}
