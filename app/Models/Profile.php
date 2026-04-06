<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Profile extends Model
{
  protected $fillable = [
    'title',
    'description',
    'profile_image',
    'cover_image',
    'theme',
    'custom_css',
    'social_links',  // JSON array
  ];

  protected $appends = ['profile_image_full', 'cover_image_full'];

  protected $casts = [
    'social_links' => 'array',
  ];

  protected static function booted(): void
  {
    static::deleting(function (self $profile) {
      if ($profile->profile_image) {
        $storagePath = ltrim($profile->profile_image, '/');
        if (Storage::disk('public')->exists($storagePath)) {
          Storage::disk('public')->delete($storagePath);
        }
      }

      if ($profile->cover_image) {
        $storagePath = ltrim($profile->cover_image, '/');
        if (Storage::disk('public')->exists($storagePath)) {
          Storage::disk('public')->delete($storagePath);
        }
      }
    });
  }

  // ── Relationships ─────────────────────────────────────────────────────────

  public function links(): HasMany
  {
    return $this->hasMany(Link::class)->orderBy('order');
  }

  public function activeLinks(): HasMany
  {
    return $this->hasMany(Link::class)
      ->where('is_active', true)
      ->orderBy('order');
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  public function getProfileImageFullAttribute(): ?string
  {
    if (!$this->profile_image)
      return null;
    if (str_starts_with($this->profile_image, 'http'))
      return $this->profile_image;
    return asset('storage' . $this->profile_image);
  }

  public function getCoverImageFullAttribute(): ?string
  {
    if (!$this->cover_image)
      return null;
    if (str_starts_with($this->cover_image, 'http'))
      return $this->cover_image;
    return asset('storage' . $this->cover_image);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  public static function singleton(): static
  {
    return static::firstOrCreate([], [
      'title' => 'My Links',
      'description' => null,
      'theme' => 'default',
      'social_links' => [],
    ]);
  }

  public function totalClicks(): int
  {
    return $this->links()
      ->withCount('clicks')
      ->get()
      ->sum('clicks_count');
  }

  /**
   * Return active social links sorted by order.
   */
  public function activeSocialLinks(): array
  {
    $links = $this->social_links ?? [];
    return collect($links)
      ->where('is_active', true)
      ->sortBy('order')
      ->values()
      ->toArray();
  }
}