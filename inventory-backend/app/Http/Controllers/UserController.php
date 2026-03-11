<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role
            ]);

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'CREATE',
                'table_name' => 'users',
                'record_id' => $user->id,
                'old_value' => null,
                'new_value' => $user->makeHidden('password')->toArray()
            ]);

            return $user;
        });

        return response()->json($user->makeHidden('password'), 201);
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

        $request->validate([
            'name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|required|in:admin,staff'
        ]);

        DB::transaction(function () use ($user, $request) {
            $old = $user->makeHidden('password')->toArray();

            $data = $request->only(['name', 'email', 'role']);
            if ($request->has('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'UPDATE',
                'table_name' => 'users',
                'record_id' => $user->id,
                'old_value' => $old,
                'new_value' => $user->makeHidden('password')->toArray()
            ]);
        });

        return response()->json($user->makeHidden('password'));
    }

    // Delete user (Admin only)
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        DB::transaction(function () use ($user) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'DELETE',
                'table_name' => 'users',
                'record_id' => $user->id,
                'old_value' => $user->makeHidden('password')->toArray(),
                'new_value' => null
            ]);

            $user->delete();
        });

        return response()->json(['message' => 'User deleted']);
    }
}