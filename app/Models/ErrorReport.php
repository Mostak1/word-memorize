<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ErrorReport extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'page_url',
    'page_title',
    'description',
    'image_path',
    'status',
    'admin_note',
  ];

  protected $appends = ['image_url_full'];

  protected static function booted(): void
  {
    static::deleting(function (self $report) {
      if ($report->image_path) {
        Storage::disk('public')->delete($report->image_path);
      }
    });
  }

  // ── Relationships ─────────────────────────────────────────────────────────

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  public function getImageUrlFullAttribute(): ?string
  {
    if (!$this->image_path)
      return null;
    return asset('storage/' . $this->image_path);
  }

  // ── Scopes ────────────────────────────────────────────────────────────────

  public function scopeOpen($query)
  {
    return $query->where('status', 'open');
  }
}