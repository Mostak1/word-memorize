<?php

namespace App\Services;

use App\Models\MasteredWord;
use App\Models\ReviewWord;
use App\Models\User;
use App\Models\Word;
use App\Models\WordProgress;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SrsService
{
  // ── Session queue config ──────────────────────────────────────────────────

  /** Max total words in one session's Active Queue. */
  const QUEUE_SIZE = 20;

  /** Max overdue L2/L3 review words to pull per session. */
  const REVIEW_LIMIT = 15;

  // ── Core answer handlers ──────────────────────────────────────────────────

  /**
   * User answered CORRECTLY ("I Know" button).
   *
   * Hybrid algorithm:
   *   L1 → L2 : schedule review in 1 day   (enters day-based system)
   *   L2 → L3 : schedule review in 3 days
   *   L3 → L4 : Mastered — written to mastered_words, no more active reviews
   *
   * next_review_at is always set to the START of the target day (midnight)
   * so words are reliably due for the entire day they are scheduled for —
   * regardless of what time the user studied the previous day.
   */
  public function recordCorrect(User $user, Word $word): WordProgress
  {
    $progress = $this->getOrCreate($user, $word);
    $newBox = min($progress->box + 1, WordProgress::MASTERED_BOX);

    $dayIntervals = [
      2 => 1,   // L1 → L2 : review tomorrow
      3 => 3,   // L2 → L3 : review in 3 days
      4 => 30,  // L3 → L4 : mastered (excluded from active queue anyway)
    ];

    $nextDue = Carbon::today()->addDays($dayIntervals[$newBox] ?? 30);

    $progress->update([
      'box' => $newBox,
      'correct_count' => $progress->correct_count + 1,
      'last_reviewed_at' => now(),
      'next_review_at' => $nextDue,
    ]);

    // Word reached top level → write to mastered_words
    if ($newBox >= WordProgress::MASTERED_BOX) {
      MasteredWord::firstOrCreate([
        'user_id' => $user->id,
        'word_id' => $word->id,
      ]);
    }

    // No longer needs focused review
    ReviewWord::where('user_id', $user->id)
      ->where('word_id', $word->id)
      ->delete();

    return $progress->fresh();
  }

  /**
   * User answered INCORRECTLY ("I Don't Know" button).
   *
   * Hybrid algorithm — any level resets to L1 with next_review_at = NULL.
   *
   * NULL signals "intra-session": no day-based scheduling is applied.
   * The frontend is responsible for keeping the word in the Active Queue
   * until the user answers it correctly.
   *
   * The word is also:
   *   - Removed from mastered_words (it slipped back).
   *   - Added to review_words for the focused practice list.
   */
  public function recordIncorrect(User $user, Word $word): WordProgress
  {
    $progress = $this->getOrCreate($user, $word);

    $progress->update([
      'box' => 1,
      'incorrect_count' => $progress->incorrect_count + 1,
      'last_reviewed_at' => now(),
      'next_review_at' => null,  // intra-session — L1 has no day interval
    ]);

    // Remove from mastered — word slipped back to L1
    MasteredWord::where('user_id', $user->id)
      ->where('word_id', $word->id)
      ->delete();

    // Add to focused review list
    ReviewWord::firstOrCreate([
      'user_id' => $user->id,
      'word_id' => $word->id,
    ]);

    return $progress->fresh();
  }

  // ── Session queue builder ─────────────────────────────────────────────────

  /**
   * Build the 20-word Active Queue for a session.
   *
   * Priority 1 — Overdue reviews (L2 / L3 words due today or earlier).
   *   Up to REVIEW_LIMIT (15) words, lowest box first.
   *
   * Priority 2 — New words (never seen, no progress row).
   *   Fill remaining slots up to QUEUE_SIZE (20) total.
   *
   * Design guarantees:
   *   ✓ Multiple sessions in one day never pull tomorrow's words.
   *   ✓ Queue is capped at 20 words to fit a 3–5 minute session.
   *   ✓ L1 intra-session reshuffling is handled entirely client-side.
   *   ✓ L4 (Mastered) words are excluded from the active queue.
   */
  public function buildSessionQueue(User $user, int $wordlistId): Collection
  {
    $userId = $user->id;

    // ── Priority 1: overdue L2 / L3 reviews ─────────────────────────────
    $reviewWords = Word::with(['images', 'progress' => fn($q) => $q->where('user_id', $userId)])
      ->where('wordlist_id', $wordlistId)
      ->whereHas('progress', function ($q) use ($userId) {
        $q->where('user_id', $userId)
          ->whereBetween('box', [2, WordProgress::MASTERED_BOX - 1]) // L2 & L3 only
          ->where(function ($inner) {
            $inner->whereNull('next_review_at')
              ->orWhere('next_review_at', '<=', Carbon::now()); // due today or overdue
          });
      })
      ->get()
      ->sortBy(fn($w) => $w->progress->first()?->box ?? 1) // lower box = higher priority
      ->take(self::REVIEW_LIMIT)
      ->values()
      ->map(fn($w) => $this->attachSrsMeta($w, $w->progress->first()));

    $slotsLeft = self::QUEUE_SIZE - $reviewWords->count();

    // ── Priority 2: new (never-seen) words ───────────────────────────────
    $newWords = collect();
    if ($slotsLeft > 0) {
      $newWords = Word::with('images')
        ->where('wordlist_id', $wordlistId)
        ->whereDoesntHave('progress', fn($q) => $q->where('user_id', $userId))
        ->orderBy('id')
        ->limit($slotsLeft)
        ->get()
        ->map(fn($w) => $this->attachSrsMeta($w, null));
    }

    return $reviewWords->concat($newWords);
  }

  /**
   * Build a queue from a specific set of word IDs.
   * Used for the Review Words practice session.
   */
  public function getDueWordsByIds(User $user, array $wordIds): Collection
  {
    $userId = $user->id;

    return Word::with(['images', 'wordList', 'progress' => fn($q) => $q->where('user_id', $userId)])
      ->whereIn('id', $wordIds)
      ->get()
      ->sortBy(fn($w) => $w->progress->first()?->box ?? 1)
      ->values()
      ->map(fn($w) => $this->attachSrsMeta($w, $w->progress->first()));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  public function getOrCreate(User $user, Word $word): WordProgress
  {
    return WordProgress::firstOrCreate(
      ['user_id' => $user->id, 'word_id' => $word->id],
      [
        'box' => 1,
        'next_review_at' => null,
        'correct_count' => 0,
        'incorrect_count' => 0,
      ]
    );
  }

  private function attachSrsMeta(Word $word, ?WordProgress $progress): Word
  {
    $box = $progress?->box ?? 1;

    $word->srs_box = $box;
    $word->srs_label = WordProgress::BOX_LABELS[$box] ?? 'New';
    $word->srs_color = WordProgress::BOX_COLORS[$box] ?? 'bg-gray-100 text-gray-600';
    $word->srs_next_review_at = $progress?->next_review_at?->toDateString();
    $word->srs_correct = $progress?->correct_count ?? 0;
    $word->srs_incorrect = $progress?->incorrect_count ?? 0;

    return $word;
  }

  public function getSummary(User $user): array
  {
    $rows = WordProgress::where('user_id', $user->id)->get();

    $dueCount = $rows->filter(
      fn($p) =>
      $p->box < WordProgress::MASTERED_BOX &&
      (is_null($p->next_review_at) || $p->next_review_at->isPast() || $p->next_review_at->isToday())
    )->count();

    $byBox = $rows->groupBy('box')->map->count();

    return [
      'due_today' => $dueCount,
      'total_seen' => $rows->count(),
      'mastered' => $byBox->get(WordProgress::MASTERED_BOX, 0),
      'by_box' => $byBox->toArray(),
    ];
  }
}