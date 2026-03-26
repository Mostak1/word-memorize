<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login');
        }

        // 1. Try finding by google_id
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // 2. Try matching existing email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Link account
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'provider' => 'google',
                ]);
            } else {
                // 3. Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'provider' => 'google',
                    'password' => bcrypt(str()->random(16)),

                    // optional defaults for your schema
                    'role' => 'student',
                    'approve_status' => 'approved',
                ]);
            }
        }

        Auth::login($user, true);

        return redirect('/dashboard'); // your inertia route
    }
}
