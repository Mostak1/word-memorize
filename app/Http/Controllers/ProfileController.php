<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'followerCount' => $user->followerCount(),
            'followingCount' => $user->followingCount(),
        ]);
    }

    /**
     * Show followers of the logged-in user.
     */
    public function followers(Request $request): Response
    {
        $user = $request->user();
        $followers = $user->followers()->paginate(20);

        return Inertia::render('Profile/Followers', [
            'followers' => $followers,
            'followerCount' => $user->followerCount(),
            'followingCount' => $user->followingCount(),
        ]);
    }

    /**
     * Show users that the logged-in user is following.
     */
    public function following(Request $request): Response
    {
        $user = $request->user();
        $following = $user->following()->paginate(20);

        return Inertia::render('Profile/Following', [
            'following' => $following,
            'followerCount' => $user->followerCount(),
            'followingCount' => $user->followingCount(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => ['image', 'max:2000'],
            ]);

            // Construct the Fluento API URL
            $apiUrl = rtrim(config('services.fluento.image_api_url', 'http://localhost/fluento/public/api/users'), '/') . '/' . $user->id . '/image';
            $apiToken = config('services.fluento.image_api_token');

            // Send image using Laravel Http client
            $response = \Illuminate\Support\Facades\Http::withToken($apiToken)
                ->attach(
                    'avatar', 
                    file_get_contents($request->file('avatar')->getRealPath()), 
                    $request->file('avatar')->getClientOriginalName()
                )
                ->post($apiUrl);

            if ($response->failed()) {
                return back()->withErrors([
                    'avatar' => 'Failed to upload profile image to the image storage API: ' . ($response->json('message') ?? 'Unknown error')
                ]);
            }
            
            // Refresh to sync the shared database changes (user image column updated by Fluento)
            $user->refresh();
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}