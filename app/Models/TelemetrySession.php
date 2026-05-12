<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelemetrySession extends Model
{
    protected $fillable = [
        'client_session_id',
        'anonymous_id',
        'user_id',
        'started_at',
        'last_seen_at',
        'ended_at',
        'landing_path',
        'exit_path',
        'referrer',
        'device_type',
        'browser',
        'platform',
        'timezone',
        'locale',
        'user_agent_hash',
        'ip_hash',
        'pageview_count',
        'event_count',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pageViews(): HasMany
    {
        return $this->hasMany(TelemetryPageView::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(TelemetryEvent::class);
    }
}
