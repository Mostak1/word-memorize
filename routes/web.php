<?php

use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewWordController;
use App\Http\Controllers\WordAttemptController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Redirect authenticated users to dashboard
    if (auth()->check()) {
        if (auth()->user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }

    // return Inertia::render('Welcome', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);

    return Inertia::render('Dashboard');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/exercises', [ExerciseController::class, 'index'])->name('exercise.index');
Route::get('/exercise/{id}', [ExerciseController::class, 'show'])->name('exercise.show');
Route::get('/exercise/{id}/start', [ExerciseController::class, 'start'])->name('exercise.start');
Route::get('/exercises/difficulty/{difficulty}', [ExerciseController::class, 'byDifficulty'])->name('exercise.difficulty');
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