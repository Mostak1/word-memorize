<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
  use HasFactory;

  protected $fillable = [
    'quiz_id',
    'word_id',
    'type',
    'question',
    'options',           // For MCQ types: array of choices
    'correct_answer',    // For mcq_single → string | For mcq_multiple → JSON array
    'matching_pairs',    // For matching type: array of {left, right}
    'explanation',
    'sort_order',
  ];

  protected $casts = [
    'options' => 'array',
    'matching_pairs' => 'array',
    'correct_answer' => 'array',   // Will handle both string and array based on type
  ];

  /**
   * Relationship: belongs to Quiz
   */
  public function quiz()
  {
    return $this->belongsTo(Quiz::class);
  }

  /**
   * Relationship: optional link to the original Word (useful for auto-generating questions)
   */
  public function word()
  {
    return $this->belongsTo(Word::class);
  }

  /**
   * Helper: Is this a multiple choice single answer?
   */
  public function isMcqSingle(): bool
  {
    return $this->type === 'mcq_single';
  }

  /**
   * Helper: Is this multiple correct answers?
   */
  public function isMcqMultiple(): bool
  {
    return $this->type === 'mcq_multiple';
  }

  /**
   * Helper: Is this a matching question?
   */
  public function isMatching(): bool
  {
    return $this->type === 'matching';
  }

  /**
   * Get correct answer(s) in consistent format
   */
  public function getCorrectAnswersAttribute()
  {
    if ($this->isMcqSingle()) {
      return [$this->correct_answer]; // return as array for uniformity
    }

    if ($this->isMcqMultiple() && is_string($this->correct_answer)) {
      return json_decode($this->correct_answer, true) ?? [];
    }

    return $this->correct_answer ?? [];
  }
}