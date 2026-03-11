<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\CupboardController;
use App\Http\Controllers\PlaceController;


 // Test Route

Route::get('/test', function () {
    return response()->json(['message' => 'API working fine']);
});

//Authentication

Route::post('/login', [AuthController::class, 'login']);


//Protected Routes (Require Login)

Route::middleware('auth:sanctum')->group(function () {

    // Items
    Route::apiResource('items', ItemController::class);

    // Cupboards
    Route::apiResource('cupboards', CupboardController::class);
    Route::get('/cupboards', [CupboardController::class, 'index']);
     Route::post('/cupboards', [CupboardController::class, 'store'])
        ->middleware('role:admin');

    // Places
    Route::apiResource('places', PlaceController::class);

    // Borrow System
    Route::post('/borrow', [BorrowController::class, 'borrow']);
    Route::post('/return', [BorrowController::class, 'returnItem']);

});