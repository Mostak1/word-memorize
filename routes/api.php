<?php

use App\Http\Controllers\Api\LinkTreeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\Mobile\AuthController as MobileAuthController;
use App\Http\Controllers\Api\Mobile\LearningController as MobileLearningController;
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

Route::prefix('mobile')->name('api.mobile.')->group(function () {
    Route::post('/register', [MobileAuthController::class, 'register'])->name('register');
    Route::post('/login', [MobileAuthController::class, 'login'])->name('login');

    Route::get('/categories', [MobileLearningController::class, 'categories'])->name('categories.index');
    Route::get('/categories/{category}/wordlists', [MobileLearningController::class, 'wordlists'])->name('categories.wordlists');
    Route::get('/wordlists/{wordList}', [MobileLearningController::class, 'wordlistDetail'])->name('wordlists.show');
    Route::get('/words/{word}', [MobileLearningController::class, 'wordDetail'])->name('words.show');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [MobileAuthController::class, 'logout'])->name('logout');
        Route::get('/me', [MobileAuthController::class, 'me'])->name('me');

        Route::get('/dashboard', [MobileLearningController::class, 'dashboard'])->name('dashboard');

        Route::get('/sessions/wordlists/{wordList}/start', [MobileLearningController::class, 'startWordlistSession'])->name('sessions.wordlists.start');
        Route::get('/sessions/revise/start', [MobileLearningController::class, 'startReviseSession'])->name('sessions.revise.start');
        Route::post('/sessions/complete', [MobileLearningController::class, 'completeSession'])->name('sessions.complete');

        Route::get('/quiz/mastery/start', [MobileLearningController::class, 'masteryQuiz'])->name('quiz.mastery.start');
        Route::get('/quiz/wordlists/{wordList}/start', [MobileLearningController::class, 'wordlistQuiz'])->name('quiz.wordlists.start');
        Route::post('/quiz/finish', [MobileLearningController::class, 'finishAutoQuiz'])->name('quiz.finish');
        Route::post('/quiz/wordlist/finish', [MobileLearningController::class, 'finishDbQuiz'])->name('quiz.wordlist.finish');

        Route::get('/bookmarks', [MobileLearningController::class, 'bookmarks'])->name('bookmarks.index');
        Route::post('/bookmarks/{word}', [MobileLearningController::class, 'toggleBookmark'])->name('bookmarks.toggle');
        Route::get('/mastered', [MobileLearningController::class, 'mastered'])->name('mastered.index');
        Route::get('/review', [MobileLearningController::class, 'reviewWords'])->name('review.index');
        Route::get('/revise/{filter?}', [MobileLearningController::class, 'revise'])->name('revise.index');

        Route::get('/settings', [MobileLearningController::class, 'settings'])->name('settings.show');
        Route::patch('/settings', [MobileLearningController::class, 'updateSettings'])->name('settings.update');

        Route::get('/achievements', [MobileLearningController::class, 'achievements'])->name('achievements.index');
        Route::get('/achievements/unseen', [MobileLearningController::class, 'unseenAchievements'])->name('achievements.unseen');
        Route::post('/achievements/mark-seen', [MobileLearningController::class, 'markAchievementsSeen'])->name('achievements.mark-seen');

        Route::get('/leaderboard', [MobileLearningController::class, 'leaderboard'])->name('leaderboard.index');
        Route::get('/profiles/{user}', [MobileLearningController::class, 'profile'])->name('profiles.show');
        Route::post('/profiles/{user}/follow', [FollowController::class, 'follow'])->name('profiles.follow');
        Route::delete('/profiles/{user}/follow', [FollowController::class, 'unfollow'])->name('profiles.unfollow');
        Route::get('/profiles/{user}/followers', [FollowController::class, 'followers'])->name('profiles.followers');
        Route::get('/profiles/{user}/following', [FollowController::class, 'following'])->name('profiles.following');
    });
});
