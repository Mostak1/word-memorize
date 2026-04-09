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
        'created_by',
        'price',
        'is_locked',
    ];

    protected $casts = [
        'show_example_sentences' => 'boolean',
        'is_locked' => 'boolean',
        'status' => 'boolean',
    ];

    protected $appends = ['thumbnail_url_full']; // ✅ accessor

    /**
     * Auto-delete thumbnail file when category is deleted
     */
    // protected static function booted(): void
    // {
    //     static::deleting(function (self $category) {
    //         if (!$category->thumbnail) {
    //             return;
    //         }

    //         // "/word_categories/thumb.jpg" → "word_categories/thumb.jpg"
    //         $storagePath = ltrim($category->thumbnail, '/');

    //         if (Storage::disk('public')->exists($storagePath)) {
    //             Storage::disk('public')->delete($storagePath);
    //         }
    //     });
    // }

    protected static function booted(): void
    {
        static::deleting(function (self $category) {
            if (!$category->thumbnail)
                return;
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

    public function orders()
    {
        return $this->belongsToMany(
            WordListOrder::class,
            'word_list_order_items',
            'word_list_category_id',
            'word_list_order_id'
        );
    }

    public function accessGrants()
    {
        return $this->hasMany(UserWordListAccess::class, 'word_list_category_id');
    }

    public function isPersonal(): bool
    {
        return $this->created_by !== null;
    }

    public function scopePersonalFor($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function userHasAccess($userId): bool
    {
        return UserWordListAccess::where('user_id', $userId)
            ->where('word_list_category_id', $this->id)
            ->exists();
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
        if (!$this->thumbnail)
            return null;
        if (str_starts_with($this->thumbnail, 'http'))
            return $this->thumbnail;
        return asset('storage' . $this->thumbnail);
    }

    // public function getThumbnailUrlFullAttribute(): ?string
    // {
    //     if (!$this->thumbnail) {
    //         return null;
    //     }

    //     // External URL support
    //     if (str_starts_with($this->thumbnail, 'http')) {
    //         return $this->thumbnail;
    //     }

    //     return asset('storage' . $this->thumbnail);
    // }
}