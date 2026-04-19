<?php

use App\Http\Controllers\Api\LinkTreeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\UserShopController;
use App\Http\Controllers\UserAchievementController;
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



// ── Achievements API ───────────────────────────────────────────────────────────

// Achievements are handled via web session auth for SPA requests.
// Route moved to routes/web.php to match existing session-authenticated API endpoints.

// ── User API ──────────────────────────────────────────────────────────────────

Route::prefix('users')->name('api.users.')->group(function () {
    Route::get('/search', [UserController::class, 'search'])->name('search');
    Route::get('/{user}', [UserController::class, 'show'])->name('show');
});

// ── Follow API ────────────────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->prefix('follow')->name('api.follow.')->group(function () {
    Route::post('/{user}', [FollowController::class, 'follow'])->name('follow');
    Route::delete('/{user}', [FollowController::class, 'unfollow'])->name('unfollow');
    Route::get('/{user}/followers', [FollowController::class, 'followers'])->name('followers');
    Route::get('/{user}/following', [FollowController::class, 'following'])->name('following');
});
