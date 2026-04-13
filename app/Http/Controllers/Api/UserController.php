<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Search users by name or email
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (empty($query)) {
            return response()->json(['users' => []]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->where('approve_status', 'approved')
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Show public user profile
     */
    public function show(User $user): JsonResponse
    {
        // Ensure user is approved
        if (!$user->isApproved()) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $achievements = $user->userAchievements()->with('achievement')->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'headline' => $user->headline,
                'profession' => $user->profession,
                'location' => $user->location,
                'bio' => $user->bio,
                'image' => $user->image,
                'follower_count' => $user->followerCount(),
                'following_count' => $user->followingCount(),
            ],
            'achievements' => $achievements->map(function ($userAchievement) {
                return [
                    'id' => $userAchievement->achievement->id,
                    'name' => $userAchievement->achievement->name,
                    'description' => $userAchievement->achievement->description,
                    'icon' => $userAchievement->achievement->icon,
                    'category' => $userAchievement->achievement->category,
                    'tier' => $userAchievement->achievement->tier,
                    'awarded_at' => $userAchievement->awarded_at,
                ];
            }),
        ]);
    }
}
