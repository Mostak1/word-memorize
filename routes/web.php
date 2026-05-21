<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ErrorReportController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicLinkTreeController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\ReviewWordController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\UserPublicProfileController;
use App\Http\Controllers\UserAchievementController;
use App\Http\Controllers\UserSettingController;
use App\Http\Controllers\UserShopController;
use App\Http\Controllers\UserXpPurchaseController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\UserWordController;
use App\Http\Controllers\UserWordListOrderController;
use App\Http\Controllers\WordListCategoryController;
use App\Http\Controllers\WordListController;
use App\Http\Controllers\WordProgressController;
use App\Http\Controllers\SideQuestController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/practice', function () {
    $categories = \App\Models\WordListCategory::where('status', true)
        ->whereHas('creator', function ($q) {
            $q->where('id', 3)->orWhere('email', 'admin@gmail.com');
        })
        ->withCount(['wordLists', 'words'])
        ->get();

    $freeWordsCount = \App\Models\Word::whereHas('wordList', function ($q) {
        $q->where('is_locked', false)
            ->whereHas('creator', function ($q) {
                $q->where('id', 3)->orWhere('email', 'admin@gmail.com');
            });
    })->count();

    return Inertia::render('Landing/Vocab', [
        'categories' => $categories,
        'freeWordsCount' => $freeWordsCount,
    ]);
})->name('vocab');

// Route::get('/vocabland', function () {
//     return view('landing/vocabland');
// })->name('vocabland');
// Route::get('/practice', function () {
//     return view('landing/practice');
// })->name('vocabland.practice');
// Route::get('/tts', [TTSController::class, 'generate'])->name('tts');

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

Route::get('/storage-link', function () {
    try {
        Artisan::call('storage:link');

        return response()->json([
            'status' => true,
            'message' => 'Storage link created successfully',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => $e->getMessage(),
        ]);
    }
});

Route::get('/run-achievement-seeder', function () {
    Artisan::call('db:seed', [
        '--class' => \Database\Seeders\AchievementSeeder::class,
        '--force' => true, // required in production
    ]);

    return 'AchievementSeeder executed successfully';
});

Route::get('/run-seeder', function (Illuminate\Http\Request $request) {
    $results = [];

    $seeders = [
        'AcademicWordListSeeder',
        'OxfordWordsSeeder',
        'GREWordListSeeder',
        'PhrasesAndIdiomsSeeder',
    ];

    foreach ($seeders as $class) {
        try {
            Artisan::call('db:seed', ['--class' => $class, '--force' => true]);
            $output = Artisan::output();

            preg_match('/inserted:\s*(\d+),\s*updated:\s*(\d+),\s*skipped:\s*(\d+),\s*deleted:\s*(\d+)/i', $output, $m);
            preg_match('/images added:\s*(\d+),\s*already existed \/ no file:\s*(\d+)/i', $output, $img);
            preg_match('/words_without_images:\s*(\[.*\])/i', $output, $wni);

            $stats = [
                'inserted' => isset($m[1])   ? (int) $m[1]   : null,
                'updated'  => isset($m[2])   ? (int) $m[2]   : null,
                'skipped'  => isset($m[3])   ? (int) $m[3]   : null,
                'deleted'  => isset($m[4])   ? (int) $m[4]   : null,
                'images_added'   => isset($img[1]) ? (int) $img[1] : null,
                'images_skipped' => isset($img[2]) ? (int) $img[2] : null,
            ];

            $noImageWords = isset($wni[1]) ? json_decode($wni[1], true) : [];

            $results[$class] = [
                'status'  => 'success',
                'summary' => "words +{$stats['inserted']} ~{$stats['updated']} -{$stats['deleted']} skip:{$stats['skipped']} | "
                           . "imgs +{$stats['images_added']} skip:{$stats['images_skipped']}"
                           . (count($noImageWords) ? ' | no-img: ' . implode(', ', $noImageWords) : ''),
                ...$stats,
                'words_without_images' => $noImageWords,
                ...($request->boolean('debug') ? ['raw_output' => $output] : []),
            ];
        } catch (\Throwable $e) {
            $results[$class] = [
                'status'  => 'error',
                'message' => $e->getMessage(),
                ...($request->boolean('debug') ? ['trace' => $e->getTraceAsString()] : []),
            ];
        }
    }

    $overallStatus = collect($results)->every(fn($r) => $r['status'] === 'success')
        ? 'success'
        : 'partial';

    return response()->json([
        'status'  => $overallStatus,
        'seeders' => $results,
    ]);
});

// Route::get('/run-unseeder', function () {
//     try {
//         $seeders = [
//             \Database\Seeders\AcademicWordListSeeder::class,
//             \Database\Seeders\OxfordWordsSeeder::class,
//             \Database\Seeders\GREWordListSeeder::class,
//         ];
//         foreach ($seeders as $seederClass) {
//             app($seederClass)->unseed();
//         }
//         return response()->json(['status' => 'success', 'message' => 'All seeders unseeded successfully.']);
//     } catch (\Throwable $e) {
//         return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
//     }
// });

// Public LinkTree page
Route::get('/links', [PublicLinkTreeController::class, 'show'])->name('link-tree.show');

// Click tracking + redirect
Route::get('/l/{link}', [PublicLinkTreeController::class, 'redirect'])->name('link-tree.redirect');

// ── Dashboard ─────────────────────────────────────────────────────────────────
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
Route::post('/streak/dismiss-broken', [DashboardController::class, 'dismissStreakBroken'])->middleware(['auth'])->name('streak.dismiss-broken');

// ── Leaderboard ───────────────────────────────────────────────────────────────
Route::get('/leaderboard', [LeaderboardController::class, 'index'])->middleware(['auth', 'verified'])->name('leaderboard');
Route::get('/users/{user}', [UserPublicProfileController::class, 'show'])->name('public.user.show');
Route::post('/users/{user}/follow', [FollowController::class, 'follow'])->middleware('auth')->name('public.user.follow');
Route::delete('/users/{user}/follow', [FollowController::class, 'unfollow'])->middleware('auth')->name('public.user.unfollow');

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
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/profile/followers', [ProfileController::class, 'followers'])->name('profile.followers');
    Route::get('/profile/following', [ProfileController::class, 'following'])->name('profile.following');
    Route::match(['post', 'patch'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings', [UserSettingController::class, 'show'])->name('settings.show');
    Route::patch('/settings', [UserSettingController::class, 'update'])->name('settings.update');

    // My Orders (user's order history)
    Route::get('/my/orders', [UserWordListOrderController::class, 'index'])
        ->name('my.orders');

    // Place an order for a locked word list CATEGORY
    // Route::post('/wordlist-categories/{category}/order', [UserWordListOrderController::class, 'store'])
    //     ->name('wordlistcategory.order.store');

    Route::post('/orders', [UserWordListOrderController::class, 'store'])
        ->name('order.store');

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
    Route::post('/quiz/wordlist/finish', [QuizController::class, 'finishWordlistQuiz'])->name('quiz.wordlist.finish');

    Route::get('/quiz', [QuizController::class, 'index'])->name('quiz.index');
    Route::get('/quiz/wordlist/{wordlist}', [QuizController::class, 'indexByWordlist'])->name('quiz.wordlist');
    // Route::post('/quiz/finish', [QuizController::class, 'finish'])->name('quiz.finish');
    Route::post('/quiz/finish', [QuizController::class, 'finish'])->name('mastery-test.finish');


    // Mastered / review lists
    Route::get('/my/mastered', [WordListController::class, 'masteredWords'])->name('words.mastered');
    Route::get('/my/mastered/{wordlistId}', [WordListController::class, 'masteredWordsByList'])
        ->name('words.mastered.byList');
    Route::get('/my/review', [WordListController::class, 'reviewWords'])->name('words.review');
    Route::get('/my/review/practice', [ReviewWordController::class, 'practiceReview'])->name('words.review.practice');

    Route::get('/my/revise', [ReviewWordController::class, 'revisePage'])->name('words.revise');
    Route::get('/my/revise/{filter}', [ReviewWordController::class, 'reviseWordsList'])->name('words.revise.list');

    // Revise exercise session (started from the Revise page)
    Route::get('/my/revise/session', [ReviewWordController::class, 'reviseSession'])->name('words.revise.session');

    // Bookmarks
    Route::post('/word/{word}/bookmark', [BookmarkController::class, 'toggle'])->name('word.bookmark');
    // Route::get('/my/bookmarks', [BookmarkController::class, 'index'])->name('words.bookmarked');
    Route::get('/bookmarks', [BookmarkController::class, 'index'])->name('words.bookmarked');

    // Word Progress (demote mastered words back to review)
    Route::post('/word/{word}/demote-from-mastery', [WordProgressController::class, 'demoteFromMastery'])
        ->name('word.demote-from-mastery');

    // Error reports
    Route::post('/error-reports', [ErrorReportController::class, 'store'])->name('error-reports.store');


    Route::get('/shop', [UserShopController::class, 'index'])->name('shop');
    Route::get('/api/xp-shop/status', [UserShopController::class, 'getStatus'])->name('api.xp-shop.status');
    Route::post('/api/xp-shop/buy-freeze', [UserShopController::class, 'buyStreakFreeze'])->name('api.xp-shop.buy-freeze');
    Route::post('/api/xp-shop/buy-dark-mode', [UserShopController::class, 'buyDarkMode'])->name('api.xp-shop.buy-dark-mode');
    Route::post('/api/xp-shop/buy-discount', [UserShopController::class, 'buyDiscountCoupon'])->name('api.xp-shop.buy-discount');
    Route::post('/api/xp-shop/buy-streak-repair', [UserShopController::class, 'buyStreakRepair'])->name('api.xp-shop.buy-streak-repair');
    Route::post('/api/xp-shop/purchase', [UserXpPurchaseController::class, 'store'])->name('api.xp-shop.purchase');

    // Achievements API
    Route::get('/api/achievements', [UserAchievementController::class, 'index'])->name('api.achievements.index');
    Route::post('/api/achievements/mark-seen', [UserAchievementController::class, 'markSeen'])->name('api.achievements.mark-seen');

    // Followed user notifications API
    Route::get('/api/followed-notifications', [NotificationController::class, 'index'])->name('api.followed-notifications.index');
    Route::post('/api/followed-notifications/mark-read', [NotificationController::class, 'markRead'])->name('api.followed-notifications.mark-read');


    // Achievements page
    Route::get('/achievements', function () {
        return Inertia::render('Achievements');
    })->name('achievements');

    // Side Quests
    Route::post('/side-quests/{category}/unlock', [SideQuestController::class, 'unlock'])->name('sidequests.unlock');
    Route::get('/side-quests/{category}/start', [SideQuestController::class, 'start'])->name('sidequests.start');
    Route::post('/side-quests/{category}/complete', [SideQuestController::class, 'complete'])->name('sidequests.complete');
});

// Temporary test route for followed user notifications (public with auto-login)
Route::get('/api/test-notifications', function () {
    $currentUser = auth()->user();
    if (!$currentUser) {
        // Auto-login the first available user in the system
        $currentUser = \App\Models\User::first();
        if (!$currentUser) {
            // Create a default test user if none exists
            $currentUser = \App\Models\User::create([
                'name' => 'Test User',
                'email' => 'test_user@vocabpix.com',
                'password' => bcrypt('password123'),
            ]);
        }
        auth()->login($currentUser);
    }

    $notifier = \App\Models\User::firstOrCreate(
        ['email' => 'followed_test_user@vocabpix.com'],
        [
            'name' => 'Emma Watson',
            'password' => bcrypt('password123'),
            'image' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
        ]
    );

    if (!$currentUser->following()->where('following_id', $notifier->id)->exists()) {
        $currentUser->following()->attach($notifier->id);
    }

    // Clear existing notifications first to ensure a clean preview state
    \App\Models\Notification::where('user_id', $currentUser->id)->delete();

    // Create a streak notification
    \App\Models\Notification::create([
        'user_id' => $currentUser->id,
        'notifier_id' => $notifier->id,
        'type' => 'streak',
        'data' => [
            'current_streak' => 15,
        ],
        'is_read' => false,
    ]);

    // Create an achievement notification
    \App\Models\Notification::create([
        'user_id' => $currentUser->id,
        'notifier_id' => $notifier->id,
        'type' => 'achievement',
        'data' => [
            'achievement_name' => 'Century Club',
            'achievement_description' => 'Mastered 100 words in VocabPix!',
            'achievement_icon' => 'trophy',
            'achievement_category' => 'words_mastered',
        ],
        'is_read' => false,
    ]);

    return redirect()->route('dashboard');
});

Route::get('/api/achievements/unseen', [UserAchievementController::class, 'getUnseen'])->name('api.achievements.unseen');

Route::post('/telemetry/batch', [TelemetryController::class, 'batch'])
    ->middleware('throttle:120,1')
    ->name('telemetry.batch');

require __DIR__ . '/auth.php';
