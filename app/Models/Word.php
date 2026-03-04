<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_group_id',
        'word',
        'pronunciation',
        'hyphenation',
        'parts_of_speech_variations',
        'definition',
        'bangla_meaning',
        'collocations',
        'example_sentences',
        'ai_prompt',
        'synonym',
        'antonym',
        'image_url',
        'image_related_sentence',
    ];
    protected $appends = ['image_url_full'];

     /**
     * Booted model events
     * Delete image file from public folder when the Word is deleted
     */
    protected static function booted()
    {
        static::deleting(function ($word) {
            if ($word->image_url) {
                // Convert full URL to relative storage path
                $path = ltrim(str_replace('/storage/', '', parse_url($word->image_url, PHP_URL_PATH)), '/');

                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        });
    }

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
