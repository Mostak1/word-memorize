<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserStreak;
use App\Models\UserDailyActivity;
use Carbon\Carbon;

class StreakService
{
  public function __construct(private XpService $xpService)
  {
  }

  /**
   * Call this when a user completes a quiz or exercise session.
   * This is the ONLY place streak advances — not on login.
   *
   * Gap bridging logic:
   *
   *   0 days gap  (active yesterday) → consecutive, increment
   *   1 day gap   (missed exactly 1 day) + auto-save available → bridge silently, increment
   *   1 day gap   + auto-save already used this week → streak resets to 1
   *   2+ days gap → streak resets to 1 regardless
   *
   * Idempotent — safe to call multiple times per day.
   */
  public function recordActivity(User $user): UserStreak
  {
    $today = Carbon::today();
    $streak = $this->getOrCreate($user);

    // Already recorded today — nothing to do
    if ($streak->last_activity_date?->isToday()) {
      return $streak;
    }

    // Log today's activity
    UserDailyActivity::updateOrCreate(
      ['user_id' => $user->id, 'activity_date' => $today],
      ['completed' => true]
    );

    // ── Calculate new streak ──────────────────────────────────────────────

    if (!$streak->last_activity_date) {
      // Brand new user, first ever activity
      $newStreak = 1;

    } elseif ($streak->last_activity_date->isYesterday()) {
      // Perfect — no gap
      $newStreak = $streak->current_streak + 1;

    } else {
      $daysMissed = $streak->last_activity_date->diffInDays($today) - 1;
      // daysMissed = 1 → missed exactly one day (isFrozen territory)
      // daysMissed = 2+ → consecutive misses

      if ($daysMissed === 1 && !$streak->autoSaveUsedThisWeek()) {
        // ── Auto-save fires here ──────────────────────────────────────
        // Bridge the single missed day silently, mark auto-save as used
        $streak->last_auto_save_at = $today;

        // Back-fill the missed day in the activity log
        UserDailyActivity::updateOrCreate(
          ['user_id' => $user->id, 'activity_date' => Carbon::yesterday()],
          ['completed' => true]
        );

        $newStreak = $streak->current_streak + 1;

      } else {
        // Missed 2+ days, OR missed 1 day but auto-save already used
        $streak->last_auto_save_at = $streak->last_auto_save_at; // unchanged
        $streak->freeze_count = 0;
        $newStreak = 1;
      }
    }

    $streak->current_streak = $newStreak;
    $streak->longest_streak = max($streak->longest_streak, $newStreak);
    $streak->last_activity_date = $today;
    $streak->save();

    // Award XP for milestone if applicable
    $this->xpService->awardStreakMilestoneXp($user, $newStreak);

    return $streak;
  }

  /**
   * Award a freeze / safe day to the user (from admin, milestone reward, etc.)
   */
  public function awardFreeze(User $user, int $count = 1): UserStreak
  {
    $streak = $this->getOrCreate($user);
    $streak->increment('freeze_count', $count);

    return $streak->fresh();
  }

  /**
   * Get or create the streak record for a user.
   */
  public function getOrCreate(User $user): UserStreak
  {
    return UserStreak::firstOrCreate(
      ['user_id' => $user->id],
      [
        'current_streak' => 0,
        'longest_streak' => 0,
        'last_activity_date' => null,
        'freeze_count' => 0,
        'last_auto_save_at' => null,
      ]
    );
  }

  /**
   * Summary passed to the frontend as the `streak` Inertia prop.
   *
   * States are mutually exclusive (checked in order):
   *   active_today → did something today ✅
   *   at_risk      → last activity yesterday, deadline is today ⚠️
   *   is_frozen    → missed 1 day, auto-save available, do something today 🧊
   *   is_broken    → missed 2+ days, or missed 1 day + auto-save spent 💀
   */
  public function getSummary(User $user): array
  {
    $streak = $this->getOrCreate($user);

    return [
      'current_streak' => $streak->current_streak,
      'longest_streak' => $streak->longest_streak,
      'freeze_count' => $streak->freeze_count,
      'active_today' => $streak->isActiveToday(),
      'at_risk' => $streak->isAtRisk(),
      'is_frozen' => $streak->isFrozen(),
      'is_broken' => $streak->isBroken(),
      // Whether auto-save is still available this week
      'auto_save_available' => !$streak->autoSaveUsedThisWeek(),
    ];
  }
}