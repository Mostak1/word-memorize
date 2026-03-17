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

    /**
     * Scope: Filter by difficulty
     */
    public function scopeDifficulty($query, $level)
    {
        return $query->where('difficulty', $level);
    }
}