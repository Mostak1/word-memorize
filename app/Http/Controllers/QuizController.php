<?php

namespace App\Http\Controllers;

use App\Models\MasteredWord;
use App\Models\Word;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $masteredWordIds = MasteredWord::where('user_id', $userId)
            ->pluck('word_id')
            ->toArray();

        if (empty($masteredWordIds)) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => true,
            ]);
        }

        // Load mastered words that have an example sentence containing the word
        $words = Word::whereIn('id', $masteredWordIds)
            ->whereNotNull('example_sentences')
            ->where('example_sentences', '!=', '')
            ->get()
            ->filter(fn($w) => stripos($w->example_sentences, $w->word) !== false)
            ->values();

        if ($words->count() < 1) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => true,
            ]);
        }

        $questionWords = $words->shuffle()->take(10);

        $questions = $questionWords->map(function ($word) use ($masteredWordIds) {
            $blank = '___________';
            $pattern = '/\b' . preg_quote($word->word, '/') . '\b/i';

            // Pick a sentence where the regex actually produces a blank
            $question = $this->pickSentenceWithBlank(
                $word->example_sentences,
                $pattern,
                $blank
            );

            if ($question === null) {
                return null; // no usable sentence — skip word
            }

            $wrongOptions = $this->buildWrongOptions($word, $masteredWordIds);

            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);

            return [
                'word' => $word->word,
                'sentence' => $question,
                'options' => $options,
                'correct' => $word->word,
            ];
        })->filter()->values();

        return Inertia::render('Quiz', [
            'questions' => $questions,
            'noMasteredWords' => false,
        ]);
    }

    /**
     * Split example_sentences into individual sentences, then pick one at
     * random that actually contains the target word.
     * Falls back to the full text if no single sentence matches.
     */
    /**
     * Split example_sentences, then pick ONE sentence at random where the
     * word-boundary regex actually matches (i.e. will produce a real blank).
     * Returns null if no suitable sentence exists.
     */
    private function pickSentenceWithBlank(string $text, string $pattern, string $blank): ?string
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        // Keep only sentences where the regex would actually match
        $usable = array_values(array_filter(
            $sentences,
            fn($s) => preg_match($pattern, $s) === 1
        ));

        if (empty($usable)) {
            return null;
        }

        // Pick a random usable sentence and apply the blank
        $sentence = $usable[array_rand($usable)];
        return preg_replace($pattern, $blank, $sentence, 1);
    }

    /**
     * Build 3 wrong answer options using a tiered strategy.
     *
     * The pool is ALL words in the DB with the same POS tag (not just mastered),
     * giving many more plausible distractors.
     *
     * Tier 1 — same POS + same first letter   (hardest / most deceptive)
     * Tier 2 — same POS, any first letter
     * Tier 3 — any mastered word (fallback when POS pool is tiny)
     * Tier 4 — generic fillers (last resort)
     */
    private function buildWrongOptions(Word $word, array $masteredWordIds): array
    {
        $correctWord = strtolower($word->word);
        $correctPos = strtolower(trim($word->parts_of_speech_variations ?? ''));
        $firstLetter = strtolower($word->word[0] ?? '');

        // ── Tier 1: whole-DB same POS + same first letter ─────────────────────
        $tier1 = Word::where('id', '!=', $word->id)
            ->whereRaw('LOWER(TRIM(parts_of_speech_variations)) = ?', [$correctPos])
            ->whereRaw('LOWER(SUBSTR(word, 1, 1)) = ?', [$firstLetter])
            ->inRandomOrder()
            ->limit(10)
            ->pluck('word')
            ->toArray();

        // ── Tier 2: whole-DB same POS, any first letter ───────────────────────
        $tier2 = Word::where('id', '!=', $word->id)
            ->whereRaw('LOWER(TRIM(parts_of_speech_variations)) = ?', [$correctPos])
            ->whereNotIn('word', array_merge([$word->word], $tier1))
            ->inRandomOrder()
            ->limit(10)
            ->pluck('word')
            ->toArray();

        // ── Tier 3: fallback — any other mastered word ────────────────────────
        $tier3 = Word::whereIn('id', $masteredWordIds)
            ->where('id', '!=', $word->id)
            ->whereNotIn('word', array_merge([$word->word], $tier1, $tier2))
            ->inRandomOrder()
            ->limit(10)
            ->pluck('word')
            ->toArray();

        // Fill up to 3 from tiers in priority order
        $wrong = [];
        foreach (array_merge($tier1, $tier2, $tier3) as $candidate) {
            if (strtolower($candidate) !== $correctWord && !in_array($candidate, $wrong)) {
                $wrong[] = $candidate;
            }
            if (count($wrong) === 3)
                break;
        }

        // ── Tier 4: generic fillers (only if pool exhausted) ─────────────────
        $fillers = [
            'explore',
            'create',
            'balance',
            'develop',
            'achieve',
            'promote',
            'assess',
            'resolve',
            'sustain',
            'define'
        ];
        $fi = 0;
        while (count($wrong) < 3) {
            $filler = $fillers[$fi++ % count($fillers)];
            if (!in_array($filler, $wrong) && strtolower($filler) !== $correctWord) {
                $wrong[] = $filler;
            }
        }

        return $wrong;
    }
}