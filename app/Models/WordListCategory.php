<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WordListCategory extends Model
{
    use HasFactory;

    protected $table = 'word_list_categories';

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    /**
     * Relationship: A WordListCategory has many WordLists
     */
    public function wordLists()
    {
        return $this->hasMany(WordList::class, 'word_list_category_id')->orderBy('title');
    }
}