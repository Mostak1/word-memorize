<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Click extends Model
{
  // clicks table has no updated_at
  public $timestamps = false;

  protected $fillable = [
    'link_id',
    'clicked_at',
    'ip_address',
    'referrer',
  ];

  protected $casts = [
    'clicked_at' => 'datetime',
  ];

  // ── Relationships ─────────────────────────────────────────────────────────

  public function link(): BelongsTo
  {
    return $this->belongsTo(Link::class);
  }

  // ── Factory method ────────────────────────────────────────────────────────

  /**
   * Record a click from the current request.
   */
  public static function record(Link $link, \Illuminate\Http\Request $request): static
  {
    return static::create([
      'link_id' => $link->id,
      'ip_address' => $request->ip(),
      'referrer' => $request->headers->get('referer'),
    ]);
  }
}