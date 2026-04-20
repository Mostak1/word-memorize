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
        $limit = 20;

        // Fetch users efficiently. Using withCount for mastered_count to avoid N+1 query.
        $usersQuery = User::with(['xp', 'streak'])
            ->withCount(['wordProgresses as mastered_count' => function ($query) {
                $query->where('box', '>=', WordProgress::MASTERED_BOX);
            }])
            ->where('approve_status', 'approved');

        $allUsersCollection = $usersQuery->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'headline' => $user->headline,
                'image' => $user->image,
                'email' => $user->email,
                'xp' => $user->xp->xp_balance ?? 0,
                'mastered_count' => $user->mastered_count ?? 0,
                'current_streak' => $user->streak->current_streak ?? 0,
                'longest_streak' => $user->streak->longest_streak ?? 0,
            ];
        });

        // Filter out admin from the visible leaderboard list
        $visibleUsers = $allUsersCollection->reject(function ($user) {
            return $user['email'] === 'admin@gmail.com';
        });

        // Sort the visible leaderboard list
        switch ($sortBy) {
            case 'mastered':
                $visibleUsers = $visibleUsers->sortByDesc('mastered_count')->values();
                break;
            case 'streak':
                $visibleUsers = $visibleUsers->sortByDesc('current_streak')->values();
                break;
            case 'xp':
            default:
                $visibleUsers = $visibleUsers->sortByDesc('xp')->values();
                break;
        }

        $users = $visibleUsers->take($limit)->values();

        // Calculate the authenticated user's rank
        $currentUser = $request->user();
        $currentUserRank = null;

        if ($currentUser) {
            if ($currentUser->email === 'admin@gmail.com') {
                // Admin gets their rank calculated against everyone (including themselves)
                switch ($sortBy) {
                    case 'mastered':
                        $allUsersData = $allUsersCollection->sortByDesc('mastered_count')->values();
                        break;
                    case 'streak':
                        $allUsersData = $allUsersCollection->sortByDesc('current_streak')->values();
                        break;
                    case 'xp':
                    default:
                        $allUsersData = $allUsersCollection->sortByDesc('xp')->values();
                        break;
                }
                $searchIndex = $allUsersData->pluck('id')->search($currentUser->id);
            } else {
                // Regular users get their rank calculated against visible users ONLY
                // Note: $visibleUsers is already sorted appropriately above
                $searchIndex = $visibleUsers->pluck('id')->search($currentUser->id);
            }

            $currentUserRank = $searchIndex !== false ? $searchIndex + 1 : null;
        }

        return Inertia::render('Leaderboard', [
            'users' => $users,
            'currentUserRank' => $currentUserRank,
            'sortBy' => $sortBy,
        ]);
    }
}
