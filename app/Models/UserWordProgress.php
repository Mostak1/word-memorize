<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserWordProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'word_id',
        'correct_count',
        'wrong_count',
        'last_result',
        'mastery_level',
        'last_attempted_at',
    ];

    protected $casts = [
        'last_attempted_at' => 'datetime',
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

    /* ======================
     | Helper Methods
     ====================== */

    public function accuracy(): float
    {
        $total = $this->correct_count + $this->wrong_count;

        if ($total === 0) {
            return 0;
        }

        return round(($this->correct_count / $total) * 100, 2);
    }

    public function isMastered(): bool
    {
        return $this->mastery_level >= 4;
    }
}
