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
        'created_by'
    ];

    /**
     * Relationship: A WordListCategory has many WordLists
     */
    public function wordLists()
    {
        return $this->hasMany(WordList::class, 'word_list_category_id')->orderBy('title');
    }

    public function isPersonal(): bool
    {
        return $this->created_by !== null;
    }

    // Scope: Get personal category for a user
    public function scopePersonalFor($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}