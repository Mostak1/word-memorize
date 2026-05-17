<?php

namespace App\Http\Controllers;

use App\Models\UserWordListAccess;
use App\Models\WordListCategory;
use App\Models\WordListOrderItem;
use App\Models\Coupon;
use App\Models\Course;
use App\Services\ReferralService;
use App\Services\XpService;
use App\Services\StreakService;
use App\Support\Telemetry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserShopController extends Controller
{
  public function __construct(
    private XpService $xpService,
    private StreakService $streakService,
    private ReferralService $referralService,
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
    $allCategoriesOffer = null;
    $availableCoupons = [];

    $adminCategoryQuery = WordListCategory::where('is_locked', true)
      ->where('status', true)
      ->whereHas('creator', fn($q) => $q->where('email', 'admin@gmail.com'));

    $adminCategoryIds = (clone $adminCategoryQuery)->pluck('id');
    $adminWordListCount = (clone $adminCategoryQuery)->withCount('wordLists')->get()->sum('word_lists_count');

    if ($user) {
      $pendingCategoryIds = WordListOrderItem::whereHas(
        'order',
        fn($q) => $q->where('user_id', $user->id)->where('status', 'pending')
      )->pluck('word_list_category_id')->unique()->values()->all();

      $accessCategoryIds = UserWordListAccess::where('user_id', $user->id)
        ->pluck('word_list_category_id')->all();

      $availableCoupons = Coupon::where('assigned_user_id', $user->id)
        ->where('is_active', true)
        ->where(function ($q) {
          $q->whereNull('max_uses')
            ->orWhereColumn('used_count', '<', 'max_uses');
        })
        ->latest()
        ->get(['code', 'discount_percent', 'description', 'used_count', 'max_uses', 'course_only', 'shop_only'])
        ->all();
    }

    if ($adminCategoryIds->isNotEmpty()) {
      $accessCollection = collect($accessCategoryIds);
      $pendingCollection = collect($pendingCategoryIds);
      $remainingCategoryIds = $adminCategoryIds->diff($accessCollection)->values();
      $pendingRemainingIds = $remainingCategoryIds->intersect($pendingCollection)->values();

      $allCategoriesOffer = [
        'id' => 'all-admin-categories',
        'name' => 'All Word List Categories',
        'description' => 'Unlock every admin word list category from admin@gmail.com.',
        'price' => 999,
        'is_locked' => true,
        'wordlists_count' => $adminWordListCount,
        'category_count' => $adminCategoryIds->count(),
        'category_ids' => $pendingRemainingIds->isEmpty()
          ? $remainingCategoryIds->all()
          : [],
        'status' => $remainingCategoryIds->isEmpty()
          ? 'owned'
          : ($pendingRemainingIds->isNotEmpty() ? 'pending' : null),
      ];
    }

    $featuredCourses = Course::where('status', 1)
      ->where('is_approved', 1)
      ->where('course_type', 'course')
      ->latest()
      ->limit(3)
      ->get(['id', 'title', 'thumbnail', 'price', 'discount', 'slug']);

    return Inertia::render('Shop', [
      'wordListCategories' => $wordListCategories,
      'pendingCategoryIds' => $pendingCategoryIds,
      'accessCategoryIds' => $accessCategoryIds,
      'allCategoriesOffer' => $allCategoriesOffer,
      'availableReferralCredits' => $user ? $this->referralService->availableCreditPayload($user) : [],
      'availableCoupons' => $availableCoupons,
      'featuredCourses' => $featuredCourses,
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
      'discount_purchased' => $this->xpService->hasPurchasedDiscountCoupon($user),
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
        'dark_mode_unlocked' => $this->xpService->hasDarkModeUnlocked($user),
      ], 400);
    }

    if ($this->xpService->buyStreakFreeze($user)) {
      $this->streakService->awardFreeze($user, 1);

      Telemetry::record($request, 'xp_shop_purchase_completed', [
        'item' => 'streak_freeze',
        'cost' => $cost,
      ]);

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
      Telemetry::record($request, 'xp_shop_purchase_completed', [
        'item' => 'dark_mode',
        'cost' => \App\Services\XpService::DARK_MODE_COST,
      ]);

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

  /**
   * Purchase 10% Discount Coupon with XP.
   */
  public function buyDiscountCoupon(Request $request)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    if ($this->xpService->hasPurchasedDiscountCoupon($user)) {
      return response()->json([
        'error' => 'Already purchased',
        'message' => 'You have already purchased the 10% discount coupon.',
      ], 400);
    }

    $userXp = $this->xpService->getOrCreate($user);

    if ($userXp->xp_balance < \App\Services\XpService::DISCOUNT_COUPON_COST) {
      return response()->json([
        'error' => 'Insufficient XP',
        'balance' => $userXp->xp_balance,
        'required' => \App\Services\XpService::DISCOUNT_COUPON_COST,
      ], 400);
    }

    if ($this->xpService->buyDiscountCoupon($user)) {
      Telemetry::record($request, 'xp_shop_purchase_completed', [
        'item' => 'discount_coupon',
        'cost' => \App\Services\XpService::DISCOUNT_COUPON_COST,
      ]);

      return response()->json([
        'success' => true,
        'message' => '10% Discount Coupon purchased!',
        'xp' => $this->xpService->getSummary($user),
        'streak' => $this->streakService->getSummary($user),
        'discount_purchased' => true,
      ]);
    }

    return response()->json([
      'error' => 'Failed to purchase discount coupon',
    ], 500);
  }

  /**
   * Purchase streak repair with XP.
   */
  public function buyStreakRepair(Request $request)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    $cost = \App\Services\XpService::STREAK_REPAIR_COST;
    $userXp = $this->xpService->getOrCreate($user);

    if ($userXp->xp_balance < $cost) {
      return response()->json([
        'error' => 'Insufficient XP',
        'balance' => $userXp->xp_balance,
        'required' => $cost,
      ], 400);
    }

    if ($this->xpService->buyStreakRepair($user)) {
      $this->streakService->repairStreak($user);

      Telemetry::record($request, 'xp_shop_purchase_completed', [
        'item' => 'streak_repair',
        'cost' => $cost,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Streak repaired successfully!',
        'xp' => $this->xpService->getSummary($user),
        'streak' => $this->streakService->getSummary($user),
      ]);
    }

    return response()->json([
      'error' => 'Failed to repair streak',
    ], 500);
  }
}
