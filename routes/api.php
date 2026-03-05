<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ApiKeyController;
use App\Http\Controllers\Api\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    
    // Core Chat System
    Route::post('/chat', [ChatController::class, 'sendMessage']);
    Route::get('/history', [ChatController::class, 'getHistory']);
    Route::delete('/history/{id}', [ChatController::class, 'deleteChat']);
    
    // Ollama Specific
    Route::get('/ollama/models', [ChatController::class, 'getOllamaModels']);
    
    // User Settings & Personalization
    Route::get('/user/personalization', [AuthController::class, 'getPersonalization']);
    Route::post('/user/personalization', [AuthController::class, 'savePersonalization']);

    // API Keys
    Route::get('/user/tokens', [ApiKeyController::class, 'index']);
    Route::post('/user/tokens', [ApiKeyController::class, 'store']);
    Route::delete('/user/tokens/{id}', [ApiKeyController::class, 'destroy']);

    // Invoice Management
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices/upload', [InvoiceController::class, 'upload']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'status']);
    
    // Admin Dashboard (Restricted to super_admin/tenant_admin)
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
    });
});
