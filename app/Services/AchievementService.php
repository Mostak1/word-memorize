<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;

class AchievementService
{
  public function __construct(private CourseStreakRewardCouponService $courseStreakRewardCouponService)
  {
  }

  /**
   * Check and award achievements for a user based on their current stats.
   *
   * @param User $user
   * @return array List of newly awarded achievements
   */
  public function checkAndAwardAchievements(User $user): array
  {
    $newAchievements = [];

    // Get all achievements
    $achievements = Achievement::all();

    foreach ($achievements as $achievement) {
      if ($this->shouldAwardAchievement($user, $achievement)) {
        $userAchievement = UserAchievement::create([
          'user_id' => $user->id,
          'achievement_id' => $achievement->id,
          'awarded_at' => now(),
        ]);
        $this->courseStreakRewardCouponService->ensureForAchievement($user, $achievement);
        $newAchievements[] = $userAchievement->load('achievement');
      }
    }

    return $newAchievements;
  }

  /**
   * Check if a user should be awarded a specific achievement.
   */
  private function shouldAwardAchievement(User $user, Achievement $achievement): bool
  {
    // Skip if user already has this achievement
    if (
      UserAchievement::where('user_id', $user->id)
        ->where('achievement_id', $achievement->id)
        ->exists()
    ) {
      return false;
    }

    switch ($achievement->category) {
      case 'streak':
        return $this->checkStreakAchievement($user, $achievement);
      case 'xp':
        return $this->checkXpAchievement($user, $achievement);
      case 'morning':
        return $this->checkMorningAchievement($user, $achievement);
      case 'perfect':
        return $this->checkPerfectAchievement($user, $achievement);
      case 'words':
        return $this->checkWordsAchievement($user, $achievement);
      case 'sessions':
        return $this->checkSessionsAchievement($user, $achievement);
      case 'night':
        return $this->checkNightAchievement($user, $achievement);
      case 'mastery':
        return $this->checkMasteryAchievement($user, $achievement);
      case 'dedication':
        return $this->checkDedicationAchievement($user, $achievement);
      default:
        return false;
    }
  }

  /**
   * Check streak-based achievements.
   */
  private function checkStreakAchievement(User $user, Achievement $achievement): bool
  {
    $streak = $user->streak;
    if (!$streak)
      return false;

    return $streak->longest_streak >= $achievement->milestone_value;
  }

  /**
   * Check XP-based achievements.
   */
  private function checkXpAchievement(User $user, Achievement $achievement): bool
  {
    $xp = $user->xp;
    if (!$xp)
      return false;

    return $xp->xp_balance >= $achievement->milestone_value;
  }

  /**
   * Check morning learning achievement.
   */
  private function checkMorningAchievement(User $user, Achievement $achievement): bool
  {
    // Check if user has ever earned XP before 9 AM
    return \App\Models\UserDailyActivity::where('user_id', $user->id)
      ->where('session_xp_earned', '>', 0)
      ->whereTime('created_at', '<', '09:00:00')
      ->exists();
  }

  /**
   * Check perfect lesson achievements.
   */
  private function checkPerfectAchievement(User $user, Achievement $achievement): bool
  {
    // Count perfect quiz attempts (assuming score = 100 for perfect)
    $perfectCount = \App\Models\QuizAttempt::where('user_id', $user->id)
      ->where('score', 100)
      ->count();

    return $perfectCount >= $achievement->milestone_value;
  }

  /**
   * Check words-mastered achievements.
   */
  private function checkWordsAchievement(User $user, Achievement $achievement): bool
  {
    $masteredCount = \App\Models\WordProgress::where('user_id', $user->id)
      ->where('box', '>=', \App\Models\WordProgress::MASTERED_BOX)
      ->count();

    return $masteredCount >= $achievement->milestone_value;
  }

  /**
   * Check sessions-completed achievements.
   */
  private function checkSessionsAchievement(User $user, Achievement $achievement): bool
  {
    $sessionCount = \App\Models\UserDailyActivity::where('user_id', $user->id)
      ->where('session_xp_earned', '>', 0)
      ->count();

    return $sessionCount >= $achievement->milestone_value;
  }

  /**
   * Check night learning achievement.
   */
  private function checkNightAchievement(User $user, Achievement $achievement): bool
  {
    // Check if user has ever earned XP after 10 PM
    return \App\Models\UserDailyActivity::where('user_id', $user->id)
      ->where('session_xp_earned', '>', 0)
      ->whereTime('created_at', '>=', '22:00:00')
      ->exists();
  }

  /**
   * Check mastery test achievements.
   */
  private function checkMasteryAchievement(User $user, Achievement $achievement): bool
  {
    if ($achievement->key === 'mastery_flawless') {
      return \App\Models\QuizAttempt::where('user_id', $user->id)
        ->where('score', 100)
        ->exists();
    }

    $passedCount = \App\Models\QuizAttempt::where('user_id', $user->id)
      ->where('passed', true)
      ->count();

    return $passedCount >= $achievement->milestone_value;
  }

  /**
   * Check dedication-based achievements.
   */
  private function checkDedicationAchievement(User $user, Achievement $achievement): bool
  {
    switch ($achievement->key) {
      case 'dedication_weekend_warrior':
        // Study on both Sat and Sun in the same weekend
        return \App\Models\UserDailyActivity::where('user_id', $user->id)
          ->whereIn(\DB::raw('DAYOFWEEK(activity_date)'), [1, 7]) // 1=Sun, 7=Sat
          ->groupBy(\DB::raw('YEARWEEK(activity_date)'))
          ->havingRaw('COUNT(DISTINCT DAYOFWEEK(activity_date)) = 2')
          ->exists();

      case 'dedication_comeback_kid':
        // Return after a 7-day break (gap between activities > 7 days)
        // This is a bit complex, let's look for any two activities with > 7 day gap
        $activities = \App\Models\UserDailyActivity::where('user_id', $user->id)
          ->orderBy('activity_date')
          ->pluck('activity_date');

        for ($i = 1; $i < count($activities); $i++) {
          if ($activities[$i]->diffInDays($activities[$i - 1]) >= 7) {
            return true;
          }
        }
        return false;

      case 'dedication_30_days':
      case 'dedication_100_days':
        $daysCount = \App\Models\UserDailyActivity::where('user_id', $user->id)
          ->count();
        return $daysCount >= $achievement->milestone_value;

      case 'dedication_list_finisher':
        // Complete every word in a word list
        $lists = \App\Models\WordList::withCount('words')->get();
        foreach ($lists as $list) {
          $masteredInList = \App\Models\WordProgress::where('user_id', $user->id)
            ->whereIn('word_id', $list->words->pluck('id'))
            ->where('box', '>=', \App\Models\WordProgress::MASTERED_BOX)
            ->count();

          if ($masteredInList > 0 && $masteredInList === $list->words_count) {
            return true;
          }
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Get user's achievements with progress information.
   */
  public function getUserAchievements(User $user): array
  {
    $achievements = Achievement::all();
    $userAchievements = $user->userAchievements()->with('achievement')->get();

    $earnedIds = $userAchievements->pluck('achievement_id')->toArray();

    $result = [];

    foreach ($achievements as $achievement) {
      $earned = in_array($achievement->id, $earnedIds);
      $progress = $this->getAchievementProgress($user, $achievement);
      $rewardCoupon = $earned
        ? $this->courseStreakRewardCouponService->payloadForAchievement($user, $achievement)
        : null;

      $result[] = [
        'achievement' => $achievement,
        'earned' => $earned,
        'progress' => $progress,
        'earned_at' => $earned ? $userAchievements->where('achievement_id', $achievement->id)->first()->awarded_at : null,
        'reward_coupon' => $rewardCoupon,
      ];
    }

    return $result;
  }

  /**
   * Get progress toward an achievement.
   */
  private function getAchievementProgress(User $user, Achievement $achievement): array
  {
    switch ($achievement->category) {
      case 'streak':
        $current = $user->streak ? $user->streak->longest_streak : 0;
        return [
          'current' => $current,
          'target' => $achievement->milestone_value,
          'percentage' => min(100, ($current / $achievement->milestone_value) * 100),
        ];

      case 'xp':
        $current = $user->xp ? $user->xp->xp_balance : 0;
        return [
          'current' => $current,
          'target' => $achievement->milestone_value,
          'percentage' => min(100, ($current / $achievement->milestone_value) * 100),
        ];

      case 'morning':
        $hasEarned = $this->checkMorningAchievement($user, $achievement);
        return [
          'current' => $hasEarned ? 1 : 0,
          'target' => 1,
          'percentage' => $hasEarned ? 100 : 0,
        ];

      case 'perfect':
        $current = \App\Models\QuizAttempt::where('user_id', $user->id)
          ->where('score', 100)
          ->count();
        return [
          'current' => $current,
          'target' => $achievement->milestone_value,
          'percentage' => min(100, ($current / $achievement->milestone_value) * 100),
        ];

      case 'words':
        $current = \App\Models\WordProgress::where('user_id', $user->id)
          ->where('box', '>=', \App\Models\WordProgress::MASTERED_BOX)
          ->count();
        return [
          'current' => $current,
          'target' => $achievement->milestone_value,
          'percentage' => min(100, ($current / $achievement->milestone_value) * 100),
        ];

      case 'sessions':
        $current = \App\Models\UserDailyActivity::where('user_id', $user->id)
          ->where('session_xp_earned', '>', 0)
          ->count();
        return [
          'current' => $current,
          'target' => $achievement->milestone_value,
          'percentage' => min(100, ($current / $achievement->milestone_value) * 100),
        ];

      case 'night':
        $hasEarned = $this->checkNightAchievement($user, $achievement);
        return [
          'current' => $hasEarned ? 1 : 0,
          'target' => 1,
          'percentage' => $hasEarned ? 100 : 0,
        ];

      case 'mastery':
        if ($achievement->key === 'mastery_flawless') {
          $hasEarned = \App\Models\QuizAttempt::where('user_id', $user->id)
            ->where('score', 100)
            ->exists();
          return [
            'current' => $hasEarned ? 1 : 0,
            'target' => 1,
            'percentage' => $hasEarned ? 100 : 0,
          ];
        }
        $current = \App\Models\QuizAttempt::where('user_id', $user->id)
          ->where('passed', true)
          ->count();
        return [
          'current' => $current,
          'target' => $achievement->milestone_value,
          'percentage' => min(100, ($current / $achievement->milestone_value) * 100),
        ];

      case 'dedication':
        $hasEarned = $this->checkDedicationAchievement($user, $achievement);
        return [
          'current' => $hasEarned ? $achievement->milestone_value : 0,
          'target' => $achievement->milestone_value,
          'percentage' => $hasEarned ? 100 : 0,
        ];

      default:
        return [
          'current' => 0,
          'target' => $achievement->milestone_value,
          'percentage' => 0,
        ];
    }
  }
}
