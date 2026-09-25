<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminUploadController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\HeroSlideController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Authenticated Routes
Route::middleware('auth.supabase')->group(function () {
    Route::prefix('auth')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::prefix('account')->group(function (): void {
        Route::put('/profile', [AccountController::class, 'updateProfile']);
        Route::put('/shipping-address', [AccountController::class, 'updateShippingAddress']);
        Route::get('/orders', [OrderController::class, 'userOrders']);
    });

    Route::post('gallery/{id}/like', [GalleryController::class, 'like']);
});

// Admin Routes (implicitly requires auth + admin via EnsureUserIsAdmin)
Route::middleware('admin.supabase')->group(function () {
    Route::post('/admin/uploads/images', [AdminUploadController::class, 'image']);
    Route::get('/admin/analytics', [OrderController::class, 'adminAnalytics']);

    Route::prefix('admin/products')->group(function (): void {
        Route::get('/', [AdminProductController::class, 'index']);
        Route::post('/', [AdminProductController::class, 'store']);
        Route::delete('/', [AdminProductController::class, 'destroyAll']);
        Route::put('/{id}', [AdminProductController::class, 'update']);
        Route::delete('/{id}', [AdminProductController::class, 'destroy']);
    });

    Route::prefix('admin/orders')->group(function (): void {
        Route::get('/', [OrderController::class, 'adminIndex']);
        Route::delete('/', [OrderController::class, 'adminDestroyAll']);
        Route::patch('/{id}/status', [OrderController::class, 'adminUpdateStatus']);
    });

    Route::prefix('admin/hero-slides')->group(function (): void {
        Route::get('/', [HeroSlideController::class, 'index']);
        Route::post('/', [HeroSlideController::class, 'store']);
        Route::delete('/', [HeroSlideController::class, 'destroyAll']);
        Route::delete('/{id}', [HeroSlideController::class, 'destroy']);
    });

    Route::prefix('admin/promos')->group(function (): void {
        Route::get('/', [PromoController::class, 'adminIndex']);
        Route::post('/', [PromoController::class, 'store']);
        Route::delete('/{id}', [PromoController::class, 'destroy']);
    });

    Route::prefix('admin/articles')->group(function (): void {
        Route::get('/', [ArticleController::class, 'adminIndex']);
        Route::post('/', [ArticleController::class, 'store']);
        Route::put('/{id}', [ArticleController::class, 'update']);
        Route::delete('/{id}', [ArticleController::class, 'destroy']);
    });
});

// Public API Routes
Route::get('/hero-slides', [HeroSlideController::class, 'index']);

Route::prefix('articles')->group(function (): void {
    Route::get('/', [ArticleController::class, 'index']);
    Route::get('/{slug}', [ArticleController::class, 'show']);
});

Route::prefix('products')->group(function (): void {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/{slug}', [ProductController::class, 'show']);
    Route::get('/{slug}/related', [ProductController::class, 'related']);
    Route::get('/{slug}/reviews', [ReviewController::class, 'index']);
    Route::post('/{slug}/reviews', [ReviewController::class, 'store']);
});

Route::prefix('gallery')->group(function (): void {
    Route::get('/', [GalleryController::class, 'index']);
    Route::post('/', [GalleryController::class, 'store']);
});

Route::post('/vouchers/validate', [OrderController::class, 'validateVoucher']);
Route::post('/orders/checkout', [OrderController::class, 'checkout']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);
Route::post('/orders/{orderNumber}/pay', [OrderController::class, 'pay']);
Route::any('/midtrans/notification', [OrderController::class, 'midtransNotification']);

Route::get('/categories', [ProductController::class, 'categories']);