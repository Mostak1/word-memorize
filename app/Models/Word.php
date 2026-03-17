<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'wordlist_id',
        'word',
        'pronunciation',
        'ipa',
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
        // Legacy single-image columns — kept for backward compat
        'image_url',
        'image_related_sentence',
    ];

    protected $appends = ['image_url_full'];

    /**
     * Booted model events.
     */
    protected static function booted(): void
    {
        static::deleting(function (self $word) {
            // Delete all gallery images
            $word->images()->get()->each(fn($img) => $img->delete());

            // Legacy single-image cleanup
            if ($word->image_url) {
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

    public function wordList()
    {
        return $this->belongsTo(WordList::class, 'wordlist_id');
    }

    public function images()
    {
        return $this->hasMany(WordImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function reviewEntries()
    {
        return $this->hasMany(ReviewWord::class);
    }

    public function masteredEntries()
    {
        return $this->hasMany(MasteredWord::class);
    }

    public function bookmarkEntries()
    {
        return $this->hasMany(BookmarkedWord::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getDifficultyAttribute(): ?string
    {
        return $this->wordList?->difficulty;
    }

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