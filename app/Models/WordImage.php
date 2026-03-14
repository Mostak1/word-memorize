<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WordImage extends Model
{
  use HasFactory;

  protected $fillable = [
    'word_id',
    'image_url',
    'caption',
    'sort_order',
  ];

  protected $appends = ['image_url_full'];

  /**
   * Auto-delete the physical file when a WordImage record is deleted.
   *
   * image_url in DB = "/words/filename.jpg"
   * Storage::disk('public') root = storage/app/public
   * So the file lives at:  storage/app/public/words/filename.jpg
   * Which means the storage-relative path is: "words/filename.jpg" (ltrim the slash)
   */
  protected static function booted(): void
  {
    static::deleting(function (self $image) {
      if (!$image->image_url) {
        return;
      }

      // Convert "/words/filename.jpg"  →  "words/filename.jpg"
      $storagePath = ltrim($image->image_url, '/');

      if (Storage::disk('public')->exists($storagePath)) {
        Storage::disk('public')->delete($storagePath);
      }
    });
  }

  // ── Relationships ─────────────────────────────────────────────────────────

  public function word()
  {
    return $this->belongsTo(Word::class);
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  /**
   * Build the publicly accessible URL for this image.
   *
   * DB stores:  /words/filename.jpg
   * We need:    <APP_URL>/storage/words/filename.jpg
   *
   * asset('storage' . '/words/filename.jpg')
   *   = asset('storage/words/filename.jpg')
   *   = http://your-domain.com/storage/words/filename.jpg  (live server)
   *   = http://localhost/word-memorize/public/storage/words/filename.jpg  (XAMPP)
   *
   * This relies on the public/storage symlink created by:
   *   php artisan storage:link
   */
  public function getImageUrlFullAttribute(): ?string
  {
    if (!$this->image_url) {
      return null;
    }

    // External URL — return as-is
    if (str_starts_with($this->image_url, 'http')) {
      return $this->image_url;
    }

    // "/words/filename.jpg"  →  asset('storage/words/filename.jpg')
    return asset('storage' . $this->image_url);
  }
}