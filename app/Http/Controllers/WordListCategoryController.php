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

        $ids = $wordLists->pluck('id')->toArray();

        $masteredCounts = $this->getMasteredCounts($ids);

        // Fetch the single order for this category for the current user
        $categoryOrder = null;
        $userHasAccess = false;
        if (auth()->check()) {
            $userHasAccess = UserWordListAccess::where('user_id', auth()->id())
                ->where('word_list_category_id', $category->id)
                ->exists();

            // Still fetch the latest order for pending/rejected banner info
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

        // Quiz eligibility: wordlists where at least 20 words have box >= 2
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

        // Wordlists that have at least one active DB quiz
        $hasQuizIds = [];
        if (!empty($ids)) {
            $hasQuizIds = \App\Models\Quiz::where('is_active', true)
                ->whereIn('wordlist_id', $ids)
                ->pluck('wordlist_id')
                ->unique()
                ->values()
                ->toArray();
        }

        // Quiz-unlocked: wordlists where is_locked=true but the user has a passing attempt
        $quizUnlockedIds = [];
        if (auth()->check() && !empty($ids)) {
            $quizUnlockedIds = QuizAttempt::where('user_id', auth()->id())
                ->where('passed', true)
                ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
                ->whereIn('quizzes.wordlist_id', $ids)
                ->pluck('quizzes.wordlist_id')
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
            'bkashNumber' => env('BKASH_NUMBER', '01825236112'),
        ]);
    }
}