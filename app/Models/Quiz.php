<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
  use HasFactory;

  protected $fillable = [
    'wordlist_id',
    'title',
    'pass_mark',
    'is_active',
    'created_by',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'pass_mark' => 'integer',
  ];

  /**
   * Relationship: belongs to a WordList
   */
  public function wordList()
  {
    return $this->belongsTo(WordList::class, 'wordlist_id');
  }

  /**
   * Relationship: has many questions (ordered)
   */
  public function questions()
  {
    return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
  }

  /**
   * Relationship: has many user attempts
   */
  public function attempts()
  {
    return $this->hasMany(QuizAttempt::class);
  }

  /**
   * Relationship: created by admin
   */
  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  /**
   * Get the latest attempt for a specific user
   */
  public function latestAttemptForUser($userId)
  {
    return $this->attempts()
      ->where('user_id', $userId)
      ->latest('attempted_at')
      ->first();
  }


  /**
   * Check if a user has already passed this quiz
   */
  public function hasUserPassed($userId): bool
  {
    $attempt = $this->latestAttemptForUser($userId);
    return $attempt && $attempt->passed;
  }

  /**
   * Check if a user is allowed to attempt the quiz today
   * (fails → retry tomorrow)
   */
  public function canUserAttempt($userId): bool
  {
    if ($this->hasUserPassed($userId)) {
      return false; // already passed
    }

    $attempt = $this->latestAttemptForUser($userId);

    if (!$attempt || $attempt->passed) {
      return true;
    }

    return !$attempt->next_attempt_at || $attempt->next_attempt_at->isPast();
  }
}

