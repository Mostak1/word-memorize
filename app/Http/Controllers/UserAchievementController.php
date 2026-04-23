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
     * Get unseen achievements without marking them as seen yet.
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

        return response()->json(['unseen' => $unseen]);
    }

    /**
     * Mark specific achievements as seen (notified).
     */
    public function markSeen(Request $request)
    {
        $user = $request->user();
        $ids = $request->input('ids', []);

        if (!$user || empty($ids)) {
            return response()->json(['status' => 'ignored']);
        }

        \App\Models\UserAchievement::where('user_id', $user->id)
            ->whereIn('id', $ids)
            ->update(['notified' => true]);

        return response()->json(['status' => 'success']);
    }
}
