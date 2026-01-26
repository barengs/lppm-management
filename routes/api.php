<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
    Route::post('me', [AuthController::class, 'me'])->name('me');
});


// Public Routes
Route::get('posts/public', [App\Http\Controllers\PostController::class, 'index']);
Route::get('documents/public', [App\Http\Controllers\DocumentController::class, 'index']);
Route::get('organization-members/public', [App\Http\Controllers\OrganizationMemberController::class, 'index']);

Route::middleware(['auth:api'])->group(function () {
    Route::get('fiscal-years', [App\Http\Controllers\FiscalYearController::class, 'index']);
    Route::get('fiscal-years/active', [App\Http\Controllers\FiscalYearController::class, 'active']);
    
    Route::apiResource('schemes', App\Http\Controllers\SchemeController::class);
    Route::apiResource('proposals', App\Http\Controllers\ProposalController::class);

    Route::apiResource('posts', App\Http\Controllers\PostController::class);
    Route::apiResource('documents', App\Http\Controllers\DocumentController::class);
    
    Route::get('profile/me', [App\Http\Controllers\ProfileController::class, 'me']);
    Route::post('profile/update', [App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('profile/stats', [App\Http\Controllers\ProfileController::class, 'updateStats']);

    // Architecture Refinements
    Route::apiResource('reports', App\Http\Controllers\ReportController::class);
    Route::apiResource('galleries', App\Http\Controllers\GalleryController::class);
    Route::apiResource('organization-members', App\Http\Controllers\OrganizationMemberController::class);
});


Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});
