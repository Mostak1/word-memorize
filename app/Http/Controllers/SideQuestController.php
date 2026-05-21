<?php

namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\UserSideQuestUnlock;
use App\Models\Word;
use App\Models\WordListCategory;
use App\Models\WordProgress;
use App\Services\StreakService;
use App\Services\XpService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SideQuestController extends Controller
{
    public function __construct(
        private XpService $xpService,
        private StreakService $streakService
    ) {
    }

    /**
     * Unlock the Survival Gauntlet for a category using XP.
     */
    public function unlock(Request $request, WordListCategory $category)
    {
        if (!$category->enable_side_quest) {
            abort(404, 'Side Quest is not enabled for this category.');
        }

        $user = auth()->user();

        // 1. Check if already unlocked
        if ($category->isSideQuestUnlockedFor($user)) {
            return back()->with('success', 'Side Quest is already unlocked.');
        }

        $cost = $category->side_quest_xp_cost;
        $userXp = $this->xpService->getOrCreate($user);

        // 2. Check if user can afford
        if ($userXp->xp_balance < $cost) {
            return back()->with('error', 'Insufficient XP balance to unlock this Side Quest.');
        }

        // 3. spend XP and create unlock record atomically
        $success = DB::transaction(function () use ($user, $category, $userXp, $cost) {
            if ($userXp->spendXp($cost)) {
                UserSideQuestUnlock::create([
                    'user_id' => $user->id,
                    'word_list_category_id' => $category->id,
                    'best_score' => 0,
                    'best_lives_remaining' => 0,
                    'attempts_count' => 0,
                ]);
                return true;
            }
            return false;
        });

        if ($success) {
            return back()->with('success', 'Side Quest unlocked successfully!');
        }

        return back()->with('error', 'Failed to unlock Side Quest. Please try again.');
    }

    /**
     * Start the Survival Gauntlet session.
     */
    public function start(WordListCategory $category)
    {
        if (!$category->enable_side_quest) {
            abort(404, 'Side Quest is not enabled for this category.');
        }

        $user = auth()->user();

        // 1. Ensure the user has unlocked the side quest
        $unlock = $category->getSideQuestUnlockFor($user);
        if (!$unlock) {
            abort(403, 'You must unlock this Side Quest first.');
        }

        // 2. Increment attempts count
        $unlock->increment('attempts_count');

        // 3. Fetch words belonging to the category
        $categoryWordIds = Word::whereIn('wordlist_id', function ($query) use ($category) {
            $query->select('id')
                ->from('wordlists')
                ->where('word_list_category_id', $category->id);
        })
        ->whereNotNull('synonym')
        ->where('synonym', '!=', '')
        ->pluck('id')->toArray();

        if (count($categoryWordIds) < 10) {
            abort(403, 'This category needs at least 10 words with synonyms to start a side quest.');
        }

        // Prioritize seen words (words having user progress)
        $seenWordIds = WordProgress::where('user_id', $user->id)
            ->whereIn('word_id', $categoryWordIds)
            ->pluck('word_id')
            ->toArray();

        $unseenWordIds = array_diff($categoryWordIds, $seenWordIds);

        // Limit to 20 words
        $limit = min(20, count($categoryWordIds));

        $selectedSeenWordIds = collect($seenWordIds)->shuffle()->take($limit)->toArray();
        $needed = $limit - count($selectedSeenWordIds);
        $selectedUnseenWordIds = [];
        if ($needed > 0) {
            $selectedUnseenWordIds = collect($unseenWordIds)->shuffle()->take($needed)->toArray();
        }

        $finalWordIds = array_merge($selectedSeenWordIds, $selectedUnseenWordIds);

        $words = Word::with([
            'images',
            'wordList.category:id,show_example_sentences'
        ])
            ->whereIn('id', $finalWordIds)
            ->get()
            ->shuffle()
            ->values();

        $quizQuestions = $words->map(function ($w) {
            return $this->generateQuizQuestion($w);
        })->filter()->values();

        // 4. Return to ExerciseSession page
        return Inertia::render('ExerciseSession', [
            'wordList' => [
                'id' => $category->id,
                'title' => 'Survival Gauntlet: ' . $category->name,
                'word_list_category_id' => $category->id,
            ],
            'words' => $quizQuestions,
            'subcategory' => null,
            'totalWordsInList' => count($categoryWordIds),
            'backUrl' => route('wordlistcategory.wordlists', $category->id),
            'bookmarkedWordIds' => BookmarkedWord::where('user_id', $user->id)
                ->whereIn('word_id', $quizQuestions->pluck('id'))
                ->pluck('word_id')
                ->toArray(),
            'streak' => $this->streakService->getSummary($user),
            'xp_enabled' => true,
            'isQuizOnly' => false,
            'isStarReview' => false,
            
            // Side Quest Specific Props
            'isSideQuest' => true,
            'sideQuestUnlock' => $unlock,
            'category' => $category,
        ]);
    }

    /**
     * Complete the Survival Gauntlet session and submit score.
     */
    public function complete(Request $request, WordListCategory $category)
    {
        if (!$category->enable_side_quest) {
            abort(404, 'Side Quest is not enabled for this category.');
        }

        $request->validate([
            'score' => 'required|integer|min:0|max:20',
            'lives_remaining' => 'required|integer|min:0|max:3',
            'time_taken' => 'sometimes|integer|min:0',
        ]);

        $user = auth()->user();
        $unlock = $category->getSideQuestUnlockFor($user);

        if (!$unlock) {
            return response()->json(['error' => 'Not unlocked'], 403);
        }

        $score = $request->input('score');
        $lives = $request->input('lives_remaining');
        $timeTaken = $request->input('time_taken');

        // Update statistics
        $bestScoreUpdated = false;
        $bestLivesUpdated = false;
        $bestTimeUpdated = false;

        if ($score > $unlock->best_score) {
            $unlock->best_score = $score;
            $bestScoreUpdated = true;
        }

        if ($lives > $unlock->best_lives_remaining) {
            $unlock->best_lives_remaining = $lives;
            $bestLivesUpdated = true;
        }

        $xpAwarded = 0;
        $isFirstSuccess = false;

        // If completed successfully (lives remaining > 0)
        if ($lives > 0) {
            if (is_null($unlock->completed_at)) {
                $unlock->completed_at = now();
                $isFirstSuccess = true;
            }

            // Update best time taken if the run was successful
            if (!is_null($timeTaken)) {
                if (is_null($unlock->best_time_taken) || $timeTaken < $unlock->best_time_taken) {
                    $unlock->best_time_taken = $timeTaken;
                    $bestTimeUpdated = true;
                }
            }
        }

        $unlock->save();

        $userXp = $this->xpService->getOrCreate($user);

        return response()->json([
            'success' => true,
            'score' => $score,
            'lives_remaining' => $lives,
            'time_taken' => $timeTaken,
            'best_score' => $unlock->best_score,
            'best_lives_remaining' => $unlock->best_lives_remaining,
            'best_time_taken' => $unlock->best_time_taken,
            'xp_awarded' => 0,
            'xp_balance' => $userXp->xp_balance,
            'is_first_success' => $isFirstSuccess,
            'best_score_updated' => $bestScoreUpdated,
            'best_lives_updated' => $bestLivesUpdated,
            'best_time_updated' => $bestTimeUpdated,
        ]);
    }

    private function generateQuizQuestion(Word $word): ?array
    {
        $options = [];
        $correct = '';

        if (!empty($word->synonym)) {
            $synonyms = array_filter(array_map('trim', explode(',', $word->synonym)));
            if (!empty($synonyms)) {
                $correct = $synonyms[array_rand($synonyms)];
            }
        }

        if (!$correct) {
            return null; // Skip if no synonym exists
        }

        // Get 3 distractors from words in the same category
        $distractors = Word::where('id', '!=', $word->id)
            ->whereIn('wordlist_id', function ($query) use ($word) {
                $query->select('id')
                    ->from('wordlists')
                    ->where('word_list_category_id', function ($sub) use ($word) {
                        $sub->select('word_list_category_id')
                            ->from('wordlists')
                            ->where('id', $word->wordlist_id);
                    });
            })
            ->inRandomOrder()
            ->limit(3)
            ->get();

        // Fall back to global distractors if not enough in same category
        if ($distractors->count() < 3) {
            $globalDistractors = Word::where('id', '!=', $word->id)
                ->inRandomOrder()
                ->limit(3 - $distractors->count())
                ->get();
            $distractors = $distractors->concat($globalDistractors);
        }

        foreach ($distractors as $d) {
            $options[] = $d->word;
        }

        $options[] = $correct;
        $options = array_values(array_filter(array_unique($options)));

        // Pad up to 4 options if duplicate options reduced size
        while (count($options) < 4) {
            $extra = Word::inRandomOrder()->first();
            if ($extra) {
                $options[] = $extra->word;
                $options = array_values(array_filter(array_unique($options)));
            } else {
                break;
            }
        }

        shuffle($options);

        return [
            'id' => $word->id,
            'is_quiz' => true,
            'type' => 'synonym',
            'targetWordWord' => $word->word,
            'options' => $options,
            'correct' => $correct,
            'srs_box' => 1,
            'srs_label' => 'New',
            'srs_color' => 'bg-gray-100 text-gray-600',
        ];
    }
}
