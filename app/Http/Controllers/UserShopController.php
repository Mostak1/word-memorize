<?php

namespace App\Http\Controllers;

use App\Models\UserWordListAccess;
use App\Models\WordListCategory;
use App\Models\WordListOrderItem;
use App\Services\XpService;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserShopController extends Controller
{
  public function __construct(
    private XpService $xpService,
    private StreakService $streakService,
  ) {
  }

  /**
   * Render the combined Shop / XP Shop page.
   * Passes all locked (purchasable) word list categories so the
   * Shop tab can render them as a browseable grid.
   */
  public function index(Request $request)
  {
    $user = $request->user();

    $wordListCategories = WordListCategory::where('is_locked', true)
      ->where('status', true)
      ->withCount('wordLists')
      ->orderBy('name')
      ->get();

    $pendingCategoryIds = [];
    $accessCategoryIds = [];

    if ($user) {
      $pendingCategoryIds = WordListOrderItem::whereHas(
        'order',
        fn($q) => $q->where('user_id', $user->id)->where('status', 'pending')
      )->pluck('word_list_category_id')->unique()->values()->all();

      $accessCategoryIds = UserWordListAccess::where('user_id', $user->id)
        ->pluck('word_list_category_id')->all();
    }

    return Inertia::render('Shop', [
      'wordListCategories' => $wordListCategories,
      'pendingCategoryIds' => $pendingCategoryIds,
      'accessCategoryIds' => $accessCategoryIds,
    ]);
  }

  /**
   * Get current XP shop status (balance, freeze cost, etc).
   */
  public function getStatus(Request $request)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    $xpSummary = $this->xpService->getSummary($user);

    return response()->json([
      'xp' => $xpSummary,
      'streak' => $this->streakService->getSummary($user),
      'dark_mode_unlocked' => $this->xpService->hasDarkModeUnlocked($user),
    ]);
  }

  /**
   * Purchase a streak freeze with XP.
   */
  public function buyStreakFreeze(Request $request)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Check purchase limit (max 3 per user)
    $purchaseCount = \App\Models\StreakFreezePurchase::where('user_id', $user->id)->count();
    if ($purchaseCount >= 3) {
      return response()->json([
        'error' => 'Maximum streak freezes purchased',
        'message' => 'You can only purchase up to 3 streak freezes.',
      ], 400);
    }

    $cost = $this->xpService->getNextFreezeCost($user);
    $userXp = $this->xpService->getOrCreate($user);

    if (!$userXp->canAffordFreeze($cost)) {
      return response()->json([
        'error' => 'Insufficient XP',
        'balance' => $userXp->xp_balance,
        'required' => $cost,
      ], 400);
    }

    if ($this->xpService->buyStreakFreeze($user)) {
      $this->streakService->awardFreeze($user, 1);

      return response()->json([
        'success' => true,
        'message' => 'Streak freeze purchased!',
        'xp' => $this->xpService->getSummary($user),
        'streak' => $this->streakService->getSummary($user),
      ]);
    }

    return response()->json([
      'error' => 'Failed to purchase streak freeze',
    ], 500);
  }

  /**
   * Purchase Dark Mode unlock with XP.
   */
  public function buyDarkMode(Request $request)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    if ($this->xpService->hasDarkModeUnlocked($user)) {
      return response()->json([
        'error' => 'Already unlocked',
        'message' => 'Dark Mode is already unlocked.',
      ], 400);
    }

    $userXp = $this->xpService->getOrCreate($user);

    if ($userXp->xp_balance < \App\Services\XpService::DARK_MODE_COST) {
      return response()->json([
        'error' => 'Insufficient XP',
        'balance' => $userXp->xp_balance,
        'required' => \App\Services\XpService::DARK_MODE_COST,
      ], 400);
    }

    if ($this->xpService->buyDarkMode($user)) {
      return response()->json([
        'success' => true,
        'message' => 'Dark Mode unlocked!',
        'xp' => $this->xpService->getSummary($user),
        'streak' => $this->streakService->getSummary($user),
        'dark_mode_unlocked' => true,
      ]);
    }

    return response()->json([
      'error' => 'Failed to unlock Dark Mode',
    ], 500);
  }
}
