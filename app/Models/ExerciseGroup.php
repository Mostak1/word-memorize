<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExerciseGroup extends Model
{
    use HasFactory;

    // Fillable fields including difficulty
    protected $fillable = [
        'title',
        'price',
        'difficulty',
        'status',
    ];

    /**
     * Relationship: An ExerciseGroup has many Words
     */
    public function words()
    {
        return $this->hasMany(Word::class);
    }

    /**
     * Scope: Filter groups by difficulty
     */
    public function scopeDifficulty($query, $level)
    {
        return $query->where('difficulty', $level);
    }
}
