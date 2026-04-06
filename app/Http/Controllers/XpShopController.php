<?php

namespace App\Http\Controllers;

use App\Services\XpService;
use App\Services\StreakService;
use Illuminate\Http\Request;

class XpShopController extends Controller
{
  public function __construct(
    private XpService $xpService,
    private StreakService $streakService,
  ) {
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

    $cost = $this->xpService->getNextFreezeCost($user);
    $userXp = $this->xpService->getOrCreate($user);

    // Check if user can afford
    if (!$userXp->canAffordFreeze($cost)) {
      return response()->json([
        'error' => 'Insufficient XP',
        'balance' => $userXp->xp_balance,
        'required' => $cost,
      ], 400);
    }

    // Buy the freeze
    if ($this->xpService->buyStreakFreeze($user)) {
      // Award the freeze to the user
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
}
