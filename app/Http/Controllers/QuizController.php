<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordProgress;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    // How many questions to target per auto-generated quiz
    private const MAX_QUESTIONS = 20;

    // Min correct pairs to award a point on match_pairs (auto-generated quiz)
    private const MATCH_PASS_THRESHOLD = 3;

    public function __construct(private StreakService $streakService)
    {
    }

    // ── Public routes ──────────────────────────────────────────────────────────

    public function index()
    {
        $userId = Auth::id();

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

        $words = Word::whereIn('id', $masteredWordIds)->get();

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
            ]);
        }

        $questions = collect();
        $usedIds = [];

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

        foreach ($fillBlankWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(4) as $word) {
            $blank = '___________';
            $pattern = '/\b' . preg_quote($word->word, '/') . '\b/i';
            $sentence = $this->pickSentenceWithBlank($word->example_sentences, $pattern, $blank);
            if (!$sentence)
                continue;
            $wrongOptions = $this->buildWrongOptions($word, $masteredWordIds);
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'fill_blank', 'word' => $word->word, 'sentence' => $sentence, 'options' => $options, 'correct' => $word->word];
        }

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
     *
     * If the wordlist has an active DB quiz → serve it in WordlistQuiz page.
     * Otherwise fall back to the auto-generated quiz from learned words.
     */
    public function indexByWordlist(WordList $wordlist)
    {
        $userId = Auth::id();

        // ── DB Quiz branch ────────────────────────────────────────────────────
        $dbQuiz = $wordlist->quizzes()
            ->where('is_active', true)
            ->with(['questions' => fn($q) => $q->orderBy('sort_order')])
            ->first();

        if ($dbQuiz && $dbQuiz->questions->count() > 0) {
            $previousAttempt = $dbQuiz->latestAttemptForUser($userId);
            $canAttempt = $dbQuiz->canUserAttempt($userId);

            // Shape questions for the frontend — correct_answer is always an array
            $questions = $dbQuiz->questions->map(function ($question) {
                $correctAnswer = $question->correct_answer;

                // Normalise: always send array
                if (is_string($correctAnswer)) {
                    $decoded = json_decode($correctAnswer, true);
                    $correctAnswer = is_array($decoded) ? $decoded : [$correctAnswer];
                } elseif (!is_array($correctAnswer)) {
                    $correctAnswer = [];
                }

                return [
                    'id' => $question->id,
                    'type' => $question->type,
                    'question' => $question->question,
                    'options' => $question->options ?? [],
                    'correct_answer' => $correctAnswer,
                    'matching_pairs' => $question->matching_pairs ?? [],
                    'explanation' => $question->explanation,
                ];
            })->values()->toArray();

            return Inertia::render('WordlistQuiz', [
                'quiz' => [
                    'id' => $dbQuiz->id,
                    'title' => $dbQuiz->title,
                    'pass_mark' => $dbQuiz->pass_mark,
                ],
                'questions' => $questions,
                'wordList' => [
                    'id' => $wordlist->id,
                    'title' => $wordlist->title,
                    'word_list_category_id' => $wordlist->word_list_category_id,
                ],
                'previousAttempt' => $previousAttempt ? [
                    'passed' => $previousAttempt->passed,
                    'score' => $previousAttempt->score,
                    'next_attempt_at' => $previousAttempt->next_attempt_at?->toIso8601String(),
                ] : null,
                'canAttempt' => $canAttempt,
            ]);
        }

        // ── Auto-generated quiz fallback ──────────────────────────────────────
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

        $fillBlankWords = $words->filter(fn($w) => !empty($w->example_sentences) && stripos($w->example_sentences, $w->word) !== false)->values();
        $synonymWords = $words->filter(fn($w) => !empty(trim($w->synonym ?? '')))->values();
        $antonymWords = $words->filter(fn($w) => !empty(trim($w->antonym ?? '')))->values();
        $translationWords = $words->filter(fn($w) => !empty(trim($w->bangla_meaning ?? '')))->values();
        $matchPairWords = $words->filter(fn($w) => !empty(trim($w->definition ?? '')) || !empty(trim($w->bangla_meaning ?? '')))->values();

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

        foreach ($fillBlankWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(4) as $word) {
            $blank = '___________';
            $pattern = '/' . preg_quote($word->word, '/') . '/i';
            $sentence = $this->pickSentenceWithBlank($word->example_sentences, $pattern, $blank);
            if (!$sentence)
                continue;
            $wrongOptions = $this->buildWrongOptions($word, $eligibleWordIds);
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'fill_blank', 'word' => $word->word, 'sentence' => $sentence, 'options' => $options, 'correct' => $word->word];
        }

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
            'wordlistId' => $wordlist->id,
        ]);
    }

    /**
     * POST /quiz/wordlist/finish
     * Save a QuizAttempt for a DB-driven wordlist quiz.
     */
    public function finishWordlistQuiz(Request $request)
    {
        $data = $request->validate([
            'quiz_id' => ['required', 'integer', 'exists:quizzes,id'],
            'correct_count' => ['required', 'integer', 'min:0'],
            'total_questions' => ['required', 'integer', 'min:1'],
            'answers' => ['sometimes', 'array'],
        ]);

        $quiz = Quiz::findOrFail($data['quiz_id']);
        $userId = Auth::id();

        $correctCount = (int) $data['correct_count'];
        $totalQuestions = (int) $data['total_questions'];
        $score = $totalQuestions > 0
            ? round(($correctCount / $totalQuestions) * 100, 2)
            : 0;

        $passed = $score >= $quiz->pass_mark;
        $nextAttemptAt = !$passed
            ? now()->addDay()->startOfDay()
            : null;

        $attempt = QuizAttempt::create([
            'user_id' => $userId,
            'quiz_id' => $quiz->id,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'score' => $score,
            'passed' => $passed,
            'answers' => $data['answers'] ?? [],
            'next_attempt_at' => $nextAttemptAt,
        ]);

        // Record streak activity on any quiz submission
        $this->streakService->recordActivity($request->user());

        return response()->json([
            'passed' => $passed,
            'score' => $score,
            'next_attempt_at' => $nextAttemptAt?->toIso8601String(),
        ]);
    }

    /**
     * POST /quiz/finish — records streak activity (auto-generated quiz).
     * When called from a wordlist auto-quiz, also creates a QuizAttempt.
     */
    public function finish(Request $request)
    {
        $data = $request->validate([
            'wordlist_id' => ['sometimes', 'nullable', 'integer', 'exists:wordlists,id'],
            'correct_count' => ['sometimes', 'integer', 'min:0'],
            'total_questions' => ['sometimes', 'integer', 'min:1'],
        ]);

        $passed = false;
        $score = 0;

        // If the request carries wordlist result data, persist a QuizAttempt.
        if (
            !empty($data['wordlist_id']) &&
            isset($data['correct_count'], $data['total_questions'])
        ) {
            $userId = Auth::id();
            $wordlistId = (int) $data['wordlist_id'];
            $correctCount = (int) $data['correct_count'];
            $totalQuestions = (int) $data['total_questions'];

            // Find or create a lightweight "auto" quiz entry for this wordlist.
            // is_active=false so it never shows up as an admin-created DB quiz.
            $autoQuiz = Quiz::firstOrCreate(
                [
                    'wordlist_id' => $wordlistId,
                    'title' => '__auto__',
                ],
                [
                    'pass_mark' => 70,
                    'is_active' => false,
                    'created_by' => $userId,
                ]
            );

            $score = $totalQuestions > 0
                ? round(($correctCount / $totalQuestions) * 100, 2)
                : 0;
            $passed = $score >= $autoQuiz->pass_mark;

            QuizAttempt::create([
                'user_id' => $userId,
                'quiz_id' => $autoQuiz->id,
                'correct_count' => $correctCount,
                'total_questions' => $totalQuestions,
                'score' => $score,
                'passed' => $passed,
                'answers' => [],
                'next_attempt_at' => !$passed
                    ? now()->addDay()->startOfDay()
                    : null,
            ]);
        }

        $streak = $this->streakService->recordActivity($request->user());

        return response()->json([
            'passed' => $passed,
            'score' => $score,
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

    private function splitWordList(string $raw): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/[,;\/]/', $raw))
        ));
    }

    private function pickSentenceWithBlank(string $text, string $pattern, string $blank): ?string
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);
        $usable = array_values(array_filter($sentences, fn($s) => preg_match($pattern, $s) === 1));

        if (empty($usable))
            return null;

        $sentence = $usable[array_rand($usable)];
        return preg_replace($pattern, $blank, $sentence, 1);
    }

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

    private function buildWordDistractors(
        string $correct,
        string $sourceWord,
        \Illuminate\Support\Collection $allWords,
        int $count
    ): array {
        $correctLower = strtolower($correct);
        $sourceLower = strtolower($sourceWord);

        $candidates = $allWords
            ->filter(fn($w) => strtolower($w->word) !== $correctLower && strtolower($w->word) !== $sourceLower)
            ->shuffle()->pluck('word')->take($count * 3)->toArray();

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