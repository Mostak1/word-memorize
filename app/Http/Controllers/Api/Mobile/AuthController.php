<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\UserResource;
use App\Models\User;
use App\Models\UserSetting;
use App\Services\StreakService;
use App\Services\XpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private StreakService $streakService,
        private XpService $xpService,
    ) {
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['required', Rules\Password::defaults()],
            'location' => ['nullable', 'string', 'max:255'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        foreach ([
            'phone_number' => $data['phone_number'] ?? null,
            'location' => $data['location'] ?? null,
            'role' => 'student',
            'login_as' => 'student',
            'approve_status' => 'approved',
        ] as $column => $value) {
            if (Schema::hasColumn('users', $column)) {
                $attributes[$column] = $value;
            }
        }

        $user = User::create($attributes);

        return $this->tokenResponse($request, $user, $data['device_name'] ?? 'android', 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->tokenResponse($request, $user, $data['device_name'] ?? 'android');
    }

    public function me(Request $request)
    {
        return response()->json($this->userPayload($request, $request->user()));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['status' => 'ok']);
    }

    private function tokenResponse(Request $request, User $user, string $deviceName, int $status = 200)
    {
        $token = $user->createToken($deviceName, ['mobile'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            ...$this->userPayload($request, $user),
        ], $status);
    }

    private function userPayload(Request $request, User $user): array
    {
        $settings = UserSetting::forUser($user);

        return [
            'user' => (new UserResource($user))->resolve($request),
            'settings' => [
                'show_bangla' => (bool) $settings->show_bangla,
                'sound_effects' => (bool) $settings->sound_effects,
                'ui_language' => $settings->ui_language ?? 'en',
                'dark_mode_unlocked' => (bool) ($settings->dark_mode_unlocked ?? false),
            ],
            'xp' => $this->xpService->getSummary($user),
            'streak' => $this->streakService->getSummary($user),
        ];
    }
}
