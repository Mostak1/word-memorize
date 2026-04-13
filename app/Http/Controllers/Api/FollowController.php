<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    /**
     * Follow a user
     */
    public function follow(Request $request, User $user)
    {
        $currentUser = auth()->user();

        $isInertia = $request->header('X-Inertia');

        if ($currentUser->id === $user->id) {
            if ($request->wantsJson() && !$isInertia) {
                return response()->json(['message' => 'Cannot follow yourself'], 400);
            }

            return back()->with('error', 'Cannot follow yourself');
        }

        if ($currentUser->following()->where('following_id', $user->id)->exists()) {
            if ($request->wantsJson() && !$isInertia) {
                return response()->json(['message' => 'Already following this user'], 400);
            }

            return back()->with('error', 'Already following this user');
        }

        $currentUser->following()->attach($user->id);

        if ($request->wantsJson() && !$isInertia) {
            return response()->json(['message' => 'Successfully followed user']);
        }

        return back()->with('success', 'Successfully followed user');
    }

    /**
     * Unfollow a user
     */
    public function unfollow(Request $request, User $user)
    {
        $currentUser = auth()->user();
        $isInertia = $request->header('X-Inertia');

        $currentUser->following()->detach($user->id);

        if ($request->wantsJson() && !$isInertia) {
            return response()->json(['message' => 'Successfully unfollowed user']);
        }

        return back()->with('success', 'Successfully unfollowed user');
    }

    /**
     * Get followers of a user
     */
    public function followers(User $user): JsonResponse
    {
        $followers = $user->followers()->paginate(20);

        return response()->json($followers);
    }

    /**
     * Get users that a user is following
     */
    public function following(User $user): JsonResponse
    {
        $following = $user->following()->paginate(20);

        return response()->json($following);
    }
}
