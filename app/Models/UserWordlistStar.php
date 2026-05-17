<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserWordlistStar extends Model
{
    use HasFactory;

    protected $table = 'user_wordlist_stars';

    protected $fillable = [
        'user_id',
        'wordlist_id',
        'stars',
        'last_star_earned_at',
        'next_star_available_at',
        'last_attempted_at',
        'last_reward_type',
        'last_reward_amount',
    ];

    protected $casts = [
        'last_star_earned_at' => 'datetime',
        'next_star_available_at' => 'datetime',
        'last_attempted_at' => 'datetime',
        'stars' => 'integer',
        'last_reward_amount' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wordlist()
    {
        return $this->belongsTo(WordList::class, 'wordlist_id');
    }
}
