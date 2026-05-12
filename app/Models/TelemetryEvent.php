<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelemetryEvent extends Model
{
    protected $fillable = [
        'event_uuid',
        'telemetry_session_id',
        'telemetry_page_view_id',
        'page_view_client_id',
        'user_id',
        'anonymous_id',
        'name',
        'path',
        'route_name',
        'component',
        'occurred_at',
        'properties',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'properties' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(TelemetrySession::class, 'telemetry_session_id');
    }

    public function pageView(): BelongsTo
    {
        return $this->belongsTo(TelemetryPageView::class, 'telemetry_page_view_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
