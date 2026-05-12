<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\UserResource;
use App\Http\Resources\Mobile\WordListCategoryResource;
use App\Http\Resources\Mobile\WordListResource;
use App\Http\Resources\Mobile\WordResource;
use App\Models\BookmarkedWord;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\ReviewWord;
use App\Models\User;
use App\Models\UserSetting;
use App\Models\UserWordListAccess;
use App\Models\UserWordListSession;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use App\Models\WordProgress;
use App\Services\AchievementService;
use App\Services\SrsService;
use App\Services\StreakService;
use App\Services\XpService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LearningController extends Controller
{
    private const MAX_QUESTIONS = 20;
    private const MATCH_PASS_THRESHOLD = 3;

    public function __construct(
        private SrsService $srsService,
        private StreakService $streakService,
        private XpService $xpService,
        private AchievementService $achievementService,
    ) {
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'mastered_count' => WordProgress::where('user_id', $user->id)
                ->where('box', '>=', WordProgress::MASTERED_BOX)
                ->count(),
            'review_count' => ReviewWord::where('user_id', $user->id)->count(),
            'streak' => $this->streakService->getSummary($user),
            'xp' => $this->xpService->getSummary($user),
            'srs' => $this->srsService->getSummary($user),
            'revise_counts' => $this->reviseCounts($user),
        ]);
    }

    public function categories(Request $request)
    {
        $user = $this->optionalMobileUser($request);

        $categories = WordListCategory::withCount(['wordLists', 'words'])
            ->where('status', true)
            ->where(function ($query) use ($user) {
                $query->whereHas('creator', fn($creator) => $creator->where('email', 'admin@gmail.com'));

                if ($user) {
                    $query->orWhere('created_by', $user->id);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (WordListCategory $category) use ($user) {
                $category->has_access = !$category->is_locked
                    || ($user && ($category->userHasAccess($user->id) || $user->isAdmin()));

                return $category;
            });

        return response()->json([
            'categories' => $this->resourceCollection($request, $categories, WordListCategoryResource::class),
        ]);
    }

    public function wordlists(Request $request, WordListCategory $category)
    {
        $user = $this->optionalMobileUser($request);

        $wordLists = WordList::where('word_list_category_id', $category->id)
            ->where('status', true)
            ->withCount('words')
            ->orderBy('id')
            ->paginate((int) $request->query('per_page', 12));

        $ids = $wordLists->getCollection()->pluck('id')->all();
        $masteredCounts = $user ? $this->masteredCounts($user, $ids) : [];
        $quizEligibleIds = $user ? $this->quizEligibleIds($user, $ids) : [];
        $hasQuizIds = Quiz::where('is_active', true)->whereIn('wordlist_id', $ids)->pluck('wordlist_id')->all();

        $wordLists->getCollection()->transform(function (WordList $wordList) use ($user, $masteredCounts, $quizEligibleIds, $hasQuizIds) {
            $wordList->has_access = $this->canAccessWordList($user, $wordList);
            $wordList->mastered_count = $masteredCounts[$wordList->id] ?? 0;
            $wordList->quiz_eligible = in_array($wordList->id, $quizEligibleIds, true);
            $wordList->has_quiz = in_array($wordList->id, $hasQuizIds, true);

            return $wordList;
        });

        return response()->json([
            'category' => (new WordListCategoryResource($category))->resolve($request),
            'wordlists' => $this->paginated($request, $wordLists, WordListResource::class),
        ]);
    }

    public function wordlistDetail(Request $request, WordList $wordList)
    {
        $user = $this->optionalMobileUser($request);

        $this->authorizeWordList($user, $wordList);

        $words = $wordList->words()
            ->with(['images', 'wordList'])
            ->paginate((int) $request->query('per_page', 15));

        return response()->json([
            'wordlist' => (new WordListResource($wordList->loadCount('words')))->resolve($request),
            'category' => $wordList->category
                ? (new WordListCategoryResource($wordList->category))->resolve($request)
                : null,
            'words' => $this->paginated($request, $words, WordResource::class),
        ]);
    }

    public function wordDetail(Request $request, Word $word)
    {
        $user = $this->optionalMobileUser($request);
        $word->load(['images', 'wordList.category']);

        if ($word->wordList) {
            $this->authorizeWordList($user, $word->wordList);
        }

        $word->is_bookmarked = $user
            ? BookmarkedWord::where('user_id', $user->id)->where('word_id', $word->id)->exists()
            : false;

        return response()->json([
            'word' => (new WordResource($word))->resolve($request),
        ]);
    }

    public function startWordlistSession(Request $request, WordList $wordList)
    {
        $user = $request->user();
        $wordList->load('category.creator')->loadCount('words');

        $this->authorizeWordList($user, $wordList);

        abort_if($wordList->words_count < 10, 422, 'This word list needs at least 10 words to start an exercise.');

        $sessionTracker = UserWordListSession::firstOrCreate(
            ['user_id' => $user->id, 'wordlist_id' => $wordList->id],
            ['regular_sessions_count' => 0],
        );

        $isQuizOnly = $sessionTracker->regular_sessions_count >= 4;
        $items = $this->srsService->buildSessionQueue($user, $wordList->id, $isQuizOnly);
        $wordIds = $items->filter(fn($item) => $item instanceof Word)->pluck('id')->all();

        return response()->json([
            'wordlist' => (new WordListResource($wordList))->resolve($request),
            'words' => $this->sessionItems($request, $items),
            'bookmarked_word_ids' => $this->bookmarkedIds($user, $wordIds),
            'total_words_in_list' => $wordList->words_count,
            'streak' => $this->streakService->getSummary($user),
            'xp_enabled' => $this->wordListAwardsXp($wordList),
            'is_quiz_only' => $isQuizOnly,
        ]);
    }

    public function startReviseSession(Request $request)
    {
        $user = $request->user();
        $filter = $request->query('filter', 'all');
        [$query, $title] = $this->reviseQuery($user, $filter);
        $wordIds = $query->pluck('word_id')->all();
        $words = $this->srsService->getDueWordsByIds($user, $wordIds);

        return response()->json([
            'wordlist' => [
                'id' => null,
                'title' => $title,
                'difficulty' => 'Mixed',
            ],
            'words' => $this->sessionItems($request, $words),
            'bookmarked_word_ids' => $this->bookmarkedIds($user, $words->pluck('id')->all()),
            'streak' => $this->streakService->getSummary($user),
        ]);
    }

    public function completeSession(Request $request)
    {
        $data = $request->validate([
            'wordlist_id' => ['nullable', 'integer', 'exists:wordlists,id'],
            'is_quiz_only' => ['sometimes', 'boolean'],
            'results' => ['required', 'array'],
            'results.*.word_id' => ['required', 'integer', 'exists:words,id'],
            'results.*.action' => ['required', 'string', 'in:know,learn,master'],
        ]);

        $user = $request->user();
        $wordList = isset($data['wordlist_id']) ? WordList::with('category.creator')->find($data['wordlist_id']) : null;
        $xpEnabled = $wordList ? $this->wordListAwardsXp($wordList) : false;

        foreach ($data['results'] as $item) {
            $word = Word::with('wordList.category.creator')->find($item['word_id']);
            if (!$word) {
                continue;
            }

            match ($item['action']) {
                'know' => $this->srsService->recordCorrect($user, $word, $this->wordAwardsXp($word)),
                'learn' => $this->srsService->recordIncorrect($user, $word),
                'master' => $this->srsService->recordMastered($user, $word, $this->wordAwardsXp($word)),
            };
        }

        $this->streakService->recordActivity($user);
        $xpAwarded = $xpEnabled ? $this->xpService->awardSessionXp($user) : 0;
        $listCompleted = false;

        if ($wordList) {
            $sessionTracker = UserWordListSession::firstOrCreate(
                ['user_id' => $user->id, 'wordlist_id' => $wordList->id],
                ['regular_sessions_count' => 0],
            );

            $data['is_quiz_only'] ?? false
                ? $sessionTracker->update(['regular_sessions_count' => 0])
                : $sessionTracker->increment('regular_sessions_count');

            $listCompleted = $this->wordListCompleted($user, $wordList);
        }

        return response()->json([
            'status' => 'ok',
            'xp_awarded' => $xpAwarded,
            'streak' => $this->streakService->getSummary($user),
            'list_completed' => $listCompleted,
            'list_name' => $wordList?->title ?? '',
        ]);
    }

    public function masteryQuiz(Request $request)
    {
        $user = $request->user();
        $words = WordProgress::with('word')
            ->where('user_id', $user->id)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->get()
            ->pluck('word')
            ->filter()
            ->values();

        return response()->json([
            'questions' => $this->buildAutoQuestions($words, $user),
            'match_pass_threshold' => self::MATCH_PASS_THRESHOLD,
            'no_mastered_words' => $words->isEmpty(),
        ]);
    }

    public function wordlistQuiz(Request $request, WordList $wordList)
    {
        $user = $request->user();
        $this->authorizeWordList($user, $wordList);

        $dbQuiz = $wordList->quizzes()
            ->where('is_active', true)
            ->with(['questions' => fn($query) => $query->with('word')->orderBy('sort_order')])
            ->first();

        if ($dbQuiz && $dbQuiz->questions->isNotEmpty()) {
            return response()->json([
                'mode' => 'db',
                'quiz' => [
                    'id' => $dbQuiz->id,
                    'title' => $dbQuiz->title,
                    'pass_mark' => $dbQuiz->pass_mark,
                ],
                'wordlist' => (new WordListResource($wordList))->resolve($request),
                'questions' => $dbQuiz->questions->map(fn($question) => [
                    'id' => $question->id,
                    'word_id' => $question->word_id,
                    'word' => $question->word?->word,
                    'type' => $question->type,
                    'question' => $question->question,
                    'options' => $question->options ?? [],
                    'correct_answer' => is_array($question->correct_answer)
                        ? $question->correct_answer
                        : [$question->correct_answer],
                    'matching_pairs' => $question->matching_pairs ?? [],
                    'explanation' => $question->explanation,
                ])->values(),
                'previous_attempt' => optional($dbQuiz->latestAttemptForUser($user->id), fn($attempt) => [
                    'passed' => (bool) $attempt->passed,
                    'score' => (float) $attempt->score,
                    'next_attempt_at' => $attempt->next_attempt_at?->toIso8601String(),
                ]),
                'can_attempt' => $dbQuiz->canUserAttempt($user->id),
            ]);
        }

        $words = $wordList->words()->get();

        return response()->json([
            'mode' => 'auto',
            'wordlist' => (new WordListResource($wordList))->resolve($request),
            'questions' => $this->buildAutoQuestions($words, $user),
            'match_pass_threshold' => self::MATCH_PASS_THRESHOLD,
            'no_usable_sentences' => $words->isEmpty(),
        ]);
    }

    public function finishDbQuiz(Request $request)
    {
        $data = $request->validate([
            'quiz_id' => ['required', 'integer', 'exists:quizzes,id'],
            'correct_count' => ['required', 'integer', 'min:0'],
            'total_questions' => ['required', 'integer', 'min:1'],
            'answers' => ['sometimes', 'array'],
        ]);

        return response()->json($this->recordQuizAttempt($request, Quiz::findOrFail($data['quiz_id']), $data));
    }

    public function finishAutoQuiz(Request $request)
    {
        $data = $request->validate([
            'wordlist_id' => ['nullable', 'integer', 'exists:wordlists,id'],
            'correct_count' => ['required', 'integer', 'min:0'],
            'total_questions' => ['required', 'integer', 'min:1'],
            'word_ids' => ['sometimes', 'array'],
            'word_ids.*' => ['integer', 'exists:words,id'],
        ]);

        $quiz = null;
        if (!empty($data['wordlist_id'])) {
            $quiz = Quiz::firstOrCreate(
                ['wordlist_id' => $data['wordlist_id'], 'title' => '__auto__'],
                ['pass_mark' => 70, 'is_active' => false, 'created_by' => $request->user()->id],
            );
        }

        if (!empty($data['word_ids'])) {
            WordProgress::where('user_id', $request->user()->id)
                ->whereIn('word_id', $data['word_ids'])
                ->update(['last_reviewed_at' => now()]);
        }

        return response()->json($this->recordQuizAttempt($request, $quiz, $data));
    }

    public function bookmarks(Request $request)
    {
        $words = BookmarkedWord::where('user_id', $request->user()->id)
            ->with(['word.images', 'word.wordList.category'])
            ->latest()
            ->paginate((int) $request->query('per_page', 20))
            ->through(fn(BookmarkedWord $bookmark) => $bookmark->word);

        return response()->json([
            'words' => $this->paginated($request, $words, WordResource::class),
        ]);
    }

    public function toggleBookmark(Request $request, Word $word)
    {
        $bookmark = BookmarkedWord::where('user_id', $request->user()->id)
            ->where('word_id', $word->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $isBookmarked = false;
        } else {
            BookmarkedWord::create(['user_id' => $request->user()->id, 'word_id' => $word->id]);
            $isBookmarked = true;
        }

        return response()->json([
            'word_id' => $word->id,
            'is_bookmarked' => $isBookmarked,
        ]);
    }

    public function mastered(Request $request)
    {
        $user = $request->user();

        $wordlists = WordList::whereHas('words.progress', fn($query) => $query
            ->where('user_id', $user->id)
            ->where('box', '>=', WordProgress::MASTERED_BOX))
            ->withCount([
                'words as words_count',
                'words as mastered_count' => fn($query) => $query->whereHas('progress', fn($progress) => $progress
                    ->where('user_id', $user->id)
                    ->where('box', '>=', WordProgress::MASTERED_BOX)),
            ])
            ->get()
            ->map(function (WordList $wordList) use ($user) {
                $wordList->has_access = $this->canAccessWordList($user, $wordList);

                return $wordList;
            });

        return response()->json([
            'total_mastered' => WordProgress::where('user_id', $user->id)
                ->where('box', '>=', WordProgress::MASTERED_BOX)
                ->count(),
            'wordlists' => $this->resourceCollection($request, $wordlists, WordListResource::class),
        ]);
    }

    public function reviewWords(Request $request)
    {
        $words = ReviewWord::where('user_id', $request->user()->id)
            ->with(['word.images', 'word.wordList.category'])
            ->latest()
            ->paginate((int) $request->query('per_page', 20))
            ->through(fn(ReviewWord $entry) => $entry->word);

        return response()->json([
            'words' => $this->paginated($request, $words, WordResource::class),
        ]);
    }

    public function revise(Request $request, ?string $filter = null)
    {
        $user = $request->user();
        $filter ??= 'all';
        [$query, $title] = $this->reviseQuery($user, $filter);

        $words = Word::whereIn('id', $query->pluck('word_id'))
            ->with(['images', 'wordList.category'])
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'filter' => $filter,
            'title' => $title,
            'counts' => $this->reviseCounts($user),
            'words' => $this->paginated($request, $words, WordResource::class),
        ]);
    }

    public function settings(Request $request)
    {
        $settings = UserSetting::forUser($request->user());

        return response()->json([
            'settings' => [
                'show_bangla' => (bool) $settings->show_bangla,
                'sound_effects' => (bool) $settings->sound_effects,
                'ui_language' => $settings->ui_language ?? 'en',
                'dark_mode_unlocked' => (bool) ($settings->dark_mode_unlocked ?? false),
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'show_bangla' => ['sometimes', 'boolean'],
            'sound_effects' => ['sometimes', 'boolean'],
            'ui_language' => ['sometimes', 'string', 'in:en,bn'],
        ]);

        $settings = UserSetting::forUser($request->user());
        $settings->update($data);

        return $this->settings($request);
    }

    public function achievements(Request $request)
    {
        $this->achievementService->checkAndAwardAchievements($request->user());

        return response()->json([
            'achievements' => $this->achievementService->getUserAchievements($request->user()),
        ]);
    }

    public function unseenAchievements(Request $request)
    {
        $unseen = $request->user()
            ->userAchievements()
            ->where('notified', false)
            ->with('achievement')
            ->get();

        return response()->json(['unseen' => $unseen]);
    }

    public function markAchievementsSeen(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $request->user()
            ->userAchievements()
            ->whereIn('id', $data['ids'])
            ->update(['notified' => true]);

        return response()->json(['status' => 'success']);
    }

    public function leaderboard(Request $request)
    {
        $users = User::query()
            ->select('users.id', 'users.name', 'users.email', 'users.image', 'users.headline')
            ->leftJoin('user_xp', 'users.id', '=', 'user_xp.user_id')
            ->selectRaw('COALESCE(user_xp.xp_balance, 0) as xp_balance')
            ->orderByDesc('xp_balance')
            ->limit(50)
            ->get();

        return response()->json([
            'users' => $users->map(fn($user) => [
                'user' => (new UserResource($user))->resolve($request),
                'xp_balance' => (int) $user->xp_balance,
            ]),
        ]);
    }

    public function profile(Request $request, User $user)
    {
        return response()->json([
            'user' => (new UserResource($user))->resolve($request),
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'is_following' => $request->user()->following()->where('following_id', $user->id)->exists(),
        ]);
    }

    private function recordQuizAttempt(Request $request, ?Quiz $quiz, array $data): array
    {
        $correctCount = (int) $data['correct_count'];
        $totalQuestions = (int) $data['total_questions'];
        $score = round(($correctCount / $totalQuestions) * 100, 2);
        $passed = $quiz ? $score >= $quiz->pass_mark : $score >= 70;
        $nextAttemptAt = !$passed ? now()->addDay()->startOfDay() : null;

        if ($quiz) {
            QuizAttempt::create([
                'user_id' => $request->user()->id,
                'quiz_id' => $quiz->id,
                'correct_count' => $correctCount,
                'total_questions' => $totalQuestions,
                'score' => $score,
                'passed' => $passed,
                'answers' => $data['answers'] ?? [],
                'next_attempt_at' => $nextAttemptAt,
            ]);
        }

        $wasActiveToday = $request->user()->streak?->last_activity_date?->isToday() ?? false;
        $streak = $this->streakService->recordActivity($request->user());
        $xpAwarded = $this->xpService->awardQuizXp($request->user(), $score);
        $this->achievementService->checkAndAwardAchievements($request->user());

        return [
            'passed' => $passed,
            'score' => $score,
            'next_attempt_at' => $nextAttemptAt?->toIso8601String(),
            'xp_awarded' => $xpAwarded,
            'unlocked_wordlist' => $this->unlockedWordlistTitle($passed, $quiz),
            'streak' => $this->streakService->getSummary($request->user()),
            'streak_increased' => !$wasActiveToday && $streak->isActiveToday(),
        ];
    }

    private function buildAutoQuestions(Collection $words, User $user): array
    {
        $questions = collect();
        $usedIds = [];
        $matchWords = $words->filter(fn($word) => filled($word->definition) || filled($word->bangla_meaning))->values();

        if ($matchWords->count() >= 4) {
            $pairs = $matchWords->shuffle()->take(4)->map(function (Word $word) use (&$usedIds) {
                $usedIds[] = $word->id;

                return [
                    'id' => $word->id,
                    'word' => $word->word,
                    'meaning' => filled($word->definition) ? $word->definition : $word->bangla_meaning,
                ];
            })->values();

            $questions->push(['type' => 'match_pairs', 'pairs' => $pairs]);
        }

        foreach ($words->filter(fn($word) => !in_array($word->id, $usedIds, true))->shuffle() as $word) {
            if ($questions->count() >= self::MAX_QUESTIONS) {
                break;
            }

            $question = $this->autoQuestionForWord($word, $words, $user);
            if ($question) {
                $questions->push($question);
            }
        }

        return $questions->shuffle()->values()->all();
    }

    private function autoQuestionForWord(Word $word, Collection $pool, User $user): ?array
    {
        if (filled($word->example_sentences) && stripos($word->example_sentences, $word->word) !== false) {
            $sentence = preg_replace('/' . preg_quote($word->word, '/') . '/i', '___________', $word->example_sentences, 1);

            return [
                'type' => 'fill_blank',
                'id' => $word->id,
                'word' => $word->word,
                'sentence' => $sentence,
                'options' => $this->wordOptions($word, $pool),
                'correct' => $word->word,
            ];
        }

        if (filled($word->synonym)) {
            $correct = trim(explode(',', $word->synonym)[0]);

            return [
                'type' => 'synonym',
                'id' => $word->id,
                'word' => $word->word,
                'options' => $this->genericOptions($correct, $pool),
                'correct' => $correct,
            ];
        }

        if (filled($word->bangla_meaning) && UserSetting::forUser($user)->show_bangla) {
            return [
                'type' => 'translation_en_bn',
                'id' => $word->id,
                'word' => $word->word,
                'options' => $this->genericOptions($word->bangla_meaning, $pool, 'bangla_meaning'),
                'correct' => $word->bangla_meaning,
            ];
        }

        return null;
    }

    private function wordOptions(Word $word, Collection $pool): array
    {
        return $this->genericOptions($word->word, $pool, 'word');
    }

    private function genericOptions(string $correct, Collection $pool, string $field = 'word'): array
    {
        $options = $pool
            ->pluck($field)
            ->filter(fn($value) => filled($value) && $value !== $correct)
            ->unique()
            ->shuffle()
            ->take(3)
            ->values()
            ->all();

        $options[] = $correct;
        shuffle($options);

        return $options;
    }

    private function sessionItems(Request $request, Collection $items): array
    {
        return $items->map(function ($item) use ($request) {
            if ($item instanceof Word) {
                return ['kind' => 'word', 'payload' => (new WordResource($item))->resolve($request)];
            }

            return ['kind' => 'quiz', 'payload' => $item];
        })->values()->all();
    }

    private function resourceCollection(Request $request, iterable $items, string $resource): array
    {
        return collect($items)
            ->map(fn($item) => (new $resource($item))->resolve($request))
            ->values()
            ->all();
    }

    private function paginated(Request $request, $paginator, string $resource): array
    {
        return [
            'data' => $this->resourceCollection($request, $paginator->getCollection(), $resource),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    private function optionalMobileUser(Request $request): ?User
    {
        return $request->user('sanctum') ?? $request->user();
    }

    private function canAccessWordList(?User $user, WordList $wordList): bool
    {
        $wordList->loadMissing('category');

        if (!$wordList->is_locked || !($wordList->category?->is_locked ?? false)) {
            return true;
        }

        if (!$user) {
            return false;
        }

        return $user->isAdmin() || UserWordListAccess::where('user_id', $user->id)
            ->where('word_list_category_id', $wordList->word_list_category_id)
            ->exists();
    }

    private function authorizeWordList(?User $user, WordList $wordList): void
    {
        abort_unless($this->canAccessWordList($user, $wordList), 403, 'This word list category is locked.');
    }

    private function bookmarkedIds(User $user, array $wordIds): array
    {
        return BookmarkedWord::where('user_id', $user->id)
            ->whereIn('word_id', $wordIds)
            ->pluck('word_id')
            ->all();
    }

    private function masteredCounts(User $user, array $wordListIds): array
    {
        return WordProgress::where('user_id', $user->id)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->whereIn('words.wordlist_id', $wordListIds)
            ->selectRaw('words.wordlist_id, count(*) as cnt')
            ->groupBy('words.wordlist_id')
            ->pluck('cnt', 'wordlist_id')
            ->all();
    }

    private function quizEligibleIds(User $user, array $wordListIds): array
    {
        return WordProgress::where('user_id', $user->id)
            ->where('box', '>=', 2)
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->whereIn('words.wordlist_id', $wordListIds)
            ->selectRaw('words.wordlist_id, count(*) as cnt')
            ->groupBy('words.wordlist_id')
            ->havingRaw('count(*) >= 20')
            ->pluck('words.wordlist_id')
            ->all();
    }

    private function reviseCounts(User $user): array
    {
        $base = WordProgress::where('user_id', $user->id)
            ->where('box', '<', WordProgress::MASTERED_BOX)
            ->whereHas('word.wordList', fn($query) => $query->where('is_locked', false)
                ->orWhereHas('category', fn($category) => $category->where('is_locked', false)
                    ->orWhereIn('id', fn($ids) => $ids->select('word_list_category_id')
                        ->from('user_word_list_access')
                        ->where('user_id', $user->id))));

        return [
            'all' => (clone $base)->count(),
            'learning' => (clone $base)->where('box', 2)->count(),
            'reviewing' => (clone $base)->where('box', 3)->count(),
            'more_practice' => (clone $base)->where('incorrect_count', '>=', 2)->count(),
        ];
    }

    private function reviseQuery(User $user, string $filter): array
    {
        $query = WordProgress::where('user_id', $user->id)
            ->where('box', '<', WordProgress::MASTERED_BOX)
            ->whereHas('word.wordList', fn($wordList) => $wordList->where('is_locked', false)
                ->orWhereHas('category', fn($category) => $category->where('is_locked', false)
                    ->orWhereIn('id', fn($ids) => $ids->select('word_list_category_id')
                        ->from('user_word_list_access')
                        ->where('user_id', $user->id))));

        $title = match ($filter) {
            'learning' => tap('Learning Words', fn() => $query->where('box', 2)),
            'reviewing' => tap('Reviewing Words', fn() => $query->where('box', 3)),
            'more_practice' => tap('More Practice Needed', fn() => $query->where('incorrect_count', '>=', 2)),
            default => 'Revise - All Words',
        };

        return [$query, $title];
    }

    private function wordListAwardsXp(WordList $wordList): bool
    {
        $wordList->loadMissing('category.creator');

        return $wordList->category?->creator?->email === 'admin@gmail.com';
    }

    private function wordAwardsXp(Word $word): bool
    {
        $word->loadMissing('wordList.category.creator');

        return $word->wordList?->category?->creator?->email === 'admin@gmail.com';
    }

    private function wordListCompleted(User $user, WordList $wordList): bool
    {
        $total = $wordList->words()->count();

        return $total > 0 && WordProgress::where('user_id', $user->id)
            ->whereIn('word_id', $wordList->words()->pluck('id'))
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->count() === $total;
    }

    private function unlockedWordlistTitle(bool $passed, ?Quiz $quiz): ?string
    {
        if (!$passed || !$quiz?->wordList) {
            return null;
        }

        return WordList::where('word_list_category_id', $quiz->wordList->word_list_category_id)
            ->where('status', true)
            ->where('id', '>', $quiz->wordList->id)
            ->orderBy('id')
            ->value('title');
    }
}
