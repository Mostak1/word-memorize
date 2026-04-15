<?php

namespace App\Http\Middleware;

use App\Models\UserSetting;
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
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'image' => $user->image,
                    'headline' => $user->headline,
                    'approve_status' => $user->approve_status,
                    'wallet' => $user->wallet,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                    // ── Profile fields (were missing — caused empty inputs) ──
                    'phone_number' => $user->phone_number,
                    'location' => $user->location,
                    'gender' => $user->gender,
                    'profession' => $user->profession,
                    'xp' => app(XpService::class)->getSummary($user),
                ] : null,
            ],
            'userSettings' => function () use ($user) {
                if (! $user) {
                    return ['show_bangla' => true, 'sound_effects' => true];
                }
                $settings = UserSetting::forUser($user);   // This creates row automatically if not exists

                return [
                    'show_bangla' => (bool) $settings->show_bangla,
                    'sound_effects' => (bool) $settings->sound_effects,
                ];
            },
            // ✅ Flash messages for Sonner toasts
            'flash' => [
                'toast' => fn () => $request->session()->get('flash.toast'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'message' => fn () => $request->session()->get('message'),
            ],
        ];
    }
}
