<?php

namespace App\Http\Controllers;

use App\Models\WordList;
use App\Models\WordListCategory;
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

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
            'category' => $category,
            'currentCategory' => $category->name,
            'masteredCounts' => $this->getMasteredCounts($ids),  // ← add this
        ]);
    }
}