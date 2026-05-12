<?php

namespace App\Support;

use App\Models\TelemetryEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class Telemetry
{
    public static function record(Request $request, string $name, array $properties = []): void
    {
        try {
            TelemetryEvent::create([
                'event_uuid' => (string) Str::uuid(),
                'user_id' => $request->user()?->id,
                'anonymous_id' => $request->header('X-Telemetry-Anonymous-Id'),
                'name' => $name,
                'path' => '/' . ltrim($request->path(), '/'),
                'route_name' => $request->route()?->getName(),
                'occurred_at' => now(),
                'properties' => $properties,
            ]);
        } catch (\Throwable $e) {
            Log::debug('Telemetry event was not recorded.', [
                'event' => $name,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
