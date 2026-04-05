<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LinkTreeController;
use App\Http\Controllers\Admin\LinkTreeLinkController;
use App\Http\Controllers\Admin\MasteredWordController;
use App\Http\Controllers\Admin\ReviewWordController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WordListCategoryController;
use App\Http\Controllers\Admin\WordListController;
use App\Http\Controllers\Admin\WordController;
use App\Http\Controllers\Admin\WordImageController;
use App\Http\Controllers\Admin\SubcategoryController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ErrorReportController;
use App\Http\Controllers\Admin\WordListOrderController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth', 'admin'], 'prefix' => 'admin', 'as' => 'admin.'], function () {

    // ── Dashboard ──────────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Admin Profile ──────────────────────────────────────────────────────────
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // ── User Management ────────────────────────────────────────────────────────
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::patch('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::patch('/{user}/update-role', [UserController::class, 'updateRole'])->name('update-role');
        Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
    });

    Route::prefix('word-list-categories')->name('word-list-categories.')->group(function () {
        Route::post('/', [WordListCategoryController::class, 'store'])->name('store');
        Route::patch('/{category}', [WordListCategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [WordListCategoryController::class, 'destroy'])->name('destroy');
    });

    // ── Word List Management ───────────────────────────────────────────────────
    Route::prefix('word-lists')->name('word-lists.')->group(function () {
        Route::get('/', [WordListController::class, 'index'])->name('index');
        Route::post('/', [WordListController::class, 'store'])->name('store');
        Route::get('/{wordList}', [WordListController::class, 'show'])->name('show');
        Route::patch('/{wordList}', [WordListController::class, 'update'])->name('update');
        Route::delete('/{wordList}', [WordListController::class, 'destroy'])->name('destroy');

        // Words (modal-based) — admin.word-lists.words.*
        Route::prefix('{wordList}/words')->name('words.')->group(function () {
            Route::post('/', [WordController::class, 'store'])->name('store');
            Route::patch('/{word}', [WordController::class, 'update'])->name('update');
            Route::delete('/{word}', [WordController::class, 'destroy'])->name('destroy');

            // Word Images — admin.word-lists.words.images.*
            Route::prefix('{word}/images')->name('images.')->group(function () {
                Route::patch('/{wordImage}', [WordImageController::class, 'update'])->name('update');
                Route::delete('/{wordImage}', [WordImageController::class, 'destroy'])->name('destroy');
            });
        });
    });

    // ── Review Words ───────────────────────────────────────────────────────────
    Route::prefix('review-words')->name('review-words.')->group(function () {
        Route::get('/', [ReviewWordController::class, 'index'])->name('index');
        Route::delete('/{reviewWord}', [ReviewWordController::class, 'destroy'])->name('destroy');
    });

    // ── Mastered Words ─────────────────────────────────────────────────────────
    Route::prefix('mastered-words')->name('mastered-words.')->group(function () {
        Route::get('/', [MasteredWordController::class, 'index'])->name('index');
        Route::delete('/{masteredWord}', [MasteredWordController::class, 'destroy'])->name('destroy');
    });

    // ── Error Reports ──────────────────────────────────────────────────────────
    Route::prefix('error-reports')->name('error-reports.')->group(function () {
        Route::get('/', [ErrorReportController::class, 'index'])->name('index');
        Route::patch('/{errorReport}', [ErrorReportController::class, 'update'])->name('update');
        Route::delete('/{errorReport}', [ErrorReportController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('wordlist-orders')->name('wordlist-orders.')->group(function () {
        Route::get('/', [WordListOrderController::class, 'index'])->name('index');
        Route::patch('/{order}', [WordListOrderController::class, 'update'])->name('update');
        Route::delete('/{order}', [WordListOrderController::class, 'destroy'])->name('destroy');
    });

    // ── Settings ───────────────────────────────────────────────────────────────
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/', [SettingsController::class, 'update'])->name('update');
    });

    // ── Reports ────────────────────────────────────────────────────────────────
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/overview', [DashboardController::class, 'reports'])->name('overview');
        Route::get('/users', [DashboardController::class, 'userReports'])->name('users');
    });

    Route::prefix('link-tree')->name('link-tree.')->group(function () {

        Route::get('/', [LinkTreeController::class, 'index'])->name('index');

        // Profile info
        Route::patch('/profile', [LinkTreeController::class, 'updateProfile'])->name('profile.update');

        // Social links
        Route::patch('/social-links', [LinkTreeController::class, 'updateSocialLinks'])->name('social-links.update');

        // Profile images
        Route::post('/profile/image', [LinkTreeController::class, 'uploadProfileImage'])->name('profile.image.upload');
        Route::delete('/profile/image', [LinkTreeController::class, 'deleteProfileImage'])->name('profile.image.delete');
        Route::post('/profile/cover', [LinkTreeController::class, 'uploadCoverImage'])->name('profile.cover.upload');
        Route::delete('/profile/cover', [LinkTreeController::class, 'deleteCoverImage'])->name('profile.cover.delete');

        // Links CRUD + reorder + thumbnails
        Route::prefix('links')->name('links.')->group(function () {
            Route::post('/', [LinkTreeLinkController::class, 'store'])->name('store');
            Route::patch('/{link}', [LinkTreeLinkController::class, 'update'])->name('update');
            Route::patch('/{link}/toggle', [LinkTreeLinkController::class, 'toggle'])->name('toggle');
            Route::post('/reorder', [LinkTreeLinkController::class, 'reorder'])->name('reorder');
            Route::delete('/{link}', [LinkTreeLinkController::class, 'destroy'])->name('destroy');
            Route::post('/{link}/thumbnail', [LinkTreeLinkController::class, 'uploadThumbnail'])->name('thumbnail.upload');
            Route::delete('/{link}/thumbnail', [LinkTreeLinkController::class, 'deleteThumbnail'])->name('thumbnail.delete');
        });
    });
});