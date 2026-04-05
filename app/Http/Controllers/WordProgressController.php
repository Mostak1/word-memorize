<?php

namespace App\Http\Controllers;

use App\Models\Word;
use App\Models\WordProgress;
use Illuminate\Http\Request;

class WordProgressController extends Controller
{
  /**
   * Demote a mastered word back to Level 3 (remove from mastery).
   *
   * PUT /api/words/{word}/demote-from-mastery
   *
   * The word will re-enter the review queue and needs to be answered correctly
   * again to reach mastery. This allows users to "put words back in the list"
   * if they feel they no longer know them.
   */
  public function demoteFromMastery(Request $request, Word $word)
  {
    $user = $request->user();

    if (!$user) {
      return back()->with('error', 'You must be logged in to demote words.');
    }

    $progress = WordProgress::where('user_id', $user->id)
      ->where('word_id', $word->id)
      ->first();

    if (!$progress) {
      return back()->with('error', 'Word progress not found for this user.');
    }

    if ($progress->box < WordProgress::MASTERED_BOX) {
      return back()->with('error', 'This word is not mastered yet. You can only move back mastered words.');
    }

    // Get the wordlist ID before demoting
    $wordlistId = $word->wordlist_id;

    // Demote from mastery (box 4) back to Level 3
    $progress->update([
      'box' => 3,
      'next_review_at' => now()->addDays(0), // Schedule for review in 0 days
    ]);

    // Check if there are any mastered words left in this wordlist
    $remainingMastered = Word::where('wordlist_id', $wordlistId)
      ->whereHas(
        'progress',
        fn($q) => $q
          ->where('user_id', $user->id)
          ->where('box', '>=', WordProgress::MASTERED_BOX)
      )
      ->exists();

    $message = 'Word moved back to the wordlist!.';

    // If this was the last mastered word in the list, redirect to all mastered words
    if (!$remainingMastered) {
      return redirect()->route('words.mastered')
        ->with('success', $message);
    }

    // Otherwise, redirect back to the mastered words list for this wordlist
    return back()->with('success', $message);
  }
}
