<?php

use App\Http\Controllers\Api\LinkTreeController;
use App\Http\Controllers\XpShopController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('linktree')->name('api.linktree.')->group(function () {
    Route::get('/', [LinkTreeController::class, 'show'])->name('show');
    Route::get('/redirect/{link}', [LinkTreeController::class, 'redirect'])->name('redirect');
    Route::post('/{link}/click', [LinkTreeController::class, 'click'])->name('click');
});

// ── XP Shop API ───────────────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->prefix('xp-shop')->name('api.xp-shop.')->group(function () {
    Route::get('/status', [XpShopController::class, 'getStatus'])->name('status');
    Route::post('/buy-streak-freeze', [XpShopController::class, 'buyStreakFreeze'])->name('buy-freeze');
});