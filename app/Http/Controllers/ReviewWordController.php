<?php

namespace App\Http\Controllers;

use App\Models\MasteredWord;
use App\Models\ReviewWord;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewWordController extends Controller
{
    /**
     * ✅ "Check" — user knows this word.
     *
     * 1. Remove from review_words  (if it was there)
     * 2. Add to mastered_words     (skip if already mastered)
     * 3. Redirect — back to session OR to the next word detail page
     */
    public function know(Request $request, Word $word)
    {
        $userId = Auth::id();

        // Remove from review list
        ReviewWord::where('user_id', $userId)
            ->where('word_id', $word->id)
            ->delete();

        // Add to mastered list (ignore if already exists)
        MasteredWord::firstOrCreate([
            'user_id' => $userId,
            'word_id' => $word->id,
        ]);

        return $this->handleRedirect($request, $word);
    }

    /**
     * ❌ "Didn't Know" — user still needs to learn this word.
     *
     * 1. Remove from mastered_words  (if it was there)
     * 2. Add to review_words         (skip if already present)
     * 3. Redirect — back to session OR to the next word detail page
     */
    public function learn(Request $request, Word $word)
    {
        $userId = Auth::id();

        // Remove from mastered list
        MasteredWord::where('user_id', $userId)
            ->where('word_id', $word->id)
            ->delete();

        // Add to review list (ignore if already exists)
        ReviewWord::firstOrCreate([
            'user_id' => $userId,
            'word_id' => $word->id,
        ]);

        return $this->handleRedirect($request, $word);
    }

    /**
     * 🔁 Start a focused exercise session using only the user's review words.
     *
     * Shuffles the words and renders the shared ExerciseSession component.
     * A virtual "word list" object is passed so the session title renders nicely.
     */
    public function practiceReview()
    {
        // Query Word models directly via the review_words pivot — avoids any
        // null pluck issues when pivot rows outlive their parent words.
        $wordIds = ReviewWord::where('user_id', Auth::id())->pluck('word_id');

        $words = Word::with(['images', 'wordList'])
            ->whereIn('id', $wordIds)
            ->get()
            ->shuffle()
            ->values();

        $wordList = (object) [
            'id'         => null,
            'title'      => 'Review Words',
            'difficulty' => 'Mixed',
        ];

        return Inertia::render('ExerciseSession', [
            'wordList'    => $wordList,
            'words'       => $words,
            'subcategory' => null,
            'backUrl'     => route('words.review'),
        ]);
    }

    /**
     * Decide where to redirect after marking a word.
     *
     * - Called from ExerciseSession  →  from=session in POST body
     *   → redirect()->back() so Inertia stays on the session page
     *     (ExerciseSession uses preserveState:true and advances the card itself)
     *
     * - Called from WordDetail page  →  no from param
     *   → redirect to the next word in the list, or back to the list when done
     */
    private function handleRedirect(Request $request, Word $word)
    {
        if ($request->input('from') === 'session') {
            // ExerciseSession handles card advancement in the frontend.
            // Just redirect back so the Inertia response resolves to the
            // same ExerciseSession component and preserveState kicks in.
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