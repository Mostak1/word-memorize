<?php

use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewWordController;
use App\Http\Controllers\WordAttemptController;
use Database\Seeders\OxfordWordsSeeder;
use Illuminate\Foundation\Application;
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
    Artisan::call('db:seed', [
        '--class' => 'OxfordWordsSeeder',
    ]);

    return response()->json([
        'message' => 'Seeder ran successfully',
        'output' => Artisan::output(),
    ]);
});

Route::get('/run-unseeder', function () {
    (new OxfordWordsSeeder())->unseed();
    return response()->json(['message' => 'Unseeded successfully']);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Exercise routes
Route::get('/exercises', [ExerciseController::class, 'index'])->name('exercise.index');
Route::get('/exercise/{id}', [ExerciseController::class, 'show'])->name('exercise.show');
Route::get('/exercise/{id}/start', [ExerciseController::class, 'start'])->name('exercise.start');
Route::get('/exercises/difficulty/{difficulty}', [ExerciseController::class, 'byDifficulty'])->name('exercise.difficulty');

// Subcategory words page  ← new
Route::get('/exercise/{groupId}/subcategory/{subcategoryId}', [ExerciseController::class, 'showSubcategory'])->name('exercise.subcategory');

Route::get('/word/{id}', [ExerciseController::class, 'showWord'])->name('word.show');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/word/{word}/know', [ReviewWordController::class, 'know'])->name('word.know');
    Route::post('/word/{word}/learn', [ReviewWordController::class, 'learn'])->name('word.learn');
});

require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';