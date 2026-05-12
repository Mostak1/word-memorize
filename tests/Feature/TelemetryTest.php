<?php

namespace Tests\Feature;

use App\Models\TelemetryEvent;
use App\Models\TelemetryPageView;
use App\Models\TelemetrySession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelemetryTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_accepts_anonymous_telemetry_batches(): void
    {
        $payload = $this->payload();

        $response = $this->postJson('/telemetry/batch', $payload);

        $response->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('stored', 2)
            ->assertJsonPath('page_views_created', 1);

        $this->assertDatabaseHas('telemetry_sessions', [
            'client_session_id' => 'session-1',
            'anonymous_id' => 'anon-1',
            'landing_path' => '/dashboard',
        ]);

        $this->assertDatabaseHas('telemetry_page_views', [
            'page_view_id' => 'page-1',
            'path' => '/dashboard',
            'component' => 'Dashboard',
            'duration_ms' => 1500,
            'active_duration_ms' => 1200,
            'max_scroll_depth' => 75,
            'exit_reason' => 'navigation',
        ]);

        $this->assertDatabaseHas('telemetry_events', [
            'event_uuid' => 'event-1',
            'name' => 'page_view_started',
        ]);
    }

    public function test_event_uuid_makes_batches_idempotent(): void
    {
        $payload = $this->payload();

        $this->postJson('/telemetry/batch', $payload)->assertOk();
        $response = $this->postJson('/telemetry/batch', $payload);

        $response->assertOk()
            ->assertJsonPath('stored', 0)
            ->assertJsonPath('page_views_created', 0);

        $this->assertSame(2, TelemetryEvent::count());
        $this->assertSame(1, TelemetryPageView::count());
    }

    public function test_authenticated_batches_attach_the_user_without_storing_raw_ip(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson('/telemetry/batch', $this->payload())
            ->assertOk();

        $session = TelemetrySession::firstOrFail();

        $this->assertSame($user->id, $session->user_id);
        $this->assertNotNull($session->ip_hash);
        $this->assertNotSame('203.0.113.10', $session->ip_hash);
        $this->assertSame(64, strlen($session->ip_hash));
    }

    public function test_invalid_batches_are_rejected(): void
    {
        $this->postJson('/telemetry/batch', [
            'anonymous_id' => 'anon-1',
            'session_id' => 'session-1',
            'events' => [
                [
                    'event_uuid' => 'event-bad',
                    'name' => 'bad event name with spaces',
                    'occurred_at' => now()->toIso8601String(),
                ],
            ],
        ])->assertUnprocessable();

        $this->assertSame(0, TelemetryEvent::count());
    }

    private function payload(): array
    {
        return [
            'anonymous_id' => 'anon-1',
            'session_id' => 'session-1',
            'session_started_at' => '2026-05-11T07:00:00.000Z',
            'client' => [
                'device_type' => 'desktop',
                'browser' => 'Chrome',
                'platform' => 'Win32',
                'timezone' => 'Asia/Dhaka',
                'locale' => 'en-US',
                'user_agent' => 'Feature test browser',
            ],
            'events' => [
                [
                    'event_uuid' => 'event-1',
                    'name' => 'page_view_started',
                    'occurred_at' => '2026-05-11T07:00:00.000Z',
                    'page_view_id' => 'page-1',
                    'path' => '/dashboard',
                    'component' => 'Dashboard',
                    'properties' => [
                        'started_at' => '2026-05-11T07:00:00.000Z',
                        'title' => 'Dashboard',
                        'referrer' => 'https://example.test/',
                    ],
                ],
                [
                    'event_uuid' => 'event-2',
                    'name' => 'page_view_ended',
                    'occurred_at' => '2026-05-11T07:00:01.500Z',
                    'page_view_id' => 'page-1',
                    'path' => '/dashboard',
                    'component' => 'Dashboard',
                    'properties' => [
                        'started_at' => '2026-05-11T07:00:00.000Z',
                        'ended_at' => '2026-05-11T07:00:01.500Z',
                        'duration_ms' => 1500,
                        'active_duration_ms' => 1200,
                        'max_scroll_depth' => 75,
                        'exit_reason' => 'navigation',
                    ],
                ],
            ],
        ];
    }
}
