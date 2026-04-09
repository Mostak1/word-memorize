<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'quiz_id', //nullable
    'correct_count',
    'total_questions',
    'score',
    'passed',
    'answers',
    'next_attempt_at',
  ];

  protected $casts = [
    'score' => 'decimal:2',
    'passed' => 'boolean',
    'answers' => 'array',
    'attempted_at' => 'datetime',
    'next_attempt_at' => 'datetime',
  ];

  /**
   * Relationship: belongs to Quiz
   */
  public function quiz()
  {
    return $this->belongsTo(Quiz::class);
  }

  /**
   * Relationship: belongs to User
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }
}