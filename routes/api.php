<?php

use App\Http\Controllers\Admin\AdminInterviewController;
use App\Http\Controllers\Admin\AdminInviteController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\AnswersController;
use App\Http\Controllers\TalkController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'service' => 'web-interviewer',
        'ok' => true,
    ]);
});

Route::middleware('interview.session')->group(function () {
    Route::get('/talk', [TalkController::class, 'show']);
    Route::patch('/talk', [TalkController::class, 'update']);
    Route::post('/answers', [AnswersController::class, 'store']);
    Route::post('/talk/complete', [TalkController::class, 'complete']);
});

Route::middleware(['admin'])->prefix('admin')->group(function () {
    Route::get('/settings', [AdminSettingsController::class, 'show']);
    Route::patch('/settings', [AdminSettingsController::class, 'update']);
    Route::post('/settings/channels', [AdminSettingsController::class, 'storeChannel']);
    Route::patch('/settings/channels/{channelKey}', [AdminSettingsController::class, 'updateChannel']);
    Route::delete('/settings/channels/{channelKey}', [AdminSettingsController::class, 'destroyChannel']);

    Route::get('/invites', [AdminInviteController::class, 'index']);
    Route::post('/invites', [AdminInviteController::class, 'store']);
    Route::get('/invites/{invite}', [AdminInviteController::class, 'show']);
    Route::post('/invites/{invite}/revoke', [AdminInviteController::class, 'revoke']);
    Route::post('/invites/{invite}/resend-copy', [AdminInviteController::class, 'resendCopy']);

    Route::get('/interviews/{interview}', [AdminInterviewController::class, 'show']);
    Route::post('/interviews/{interview}/generate-summary', [AdminInterviewController::class, 'generateSummary']);
});
