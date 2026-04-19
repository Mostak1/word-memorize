<?php

namespace App\Http\Controllers;

use App\Services\AchievementService;
use Illuminate\Http\Request;

class UserAchievementController extends Controller
{
    public function __construct(private AchievementService $achievementService)
    {
    }

    /**
     * Get user's achievements with progress.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check and award any newly-qualified achievements
        $this->achievementService->checkAndAwardAchievements($user);

        $achievements = $this->achievementService->getUserAchievements($user);

        return response()->json([
            'achievements' => $achievements,
        ]);
    }

    /**
     * Get unseen achievements and mark them as seen (notified).
     */
    public function getUnseen(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['unseen' => []]);
        }

        $unseen = \App\Models\UserAchievement::where('user_id', $user->id)
            ->where('notified', false)
            ->with('achievement')
            ->get();

        if ($unseen->isNotEmpty()) {
            \App\Models\UserAchievement::whereIn('id', $unseen->pluck('id'))
                ->update(['notified' => true]);
        }

        return response()->json(['unseen' => $unseen]);
    }
}
