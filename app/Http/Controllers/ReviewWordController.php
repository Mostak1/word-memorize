<?php

namespace App\Http\Controllers;

use App\Models\ReviewWord;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewWordController extends Controller
{
    /**
     * "I Know This" — remove from review list if present, then go to next word.
     */
    public function know(Word $word)
    {
        $user = Auth::user();

        // Delete the review_word entry if it exists (ignore if not found)
        ReviewWord::where('user_id', $user->id)
            ->where('word_id', $word->id)
            ->delete();

        return $this->redirectToNextWord($word);
    }

    /**
     * "Learning" — add to review list if not already present, then go to next word.
     */
    public function learn(Word $word)
    {
        $user = Auth::user();

        // Create only if it doesn't already exist
        ReviewWord::firstOrCreate([
            'user_id' => $user->id,
            'word_id' => $word->id,
        ]);

        return $this->redirectToNextWord($word);
    }

    /**
     * Find the next word in the same exercise group (by id) and redirect to it.
     * If this is the last word, redirect back to the exercise group page.
     */
    private function redirectToNextWord(Word $word)
    {
        $nextWord = Word::where('exercise_group_id', $word->exercise_group_id)
            ->where('id', '>', $word->id)
            ->orderBy('id')
            ->first();

        if ($nextWord) {
            return redirect()->route('word.show', $nextWord->id);
        }

        // No more words — go back to the exercise group
        return redirect()
            ->route('exercise.show', $word->exercise_group_id)
            ->with('success', 'You have reviewed all words in this group!');
    }
}