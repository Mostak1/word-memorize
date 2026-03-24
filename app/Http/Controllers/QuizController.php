<?php

namespace App\Http\Controllers;

use App\Models\MasteredWord;
use App\Models\Word;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function __construct(private StreakService $streakService)
    {
    }

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
                'noUsableSentences' => false,
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
                'noMasteredWords' => false,
                'noUsableSentences' => true,
            ]);
        }

        $questionWords = $words->shuffle()->take(10);

        $questions = $questionWords->map(function ($word) use ($masteredWordIds) {
            $blank = '___________';
            $pattern = '/\b' . preg_quote($word->word, '/') . '\b/i';

            $question = $this->pickSentenceWithBlank(
                $word->example_sentences,
                $pattern,
                $blank
            );

            if ($question === null) {
                return null;
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
            'noUsableSentences' => false,
        ]);
    }

    /**
     * Called by the frontend when the user finishes (or submits) a quiz.
     * Records a streak activity for today.
     *
     * POST /quiz/finish
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
}