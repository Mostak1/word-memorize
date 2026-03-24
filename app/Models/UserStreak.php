<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class UserStreak extends Model
{
  protected $fillable = [
    'user_id',
    'current_streak',
    'longest_streak',
    'last_activity_date',
    'freeze_count',
    'last_auto_save_at',
  ];

  protected $casts = [
    'last_activity_date' => 'date',
    'last_auto_save_at' => 'date',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  // ── State helpers (mutually exclusive, checked in order) ──────────────────

  /**
   * User completed an activity today — streak is healthy.
   */
  public function isActiveToday(): bool
  {
    return $this->last_activity_date?->isToday() ?? false;
  }

  /**
   * Last activity was yesterday, nothing done today yet.
   * Streak is alive but today is the deadline.
   */
  public function isAtRisk(): bool
  {
    if ($this->isActiveToday())
      return false;

    return $this->last_activity_date?->isYesterday() ?? false;
  }

  /**
   * Missed exactly 1 day AND the weekly auto-save is still available.
   * Streak is frozen — completing a quiz or exercise today will resume it.
   */
  public function isFrozen(): bool
  {
    if ($this->isActiveToday() || $this->isAtRisk())
      return false;
    if (!$this->last_activity_date)
      return false;

    $daysMissed = $this->last_activity_date->diffInDays(Carbon::today());

    return $daysMissed === 2 && !$this->autoSaveUsedThisWeek();
  }

  /**
   * Streak is lost — missed 2+ days, or missed 1 day but auto-save was
   * already used this week.
   */
  public function isBroken(): bool
  {
    if ($this->isActiveToday() || $this->isAtRisk() || $this->isFrozen())
      return false;
    if (!$this->last_activity_date)
      return false;

    return $this->last_activity_date->diffInDays(Carbon::today()) >= 2;
  }

  /**
   * Auto-save has already been consumed in the last 7 days.
   */
  public function autoSaveUsedThisWeek(): bool
  {
    if (!$this->last_auto_save_at)
      return false;

    return $this->last_auto_save_at->diffInDays(Carbon::today()) < 7;
  }
}