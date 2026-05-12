<?php

namespace App\Http\Controllers;

use App\Models\TelemetryEvent;
use App\Models\TelemetryPageView;
use App\Models\TelemetrySession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TelemetryController extends Controller
{
    public function batch(Request $request): JsonResponse
    {
        $data = $request->validate([
            'anonymous_id' => ['required', 'string', 'max:100'],
            'session_id' => ['required', 'string', 'max:100'],
            'session_started_at' => ['nullable', 'date'],
            'client' => ['nullable', 'array'],
            'client.device_type' => ['nullable', 'string', 'max:40'],
            'client.browser' => ['nullable', 'string', 'max:80'],
            'client.platform' => ['nullable', 'string', 'max:120'],
            'client.timezone' => ['nullable', 'string', 'max:80'],
            'client.locale' => ['nullable', 'string', 'max:40'],
            'client.user_agent' => ['nullable', 'string', 'max:1000'],
            'events' => ['required', 'array', 'max:100'],
            'events.*.event_uuid' => ['required', 'string', 'max:100'],
            'events.*.name' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9_.:-]+$/i'],
            'events.*.occurred_at' => ['required', 'date'],
            'events.*.page_view_id' => ['nullable', 'string', 'max:100'],
            'events.*.path' => ['nullable', 'string', 'max:1024'],
            'events.*.route_name' => ['nullable', 'string', 'max:160'],
            'events.*.component' => ['nullable', 'string', 'max:160'],
            'events.*.properties' => ['nullable', 'array'],
            'events.*.properties.started_at' => ['nullable', 'date'],
            'events.*.properties.ended_at' => ['nullable', 'date'],
            'events.*.properties.duration_ms' => ['nullable', 'integer', 'min:0'],
            'events.*.properties.active_duration_ms' => ['nullable', 'integer', 'min:0'],
            'events.*.properties.max_scroll_depth' => ['nullable', 'integer', 'min:0', 'max:100'],
            'events.*.properties.exit_reason' => ['nullable', 'string', 'max:80'],
            'events.*.properties.title' => ['nullable', 'string', 'max:255'],
            'events.*.properties.referrer' => ['nullable', 'string', 'max:1024'],
        ]);

        $user = $request->user();
        $client = $data['client'] ?? [];
        $events = $data['events'];
        $firstEvent = collect($events)->sortBy('occurred_at')->first();
        $lastEvent = collect($events)->sortByDesc('occurred_at')->first();
        $startedAt = $this->parseTime($data['session_started_at'] ?? null)
            ?? $this->parseTime($firstEvent['occurred_at'] ?? null)
            ?? now();
        $lastSeenAt = $this->parseTime($lastEvent['occurred_at'] ?? null) ?? now();

        $result = DB::transaction(function () use ($data, $client, $events, $user, $request, $startedAt, $lastSeenAt) {
            $session = TelemetrySession::firstOrCreate(
                ['client_session_id' => $data['session_id']],
                [
                    'anonymous_id' => $data['anonymous_id'],
                    'user_id' => $user?->id,
                    'started_at' => $startedAt,
                    'last_seen_at' => $lastSeenAt,
                    'landing_path' => $this->firstPath($events),
                    'referrer' => $this->firstReferrer($events),
                    'device_type' => $client['device_type'] ?? null,
                    'browser' => $client['browser'] ?? null,
                    'platform' => $client['platform'] ?? null,
                    'timezone' => $client['timezone'] ?? null,
                    'locale' => $client['locale'] ?? null,
                    'user_agent_hash' => $this->hashValue($client['user_agent'] ?? null),
                    'ip_hash' => $this->hashValue($request->ip()),
                ],
            );

            $sessionUpdates = [
                'anonymous_id' => $data['anonymous_id'],
                'last_seen_at' => $lastSeenAt,
                'device_type' => $client['device_type'] ?? $session->device_type,
                'browser' => $client['browser'] ?? $session->browser,
                'platform' => $client['platform'] ?? $session->platform,
                'timezone' => $client['timezone'] ?? $session->timezone,
                'locale' => $client['locale'] ?? $session->locale,
                'user_agent_hash' => $this->hashValue($client['user_agent'] ?? null) ?? $session->user_agent_hash,
                'ip_hash' => $this->hashValue($request->ip()) ?? $session->ip_hash,
            ];

            if ($user && !$session->user_id) {
                $sessionUpdates['user_id'] = $user->id;
            }

            $session->fill($sessionUpdates)->save();

            $createdEvents = 0;
            $createdPageViews = 0;

            foreach ($events as $event) {
                $pageView = $this->upsertPageView($session, $event, $data['anonymous_id'], $user?->id);
                if ($pageView?->wasRecentlyCreated) {
                    $createdPageViews++;
                }

                if ($this->storeEvent($session, $pageView, $event, $data['anonymous_id'], $user?->id)) {
                    $createdEvents++;
                }

                if (($event['name'] ?? null) === 'page_view_ended') {
                    $session->exit_path = $event['path'] ?? $session->exit_path;
                    $session->ended_at = $this->parseTime($event['occurred_at'] ?? null) ?? $session->ended_at;
                }
            }

            if ($createdEvents > 0 || $createdPageViews > 0) {
                $session->increment('event_count', $createdEvents);
                $session->increment('pageview_count', $createdPageViews);
            }

            return [
                'accepted' => count($events),
                'stored' => $createdEvents,
                'page_views_created' => $createdPageViews,
            ];
        });

        return response()->json(['status' => 'ok'] + $result);
    }

    private function upsertPageView(TelemetrySession $session, array $event, string $anonymousId, ?int $userId): ?TelemetryPageView
    {
        $pageViewId = $event['page_view_id'] ?? null;
        if (!$pageViewId) {
            return null;
        }

        $properties = $event['properties'] ?? [];
        $startedAt = $this->parseTime($properties['started_at'] ?? null)
            ?? $this->parseTime($event['occurred_at'] ?? null);
        $occurredAt = $this->parseTime($event['occurred_at'] ?? null);

        $pageView = TelemetryPageView::firstOrCreate(
            ['page_view_id' => $pageViewId],
            [
                'telemetry_session_id' => $session->id,
                'user_id' => $userId,
                'anonymous_id' => $anonymousId,
                'path' => $event['path'] ?? '/',
                'route_name' => $event['route_name'] ?? null,
                'component' => $event['component'] ?? null,
                'title' => $properties['title'] ?? null,
                'referrer' => $properties['referrer'] ?? null,
                'started_at' => $startedAt,
                'last_seen_at' => $occurredAt,
            ],
        );

        $updates = [
            'user_id' => $userId ?? $pageView->user_id,
            'anonymous_id' => $anonymousId,
            'path' => $event['path'] ?? $pageView->path,
            'route_name' => $event['route_name'] ?? $pageView->route_name,
            'component' => $event['component'] ?? $pageView->component,
            'title' => $properties['title'] ?? $pageView->title,
            'referrer' => $properties['referrer'] ?? $pageView->referrer,
            'last_seen_at' => $occurredAt ?? $pageView->last_seen_at,
            'duration_ms' => max((int) ($properties['duration_ms'] ?? 0), (int) $pageView->duration_ms),
            'active_duration_ms' => max((int) ($properties['active_duration_ms'] ?? 0), (int) $pageView->active_duration_ms),
            'max_scroll_depth' => max((int) ($properties['max_scroll_depth'] ?? 0), (int) $pageView->max_scroll_depth),
        ];

        if (($event['name'] ?? null) === 'page_view_ended') {
            $updates['ended_at'] = $this->parseTime($properties['ended_at'] ?? null) ?? $occurredAt;
            $updates['exit_reason'] = $properties['exit_reason'] ?? $pageView->exit_reason;
        }

        $pageView->fill($updates)->save();

        return $pageView;
    }

    private function storeEvent(TelemetrySession $session, ?TelemetryPageView $pageView, array $event, string $anonymousId, ?int $userId): bool
    {
        if (TelemetryEvent::where('event_uuid', $event['event_uuid'])->exists()) {
            return false;
        }

        TelemetryEvent::create([
            'event_uuid' => $event['event_uuid'],
            'telemetry_session_id' => $session->id,
            'telemetry_page_view_id' => $pageView?->id,
            'page_view_client_id' => $event['page_view_id'] ?? null,
            'user_id' => $userId,
            'anonymous_id' => $anonymousId,
            'name' => $event['name'],
            'path' => $event['path'] ?? null,
            'route_name' => $event['route_name'] ?? null,
            'component' => $event['component'] ?? null,
            'occurred_at' => $this->parseTime($event['occurred_at'] ?? null) ?? now(),
            'properties' => $event['properties'] ?? [],
        ]);

        return true;
    }

    private function parseTime(?string $value): ?Carbon
    {
        if (!$value) {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function hashValue(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        return hash_hmac('sha256', $value, config('app.key'));
    }

    private function firstPath(array $events): ?string
    {
        foreach ($events as $event) {
            if (!empty($event['path'])) {
                return $event['path'];
            }
        }

        return null;
    }

    private function firstReferrer(array $events): ?string
    {
        foreach ($events as $event) {
            $referrer = $event['properties']['referrer'] ?? null;
            if ($referrer) {
                return $referrer;
            }
        }

        return null;
    }
}
