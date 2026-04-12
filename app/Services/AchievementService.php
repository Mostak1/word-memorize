<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\Carbon;

class AchievementService
{
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
      ->whereTime('activity_date', '<', '09:00:00')
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

      $result[] = [
        'achievement' => $achievement,
        'earned' => $earned,
        'progress' => $progress,
        'earned_at' => $earned ? $userAchievements->where('achievement_id', $achievement->id)->first()->awarded_at : null,
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

      default:
        return [
          'current' => 0,
          'target' => $achievement->milestone_value,
          'percentage' => 0,
        ];
    }
  }
}