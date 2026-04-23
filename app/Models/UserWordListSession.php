<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserWordListSession extends Model
{
    use HasFactory;

    protected $table = 'user_wordlist_sessions';

    protected $fillable = [
        'user_id',
        'wordlist_id',
        'regular_sessions_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wordlist()
    {
        return $this->belongsTo(WordList::class);
    }
}
