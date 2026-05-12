<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelemetryPageView extends Model
{
    protected $fillable = [
        'telemetry_session_id',
        'page_view_id',
        'user_id',
        'anonymous_id',
        'path',
        'route_name',
        'component',
        'title',
        'referrer',
        'started_at',
        'last_seen_at',
        'ended_at',
        'duration_ms',
        'active_duration_ms',
        'max_scroll_depth',
        'exit_reason',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(TelemetrySession::class, 'telemetry_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(TelemetryEvent::class);
    }
}
