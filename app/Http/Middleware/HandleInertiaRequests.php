<?php

namespace App\Http\Middleware;

use App\Services\XpService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'image' => $request->user()->image,
                    'headline' => $request->user()->headline,
                    'approve_status' => $request->user()->approve_status,
                    'wallet' => $request->user()->wallet,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'created_at' => $request->user()->created_at,
                    'updated_at' => $request->user()->updated_at,
                    // ── Profile fields (were missing — caused empty inputs) ──
                    'phone_number' => $request->user()->phone_number,
                    'location' => $request->user()->location,
                    'gender' => $request->user()->gender,
                    'profession' => $request->user()->profession,
                    'xp' => app(XpService::class)->getSummary($request->user()),
                ] : null,
            ],
            // ✅ Flash messages for Sonner toasts
            'flash' => [
                'toast' => fn() => $request->session()->get('flash.toast'),
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
                'message' => fn() => $request->session()->get('message'),
            ],
        ];
    }
}