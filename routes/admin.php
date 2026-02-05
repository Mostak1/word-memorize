<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ExerciseGroupController;
use App\Http\Controllers\Admin\WordController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ProfileController;
use Illuminate\Support\Facades\Route;

Route::group(["middleware" => "admin", "prefix" => "admin", "as" => "admin."], function () {

    // Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin Profile Management
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::patch('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::post('/{user}/toggle-admin', [UserController::class, 'toggleAdmin'])->name('toggle-admin');
    });

    // Exercise Group Management
    Route::prefix('exercise-groups')->name('exercise-groups.')->group(function () {
        Route::get('/', [ExerciseGroupController::class, 'index'])->name('index');
        Route::post('/', [ExerciseGroupController::class, 'store'])->name('store');
        Route::get('/{exerciseGroup}', [ExerciseGroupController::class, 'show'])->name('show');
        Route::patch('/{exerciseGroup}', [ExerciseGroupController::class, 'update'])->name('update');
        Route::delete('/{exerciseGroup}', [ExerciseGroupController::class, 'destroy'])->name('destroy');

        // Words (modal-based)
        Route::prefix('{exerciseGroup}/words')->name('words.')->group(function () {
            Route::post('/', [WordController::class, 'store'])->name('store');
            Route::patch('/{word}', [WordController::class, 'update'])->name('update');
            Route::delete('/{word}', [WordController::class, 'destroy'])->name('destroy');
        });
    });

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/', [SettingsController::class, 'update'])->name('update');
    });

    // Analytics & Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/overview', [DashboardController::class, 'reports'])->name('overview');
        Route::get('/users', [DashboardController::class, 'userReports'])->name('users');
    });

});