<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StreakFreezePurchase extends Model
{
  protected $fillable = [
    'user_id',
    'xp_cost',
    'purchased_at',
    'is_used',
  ];

  protected $casts = [
    'xp_cost' => 'integer',
    'purchased_at' => 'datetime',
    'is_used' => 'boolean',
  ];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
