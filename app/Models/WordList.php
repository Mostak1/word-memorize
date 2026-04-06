<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WordList extends Model
{
    use HasFactory;

    protected $table = 'wordlists';

    protected $fillable = [
        'word_list_category_id',
        'title',
        'price',
        'difficulty',
        'status',
        'is_locked',
        'created_by',
        'is_public',
    ];

    /**
     * Relationship: belongs to one WordListCategory
     */
    public function category()
    {
        return $this->belongsTo(WordListCategory::class, 'word_list_category_id');
    }

    /**
     * Relationship: A WordList has many Words
     */
    public function words()
    {
        return $this->hasMany(Word::class, 'wordlist_id');
    }

    // NEW: Owner relationship
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orders()
    {
        return $this->hasMany(WordListOrder::class, 'wordlist_id');
    }

    // check if a user has access
    public function userHasAccess($userId)
    {
        return $this->orders()->where('user_id', $userId)->where('status', 'approved')->exists();
    }

    /**
     * Scope: Filter by difficulty
     */
    public function scopeDifficulty($query, $level)
    {
        return $query->where('difficulty', $level);
    }

    public function isPublic(): bool
    {
        return (bool) $this->is_public;
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }
}