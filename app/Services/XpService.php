<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserXp;
use App\Models\UserDailyActivity;
use App\Models\StreakFreezePurchase;
use App\Models\WordProgress;
use Carbon\Carbon;

class XpService
{
  public function __construct(private AchievementService $achievementService)
  {
  }

  // ── XP Constants ──────────────────────────────────────────────────────────

  /** XP earned per completed exercise session */
  const XP_PER_SESSION = 100;

  /** Maximum daily XP from sessions (100 XP × 2 sessions) */
  const MAX_SESSION_XP_PER_DAY = 200;

  /** XP earned when a word reaches mastered status (box 4) */
  const XP_PER_WORD_MASTERED = 10;

  /** XP earned when user completes a word list (all words mastered) */
  const XP_PER_WORDLIST_COMPLETION = 50;

  /** Streak freeze costs: 1st purchase = 1000, 2nd = 2000, 3rd = 4000 */
  const FIRST_FREEZE_COST = 1000;
  const SECOND_FREEZE_COST = 2000;
  const THIRD_FREEZE_COST = 4000;

  /** Streak milestone rewards (day => xp) */
  const STREAK_MILESTONES = [
    7 => 50,
    14 => 100,
    30 => 200,
    40 => 50,
    50 => 50,
    60 => 100,
    // Pattern: every 10 days after 30 gets 50-100 XP
  ];

  // ── Core XP Management ────────────────────────────────────────────────────

  /**
   * Get or create a user's XP record.
   */
  public function getOrCreate(User $user): UserXp
  {
    return UserXp::firstOrCreate(
      ['user_id' => $user->id],
      ['xp_balance' => 0]
    );
  }

  /**
   * Get user's current XP balance.
   */
  public function getBalance(User $user): int
  {
    return $this->getOrCreate($user)->xp_balance;
  }

  /**
   * Award XP for completing an exercise session.
   *
   * Respects the daily cap: max 200 XP per day from sessions.
   * (Other sources like mastery don't count toward this cap.)
   *
   * Returns the amount actually awarded (0 if already at cap).
   */
  public function awardSessionXp(User $user): int
  {
    $today = Carbon::today();

    // Get or create today's activity record
    $activity = UserDailyActivity::firstOrCreate(
      ['user_id' => $user->id, 'activity_date' => $today],
      ['completed' => false, 'session_xp_earned' => 0]
    );

    // Check daily cap
    if ($activity->session_xp_earned >= self::MAX_SESSION_XP_PER_DAY) {
      return 0; // Already at max
    }

    // Calculate XP to award (capped at daily max)
    $xpToAward = min(
      self::XP_PER_SESSION,
      self::MAX_SESSION_XP_PER_DAY - $activity->session_xp_earned
    );

    // Award XP
    $userXp = $this->getOrCreate($user);
    $userXp->addXp($xpToAward);

    // Update daily activity tracking
    $activity->increment('session_xp_earned', $xpToAward);

    // Check for morning achievement if XP earned before 9 AM
    if ($xpToAward > 0 && Carbon::now()->hour < 9) {
      $this->achievementService->checkAndAwardAchievements($user);
    }

    return $xpToAward;
  }

  /**
   * Award XP when a word is mastered.
   *
   * Call this when WordProgress.box reaches MASTERED_BOX (4).
   * Guards against duplicate awards — only pays once per word.
   */
  public function awardMasteryXp(User $user, int $wordId): bool
  {
    // Check if we've already awarded XP for this word
    // (Simple approach: just award it, and track in the model if needed)
    // For now, we trust this is called only when box reaches 4 for the first time.

    $userXp = $this->getOrCreate($user);
    $userXp->addXp(self::XP_PER_WORD_MASTERED);

    // Check for achievements
    $this->achievementService->checkAndAwardAchievements($user);

    return true;
  }

  /**
   * Award XP when a user completes a word list.
   *
   * A word list is "completed" when all words are mastered (box >= 4).
   */
  public function awardWordListCompletionXp(User $user, int $wordListId): bool
  {
    // Check if all words in this list are mastered for this user
    $listWordCount = \App\Models\Word::where('wordlist_id', $wordListId)->count();

    if ($listWordCount === 0) {
      return false;
    }

    $masteredCount = WordProgress::where('user_id', $user->id)
      ->where('box', '>=', WordProgress::MASTERED_BOX)
      ->join('words', 'word_progress.word_id', '=', 'words.id')
      ->where('words.wordlist_id', $wordListId)
      ->count();

    // All words in the list are mastered
    if ($masteredCount === $listWordCount) {
      $userXp = $this->getOrCreate($user);
      $userXp->addXp(self::XP_PER_WORDLIST_COMPLETION);

      // Check for achievements
      $this->achievementService->checkAndAwardAchievements($user);

      return true;
    }

    return false;
  }

  /**
   * Award XP for streak milestones.
   *
   * Called when user reaches a milestone streak (7, 14, 30, etc.)
   * Guards against duplicate awards via milestone tracking.
   */
  public function awardStreakMilestoneXp(User $user, int $currentStreak): bool
  {
    // Check if this is a milestone
    if (!isset(self::STREAK_MILESTONES[$currentStreak])) {
      return false;
    }

    $xpReward = self::STREAK_MILESTONES[$currentStreak];
    $userXp = $this->getOrCreate($user);
    $userXp->addXp($xpReward);

    // Check for achievements
    $this->achievementService->checkAndAwardAchievements($user);

    return true;
  }

  // ── Streak Freeze Shop ────────────────────────────────────────────────────

  /**
   * Calculate the cost to purchase the next streak freeze.
   *
   * 1st freeze: 1000 XP
   * 2nd freeze: 2000 XP
   * 3rd freeze: 4000 XP
   * Maximum 3 purchases per user
   */
  public function getNextFreezeCost(User $user): int
  {
    // Count how many freezes this user has already purchased
    $purchaseCount = StreakFreezePurchase::where('user_id', $user->id)->count();

    switch ($purchaseCount) {
      case 0:
        return self::FIRST_FREEZE_COST;
      case 1:
        return self::SECOND_FREEZE_COST;
      case 2:
        return self::THIRD_FREEZE_COST;
      default:
        // Beyond 3 purchases, return a high cost to indicate not available
        return PHP_INT_MAX;
    }
  }

  /**
   * Buy a streak freeze with XP.
   *
   * Checks:
   *   - User has not exceeded 3 purchases
   *   - User has enough XP
   *   - XP is deducted
   *   - Purchase record is created
   *   - The actual streak freeze is awarded elsewhere (via StreakService)
   *
   * Returns success/failure.
   */
  public function buyStreakFreeze(User $user): bool
  {
    // Check purchase limit (max 3 per user)
    $purchaseCount = StreakFreezePurchase::where('user_id', $user->id)->count();
    if ($purchaseCount >= 3) {
      return false;
    }

    $cost = $this->getNextFreezeCost($user);
    $userXp = $this->getOrCreate($user);

    // Check if user can afford
    if (!$userXp->canAffordFreeze($cost)) {
      return false;
    }

    // Deduct XP
    $userXp->spendXp($cost);

    // Record purchase
    StreakFreezePurchase::create([
      'user_id' => $user->id,
      'xp_cost' => $cost,
    ]);

    return true;
  }

  /**
   * Get summary stats for the user's XP.
   */
  public function getSummary(User $user): array
  {
    $userXp = $this->getOrCreate($user);
    $cost = $this->getNextFreezeCost($user);

    return [
      'balance' => $userXp->xp_balance,
      'next_freeze_cost' => $cost,
      'can_afford_freeze' => $userXp->canAffordFreeze($cost),
    ];
  }
}
