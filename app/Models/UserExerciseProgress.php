<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserExerciseProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exercise_group_id',
        'total_words',
        'mastered_words',
        'last_practiced_at',
    ];

    protected $casts = [
        'last_practiced_at' => 'datetime',
    ];

    /* ======================
     | Relationships
     ====================== */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function exerciseGroup()
    {
        return $this->belongsTo(ExerciseGroup::class);
    }

    /* ======================
     | Helper Methods
     ====================== */

    public function completionPercentage(): float
    {
        if ($this->total_words === 0) {
            return 0;
        }

        return round(($this->mastered_words / $this->total_words) * 100, 2);
    }
}
