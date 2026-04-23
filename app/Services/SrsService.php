<?php

namespace App\Services;

use App\Models\ReviewWord;
use App\Models\User;
use App\Models\Word;
use App\Models\WordProgress;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SrsService
{
  public function __construct(private XpService $xpService)
  {
  }

  // ── Session queue config ──────────────────────────────────────────────────

  /** Max total words in one session's Active Queue. */
  const QUEUE_SIZE = 20;

  /** Max overdue L2/L3 review words to pull per session. */
  const REVIEW_LIMIT = 20;
  
  /** Mini-quiz frequency (3-4 cards) */
  const QUIZ_MIN_INTERVAL = 4;
  const QUIZ_MAX_INTERVAL = 4;

  // ── Core answer handlers ──────────────────────────────────────────────────

  /**
   * User answered CORRECTLY ("I Know" button).
   *
   * Hybrid algorithm:
   *   L1 → L2 : schedule review in 0 day   (enters day-based system)
   *   L2 → L3 : schedule review in 3 days
   *   L3 → L4 : Mastered — box = 4 indicates mastery, no more active reviews
   *
   * next_review_at is always set to the START of the target day (midnight)
   * so words are reliably due for the entire day they are scheduled for —
   * regardless of what time the user studied the previous day.
   *
   * Note: Mastery is now tracked entirely in word_progress.box (no separate mastered_words table).
   */
  public function recordCorrect(User $user, Word $word, bool $awardXp = true): WordProgress
  {
    $progress = $this->getOrCreate($user, $word);
    $oldBox = $progress->box;
    $newBox = min($progress->box + 1, WordProgress::MASTERED_BOX);

    $dayIntervals = [
      2 => 0,   // L1 → L2 : review tomorrow
      3 => 0,   // L2 → L3 : review in 3 days
      4 => 0,  // L3 → L4 : mastered (excluded from active queue anyway)
    ];

    $nextDue = Carbon::today()->addDays($dayIntervals[$newBox] ?? 5);

    $progress->update([
      'box' => $newBox,
      'correct_count' => $progress->correct_count + 1,
      'last_reviewed_at' => now(),
      'next_review_at' => $nextDue,
    ]);

    // No longer needs focused review (only matters if moved to mastered)
    if ($newBox >= WordProgress::MASTERED_BOX) {
      ReviewWord::where('user_id', $user->id)
        ->where('word_id', $word->id)
        ->delete();

      // Award XP for mastering the word (only on first mastery, only for admin lists)
      if ($oldBox < WordProgress::MASTERED_BOX && $awardXp) {
        $this->xpService->awardMasteryXp($user, $word->id);
      }
    }

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
    // Demoted from mastered status (box reduced to L1
    $progress->update([
      'box' => 1,
      'incorrect_count' => $progress->incorrect_count + 1,
      'last_reviewed_at' => now(),
      'next_review_at' => null,  // intra-session — L1 has no day interval
    ]);

    return $progress->fresh();
  }

  /**
   * User confirmed they ALREADY KNOW this word (fast-track to Mastered).
   *
   * Directly sets box = MASTERED_BOX regardless of current level,
   * clears any pending review entries, and optionally awards mastery XP.
   */
  public function recordMastered(User $user, Word $word, bool $awardXp = true): WordProgress
  {
    $progress = $this->getOrCreate($user, $word);
    $oldBox = $progress->box;
    $nextDue = Carbon::today()->addDays(30); // long interval — rarely resurfaces

    $progress->update([
      'box'              => WordProgress::MASTERED_BOX,
      'correct_count'   => $progress->correct_count + 1,
      'last_reviewed_at' => now(),
      'next_review_at'  => $nextDue,
    ]);

    // Remove from focused review queue
    ReviewWord::where('user_id', $user->id)
      ->where('word_id', $word->id)
      ->delete();

    // Award XP for mastering (only if it wasn't already mastered)
    if ($oldBox < WordProgress::MASTERED_BOX && $awardXp) {
      $this->xpService->awardMasteryXp($user, $word->id);
    }

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
  public function buildSessionQueue(User $user, int $wordlistId, bool $isQuizOnly = false): Collection
  {
    $userId = $user->id;

    if ($isQuizOnly) {
      $words = Word::where('wordlist_id', $wordlistId)->get();
      if ($words->isEmpty()) return collect();

      $quizzes = collect();
      // Ensure we get 20 quiz cards by rotating through words if necessary
      while ($quizzes->count() < 20) {
        foreach ($words->shuffle() as $word) {
          if ($quizzes->count() >= 20) break;
          $quiz = $this->generateQuizQuestion($word);
          if ($quiz) {
            $quizzes->push($quiz);
          }
        }
        // Safety break if no words can generate quizzes
        if ($quizzes->isEmpty()) break;
      }
      return $quizzes;
    }

    // ── Priority 1: overdue L2 / L3 reviews ─────────────────────────────
    $reviewWords = Word::with(['images', 'wordList.category:id,show_example_sentences', 'progress' => fn($q) => $q->where('user_id', $userId)])
      ->where('wordlist_id', $wordlistId)
      ->whereHas('progress', function ($q) use ($userId) {
        $q->where('user_id', $userId)
          ->whereBetween('box', [1, WordProgress::MASTERED_BOX - 1]) // L2 & L3 only
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

    // ── Priority 2: extra practice (words already reviewed today) ────────────
    // Use up to half of the remaining slots for words seen today to boost retention
    $extraPracticeWords = collect();
    if ($slotsLeft > 0) {
      $extraPracticeLimit = (int) floor($slotsLeft / 2);
      if ($extraPracticeLimit > 0) {
        $extraPracticeWords = Word::with(['images', 'wordList.category:id,show_example_sentences', 'progress' => fn($q) => $q->where('user_id', $userId)])
          ->where('wordlist_id', $wordlistId)
          ->whereHas('progress', function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->where('box', '<', WordProgress::MASTERED_BOX)
              ->whereDate('last_reviewed_at', Carbon::today())
              ->where('next_review_at', '>', Carbon::now()); // exclude those that were already picked essentially
          })
          ->inRandomOrder() // mix them up
          ->limit($extraPracticeLimit)
          ->get()
          ->map(fn($w) => $this->attachSrsMeta($w, $w->progress->first()));
      }
    }

    $slotsLeft -= $extraPracticeWords->count();

    // ── Priority 3: new (never-seen) words ───────────────────────────────
    $newWords = collect();
    if ($slotsLeft > 0) {
      $newWords = Word::with([
        'images',
        'wordList.category:id,show_example_sentences',
      ])
        ->where('wordlist_id', $wordlistId)
        ->whereDoesntHave('progress', fn($q) => $q->where('user_id', $userId))
        ->orderBy('id')
        ->limit($slotsLeft)
        ->get()
        ->map(fn($w) => $this->attachSrsMeta($w, null));
    }

    $words = $reviewWords->concat($extraPracticeWords)->concat($newWords);
    
    return $this->injectQuizzes($words);
  }

  private function injectQuizzes(Collection $words): Collection
  {
    if ($words->isEmpty()) return $words;

    $finalQueue = collect();
    $window = collect(); // tracking words in the current interval
    $nextQuizAt = rand(self::QUIZ_MIN_INTERVAL, self::QUIZ_MAX_INTERVAL);

    foreach ($words as $word) {
      if ($finalQueue->count() >= self::QUEUE_SIZE) {
        break;
      }

      $finalQueue->push($word);
      $window->push($word);

      // When we reach the interval, try to inject a quiz
      if ($window->count() >= $nextQuizAt) {
        // Selection: Randomized from the window.
        // Frontend will dynamically decide whether to show or skip based 
        // on real-time session progress.
        if ($window->isNotEmpty()) {
          $target = $window->random();
          $quiz = $this->generateQuizQuestion($target);
          if ($quiz && $finalQueue->count() < self::QUEUE_SIZE) {
            $finalQueue->push($quiz);
          }
        }

        // Reset for next interval
        $window = collect();
        $nextQuizAt = rand(self::QUIZ_MIN_INTERVAL, self::QUIZ_MAX_INTERVAL);
      }
    }

    return $finalQueue;
  }

  /**
   * Generates a basic multiple choice quiz for a word. 
   * returns a 'fake' word object with is_quiz = true.
   */
  private function generateQuizQuestion(Word $word): ?array
  {
    // Try synonym first
    $options = [];
    $type = 'definition';
    $correct = '';

    if (!empty($word->synonym)) {
       $synonyms = array_filter(array_map('trim', explode(',', $word->synonym)));
       if (!empty($synonyms)) {
          $type = 'synonym';
          $correct = $synonyms[array_rand($synonyms)];
       }
    }

    if (!$correct && !empty($word->definition)) {
      $type = 'definition';
      $correct = $word->definition;
    }

    if (!$correct && !empty($word->bangla_meaning)) {
      $type = 'translation';
      $correct = $word->bangla_meaning;
    }

    if (!$correct) return null;

    // Distractors
    $distractors = Word::where('id', '!=', $word->id)
      ->inRandomOrder()
      ->limit(3)
      ->get();

    foreach ($distractors as $d) {
       if ($type === 'synonym') {
          $options[] = $d->word; // In synonym quizzes, we usually show other words
       } elseif ($type === 'translation') {
          $options[] = $d->bangla_meaning;
       } else {
          $options[] = $d->definition;
       }
    }
    
    $options[] = $correct;
    shuffle($options);

    return [
      'id' => $word->id,
      'is_quiz' => true,
      'type' => $type,
      'targetWordWord' => $word->word,
      'options' => array_filter($options),
      'correct' => $correct,
      'srs_box' => $word->srs_box,
      'srs_label' => $word->srs_label,
      'srs_color' => $word->srs_color,
    ];
  }

  /**
   * Build a queue from a specific set of word IDs.
   * Used for the Review Words practice session.
   */
  public function getDueWordsByIds(User $user, array $wordIds): Collection
  {
    $userId = $user->id;

    return Word::with(['images', 'wordList.category:id,show_example_sentences', 'wordList', 'progress' => fn($q) => $q->where('user_id', $userId)])
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
    $word->show_example_sentences =
      $word->wordList?->category?->show_example_sentences ?? true;

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