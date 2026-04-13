<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WordProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserPublicProfileController extends Controller
{
  public function show(Request $request, User $user)
  {
    if (!$user->isApproved()) {
      abort(404);
    }

    $user->loadMissing(['xp', 'streak']);

    $achievements = $user->userAchievements()
      ->with('achievement')
      ->get()
      ->map(function ($userAchievement) {
        return [
          'id' => $userAchievement->achievement->id,
          'name' => $userAchievement->achievement->name,
          'description' => $userAchievement->achievement->description,
          'icon' => $userAchievement->achievement->icon,
          'category' => $userAchievement->achievement->category,
          'tier' => $userAchievement->achievement->tier,
          'awarded_at' => $userAchievement->awarded_at,
        ];
      });

    $currentUser = $request->user();
    $isFollowing = false;

    if ($currentUser && $currentUser->id !== $user->id) {
      $isFollowing = $currentUser->following()->where('following_id', $user->id)->exists();
    }

    $masteredCount = WordProgress::where('user_id', $user->id)
      ->where('box', '>=', WordProgress::MASTERED_BOX)
      ->count();

    return Inertia::render('PublicProfile', [
      'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'headline' => $user->headline,
        'profession' => $user->profession,
        'location' => $user->location,
        'bio' => $user->bio,
        'image' => $user->image,
        'facebook' => $user->facebook,
        'x' => $user->x,
        'linkedin' => $user->linkedin,
        'website' => $user->website,
        'github' => $user->github,
        'follower_count' => $user->followerCount(),
        'following_count' => $user->followingCount(),
        'xp' => $user->xp->xp_balance ?? 0,
        'mastered_count' => $masteredCount,
        'current_streak' => $user->streak->current_streak ?? 0,
      ],
      'achievements' => $achievements,
      'isFollowing' => $isFollowing,
      'canFollow' => $currentUser && $currentUser->id !== $user->id,
    ]);
  }
}
