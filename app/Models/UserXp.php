<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserXp extends Model
{
  protected $table = 'user_xp';

  protected $fillable = [
    'user_id',
    'xp_balance',
  ];

  protected $casts = [
    'xp_balance' => 'integer',
  ];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function freezePurchases()
  {
    return $this->hasMany(StreakFreezePurchase::class, 'user_id', 'user_id');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Check if user can afford to buy a streak freeze.
   */
  public function canAffordFreeze(int $cost): bool
  {
    return $this->xp_balance >= $cost;
  }

  /**
   * Award XP to the user.
   */
  public function addXp(int $amount): self
  {
    $this->increment('xp_balance', $amount);
    return $this->fresh();
  }

  /**
   * Spend XP from the user's balance.
   * Returns true if successful, false if insufficient balance.
   */
  public function spendXp(int $amount): bool
  {
    if (!$this->canAffordFreeze($amount)) {
      return false;
    }

    $this->decrement('xp_balance', $amount);
    return true;
  }
}
