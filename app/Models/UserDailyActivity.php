<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDailyActivity extends Model
{
  protected $fillable = [
    'user_id',
    'activity_date',
    'completed',
  ];

  protected $casts = [
    'activity_date' => 'date',
    'completed' => 'boolean',
  ];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  // ── Scopes ────────────────────────────────────────────────────────────────

  public function scopeCompleted($query)
  {
    return $query->where('completed', true);
  }

  public function scopeForUser($query, int $userId)
  {
    return $query->where('user_id', $userId);
  }
}