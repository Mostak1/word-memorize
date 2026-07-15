<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect('/login')->with('flash', [
                'toast' => [
                    'type' => 'error',
                    'message' => 'Google login failed: ' . $e->getMessage()
                ]
            ]);
        }

        // 1. Try finding by google_id
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // 2. Try matching existing email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Existing user — link Google account and log in as usual
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'provider' => 'google',
                    // Only set avatar if the user doesn't already have one
                    'image' => $user->image ?? $googleUser->getAvatar(),
                ]);
            } else {
                // 3. Brand-new user — store Google data in session and ask for WhatsApp
                session([
                    'google_pending_user' => [
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),  // stored → saved to image column on completion
                    ],
                ]);

                return redirect()->route('complete.profile');
            }
        }

        Auth::login($user, true);

        $request->session()->regenerate();

        $userName = $user->name;

        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard'))
                ->with('flash', [
                    'toast' => [
                        'type' => 'success',
                        'message' => "Welcome back, {$userName}! 👋"
                    ]
                ]);
        }

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('flash', [
                'toast' => [
                    'type' => 'success',
                    'message' => "Welcome back, {$userName}! 👋"
                ]
            ]);
    }
}