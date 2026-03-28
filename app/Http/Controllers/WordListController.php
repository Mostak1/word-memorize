<?php

namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\MasteredWord;
use App\Models\ReviewWord;
use App\Models\WordList;
use App\Models\Word;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WordListController extends Controller
{
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
     * Display a specific word list.
     * Passes `category` so WordlistDetail's back button returns to the
     * correct category wordlist page.
     * NOTE: The relationship on WordList is named category(), not wordListCategory().
     */
    public function show(Request $request, $id)
    {
        $wordList = WordList::with('category')
            ->where('status', true)
            ->withCount('words')
            ->findOrFail($id);

        if ($wordList->is_locked) {
            abort(403, 'This word list is locked.');
        }

        $words = $wordList->words()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('WordlistDetail', [
            'wordList' => $wordList,
            'words' => $words,
            'category' => $wordList->category,   // ← correct relationship name
        ]);
    }

    public function start($id)
    {
        $wordList = WordList::where('id', $id)
            ->where('status', true)
            ->firstOrFail();

        if ($wordList->is_locked) {
            abort(403, 'This word list is locked.');
        }

        $wordsQuery = Word::with('images')->where('wordlist_id', $id);

        // Exclude already-mastered words for logged-in users
        if (auth()->check()) {
            $masteredWordIds = MasteredWord::where('user_id', auth()->id())
                ->pluck('word_id');

            if ($masteredWordIds->isNotEmpty()) {
                $wordsQuery->whereNotIn('id', $masteredWordIds);
            }
        }

        // $words = $wordsQuery->get()->shuffle()->values();
        $words = $wordsQuery
            ->orderBy('id', 'asc')
            ->get()
            ->values();

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words,
            'subcategory' => null,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
        ]);
    }

    public function startSubcategory($wordListId, $subcategoryId)
    {
        // $wordList = WordList::findOrFail($wordListId);
        $wordList = WordList::where('id', $wordListId)
            ->where('status', true)
            ->firstOrFail();
        $words = Word::with('images')
            ->where('wordlist_id', $wordListId)
            ->get()->shuffle()->values();

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
        ]);
    }

    public function byDifficulty($difficulty)
    {
        $wordLists = WordList::difficulty($difficulty)
            ->withCount('words')
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Wordlist', [
            'wordLists' => $wordLists,
            'currentDifficulty' => $difficulty,
        ]);
    }

    /**
     * Display a single word detail page.
     *
     * When coming from=mastered, also resolves the previous and next word IDs
     * in the user's mastered list (ordered latest-first, same as MasteredWords page)
     * so the frontend can render Prev / Next navigation.
     */
    public function showWord(Request $request, $id)
    {
        $word = Word::with(['wordList', 'images'])->findOrFail($id);

        $isBookmarked = auth()->check()
            ? BookmarkedWord::where('user_id', auth()->id())
                ->where('word_id', $word->id)->exists()
            : false;

        $prevWordId = null;
        $nextWordId = null;

        if ($request->query('from') === 'mastered' && auth()->check()) {
            // Get all mastered word IDs in the same order as the MasteredWords page
            $masteredIds = MasteredWord::where('user_id', auth()->id())
                ->latest()
                ->pluck('word_id')
                ->toArray();

            $currentIndex = array_search($word->id, $masteredIds);

            if ($currentIndex !== false) {
                // "Previous" = earlier in the list (lower index = more recently mastered)
                $prevWordId = $currentIndex > 0
                    ? $masteredIds[$currentIndex - 1]
                    : null;

                // "Next" = later in the list (higher index = older mastered)
                $nextWordId = $currentIndex < count($masteredIds) - 1
                    ? $masteredIds[$currentIndex + 1]
                    : null;
            }
        }

        return Inertia::render('WordDetail', [
            'word' => $word,
            'wordList' => $word->wordList,
            'subCategory' => $word->subcategory,
            'isMastered' => $request->query('from') === 'mastered',
            'isBookmarked' => $isBookmarked,
            'prevWordId' => $prevWordId,
            'nextWordId' => $nextWordId,
        ]);
    }

    public function masteredWords()
    {
        $userId = auth()->id();

        // Wordlists that have at least one mastered word for this user
        $wordlists = WordList::whereHas('words.masteredEntries', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })
            ->withCount([
                'words as total_words',
                'words as mastered_count' => function ($q) use ($userId) {
                    $q->whereHas('masteredEntries', fn($q2) => $q2->where('user_id', $userId));
                },
            ])
            ->get(['id', 'title', 'difficulty']);

        $totalMastered = MasteredWord::where('user_id', $userId)->count();

        return Inertia::render('MasteredWords', [
            'wordlists' => $wordlists,
            'totalMastered' => $totalMastered,
        ]);
    }

    public function masteredWordsByList($wordlistId)
    {
        $userId = auth()->id();

        $wordlist = WordList::where('id', $wordlistId)
            ->where('status', true)
            ->firstOrFail();

        if ($wordlist->is_locked) {
            abort(403, 'This word list is locked.');
        }
        $words = Word::where('wordlist_id', $wordlistId)
            ->whereHas('masteredEntries', fn($q) => $q->where('user_id', $userId))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('MasteredWordsByList', [
            'words' => $words,
            'wordlist' => $wordlist,
        ]);
    }

    public function reviewWords()
    {
        $words = ReviewWord::where('user_id', auth()->id())
            ->with(['word.wordList', 'word.images'])
            ->latest()->paginate(20)->withQueryString()
            ->through(fn($e) => $e->word);

        return Inertia::render('ReviewWords', ['words' => $words]);
    }
}