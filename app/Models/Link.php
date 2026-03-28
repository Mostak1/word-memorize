<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Link extends Model
{
  protected $fillable = [
    'profile_id',
    'title',
    'url',
    'icon',
    'thumbnail',
    'order',
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'order' => 'integer',
  ];

  protected $appends = ['thumbnail_full'];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function profile(): BelongsTo
  {
    return $this->belongsTo(Profile::class);
  }

  public function clicks(): HasMany
  {
    return $this->hasMany(Click::class);
  }

  // ── Scopes ────────────────────────────────────────────────────────────────

  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function scopeOrdered($query)
  {
    return $query->orderBy('order');
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  public function getThumbnailFullAttribute(): ?string
  {
    if (!$this->thumbnail)
      return null;
    if (str_starts_with($this->thumbnail, 'http'))
      return $this->thumbnail;
    return asset('storage/' . ltrim($this->thumbnail, '/'));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  public function clickCount(?int $days = null): int
  {
    $query = $this->clicks();
    if ($days) {
      $query->where('clicked_at', '>=', now()->subDays($days));
    }
    return $query->count();
  }
}