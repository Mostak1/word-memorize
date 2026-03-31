<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WordProgress extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'word_id',
    'box',
    'next_review_at',
    'correct_count',
    'incorrect_count',
    'last_reviewed_at',
  ];

  protected $casts = [
    'next_review_at' => 'datetime',
    'last_reviewed_at' => 'datetime',
  ];

  // ── 3-Step to Mastery — 4-box Leitner config ─────────────────────────────

  /**
   * Review interval in days for each box.
   *
   * Box 1 → review today (0 days = immediately due)
   * Box 2 → review tomorrow
   * Box 3 → review in 3 days
   * Box 4 → Mastered — removed from active queue (30-day safety interval)
   *
   * A word needs THREE consecutive correct answers (boxes 1→2→3→4) to be mastered.
   */
  public const INTERVALS = [
    1 => 0,   // Due immediately / today
    2 => 1,   // Tomorrow
    3 => 3,   // In 3 days
    4 => 30,  // Mastered — effectively out of rotation
  ];

  /** Words at this box (or higher) are considered mastered. */
  public const MASTERED_BOX = 4;

  /** Human-friendly label for each box (shown on the card). */
  public const BOX_LABELS = [
    1 => 'New',
    2 => 'Familiar',
    3 => 'Solid',
    4 => 'Mastered',
  ];

  /** Tailwind badge colours per box. */
  public const BOX_COLORS = [
    1 => 'bg-gray-100 text-gray-600',
    2 => 'bg-blue-100 text-blue-600',
    3 => 'bg-yellow-100 text-yellow-700',
    4 => 'bg-green-100 text-green-700',
  ];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function word()
  {
    return $this->belongsTo(Word::class);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  public function isDue(): bool
  {
    return is_null($this->next_review_at)
      || $this->next_review_at->isPast()
      || $this->next_review_at->isToday();
  }

  public function isMastered(): bool
  {
    return $this->box >= self::MASTERED_BOX;
  }

  public function label(): string
  {
    return self::BOX_LABELS[$this->box] ?? 'New';
  }
}