<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WordAttempt extends Model
{
    use HasFactory;

    /**
     * We manually control timestamps via attempted_at
     */
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'word_id',
        'exercise_group_id',
        'result',
        'attempted_at',
    ];

    protected $casts = [
        'attempted_at' => 'datetime',
    ];

    /* ======================
     | Relationships
     ====================== */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function word()
    {
        return $this->belongsTo(Word::class);
    }

    public function exerciseGroup()
    {
        return $this->belongsTo(ExerciseGroup::class);
    }
}
