<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
  use HasFactory;

  protected $fillable = ['exercise_group_id', 'name'];

  /**
   * Relationship: belongs to one ExerciseGroup
   */
  public function exerciseGroup()
  {
    return $this->belongsTo(ExerciseGroup::class);
  }

  /**
   * Relationship: has many Words
   */
  public function words()
  {
    return $this->hasMany(Word::class);
  }
}