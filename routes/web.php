<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\InviteEntryController;
use App\Http\Middleware\ResetDevInterview;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/talk');

Route::get('/invites', [InviteEntryController::class, 'show']);

Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/auth/logout', [GoogleAuthController::class, 'logout']);

Route::middleware(ResetDevInterview::class)->group(function () {
    Route::view('/talk', 'app');
    Route::view('/talk/{any?}', 'app')->where('any', '.*');
});

Route::view('/admin', 'app');
Route::view('/admin/{any?}', 'app')->where('any', '.*');
