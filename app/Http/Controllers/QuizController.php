<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserSetting;
use App\Models\UserWordListAccess;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordProgress;
use App\Services\AchievementService;
use App\Services\StreakService;
use App\Services\XpService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    // How many questions to target per auto-generated quiz
    private const MAX_QUESTIONS = 20;

    // Min correct pairs to award a point on match_pairs (auto-generated quiz)
    private const MATCH_PASS_THRESHOLD = 3;

    public function __construct(private StreakService $streakService, private AchievementService $achievementService, private XpService $xpService)
    {
    }

    // ── Public routes ──────────────────────────────────────────────────────────

    public function index()
    {
        $userId = Auth::id();

        $progresses = WordProgress::with('word')
            ->where('user_id', $userId)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->get()
            ->map(function ($progress) {
                $progress->interactions = $progress->correct_count + $progress->incorrect_count;
                $progress->days = $progress->last_reviewed_at ? now()->diffInDays($progress->last_reviewed_at) : 365;

                return $progress;
            })
            ->sort(function ($a, $b) {
                if ($a->days != $b->days) {
                    return $b->days <=> $a->days;
                }
                if ($a->incorrect_count != $b->incorrect_count) {
                    return $b->incorrect_count <=> $a->incorrect_count;
                }

                return $b->interactions <=> $a->interactions;
            });

        $words = $progresses->pluck('word')->values();
        $masteredWordIds = $progresses->pluck('word_id')->toArray();

        if ($words->isEmpty()) {
            return Inertia::render('MasteryTest', [
                'questions' => [],
                'noMasteredWords' => true,
                'noUsableSentences' => false,
            ]);
        }

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
            return Inertia::render('MasteryTest', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
            ]);
        }

        $questions = collect();
        $usedIds = [];

        if ($matchPairWords->count() >= 4) {
            $pairWords = $matchPairWords->take(4);
            foreach ($pairWords as $w) {
                $usedIds[] = $w->id;
            }
            $pairs = $pairWords->map(function ($w) {
                $meaning = !empty(trim($w->definition ?? '')) ? $w->definition : $w->bangla_meaning;

                return ['id' => $w->id, 'word' => $w->word, 'meaning' => $meaning];
            })->values()->toArray();
            $questions->push(['type' => 'match_pairs', 'pairs' => $pairs]);
        }

        $pool = [];

        foreach ($fillBlankWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(10) as $word) {
            $blank = '___________';
            $pattern = '/\b' . preg_quote($word->word, '/') . '\b/i';
            $sentence = $this->pickSentenceWithBlank($word->example_sentences, $pattern, $blank);
            if (!$sentence) {
                continue;
            }
            $wrongOptions = $this->buildWrongOptions($word, $masteredWordIds);
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'fill_blank', 'id' => $word->id, 'word' => $word->word, 'sentence' => $sentence, 'options' => $options, 'correct' => $word->word];
        }

        foreach ($synonymWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(8) as $word) {
            $list = $this->splitWordList($word->synonym);
            if (empty($list)) {
                continue;
            }
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'synonym', 'id' => $word->id, 'word' => $word->word, 'options' => $options, 'correct' => $correct];
        }

        foreach ($antonymWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(8) as $word) {
            $list = $this->splitWordList($word->antonym);
            if (empty($list)) {
                continue;
            }
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'antonym', 'id' => $word->id, 'word' => $word->word, 'options' => $options, 'correct' => $correct];
        }

        // Only generate translation questions if user has Bangla translation enabled
        if ($userId && UserSetting::forUser(User::find($userId))->show_bangla) {
            foreach ($translationWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(10) as $word) {
                $distractors = $translationWords
                    ->filter(fn($w2) => $w2->id !== $word->id && !empty(trim($w2->bangla_meaning ?? '')))
                    ->shuffle()->take(3)->pluck('bangla_meaning')->toArray();
                if (count($distractors) < 3) {
                    continue;
                }
                $options = array_merge([$word->bangla_meaning], $distractors);
                shuffle($options);
                $pool[] = ['type' => 'translation_en_bn', 'id' => $word->id, 'word' => $word->word, 'options' => $options, 'correct' => $word->bangla_meaning];
            }
        }

        $remaining = self::MAX_QUESTIONS - $questions->count();
        shuffle($pool);
        foreach (array_slice($pool, 0, $remaining) as $q) {
            $questions->push($q);
        }

        if ($questions->count() < 1) {
            return Inertia::render('MasteryTest', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
            ]);
        }

        return Inertia::render('MasteryTest', [
            'questions' => $questions->shuffle()->values(),
            'noMasteredWords' => false,
            'noUsableSentences' => false,
            'matchPassThreshold' => self::MATCH_PASS_THRESHOLD,
        ]);
    }

    /**
     * GET /quiz/wordlist/{wordlist}
     *
     * If the wordlist has an active DB quiz → serve it in WordlistQuiz page.
     * Otherwise fall back to the auto-generated MasteryTest from wordlist words.
     */
    public function indexByWordlist(WordList $wordlist)
    {
        $userId = Auth::id();

        // ── Access guard ──────────────────────────────────────────────────────
        // 1. Check Category Lock (Bypassed if wordlist is NOT locked)
        if ($wordlist->is_locked && $wordlist->category?->is_locked) {
            $hasCategoryAccess = auth()->check() && UserWordListAccess::where('user_id', auth()->id())
                ->where('word_list_category_id', $wordlist->word_list_category_id)
                ->exists();

            if (!$hasCategoryAccess && !auth()->user()?->isAdmin()) {
                abort(403, 'This word list category is locked.');
            }
        }

        // 2. Check Quiz Progression Lock
        if ($wordlist->is_locked) {
            if (!$userId) {
                abort(403, 'You must be logged in to take this quiz.');
            }

            $prevWordlist = WordList::where('word_list_category_id', $wordlist->word_list_category_id)
                ->where('status', true)
                ->where('id', '<', $wordlist->id)
                ->orderBy('id', 'desc')
                ->first();

            if (!$prevWordlist) {
                abort(403, 'This quiz is not accessible.');
            }

            $hasPassedPrev = QuizAttempt::where('user_id', $userId)
                ->where('passed', true)
                ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
                ->where('quizzes.wordlist_id', $prevWordlist->id)
                ->exists();

            if (!$hasPassedPrev) {
                abort(403, 'Pass the previous quiz first to unlock this wordlist.');
            }
        }

        // ── DB Quiz branch ────────────────────────────────────────────────────
        $dbQuiz = $wordlist->quizzes()
            ->where('is_active', true)
            ->with(['questions' => fn($q) => $q->orderBy('sort_order')])
            ->first();

        if ($dbQuiz && $dbQuiz->questions->count() > 0) {
            $previousAttempt = $dbQuiz->latestAttemptForUser($userId);
            $canAttempt = $dbQuiz->canUserAttempt($userId);

            // Shape questions for the frontend — correct_answer is always an array
            $questions = $dbQuiz->questions()->with('word')->orderBy('sort_order')->get()->map(function ($question) {
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
                    'word_id' => $question->word_id,
                    'word' => $question->word?->word,
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

        // ── Auto-generated test from wordlist words (no progress gate) ────────
        $words = Word::where('wordlist_id', $wordlist->id)->get();

        if ($words->isEmpty()) {
            return Inertia::render('MasteryTest', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
                'wordListTitle' => $wordlist->title,
                'categoryId' => $wordlist->word_list_category_id,
            ]);
        }

        $questions = $this->buildWordlistAutoQuestions($words, $userId);

        if ($questions->count() < 1) {
            return Inertia::render('MasteryTest', [
                'questions' => [],
                'noMasteredWords' => false,
                'noUsableSentences' => true,
                'wordListTitle' => $wordlist->title,
                'categoryId' => $wordlist->word_list_category_id,
            ]);
        }

        return Inertia::render('MasteryTest', [
            'questions' => $questions,
            'noMasteredWords' => false,
            'noUsableSentences' => false,
            'matchPassThreshold' => self::MATCH_PASS_THRESHOLD,
            'wordListTitle' => $wordlist->title,
            'wordlistId' => $wordlist->id,
            'categoryId' => $wordlist->word_list_category_id,
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
        $wasActiveToday = $request->user()->streak?->last_activity_date?->isToday() ?? false;
        $streak = $this->streakService->recordActivity($request->user());

        // Award XP for passing quiz
        $xpAwarded = $this->xpService->awardQuizXp($request->user(), $score);

        // Check for achievements (especially perfect scores)
        $this->achievementService->checkAndAwardAchievements($request->user());

        $unlockedWordlistTitle = null;
        if ($passed) {
            $currentWordlist = $quiz->wordList;
            $nextWordlist = WordList::where('word_list_category_id', $currentWordlist->word_list_category_id)
                ->where('status', true)
                ->where('id', '>', $currentWordlist->id)
                ->orderBy('id', 'asc')
                ->first();

            if ($nextWordlist) {
                $unlockedWordlistTitle = $nextWordlist->title;
            }
        }

        return response()->json([
            'passed' => $passed,
            'score' => $score,
            'next_attempt_at' => $nextAttemptAt?->toIso8601String(),
            'xp_awarded' => $xpAwarded,
            'unlocked_wordlist' => $unlockedWordlistTitle,
            'streak' => [
                'current_streak' => $streak->current_streak,
                'longest_streak' => $streak->longest_streak,
                'freeze_count' => $streak->freeze_count,
                'active_today' => $streak->isActiveToday(),
                'at_risk' => $streak->isAtRisk(),
                'is_broken' => $streak->isBroken(),
            ],
            'streak_increased' => !$wasActiveToday && $streak->isActiveToday(),
        ]);
    }

    /**
     * POST /quiz/finish — records streak activity (mastery test).
     * When called from a wordlist auto-test, also creates a QuizAttempt.
     */
    public function finish(Request $request)
    {
        $data = $request->validate([
            'wordlist_id' => ['sometimes', 'nullable', 'integer', 'exists:wordlists,id'],
            'correct_count' => ['sometimes', 'integer', 'min:0'],
            'total_questions' => ['sometimes', 'integer', 'min:1'],
            'word_ids' => ['sometimes', 'array'],
            'word_ids.*' => ['integer', 'exists:words,id'],
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
            $passed = $score >= 70;

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

        // Update last_reviewed_at for all words included in the test
        if (!empty($data['word_ids'])) {
            WordProgress::where('user_id', Auth::id())
                ->whereIn('word_id', $data['word_ids'])
                ->update(['last_reviewed_at' => now()]);
        }

        $wasActiveToday = $request->user()->streak?->last_activity_date?->isToday() ?? false;
        $streak = $this->streakService->recordActivity($request->user());

        $xpAwarded = $this->xpService->awardQuizXp($request->user(), $score);

        // Check for achievements
        $this->achievementService->checkAndAwardAchievements($request->user());

        $unlockedWordlistTitle = null;
        if ($passed && !empty($data['wordlist_id'])) {
            $currentWordlistId = (int) $data['wordlist_id'];
            $currentWordlist = WordList::find($currentWordlistId);
            
            if ($currentWordlist) {
                $nextWordlist = WordList::where('word_list_category_id', $currentWordlist->word_list_category_id)
                    ->where('status', true)
                    ->where('id', '>', $currentWordlist->id)
                    ->orderBy('id', 'asc')
                    ->first();

                if ($nextWordlist) {
                    $unlockedWordlistTitle = $nextWordlist->title;
                }
            }
        }

        return response()->json([
            'passed' => $passed,
            'score' => $score,
            'xp_awarded' => $xpAwarded,
            'unlocked_wordlist' => $unlockedWordlistTitle,
            'streak' => [
                'current_streak' => $streak->current_streak,
                'longest_streak' => $streak->longest_streak,
                'freeze_count' => $streak->freeze_count,
                'active_today' => $streak->isActiveToday(),
                'at_risk' => $streak->isAtRisk(),
                'is_broken' => $streak->isBroken(),
            ],
            'streak_increased' => !$wasActiveToday && $streak->isActiveToday(),
        ]);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Build auto-generated quiz questions from a wordlist's own words.
     * No progress gate — any word in the list is eligible.
     */
    private function buildWordlistAutoQuestions(Collection $words, ?int $userId = null): Collection
    {
        $fillBlankWords = $words->filter(fn($w) => !empty($w->example_sentences) && stripos($w->example_sentences, $w->word) !== false)->values();
        $synonymWords = $words->filter(fn($w) => !empty(trim($w->synonym ?? '')))->values();
        $antonymWords = $words->filter(fn($w) => !empty(trim($w->antonym ?? '')))->values();
        $translationWords = $words->filter(fn($w) => !empty(trim($w->bangla_meaning ?? '')))->values();
        $matchPairWords = $words->filter(fn($w) => !empty(trim($w->definition ?? '')) || !empty(trim($w->bangla_meaning ?? '')))->values();

        $questions = collect();
        $usedIds = [];

        if ($matchPairWords->count() >= 4) {
            $pairWords = $matchPairWords->shuffle()->take(4);
            foreach ($pairWords as $w) {
                $usedIds[] = $w->id;
            }
            $pairs = $pairWords->map(function ($w) {
                $meaning = !empty(trim($w->definition ?? '')) ? $w->definition : $w->bangla_meaning;

                return ['id' => $w->id, 'word' => $w->word, 'meaning' => $meaning];
            })->values()->toArray();
            $questions->push(['type' => 'match_pairs', 'pairs' => $pairs]);
        }

        $pool = [];

        foreach ($fillBlankWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(7) as $word) {
            $blank = '___________';
            $pattern = '/' . preg_quote($word->word, '/') . '/i';
            $sentence = $this->pickSentenceWithBlank($word->example_sentences, $pattern, $blank);
            if (!$sentence) {
                continue;
            }
            $wrongOptions = $this->buildWordlistWrongOptions($word, $words);
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'fill_blank', 'id' => $word->id, 'word' => $word->word, 'sentence' => $sentence, 'options' => $options, 'correct' => $word->word];
        }

        foreach ($synonymWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(6) as $word) {
            $list = $this->splitWordList($word->synonym);
            if (empty($list)) {
                continue;
            }
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'synonym', 'id' => $word->id, 'word' => $word->word, 'options' => $options, 'correct' => $correct];
        }

        foreach ($antonymWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(6) as $word) {
            $list = $this->splitWordList($word->antonym);
            if (empty($list)) {
                continue;
            }
            $correct = $list[array_rand($list)];
            $wrongOptions = $this->buildWordDistractors($correct, $word->word, $words, 3);
            $options = array_merge([$correct], $wrongOptions);
            shuffle($options);
            $pool[] = ['type' => 'antonym', 'id' => $word->id, 'word' => $word->word, 'options' => $options, 'correct' => $correct];
        }

        // Only generate translation questions if user has Bangla translation enabled
        if ($userId && UserSetting::forUser(User::find($userId))->show_bangla) {
            foreach ($translationWords->filter(fn($w) => !in_array($w->id, $usedIds))->shuffle()->take(6) as $word) {
                $distractors = $translationWords
                    ->filter(fn($w2) => $w2->id !== $word->id && !empty(trim($w2->bangla_meaning ?? '')))
                    ->shuffle()->take(3)->pluck('bangla_meaning')->toArray();
                if (count($distractors) < 3) {
                    continue;
                }
                $options = array_merge([$word->bangla_meaning], $distractors);
                shuffle($options);
                $pool[] = ['type' => 'translation_en_bn', 'id' => $word->id, 'word' => $word->word, 'options' => $options, 'correct' => $word->bangla_meaning];
            }
        }

        shuffle($pool);
        $remaining = self::MAX_QUESTIONS - $questions->count();
        foreach (array_slice($pool, 0, $remaining) as $q) {
            $questions->push($q);
        }

        return $questions->shuffle()->values();
    }

    private function buildWordlistWrongOptions(Word $word, Collection $wordlistWords): array
    {
        $correctWord = strtolower($word->word);

        $candidates = $wordlistWords
            ->filter(fn($w) => strtolower($w->word) !== $correctWord)
            ->shuffle()
            ->pluck('word')
            ->toArray();

        $wrong = [];
        foreach ($candidates as $c) {
            if (count($wrong) >= 3) {
                break;
            }
            $wrong[] = $c;
        }

        // Fallback: pull from DB if wordlist is too small
        if (count($wrong) < 3) {
            $extra = Word::where('id', '!=', $word->id)
                ->whereNotIn('word', array_merge([$word->word], $wrong))
                ->inRandomOrder()
                ->limit(3 - count($wrong))
                ->pluck('word')
                ->toArray();
            $wrong = array_merge($wrong, $extra);
        }

        return array_slice($wrong, 0, 3);
    }

    private function buildWrongOptions(Word $word, array $masteredWordIds): array
    {
        return Word::whereIn('id', $masteredWordIds)
            ->where('id', '!=', $word->id)
            ->inRandomOrder()
            ->limit(3)
            ->pluck('word')
            ->toArray();
    }

    private function buildWordDistractors(string $correct, string $targetWord, Collection $pool, int $count): array
    {
        return $pool
            ->filter(fn($w) => strtolower($w->word) !== strtolower($targetWord) && strtolower($w->word) !== strtolower($correct))
            ->shuffle()
            ->take($count)
            ->pluck('word')
            ->toArray();
    }

    private function splitWordList(string $raw): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/[,;\/]+/', $raw))));
    }

    private function pickSentenceWithBlank(string $sentences, string $pattern, string $blank): ?string
    {
        $parts = preg_split('/(?<=[.!?])\s+/', trim($sentences));
        foreach (($parts ?: []) as $part) {
            if (preg_match($pattern, $part)) {
                return preg_replace($pattern, $blank, $part, 1);
            }
        }

        return null;
    }
}
