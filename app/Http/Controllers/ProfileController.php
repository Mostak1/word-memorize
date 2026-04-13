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
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

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