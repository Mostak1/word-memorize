<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WordListCategory extends Model
{
    use HasFactory;

    protected $table = 'word_list_categories';

    protected $fillable = [
        'name',
        'description',
        'thumbnail',
        'show_example_sentences',
        'status',
        'created_by'
    ];

    protected $casts = [
        'show_example_sentences' => 'boolean',
    ];

    protected $appends = ['thumbnail_url_full']; // ✅ accessor

    /**
     * Auto-delete thumbnail file when category is deleted
     */
    protected static function booted(): void
    {
        static::deleting(function (self $category) {
            if (!$category->thumbnail) {
                return;
            }

            // "/word_categories/thumb.jpg" → "word_categories/thumb.jpg"
            $storagePath = ltrim($category->thumbnail, '/');

            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function wordLists()
    {
        return $this->hasMany(WordList::class, 'word_list_category_id')->orderBy('title');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isPersonal(): bool
    {
        return $this->created_by !== null;
    }

    public function scopePersonalFor($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Get full URL for thumbnail
     *
     * DB: /word_categories/thumb.jpg
     * Output: https://domain.com/storage/word_categories/thumb.jpg
     */
    public function getThumbnailUrlFullAttribute(): ?string
    {
        if (!$this->thumbnail) {
            return null;
        }

        // External URL support
        if (str_starts_with($this->thumbnail, 'http')) {
            return $this->thumbnail;
        }

        return asset('storage' . $this->thumbnail);
    }
}