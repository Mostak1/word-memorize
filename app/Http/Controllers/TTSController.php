<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TTSController extends Controller
{
    public function generate(Request $request)
    {
        $text = trim($request->get('text', ''));

        if (!$text) {
            return response()->json(['error' => 'Text is required'], 400);
        }

        // ── Guard: API key ────────────────────────────────────────────────────
        $apiKey = config('services.elevenlabs.api_key');
        if (!$apiKey) {
            Log::error('TTS: ELEVENLABS_API_KEY is not set in .env');
            return response()->json(['error' => 'TTS service is not configured (missing API key)'], 500);
        }

        // ── Guard: Voice ID ───────────────────────────────────────────────────
        $voiceId = config('services.elevenlabs.voice_id');
        if (!$voiceId) {
            Log::error('TTS: ELEVENLABS_VOICE_ID is not set in .env');
            return response()->json(['error' => 'TTS service is not configured (missing voice ID)'], 500);
        }

        // ── Cache: return existing file if already generated ──────────────────
        $filename = 'tts/' . md5($text) . '.mp3';

        if (Storage::disk('public')->exists($filename)) {
            return response()->json([
                'url' => asset('storage/' . $filename),
            ]);
        }

        // ── Call ElevenLabs API ───────────────────────────────────────────────
        $response = Http::withHeaders([
            'xi-api-key' => $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'audio/mpeg',
        ])->post("https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}", [
                    'text' => $text,
                    'model_id' => 'eleven_turbo_v2_5',
                    'voice_settings' => [
                        'stability' => 0.5,
                        'similarity_boost' => 0.75,
                    ],
                ]);

        if (!$response->successful()) {
            Log::error('TTS: ElevenLabs API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return response()->json([
                'error' => 'ElevenLabs API request failed',
                'status' => $response->status(),
                'detail' => config('app.debug') ? $response->body() : null,
            ], 500);
        }

        // ── Save audio file ───────────────────────────────────────────────────
        try {
            Storage::disk('public')->put($filename, $response->body());
        } catch (\Throwable $e) {
            Log::error('TTS: Failed to save audio file', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Could not save audio file. Run: php artisan storage:link'], 500);
        }

        return response()->json([
            'url' => asset('storage/' . $filename),
        ]);
    }
}