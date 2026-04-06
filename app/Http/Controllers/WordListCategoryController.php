<?php

namespace App\Http\Controllers;

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
    // public function index()
    // {
    //     $wordListCategories = WordListCategory::withCount('wordlists')
    //         ->where('status', true)
    //         ->orderBy('created_at', 'desc')
    //         ->get();

    //     return Inertia::render('WordListCategoryIndex', [
    //         'wordListCategories' => $wordListCategories,
    //     ]);
    // }

    public function index()
    {
        $query = WordListCategory::withCount('wordlists')
            ->where('status', true)
            ->orderBy('created_at', 'desc');

        if (auth()->check()) {
            $user = auth()->user();

            // Show categories created by logged-in user OR by admin@gmail.com
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('creator', function ($subQuery) {
                        $subQuery->where('email', 'admin@gmail.com');
                    });
            });
        } else {
            // For guests: only show categories created by admin@gmail.com
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

        // Fetch the latest order per wordlist for the current user
        $userOrders = [];
        if (auth()->check()) {
            $orders = WordListOrder::where('user_id', auth()->id())
                ->whereIn('wordlist_id', $ids)
                ->latest()
                ->get(['wordlist_id', 'status', 'admin_note', 'address', 'name', 'phone_number', 'profession'])
                ->keyBy('wordlist_id');

            $userOrders = $orders->map(fn($o) => [
                'status' => $o->status,
                'admin_note' => $o->admin_note,
                'address' => $o->address,
                'name' => $o->name,
                'phone_number' => $o->phone_number,
                'profession' => $o->profession,
            ])->toArray();
        }

        // Quiz eligibility: wordlists where at least 20 words have box >= 2 (learning stage)
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

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
            'category' => $category,
            'currentCategory' => $category->name,
            'masteredCounts' => $masteredCounts,
            'userOrders' => $userOrders,
            'quizEligibleIds' => $quizEligibleIds,
            'bkashNumber' => env('BKASH_NUMBER', '01825236112'),
        ]);
    }
}