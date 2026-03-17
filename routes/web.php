<?php

use App\Http\Controllers\QuizController;
use App\Http\Controllers\WordListCategoryController;
use App\Http\Controllers\WordListController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewWordController;
use App\Http\Controllers\BookmarkController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->is_admin) {
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
    try {
        Artisan::call('db:seed', [
            '--class' => 'FluentoWordsSeeder',
            '--force' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'FluentoWordsSeeder ran successfully.',
            'output' => Artisan::output(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::get('/run-unseeder', function () {
    try {
        $seeder = new \Database\Seeders\FluentoWordsSeeder();
        $seeder->unseed();

        return response()->json([
            'status' => 'success',
            'message' => 'FluentoWordsSeeder unseeded successfully.',
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::get('/dashboard', function () {
    $userId = auth()->id();

    $masteredCount = \App\Models\MasteredWord::where('user_id', $userId)->count();
    $reviewCount = \App\Models\ReviewWord::where('user_id', $userId)->count();

    return Inertia::render('Dashboard', [
        'masteredCount' => $masteredCount,
        'reviewCount' => $reviewCount,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/wordListCategories', [WordListCategoryController::class, 'index'])->name('wordlistcategory.index');
Route::get('/wordlist-categories/{category}/wordlists', [WordListCategoryController::class, 'showWordlists'])
    ->name('wordlistcategory.wordlists');

// ── WordList routes ────────────────────────────────────────────────────────────
// Route::get('/wordlists', [WordListController::class, 'index'])->name('wordlist.index');
Route::get('/wordlist/{id}', [WordListController::class, 'show'])->name('wordlist.show');
Route::get('/wordlists/difficulty/{difficulty}', [WordListController::class, 'byDifficulty'])->name('wordlist.difficulty');

// Start entire word list
Route::get('/wordlist/{id}/start', [WordListController::class, 'start'])->name('wordlist.start');

// Subcategory browse
// Route::get(
//     '/wordlist/{wordListId}/subcategory/{subcategoryId}',
//     [WordListController::class, 'showSubcategory']
// )->name('wordlist.subcategory');

// Start subcategory session  ← was missing, caused route() error in ExerciseSubcategory
Route::get(
    '/wordlist/{wordListId}/subcategory/{subcategoryId}/start',
    [WordListController::class, 'startSubcategory']
)->name('wordlist.subcategory.start');

Route::get('/word/{id}', [WordListController::class, 'showWord'])->name('word.show');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/word/{word}/know', [ReviewWordController::class, 'know'])->name('word.know');
    Route::post('/word/{word}/learn', [ReviewWordController::class, 'learn'])->name('word.learn');

    Route::get('/quiz', [QuizController::class, 'index'])->name('quiz.index');

    Route::get('/my/mastered', [WordListController::class, 'masteredWords'])->name('words.mastered');
    Route::get('/my/review', [WordListController::class, 'reviewWords'])->name('words.review');
    Route::get('/my/review/practice', [ReviewWordController::class, 'practiceReview'])->name('words.review.practice');

    // inside the auth middleware group:
    Route::post('/word/{word}/bookmark', [BookmarkController::class, 'toggle'])->name('word.bookmark');
    Route::get('/my/bookmarks', [BookmarkController::class, 'index'])->name('words.bookmarked');
});

require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';