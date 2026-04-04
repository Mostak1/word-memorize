<?php

use App\Http\Controllers\ErrorReportController;
use App\Http\Controllers\PublicLinkTreeController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\TTSController;
use App\Http\Controllers\UserWordController;
use App\Http\Controllers\WordListCategoryController;
use App\Http\Controllers\WordListController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewWordController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\WordProgressController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\XpShopController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/tts', [TTSController::class, 'generate'])->name('tts');
Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('dashboard');
    }

    return Inertia::render('Dashboard');
})->name('home');

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    Artisan::call('migrate');

    return 'Laravel cache cleared!';
});

Route::get('/run-seeder', function () {
    $results = [];

    $seeders = [
        'AcademicWordListSeeder',
        'OxfordWordsSeeder',
    ];

    foreach ($seeders as $class) {
        try {
            Artisan::call('db:seed', ['--class' => $class, '--force' => true]);
            $output = Artisan::output();

            preg_match('/inserted:\s*(\d+),\s*updated:\s*(\d+),\s*skipped:\s*(\d+)/i', $output, $m);
            preg_match('/images added:\s*(\d+),\s*already existed \/ no file:\s*(\d+)/i', $output, $img);
            preg_match('/words_without_images:\s*(\[.*\])/i', $output, $wni);

            $results[$class] = [
                'status' => 'success',
                'inserted' => isset($m[1]) ? (int) $m[1] : null,
                'updated' => isset($m[2]) ? (int) $m[2] : null,
                'skipped' => isset($m[3]) ? (int) $m[3] : null,
                'images_added' => isset($img[1]) ? (int) $img[1] : null,
                'images_skipped' => isset($img[2]) ? (int) $img[2] : null,
                'words_without_images' => isset($wni[1]) ? json_decode($wni[1], true) : [],
            ];
        } catch (\Throwable $e) {
            $results[$class] = [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    $overallStatus = collect($results)->every(fn($r) => $r['status'] === 'success') ? 'success' : 'partial';

    return response()->json([
        'status' => $overallStatus,
        'seeders' => $results,
    ]);
});

Route::get('/run-unseeder', function () {
    try {
        $seeders = [
            \Database\Seeders\AcademicWordListSeeder::class,
            \Database\Seeders\OxfordWordsSeeder::class,
        ];
        foreach ($seeders as $seederClass) {
            app($seederClass)->unseed();
        }
        return response()->json(['status' => 'success', 'message' => 'All seeders unseeded successfully.']);
    } catch (\Throwable $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// Public LinkTree page
Route::get('/links', [PublicLinkTreeController::class, 'show'])->name('link-tree.show');

// Click tracking + redirect
Route::get('/l/{link}', [PublicLinkTreeController::class, 'redirect'])->name('link-tree.redirect');

// ── Dashboard ─────────────────────────────────────────────────────────────────
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// ── Public wordlist routes ─────────────────────────────────────────────────────
Route::get('/wordListCategories', [WordListCategoryController::class, 'index'])->name('wordlistcategory.index');
Route::get('/wordlist-categories/{category}/wordlists', [WordListCategoryController::class, 'showWordlists'])
    ->name('wordlistcategory.wordlists');

Route::get('/wordlist/{id}', [WordListController::class, 'show'])->name('wordlist.show');
Route::get('/wordlists/difficulty/{difficulty}', [WordListController::class, 'byDifficulty'])->name('wordlist.difficulty');
Route::get('/wordlist/{id}/start', [WordListController::class, 'start'])->name('wordlist.start');
Route::get('/wordlist/{wordListId}/subcategory/{subcategoryId}/start', [WordListController::class, 'startSubcategory'])
    ->name('wordlist.subcategory.start');
Route::get('/word/{id}', [WordListController::class, 'showWord'])->name('word.show');

// ── Auth-protected routes ──────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // My Words
    Route::get('/my/words', [UserWordController::class, 'index'])->name('my.words.index');
    Route::post('/my/words', [UserWordController::class, 'store'])->name('my.words.store');
    Route::put('/my/words/{word}', [UserWordController::class, 'update'])->name('my.words.update');
    Route::delete('/my/words/{word}', [UserWordController::class, 'destroy'])->name('my.words.destroy');

    // Word actions (exercise session triggers these)
    Route::post('/word/{word}/know', [ReviewWordController::class, 'know'])->name('word.know');
    Route::post('/word/{word}/learn', [ReviewWordController::class, 'learn'])->name('word.learn');
    Route::post('words/session-complete', [ReviewWordController::class, 'sessionComplete'])->name('word.session-complete');

    // Quiz
    Route::get('/quiz', [QuizController::class, 'index'])->name('quiz.index');
    Route::post('/quiz/finish', [QuizController::class, 'finish'])->name('quiz.finish');

    // Mastered / review lists
    Route::get('/my/mastered', [WordListController::class, 'masteredWords'])->name('words.mastered');
    Route::get('/my/mastered/{wordlistId}', [WordListController::class, 'masteredWordsByList'])
        ->name('words.mastered.byList');
    Route::get('/my/review', [WordListController::class, 'reviewWords'])->name('words.review');
    Route::get('/my/review/practice', [ReviewWordController::class, 'practiceReview'])->name('words.review.practice');

    // Bookmarks
    Route::post('/word/{word}/bookmark', [BookmarkController::class, 'toggle'])->name('word.bookmark');
    Route::get('/my/bookmarks', [BookmarkController::class, 'index'])->name('words.bookmarked');

    // Word Progress (demote mastered words back to review)
    Route::post('/word/{word}/demote-from-mastery', [WordProgressController::class, 'demoteFromMastery'])
        ->name('word.demote-from-mastery');

    // Error reports
    Route::post('/error-reports', [ErrorReportController::class, 'store'])->name('error-reports.store');

    // ── XP Shop ───────────────────────────────────────────────────────────────
    // Inertia page — renders the shop UI
    Route::get('/shop', function () {
        return Inertia::render('XpShop');
    })->name('xp-shop');

    // JSON API — used by AppLayout (XP balance pill) and the shop page itself
    Route::get('/api/xp-shop/status', [XpShopController::class, 'getStatus'])
        ->name('api.xp-shop.status');

    // JSON API — purchase a streak freeze
    Route::post('/api/xp-shop/buy-freeze', [XpShopController::class, 'buyStreakFreeze'])
        ->name('api.xp-shop.buy-freeze');
});

require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';