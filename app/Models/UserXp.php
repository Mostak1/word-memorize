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

  // ── Accessors ───────────────────────────────────────────────────────────────

  public function getXpAttribute(): int
  {
    return $this->xp_balance ?? 0;
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
   * Spend XP from the user's balance using atomic database operation.
   * Returns true if successful, false if insufficient balance.
   * 
   * Uses a database-level UPDATE with WHERE clause to prevent race conditions
   * where multiple concurrent requests could both pass the balance check.
   */
  public function spendXp(int $amount): bool
  {
    $updated = \Illuminate\Support\Facades\DB::table('user_xp')
      ->where('user_id', $this->user_id)
      ->where('xp_balance', '>=', $amount)
      ->decrement('xp_balance', $amount);

    if ($updated > 0) {
      $this->refresh();
      return true;
    }

    return false;
  }
}
