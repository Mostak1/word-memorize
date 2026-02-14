<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReviewWord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'word_id',
    ];

    /**
     * Relationships
     */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function word()
    {
        return $this->belongsTo(Word::class);
    }
}
