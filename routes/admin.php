<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MasteredWordController;
use App\Http\Controllers\Admin\ReviewWordController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WordListController;
use App\Http\Controllers\Admin\WordController;
use App\Http\Controllers\Admin\WordImageController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ProfileController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth', 'admin'], 'prefix' => 'admin', 'as' => 'admin.'], function () {

    // ── Dashboard ──────────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Admin Profile ──────────────────────────────────────────────────────────
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/',          [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/',        [ProfileController::class, 'update'])->name('update');
        Route::put('/password',  [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/',       [ProfileController::class, 'destroy'])->name('destroy');
    });

    // ── User Management ────────────────────────────────────────────────────────
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/',                        [UserController::class, 'index'])->name('index');
        Route::get('/create',                  [UserController::class, 'create'])->name('create');
        Route::post('/',                       [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit',             [UserController::class, 'edit'])->name('edit');
        Route::patch('/{user}',                [UserController::class, 'update'])->name('update');
        Route::delete('/{user}',               [UserController::class, 'destroy'])->name('destroy');
        Route::post('/{user}/toggle-admin',    [UserController::class, 'toggleAdmin'])->name('toggle-admin');
        Route::post('/{user}/reset-password',  [UserController::class, 'resetPassword'])->name('reset-password');
    });

    // ── Word List Management ───────────────────────────────────────────────────
    Route::prefix('word-lists')->name('word-lists.')->group(function () {
        Route::get('/',              [WordListController::class, 'index'])->name('index');
        Route::post('/',             [WordListController::class, 'store'])->name('store');
        Route::get('/{wordList}',    [WordListController::class, 'show'])->name('show');
        Route::patch('/{wordList}',  [WordListController::class, 'update'])->name('update');
        Route::delete('/{wordList}', [WordListController::class, 'destroy'])->name('destroy');

        // Words (modal-based) — admin.word-lists.words.*
        Route::prefix('{wordList}/words')->name('words.')->group(function () {
            Route::post('/',         [WordController::class, 'store'])->name('store');
            Route::patch('/{word}',  [WordController::class, 'update'])->name('update');
            Route::delete('/{word}', [WordController::class, 'destroy'])->name('destroy');

            // Word Images — admin.word-lists.words.images.*
            Route::prefix('{word}/images')->name('images.')->group(function () {
                Route::patch('/{wordImage}',  [WordImageController::class, 'update'])->name('update');
                Route::delete('/{wordImage}', [WordImageController::class, 'destroy'])->name('destroy');
            });
        });

        // Subcategories (modal-based) — admin.word-lists.subcategories.*
        Route::prefix('{wordList}/subcategories')->name('subcategories.')->group(function () {
            Route::post('/',               [SubcategoryController::class, 'store'])->name('store');
            Route::patch('/{subcategory}', [SubcategoryController::class, 'update'])->name('update');
            Route::delete('/{subcategory}',[SubcategoryController::class, 'destroy'])->name('destroy');
        });
    });

    // ── Review Words ───────────────────────────────────────────────────────────
    Route::prefix('review-words')->name('review-words.')->group(function () {
        Route::get('/',              [ReviewWordController::class, 'index'])->name('index');
        Route::delete('/{reviewWord}', [ReviewWordController::class, 'destroy'])->name('destroy');
    });

    // ── Mastered Words ─────────────────────────────────────────────────────────
    Route::prefix('mastered-words')->name('mastered-words.')->group(function () {
        Route::get('/',                  [MasteredWordController::class, 'index'])->name('index');
        Route::delete('/{masteredWord}', [MasteredWordController::class, 'destroy'])->name('destroy');
    });

    // ── Settings ───────────────────────────────────────────────────────────────
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/',  [SettingsController::class, 'index'])->name('index');
        Route::post('/', [SettingsController::class, 'update'])->name('update');
    });

    // ── Reports ────────────────────────────────────────────────────────────────
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/overview', [DashboardController::class, 'reports'])->name('overview');
        Route::get('/users',    [DashboardController::class, 'userReports'])->name('users');
    });
});