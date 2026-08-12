<?php

use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::any('/', function () {
    return response()->json([
        'name' => 'Aquaku API',
        'status' => 'online',
    ]);
});

Route::any('/midtrans/notification', [OrderController::class, 'midtransNotification']);
Route::any('/api/midtrans/notification', [OrderController::class, 'midtransNotification']);
