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
        'subcategory_id',
        'word',
        'pronunciation',
        'bangla_pronunciation',
        'hyphenation',
        'parts_of_speech_variations',
        'definition',
        'bangla_meaning',
        'collocations',
        'example_sentences',
        'ai_prompt',
        'synonym',
        'antonym',
        // Legacy single-image columns — kept for backward compat, no longer
        // used by the admin UI. New images live in the word_images table.
        'image_url',
        'image_related_sentence',
    ];

    protected $appends = ['image_url_full'];

    /**
     * Booted model events.
     * When a Word is deleted, cascade-delete its WordImage records
     * (each WordImage's own deleting hook handles the physical file removal).
     * Also removes the legacy single image file if one is still stored.
     */
    protected static function booted(): void
    {
        static::deleting(function (self $word) {
            // Delete all gallery images (each triggers WordImage::deleting → file cleanup)
            $word->images()->get()->each(fn($img) => $img->delete());

            // Legacy single-image cleanup (image_url may be bare path or old /storage/... format)
            if ($word->image_url) {
                // Normalise both old "/storage/words/file.jpg" and bare "words/file.jpg" formats
                $path = ltrim(
                    str_replace('/storage/', '', parse_url($word->image_url, PHP_URL_PATH)),
                    '/'
                );
                if ($path && Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function exerciseGroup()
    {
        return $this->belongsTo(ExerciseGroup::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Gallery images — ordered by sort_order, then id.
     */
    public function images()
    {
        return $this->hasMany(WordImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function reviewEntries()
    {
        return $this->hasMany(ReviewWord::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Helper: Get difficulty via ExerciseGroup.
     */
    public function getDifficultyAttribute(): ?string
    {
        return $this->exerciseGroup?->difficulty;
    }

    /**
     * Legacy accessor — still available for any code that reads image_url_full
     * directly off a Word; falls through to the old image_url column.
     */
    public function getImageUrlFullAttribute(): ?string
    {
        if (!$this->image_url) {
            return null;
        }

        if (str_starts_with($this->image_url, 'http')) {
            return $this->image_url;
        }

        return asset($this->image_url);
    }
}