<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\CupboardController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuditLogController;

// Test Route
Route::get('/test', function () {
    return response()->json(['message' => 'API working fine dude hehe']);
});

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // User info for session restore
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Items
    Route::apiResource('items', ItemController::class);
    Route::post('/items/{id}/increment-quantity', [ItemController::class, 'incrementQuantity']);
    Route::post('/items/{id}/decrement-quantity', [ItemController::class, 'decrementQuantity']);

    // Borrow System
    Route::get('/borrow-records', [BorrowController::class, 'index']);
    Route::get('/borrow-records/{id}', [BorrowController::class, 'show']);
    Route::post('/borrow', [BorrowController::class, 'borrow']);
    Route::post('/return', [BorrowController::class, 'returnItem']);

    // Cupboards
    Route::get('/cupboards', [CupboardController::class, 'index']);
    Route::get('/cupboards/{id}', [CupboardController::class, 'show']);
    Route::post('/cupboards', [CupboardController::class, 'store'])->middleware('role:admin');
    Route::put('/cupboards/{id}', [CupboardController::class, 'update'])->middleware('role:admin');
    Route::delete('/cupboards/{id}', [CupboardController::class, 'destroy'])->middleware('role:admin');

    // Places
    Route::get('/places', [PlaceController::class, 'index']);
    Route::get('/places/{id}', [PlaceController::class, 'show']);
    Route::post('/places', [PlaceController::class, 'store'])->middleware('role:admin');
    Route::put('/places/{id}', [PlaceController::class, 'update'])->middleware('role:admin');
    Route::delete('/places/{id}', [PlaceController::class, 'destroy'])->middleware('role:admin');

    // Audit Logs (Admin Only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);
    });

    // Users (Admin Only)
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('users', UserController::class);
    });

});