<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WordProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserProgressController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = in_array((int) $request->input('per_page'), [10, 20, 50, 100])
            ? (int) $request->input('per_page')
            : 10;

        $users = $query->with(['streak', 'xp', 'wordProgresses'])
            ->select('id', 'name', 'email')
            ->paginate($perPage)
            ->withQueryString();

        // Get user IDs from the current page
        $userIds = $users->pluck('id');

        $stageCounts = WordProgress::query()
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->join('wordlists', 'words.wordlist_id', '=', 'wordlists.id')
            ->whereIn('word_progress.box', [2, 3, 4])
            ->whereIn('word_progress.user_id', $userIds)
            ->select(
                'word_progress.user_id',
                'wordlists.id as wordlist_id',
                'wordlists.title as wordlist_title',
                'word_progress.box',
                DB::raw('COUNT(*) as stage_count')
            )
            ->groupBy('word_progress.user_id', 'wordlists.id', 'wordlists.title', 'word_progress.box')
            ->get()
            ->groupBy('user_id');

        $users->setCollection($users->getCollection()->map(function ($user) use ($stageCounts) {
            $currentStreak = $user->streak?->current_streak ?? 0;
            $xp = $user->xp?->xp_balance ?? 0;
            $lastPractice = $user->wordProgresses->max('last_reviewed_at');
            $masteredWordsCount = $user->wordProgresses->where('box', '>=', 4)->count();

            $wordlistProgress = ($stageCounts[$user->id] ?? collect())
                ->groupBy('wordlist_id')
                ->map(function ($rows, $wordlistId) {
                    return [
                        'wordlist_id' => $wordlistId,
                        'wordlist_title' => $rows->first()->wordlist_title,
                        'learning_count' => $rows->firstWhere('box', 2)?->stage_count ?? 0,
                        'reviewing_count' => $rows->firstWhere('box', 3)?->stage_count ?? 0,
                        'mastered_count' => $rows->firstWhere('box', 4)?->stage_count ?? 0,
                    ];
                })
                ->sortByDesc(fn($row) => $row['mastered_count'])
                ->values()
                ->all();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'current_streak' => $currentStreak,
                'last_practice' => $lastPractice,
                'xp' => $xp,
                'mastered_words_count' => $masteredWordsCount,
                'wordlist_progress' => $wordlistProgress,
            ];
        }));

        return Inertia::render('Admin/UserProgress/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'per_page' => $perPage,
            ],
        ]);
    }
}
