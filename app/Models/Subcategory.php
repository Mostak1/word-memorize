<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
    use HasFactory;

    protected $fillable = ['wordlist_id', 'name'];

    /**
     * Relationship: belongs to one WordList
     */
    public function wordList()
    {
        return $this->belongsTo(WordList::class, 'wordlist_id');
    }

    /**
     * Relationship: has many Words
     */
    public function words()
    {
        return $this->hasMany(Word::class);
    }
}