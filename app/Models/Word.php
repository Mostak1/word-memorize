<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_group_id',
        'word',
        'hyphenation',
        'parts_of_speech_variations',
        'definition',
        'bangla_translation',
        'collocations',
        'example_sentences',
        'synonym',
        'antonym',
        'image_url',
        'image_related_sentence',
    ];
    protected $appends = ['image_url_full'];

    /**
     * Relationship: Word belongs to one ExerciseGroup
     */
    public function exerciseGroup()
    {
        return $this->belongsTo(ExerciseGroup::class);
    }

    /**
     * Helper: Get difficulty via ExerciseGroup
     */
    public function getDifficultyAttribute()
    {
        return $this->exerciseGroup?->difficulty;
    }

    public function getImageUrlFullAttribute()
    {
        if (!$this->image_url) {
            return null;
        }

        // If it's already a full URL, return as is
        if (str_starts_with($this->image_url, 'http')) {
            return $this->image_url;
        }

        // Otherwise, convert relative path to full URL
        return asset($this->image_url);
    }

    // public function getImageUrlFullAttribute()
    // {
    //     if (!$this->image_url) {
    //         return null;
    //     }

    //     if (str_starts_with($this->image_url, 'http')) {
    //         return $this->image_url;
    //     }

    //     return url($this->image_url);
    // }

    public function reviewEntries()
    {
        return $this->hasMany(ReviewWord::class);
    }
}
