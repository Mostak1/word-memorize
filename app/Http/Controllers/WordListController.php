<?php

namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\MasteredWord;
use App\Models\ReviewWord;
use App\Models\WordList;
use App\Models\Word;
use App\Services\SrsService;
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
            'category' => $wordList->category,
        ]);
    }

    public function start(SrsService $srsService, $id)
    {
        $wordList = WordList::where('id', $id)
            ->where('status', true)
            ->withCount('words')    // ← so totalWordsInList is always available
            ->firstOrFail();

        if ($wordList->is_locked) {
            abort(403, 'This word list is locked.');
        }

        if (auth()->check()) {
            // Hybrid SRS: build the capped 20-word Active Queue
            $words = $srsService->buildSessionQueue(auth()->user(), (int) $id);
        } else {
            // Guests: first 20 words in order, no SRS metadata
            $words = Word::with('images')
                ->where('wordlist_id', $id)
                ->orderBy('id')
                ->limit(20)
                ->get()
                ->map(function ($w) {
                    $w->srs_box = 1;
                    $w->srs_label = 'New';
                    $w->srs_color = 'bg-gray-100 text-gray-600';
                    return $w;
                });
        }

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words->values(),
            'subcategory' => null,
            'totalWordsInList' => $wordList->words_count, // full list size for progress display
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
        ]);
    }

    public function startSubcategory($wordListId, $subcategoryId)
    {
        $wordList = WordList::where('id', $wordListId)
            ->where('status', true)
            ->withCount('words')
            ->firstOrFail();

        $words = Word::with('images')
            ->where('wordlist_id', $wordListId)
            ->get()->shuffle()->values();

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words,
            'totalWordsInList' => $wordList->words_count,
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
            $masteredIds = MasteredWord::where('user_id', auth()->id())
                ->latest()
                ->pluck('word_id')
                ->toArray();

            $currentIndex = array_search($word->id, $masteredIds);

            if ($currentIndex !== false) {
                $prevWordId = $currentIndex > 0
                    ? $masteredIds[$currentIndex - 1]
                    : null;
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