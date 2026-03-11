<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;

class UserController extends Controller
{
    // Only admin can create users
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,staff'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        // Log the creation in AuditLog
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'users',
            'record_id' => $user->id,
            'old_value' => null,
            'new_value' => $user->toJson()
        ]);

        return response()->json($user, 201);
    }

    // List all users (Admin only)
    public function index()
    {
        return User::all();
    }

    // Show specific user
    public function show($id)
    {
        return User::findOrFail($id);
    }

    // Update user info (Admin only)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $old = $user->toJson();

        $request->validate([
            'name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|required|in:admin,staff'
        ]);

        if ($request->password) {
            $request->merge(['password' => Hash::make($request->password)]);
        }

        $user->update($request->all());

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'users',
            'record_id' => $user->id,
            'old_value' => $old,
            'new_value' => $user->toJson()
        ]);

        return response()->json($user);
    }

    // Delete user (Admin only)
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'users',
            'record_id' => $user->id,
            'old_value' => $user->toJson(),
            'new_value' => null
        ]);

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}