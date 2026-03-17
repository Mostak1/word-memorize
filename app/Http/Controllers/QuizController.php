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

        // Get all mastered word IDs for this user
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
        $words = Word::with('images')
            ->whereIn('id', $masteredWordIds)
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

        // Shuffle and pick up to 10 questions
        $questionWords = $words->shuffle()->take(10);

        // All mastered word strings (for wrong options pool)
        $allWordStrings = Word::whereIn('id', $masteredWordIds)
            ->pluck('word')
            ->toArray();

        $questions = $questionWords->map(function ($word) use ($allWordStrings) {
            // Replace first occurrence of the word (case-insensitive) with blank
            $blank = '___________';
            $sentence = preg_replace(
                '/\b' . preg_quote($word->word, '/') . '\b/i',
                $blank,
                $word->example_sentences,
                1
            );

            // Build wrong options: 3 random words from the pool that are not the correct word
            $wrongPool = array_values(array_filter(
                $allWordStrings,
                fn($w) => strtolower($w) !== strtolower($word->word)
            ));
            shuffle($wrongPool);
            $wrongOptions = array_slice($wrongPool, 0, 3);

            // Pad with generic fillers if pool too small
            $fillers = ['explore', 'create', 'balance', 'develop', 'achieve'];
            $fi = 0;
            while (count($wrongOptions) < 3) {
                $wrongOptions[] = $fillers[$fi++ % count($fillers)];
            }

            // Merge correct + wrong and shuffle
            $options = array_merge([$word->word], $wrongOptions);
            shuffle($options);

            return [
                'word' => $word->word,
                'sentence' => $sentence,
                'options' => $options,
                'correct' => $word->word,
                'image' => $word->images->first()?->url ?? null,
            ];
        })->values();

        return Inertia::render('Quiz', [
            'questions' => $questions,
            'noMasteredWords' => false,
        ]);
    }
}