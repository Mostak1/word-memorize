<?php

namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\ReviewWord;
use App\Models\Word;
use App\Services\SrsService;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewWordController extends Controller
{
    public function __construct(
        private StreakService $streakService,
        private SrsService $srsService,
    ) {
    }

    /**
     * ✅ "I Know" — user knew this word.
     *
     * Delegates to SrsService::recordCorrect which:
     *   - Moves word up one Leitner box (1→2→3→4).
     *   - Inserts into mastered_words when box 4 is reached.
     *   - Removes from review_words.
     *   - Schedules next review according to the 3-Step algorithm.
     */
    public function know(Request $request, Word $word)
    {
        $user = $request->user();

        $this->srsService->recordCorrect($user, $word);
        // $this->streakService->recordActivity($user);
        if ($request->input('from') !== 'session') {
            $this->streakService->recordActivity($user);
        }

        return $this->handleRedirect($request, $word);
    }

    /**
     * ❌ "I Don't Know" — user still needs to learn this word.
     *
     * Delegates to SrsService::recordIncorrect which:
     *   - Resets word all the way back to Box 1 (hard Leitner reset).
     *   - Removes from mastered_words (word has slipped).
     *   - Adds to review_words for focused practice.
     *   - Schedules next review for today.
     */
    public function learn(Request $request, Word $word)
    {
        $user = $request->user();

        $this->srsService->recordIncorrect($user, $word);
        if ($request->input('from') !== 'session') {
            $this->streakService->recordActivity($user);
        }

        return $this->handleRedirect($request, $word);
    }

    public function sessionComplete(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $this->streakService->recordActivity($user);

        return response()->json(['status' => 'ok']);
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
     * 🔁 Start a focused exercise session using only the user's review words.
     */
    public function practiceReview()
    {
        $wordIds = ReviewWord::where('user_id', Auth::id())->pluck('word_id');

        $words = $this->srsService->getDueWordsByIds(
            auth()->user(),
            $wordIds->toArray()
        );

        $wordList = (object) [
            'id' => null,
            'title' => 'Review Words',
            'difficulty' => 'Mixed',
        ];

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words->values(),
            'subcategory' => null,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
            'backUrl' => route('words.review'),
        ]);
    }

    /**
     * Decide where to redirect after marking a word.
     *
     * - Called from ExerciseSession  →  from=session in POST body
     *   → redirect()->back() so Inertia stays on the session page.
     *
     * - Called from WordDetail page  →  no from param
     *   → redirect to the next word in the list, or back to the list when done.
     */
    private function handleRedirect(Request $request, Word $word)
    {
        if ($request->input('from') === 'session') {
            return redirect()->back();
        }

        return $this->redirectToNextWord($word);
    }

    /**
     * Redirect to the next word in the same word list (ordered by id).
     * If there is no next word, go back to the word list page.
     */
    private function redirectToNextWord(Word $word)
    {
        $nextWord = Word::where('wordlist_id', $word->wordlist_id)
            ->where('id', '>', $word->id)
            ->orderBy('id')
            ->first();

        if ($nextWord) {
            return redirect()->route('word.show', $nextWord->id);
        }

        return redirect()
            ->route('wordlist.show', $word->wordlist_id)
            ->with('success', 'You have reviewed all words in this group!');
    }
}