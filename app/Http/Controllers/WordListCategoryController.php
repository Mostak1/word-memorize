<?php

namespace App\Http\Controllers;

use App\Models\QuizAttempt;
use App\Models\UserWordListAccess;
use App\Models\WordList;
use App\Models\WordListCategory;
use App\Models\WordListOrder;
use App\Models\WordProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WordListCategoryController extends Controller
{
    private function getMasteredCounts(array $wordListIds): array
    {
        if (!auth()->check() || empty($wordListIds))
            return [];

        return WordProgress::where('user_id', auth()->id())
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->whereHas('word', fn($q) => $q->whereIn('wordlist_id', $wordListIds))
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->selectRaw('words.wordlist_id, count(*) as cnt')
            ->groupBy('words.wordlist_id')
            ->pluck('cnt', 'wordlist_id')
            ->toArray();
    }

    public function index()
    {
        $query = WordListCategory::withCount('wordlists')
            ->where('status', true)
            ->orderBy('created_at', 'desc');

        if (auth()->check()) {
            $user = auth()->user();

            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('creator', function ($subQuery) {
                        $subQuery->where('email', 'admin@gmail.com');
                    });
            });
        } else {
            $query->whereHas('creator', function ($subQuery) {
                $subQuery->where('email', 'admin@gmail.com');
            });
        }

        $wordListCategories = $query->get();

        return Inertia::render('WordListCategoryIndex', [
            'wordListCategories' => $wordListCategories,
        ]);
    }

    public function showWordlists(WordListCategory $category)
    {
        $wordLists = WordList::withCount('words')
            ->where('word_list_category_id', $category->id)
            ->where('status', true)
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();

        // IDs on the current page only
        $ids = $wordLists->pluck('id')->toArray();

        $masteredCounts = $this->getMasteredCounts($ids);

        // ── Category purchase / access state ──────────────────────────────────
        $categoryOrder = null;
        $userHasAccess = false;

        if (auth()->check()) {
            $userHasAccess = UserWordListAccess::where('user_id', auth()->id())
                ->where('word_list_category_id', $category->id)
                ->exists();

            $order = WordListOrder::where('user_id', auth()->id())
                ->whereHas('items', fn($q) => $q->where('word_list_category_id', $category->id))
                ->latest()
                ->first(['id', 'status', 'admin_note', 'name', 'phone_number', 'address', 'profession']);

            if ($order) {
                $categoryOrder = [
                    'status' => $order->status,
                    'admin_note' => $order->admin_note,
                    'address' => $order->address,
                    'name' => $order->name,
                    'phone_number' => $order->phone_number,
                    'profession' => $order->profession,
                ];
            }
        }

        // ── Step 1: All ordered IDs for this category (all pages) ────────────
        // Needed so "previous wordlist" resolution works correctly across
        // pagination boundaries.
        $allOrderedIds = WordList::where('word_list_category_id', $category->id)
            ->where('status', true)
            ->orderBy('id')
            ->pluck('id')
            ->toArray();

        // ── Step 2: Wordlist IDs the user has already passed a quiz for ───────
        // Covers both admin DB quizzes and the auto-generated __auto__ quizzes
        // created by QuizController::finish().
        $passedQuizWordlistIds = [];
        if (auth()->check() && !empty($allOrderedIds)) {
            $passedQuizWordlistIds = QuizAttempt::where('user_id', auth()->id())
                ->where('passed', true)
                ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
                ->whereIn('quizzes.wordlist_id', $allOrderedIds)
                ->pluck('quizzes.wordlist_id')
                ->unique()
                ->values()
                ->toArray();
        }

        // ── Step 3: is_locked map for every wordlist in the category ──────────
        // Lightweight — only fetches the lock flag, not full models.
        $allLockStatus = WordList::whereIn('id', $allOrderedIds)
            ->pluck('is_locked', 'id')
            ->toArray(); // [ wordlistId => bool ]

        // ── Step 4: Compute which wordlists are accessible to this user ───────
        // A wordlist is accessible when:
        //   (a) its is_locked flag is false (admin left it open), OR
        //   (b) it IS locked but the user passed the quiz for the one before it.
        $accessibleIds = [];
        foreach ($allOrderedIds as $pos => $wlId) {
            if (empty($allLockStatus[$wlId])) {
                // Not locked → always open
                $accessibleIds[] = $wlId;
            } elseif ($pos > 0 && in_array($allOrderedIds[$pos - 1], $passedQuizWordlistIds)) {
                // Locked but user passed the previous quiz → unlocked
                $accessibleIds[] = $wlId;
            }
        }

        // ── Step 5: Per-locked-wordlist data (current page only) ─────────────
        $quizUnlockedIds = []; // locked IDs that the user has now unlocked
        $previousWordlistIdMap = []; // [ lockedId => previousWordlistId ]

        foreach ($ids as $wlId) {
            $wl = $wordLists->firstWhere('id', $wlId);
            if (!$wl || !$wl->is_locked) {
                continue;
            }

            $pos = array_search($wlId, $allOrderedIds);

            // The very first wordlist in the category cannot be quiz-unlocked
            // (there is nothing before it).
            if ($pos === false || $pos === 0) {
                continue;
            }

            $prevId = $allOrderedIds[$pos - 1];
            $previousWordlistIdMap[$wlId] = $prevId;

            // Unlocked when the user passed the quiz for the previous wordlist
            if (in_array($prevId, $passedQuizWordlistIds)) {
                $quizUnlockedIds[] = $wlId;
            }
        }

        // ── Step 6: Which locked cards may show the "Take Quiz" button ────────
        // Three conditions must ALL be true for the button to appear:
        //   1. The previous wordlist is accessible (not locked, or quiz-unlocked).
        //   2. The user can actually take the previous wordlist's quiz, meaning:
        //        (a) they have ≥ 20 words at box ≥ 2 in it (auto-quiz gate), OR
        //        (b) it has an active admin-created DB quiz (no learning gate).
        //
        // Without condition 2, a locked card shows "Take Quiz" even when the
        // previous wordlist's quiz is itself not yet reachable by the user.

        $prevIds = array_values(array_unique(array_values($previousWordlistIdMap)));

        // (a) Learning progress on the previous wordlists
        $prevLearnedCounts = [];
        if (auth()->check() && !empty($prevIds)) {
            $prevLearnedCounts = WordProgress::where('user_id', auth()->id())
                ->where('box', '>=', 2)
                ->join('words', 'word_progress.word_id', '=', 'words.id')
                ->whereIn('words.wordlist_id', $prevIds)
                ->selectRaw('words.wordlist_id, count(*) as cnt')
                ->groupBy('words.wordlist_id')
                ->pluck('cnt', 'wordlist_id')
                ->toArray();
        }

        // (b) Previous wordlists that have an active admin DB quiz
        $prevHasDbQuizIds = [];
        if (!empty($prevIds)) {
            $prevHasDbQuizIds = \App\Models\Quiz::where('is_active', true)
                ->whereIn('wordlist_id', $prevIds)
                ->pluck('wordlist_id')
                ->toArray();
        }

        $quizTakeableIds = [];
        foreach ($previousWordlistIdMap as $lockedId => $prevId) {
            $prevAccessible = in_array($prevId, $accessibleIds);
            $prevHasDbQuiz = in_array($prevId, $prevHasDbQuizIds);
            $prevWordsLearned = ($prevLearnedCounts[$prevId] ?? 0) >= 20;

            if ($prevAccessible && ($prevHasDbQuiz || $prevWordsLearned)) {
                $quizTakeableIds[] = $lockedId;
            }
        }

        // ── Step 7: Quiz eligibility for UNLOCKED wordlists ───────────────────
        // A user may take the quiz on an accessible wordlist once they have
        // reached the learning stage (box >= 2) on at least 20 words in it.
        $quizEligibleIds = [];
        if (auth()->check() && !empty($ids)) {
            $learnedCounts = WordProgress::where('user_id', auth()->id())
                ->where('box', '>=', 2)
                ->join('words', 'word_progress.word_id', '=', 'words.id')
                ->whereIn('words.wordlist_id', $ids)
                ->selectRaw('words.wordlist_id, count(*) as cnt')
                ->groupBy('words.wordlist_id')
                ->pluck('cnt', 'wordlist_id')
                ->toArray();

            foreach ($wordLists as $wl) {
                if (($learnedCounts[$wl->id] ?? 0) >= 20) {
                    $quizEligibleIds[] = $wl->id;
                }
            }
        }

        // ── Step 8: Wordlists that have an admin-created active DB quiz ───────
        $hasQuizIds = [];
        if (!empty($ids)) {
            $hasQuizIds = \App\Models\Quiz::where('is_active', true)
                ->whereIn('wordlist_id', $ids)
                ->pluck('wordlist_id')
                ->unique()
                ->values()
                ->toArray();
        }

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
            'category' => $category,
            'currentCategory' => $category->name,
            'masteredCounts' => $masteredCounts,
            'categoryOrder' => $categoryOrder,
            'userHasAccess' => $userHasAccess,
            'quizEligibleIds' => $quizEligibleIds,
            'hasQuizIds' => $hasQuizIds,
            'quizUnlockedIds' => $quizUnlockedIds,
            'previousWordlistIdMap' => $previousWordlistIdMap,
            'quizTakeableIds' => $quizTakeableIds,
            'bkashNumber' => env('BKASH_NUMBER', '01825236112'),
        ]);
    }
}