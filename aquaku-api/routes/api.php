<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::prefix('account')->group(function (): void {
    Route::put('/profile', [AccountController::class, 'updateProfile']);
    Route::put('/shipping-address', [AccountController::class, 'updateShippingAddress']);
});

Route::prefix('admin/products')->group(function (): void {
    Route::get('/', [AdminProductController::class, 'index']);
    Route::post('/', [AdminProductController::class, 'store']);
    Route::put('/{id}', [AdminProductController::class, 'update']);
});

Route::prefix('products')->group(function (): void {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/{slug}', [ProductController::class, 'show']);
    Route::get('/{slug}/related', [ProductController::class, 'related']);
});

Route::get('/categories', [ProductController::class, 'categories']);