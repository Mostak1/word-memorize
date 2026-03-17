<?php

namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\WordList;
use App\Models\Subcategory;
use App\Models\Word;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WordListController extends Controller
{
    /**
     * Display all word lists
     */
    public function index()
    {
        $wordLists = WordList::withCount('words')
            ->where('status', true)
            ->orderBy('difficulty')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
        ]);
    }

    private function bookmarkedIds(array $wordIds): array
    {
        if (!auth()->check())
            return [];
        return BookmarkedWord::where('user_id', auth()->id())
            ->whereIn('word_id', $wordIds)
            ->pluck('word_id')
            ->toArray();
    }

    /**
     * Display a specific word list:
     * - If it has subcategories → show subcategory list
     * - If no subcategories    → show words directly (fallback)
     */
    public function show(Request $request, $id)
    {
        $wordList = WordList::withCount('words')->findOrFail($id);

        $subcategories = Subcategory::where('wordlist_id', $id)
            ->withCount('words')
            ->orderBy('name')
            ->get();

        if ($subcategories->isEmpty()) {
            $words = $wordList->words()
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('WordlistDetail', [
                'wordList' => $wordList,
                'subcategories' => [],
                'words' => $words,
            ]);
        }

        return Inertia::render('WordlistDetail', [
            'wordList' => $wordList,
            'subcategories' => $subcategories,
            'words' => null,
        ]);
    }

    /**
     * Show words for a specific subcategory within a word list
     */
    public function showSubcategory(Request $request, $wordListId, $subcategoryId)
    {
        $wordList = WordList::withCount('words')->findOrFail($wordListId);

        $subcategory = Subcategory::where('id', $subcategoryId)
            ->where('wordlist_id', $wordListId)
            ->withCount('words')
            ->firstOrFail();

        $words = Word::where('wordlist_id', $wordListId)
            ->where('subcategory_id', $subcategoryId)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('WordlistSubcategory', [
            'wordList' => $wordList,
            'subcategory' => $subcategory,
            'words' => $words,
        ]);
    }

    /**
     * Start an exercise session for a specific word list
     */
    public function start($id)
    {
        $wordList = WordList::with('words.images')->findOrFail($id);

        $words = $wordList->words->shuffle()->values();

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words,
            'subcategory' => null,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
        ]);
    }

    /**
     * Start an exercise session for a specific subcategory (words shuffled)
     */
    public function startSubcategory($wordListId, $subcategoryId)
    {
        $wordList = WordList::findOrFail($wordListId);

        $subcategory = Subcategory::where('id', $subcategoryId)
            ->where('wordlist_id', $wordListId)
            ->firstOrFail();

        $words = Word::with('images')
            ->where('wordlist_id', $wordListId)
            ->where('subcategory_id', $subcategoryId)
            ->get()
            ->shuffle()
            ->values();

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words,
            'subcategory' => $subcategory,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
        ]);
    }

    /**
     * Get word lists filtered by difficulty
     */
    public function byDifficulty($difficulty)
    {
        $wordLists = WordList::difficulty($difficulty)
            ->withCount('words')
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
            'currentDifficulty' => $difficulty,
        ]);
    }

    /**
     * Display a single word detail page
     */
    public function showWord(Request $request, $id)
    {
        $word = Word::with(['wordList', 'images'])->findOrFail($id);

        $isBookmarked = auth()->check()
            ? \App\Models\BookmarkedWord::where('user_id', auth()->id())
                ->where('word_id', $word->id)->exists()
            : false;

        return Inertia::render('WordDetail', [
            'word' => $word,
            'wordList' => $word->wordList,
            'subCategory' => $word->subcategory,
            'isMastered' => $request->query('from') === 'mastered',
            'isBookmarked' => $isBookmarked,   // ← new
        ]);
    }

    public function masteredWords()
    {
        $words = \App\Models\MasteredWord::where('user_id', auth()->id())
            ->with(['word.wordList', 'word.images'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn($entry) => $entry->word);

        return Inertia::render('MasteredWords', [
            'words' => $words,
        ]);
    }

    /**
     * Show all words the authenticated user is still reviewing.
     */
    public function reviewWords()
    {
        $words = \App\Models\ReviewWord::where('user_id', auth()->id())
            ->with(['word.wordList', 'word.images'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn($entry) => $entry->word);

        return Inertia::render('ReviewWords', [
            'words' => $words,
        ]);
    }
}