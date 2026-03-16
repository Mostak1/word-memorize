<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WordList extends Model
{
    use HasFactory;

    protected $table = 'wordlists';

    protected $fillable = [
        'title',
        'price',
        'difficulty',
        'status',
    ];

    /**
     * Relationship: A WordList has many Words
     */
    public function words()
    {
        return $this->hasMany(Word::class, 'wordlist_id');
    }

    /**
     * Relationship: A WordList has many Subcategories
     */
    public function subcategories()
    {
        return $this->hasMany(Subcategory::class, 'wordlist_id')->orderBy('name');
    }

    /**
     * Scope: Filter by difficulty
     */
    public function scopeDifficulty($query, $level)
    {
        return $query->where('difficulty', $level);
    }
}