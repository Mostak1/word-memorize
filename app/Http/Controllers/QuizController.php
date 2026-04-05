<?php

namespace App\Http\Controllers;

use App\Models\Word;
use App\Models\WordList;
use App\Models\WordProgress;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    // How many questions to target per quiz
    private const MAX_QUESTIONS = 20;

    // Min correct pairs to award a point on match_pairs
    private const MATCH_PASS_THRESHOLD = 3;

    public function __construct(private StreakService $streakService)
    {
    }

    // ── Public routes ──────────────────────────────────────────────────────────

    public function index()
    {
        $userId = Auth::id();

        // Get all words the user has mastered (box >= 4 in word_progress)
        $masteredWordIds = WordProgress::where('user_id', $userId)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->pluck('word_id')
            ->toArray();

        if (empty($masteredWordIds)) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => true,
                'noUsableSentences' => false,
            ]);
        }

        // Load every mastered word once
        $words = Word::whereIn('id', $masteredWordIds)->get();

        // ── Bucket words by which quiz types they can serve ───────────────────
        $fillBlankWords = $words->filter(
            fn($w) => !empty($w->example_sentences)
            && stripos($w->example_sentences, $w->word) !== false
        )->values();

        $synonymWords = $words->filter(
            fn($w) => !empty(trim($w->synonym ?? ''))
        )->values();

        $antonymWords = $words->filter(
            fn($w) => !empty(trim($w->antonym ?? ''))
        )->values();

        $translationWords = $words->filter(
            fn($w) => !empty(trim($w->bangla_meaning ?? ''))
        )->values();

        // For match-pairs we prefer definition; fall back to bangla_meaning
        $matchPairWords = $words->filter(
            fn($w) => !empty(trim($w->definition ?? '')) || !empty(trim($w->bangla_meaning ?? ''))
        )->values();

        // Nothing usable at all?
        $totalEligible = $fillBlankWords->count()
            + $synonymWords->count()
            + $antonymWords->count()
            + $translationWords->count()
            + $matchPairWords->count();

        if ($totalEligible < 1) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
            ]);
        }

        // ── Build questions ───────────────────────────────────────────────────

        $questions = collect();
        $usedIds = [];

        // 1. Match the Pairs — 1 question that "uses up" 4 words
        if ($matchPairWords->count() >= 4) {
            $pairWords = $matchPairWords->shuffle()->take(4);
            foreach ($pairWords as $w) {
                $usedIds[] = $w->id;
            }

            $pairs = $pairWords->map(function ($w) {
                $meaning = !empty(trim($w->definition ?? ''))
                    ? $w->definition
                    : $w->bangla_meaning;
                return ['word' => $w->word, 'meaning' => $meaning];
            })->values()->toArray();

            $questions->push([
                'type' => 'match_pairs',
                'pairs' => $pairs,
            ]);
        }

        // 2–10. Individual-question pool (all other types mixed together)
        $pool = [];

        // Fill-in-the-blank
        $eligible = $fillBlankWords
            ->filter(fn($w) => !in_array($w->id, $usedIds))
            ->shuffle()->take(4);

        foreach ($eligible as $word) {
            $blank = '___________';
            $pattern = '/\b' . preg_quote($word->word, '/') . '\b/i';
            $sentence = $this->pickSentenceWithBlank($word->example_sentences, $pattern, $blank);
            if (!$sentence)
                continue;

            $wrongOptions = $this->buildWrongOptions($word, $masteredWordIds);
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);

            $pool[] = [
                'type' => 'fill_blank',
                'word' => $word->word,
                'sentence' => $sentence,
                'options' => $options,
                'correct' => $word->word,
            ];
        }

        // Synonym
        $eligible = $synonymWords
            ->filter(fn($w) => !in_array($w->id, $usedIds))
            ->shuffle()->take(3);

        foreach ($eligible as $word) {
            $list = $this->splitWordList($word->synonym);
            if (empty($list))
                continue;
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);

            $pool[] = [
                'type' => 'synonym',
                'word' => $word->word,
                'options' => $options,
                'correct' => $correct,
            ];
        }

        // Antonym
        $eligible = $antonymWords
            ->filter(fn($w) => !in_array($w->id, $usedIds))
            ->shuffle()->take(3);

        foreach ($eligible as $word) {
            $list = $this->splitWordList($word->antonym);
            if (empty($list))
                continue;
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);

            $pool[] = [
                'type' => 'antonym',
                'word' => $word->word,
                'options' => $options,
                'correct' => $correct,
            ];
        }

        // Translation EN → BN
        $eligible = $translationWords
            ->filter(fn($w) => !in_array($w->id, $usedIds))
            ->shuffle()->take(4);

        foreach ($eligible as $word) {
            $distractors = $translationWords
                ->filter(fn($w2) => $w2->id !== $word->id && !empty(trim($w2->bangla_meaning ?? '')))
                ->shuffle()
                ->take(3)
                ->pluck('bangla_meaning')
                ->toArray();

            if (count($distractors) < 3)
                continue;

            $options = array_merge([$word->bangla_meaning], $distractors);
            shuffle($options);

            $pool[] = [
                'type' => 'translation_en_bn',
                'word' => $word->word,
                'options' => $options,
                'correct' => $word->bangla_meaning,
            ];
        }

        // Shuffle pool, take enough to fill up to MAX_QUESTIONS
        shuffle($pool);
        $remaining = self::MAX_QUESTIONS - $questions->count();
        foreach (array_slice($pool, 0, $remaining) as $q) {
            $questions->push($q);
        }

        // Shuffle final order
        $questions = $questions->shuffle()->values();

        if ($questions->count() < 1) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
            ]);
        }

        return Inertia::render('Quiz', [
            'questions' => $questions,
            'noMasteredWords' => false,
            'noUsableSentences' => false,
            'matchPassThreshold' => self::MATCH_PASS_THRESHOLD,
        ]);
    }

    /**
     * GET /quiz/wordlist/{wordlist}
     * Quiz built from all words the user has at least seen once (box >= 2) in a wordlist.
     */
    public function indexByWordlist(WordList $wordlist)
    {
        $userId = Auth::id();

        // All words in this wordlist where the user has progress box >= 2
        $eligibleWordIds = WordProgress::where('user_id', $userId)
            ->where('box', '>=', 2)
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->where('words.wordlist_id', $wordlist->id)
            ->pluck('word_progress.word_id')
            ->toArray();

        if (empty($eligibleWordIds)) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => true,
                'noUsableSentences' => false,
                'wordListTitle' => $wordlist->title,
            ]);
        }

        $words = Word::whereIn('id', $eligibleWordIds)->get();

        // ── Bucket into question types (same logic as index()) ────────────────
        $fillBlankWords = $words->filter(
            fn($w) => !empty($w->example_sentences)
            && stripos($w->example_sentences, $w->word) !== false
        )->values();

        $synonymWords = $words->filter(fn($w) => !empty(trim($w->synonym ?? '')))->values();
        $antonymWords = $words->filter(fn($w) => !empty(trim($w->antonym ?? '')))->values();
        $translationWords = $words->filter(fn($w) => !empty(trim($w->bangla_meaning ?? '')))->values();
        $matchPairWords = $words->filter(
            fn($w) => !empty(trim($w->definition ?? '')) || !empty(trim($w->bangla_meaning ?? ''))
        )->values();

        $totalEligible = $fillBlankWords->count() + $synonymWords->count()
            + $antonymWords->count() + $translationWords->count() + $matchPairWords->count();

        if ($totalEligible < 1) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
                'wordListTitle' => $wordlist->title,
            ]);
        }

        $questions = collect();
        $usedIds = [];

        // Match the Pairs
        if ($matchPairWords->count() >= 4) {
            $pairWords = $matchPairWords->shuffle()->take(4);
            foreach ($pairWords as $w) {
                $usedIds[] = $w->id;
            }

            $pairs = $pairWords->map(function ($w) {
                $meaning = !empty(trim($w->definition ?? '')) ? $w->definition : $w->bangla_meaning;
                return ['word' => $w->word, 'meaning' => $meaning];
            })->values()->toArray();

            $questions->push(['type' => 'match_pairs', 'pairs' => $pairs]);
        }

        $pool = [];

        // Fill-in-the-blank
        foreach ($fillBlankWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(4) as $word) {
            $blank = '___________';
            $pattern = '/' . preg_quote($word->word, '/') . '/i';
            $sentence = $this->pickSentenceWithBlank($word->example_sentences, $pattern, $blank);
            if (!$sentence)
                continue;
            $wrongOptions = $this->buildWrongOptions($word, $eligibleWordIds);
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'fill_blank', 'word' => $word->word, 'sentence' => $sentence, 'options' => $options, 'correct' => $word->word];
        }

        // Synonym
        foreach ($synonymWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(3) as $word) {
            $list = $this->splitWordList($word->synonym);
            if (empty($list))
                continue;
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'synonym', 'word' => $word->word, 'options' => $options, 'correct' => $correct];
        }

        // Antonym
        foreach ($antonymWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(3) as $word) {
            $list = $this->splitWordList($word->antonym);
            if (empty($list))
                continue;
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'antonym', 'word' => $word->word, 'options' => $options, 'correct' => $correct];
        }

        // Translation EN → BN
        foreach ($translationWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(4) as $word) {
            $distractors = $translationWords
                ->filter(fn($w2) => $w2->id !== $word->id && !empty(trim($w2->bangla_meaning ?? '')))
                ->shuffle()->take(3)->pluck('bangla_meaning')->toArray();
            if (count($distractors) < 3)
                continue;
            $options = array_merge([$word->bangla_meaning], $distractors);
            shuffle($options);
            $pool[] = ['type' => 'translation_en_bn', 'word' => $word->word, 'options' => $options, 'correct' => $word->bangla_meaning];
        }

        shuffle($pool);
        $remaining = self::MAX_QUESTIONS - $questions->count();
        foreach (array_slice($pool, 0, $remaining) as $q) {
            $questions->push($q);
        }
        $questions = $questions->shuffle()->values();

        if ($questions->count() < 1) {
            return Inertia::render('Quiz', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
                'wordListTitle' => $wordlist->title,
            ]);
        }

        return Inertia::render('Quiz', [
            'questions' => $questions,
            'noMasteredWords' => false,
            'noUsableSentences' => false,
            'matchPassThreshold' => self::MATCH_PASS_THRESHOLD,
            'wordListTitle' => $wordlist->title,
        ]);
    }

    /**
     * POST /quiz/finish — records streak activity.
     */
    public function finish(Request $request)
    {
        $streak = $this->streakService->recordActivity($request->user());

        return response()->json([
            'streak' => [
                'current_streak' => $streak->current_streak,
                'longest_streak' => $streak->longest_streak,
                'freeze_count' => $streak->freeze_count,
                'active_today' => $streak->isActiveToday(),
                'at_risk' => $streak->isAtRisk(),
                'is_broken' => $streak->isBroken(),
            ],
        ]);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Split a comma/semicolon/slash-delimited word list into a clean array.
     */
    private function splitWordList(string $raw): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/[,;\/]/', $raw))
        ));
    }

    /**
     * Pick one sentence from $text that contains the word matched by $pattern,
     * and replace the first match with $blank.
     */
    private function pickSentenceWithBlank(string $text, string $pattern, string $blank): ?string
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        $usable = array_values(array_filter(
            $sentences,
            fn($s) => preg_match($pattern, $s) === 1
        ));

        if (empty($usable)) {
            return null;
        }

        $sentence = $usable[array_rand($usable)];
        return preg_replace($pattern, $blank, $sentence, 1);
    }

    /**
     * Build 3 wrong fill-in-the-blank options, tiered by similarity to the
     * correct word (same POS + letter, same POS, then any mastered word).
     */
    private function buildWrongOptions(Word $word, array $masteredWordIds): array
    {
        $correctWord = strtolower($word->word);
        $correctPos = strtolower(trim($word->parts_of_speech_variations ?? ''));
        $firstLetter = strtolower($word->word[0] ?? '');

        $tier1 = Word::where('id', '!=', $word->id)
            ->whereRaw('LOWER(TRIM(parts_of_speech_variations)) = ?', [$correctPos])
            ->whereRaw('LOWER(SUBSTR(word, 1, 1)) = ?', [$firstLetter])
            ->inRandomOrder()->limit(10)->pluck('word')->toArray();

        $tier2 = Word::where('id', '!=', $word->id)
            ->whereRaw('LOWER(TRIM(parts_of_speech_variations)) = ?', [$correctPos])
            ->whereNotIn('word', array_merge([$word->word], $tier1))
            ->inRandomOrder()->limit(10)->pluck('word')->toArray();

        $tier3 = Word::whereIn('id', $masteredWordIds)
            ->where('id', '!=', $word->id)
            ->whereNotIn('word', array_merge([$word->word], $tier1, $tier2))
            ->inRandomOrder()->limit(10)->pluck('word')->toArray();

        $wrong = [];
        foreach (array_merge($tier1, $tier2, $tier3) as $candidate) {
            if (strtolower($candidate) !== $correctWord && !in_array($candidate, $wrong)) {
                $wrong[] = $candidate;
            }
            if (count($wrong) === 3)
                break;
        }

        $fillers = ['explore', 'create', 'balance', 'develop', 'achieve', 'promote', 'assess', 'resolve', 'sustain', 'define'];
        $fi = 0;
        while (count($wrong) < 3) {
            $filler = $fillers[$fi++ % count($fillers)];
            if (!in_array($filler, $wrong) && strtolower($filler) !== $correctWord) {
                $wrong[] = $filler;
            }
        }

        return $wrong;
    }

    /**
     * Build $count distractor words for synonym/antonym questions.
     * Pulls from the already-loaded mastered-word collection so no extra query needed.
     */
    private function buildWordDistractors(
        string $correct,
        string $sourceWord,
        \Illuminate\Support\Collection $allWords,
        int $count
    ): array {
        $correctLower = strtolower($correct);
        $sourceLower = strtolower($sourceWord);

        $candidates = $allWords
            ->filter(
                fn($w) =>
                strtolower($w->word) !== $correctLower &&
                strtolower($w->word) !== $sourceLower
            )
            ->shuffle()
            ->pluck('word')
            ->take($count * 3)
            ->toArray();

        $wrong = [];
        foreach ($candidates as $c) {
            if (strtolower($c) !== $correctLower && !in_array($c, $wrong)) {
                $wrong[] = $c;
                if (count($wrong) === $count)
                    break;
            }
        }

        $fillers = ['notable', 'common', 'simple', 'rapid', 'stable', 'precise', 'vivid', 'scarce', 'rigid', 'dense'];
        $fi = 0;
        while (count($wrong) < $count) {
            $filler = $fillers[$fi++ % count($fillers)];
            if (!in_array($filler, $wrong) && strtolower($filler) !== $correctLower) {
                $wrong[] = $filler;
            }
        }

        return $wrong;
    }
}