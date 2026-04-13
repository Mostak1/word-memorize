<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WordProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $sortBy = $request->input('sort', 'xp'); // xp, mastered, streak
        $limit = 50;

        $users = User::with(['xp', 'streak'])
            ->where('approve_status', 'approved')
            ->where('email', '!=', 'admin@gmail.com')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'headline' => $user->headline,
                    'image' => $user->image,
                    'xp' => $user->xp->xp_balance ?? 0,
                    'mastered_count' => WordProgress::where('user_id', $user->id)
                        ->where('box', '>=', WordProgress::MASTERED_BOX)
                        ->count(),
                    'current_streak' => $user->streak->current_streak ?? 0,
                    'longest_streak' => $user->streak->longest_streak ?? 0,
                ];
            });

        // Sort based on sortBy
        switch ($sortBy) {
            case 'mastered':
                $users = $users->sortByDesc('mastered_count');
                break;
            case 'streak':
                $users = $users->sortByDesc('current_streak');
                break;
            case 'xp':
            default:
                $users = $users->sortByDesc('xp');
                break;
        }

        $users = $users->take($limit)->values();

        // Find current user's rank
        $currentUser = $request->user();
        $currentUserRank = null;
        if ($currentUser) {
            $allUsers = User::with(['xp', 'streak'])
                ->where('approve_status', 'approved')
                ->where('email', '!=', 'admin@gmail.com')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'xp' => $user->xp->xp_balance ?? 0,
                        'mastered_count' => WordProgress::where('user_id', $user->id)
                            ->where('box', '>=', WordProgress::MASTERED_BOX)
                            ->count(),
                        'current_streak' => $user->streak->current_streak ?? 0,
                    ];
                });

            switch ($sortBy) {
                case 'mastered':
                    $allUsers = $allUsers->sortByDesc('mastered_count');
                    break;
                case 'streak':
                    $allUsers = $allUsers->sortByDesc('current_streak');
                    break;
                case 'xp':
                default:
                    $allUsers = $allUsers->sortByDesc('xp');
                    break;
            }

            $currentUserRank = $allUsers->pluck('id')->search($currentUser->id) + 1;
        }

        return Inertia::render('Leaderboard', [
            'users' => $users,
            'currentUserRank' => $currentUserRank,
            'sortBy' => $sortBy,
        ]);
    }
}
