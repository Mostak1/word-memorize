<?php

namespace App\Http\Controllers;

use App\Models\BookmarkedWord;
use App\Models\ReviewWord;
use App\Models\Word;
use App\Models\WordProgress;
use App\Services\SrsService;
use App\Services\StreakService;
use App\Services\XpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewWordController extends Controller
{
    public function __construct(
        private StreakService $streakService,
        private SrsService $srsService,
        private XpService $xpService,
    ) {
    }

    /**
     * ✅ "I Know" — user knew this word.
     */
    public function know(Request $request, Word $word)
    {
        $user = $request->user();

        $this->srsService->recordCorrect($user, $word, $this->wordListAwardsXp($word));
        if ($request->input('from') !== 'session') {
            $this->streakService->recordActivity($user);
        }

        return $this->handleRedirect($request, $word);
    }

    /**
     * ❌ "I Don't Know" — user still needs to learn this word.
     */
    public function learn(Request $request, Word $word)
    {
        $user = $request->user();

        $this->srsService->recordIncorrect($user, $word);
        if ($request->input('from') !== 'session') {
            $this->streakService->recordActivity($user);
        }

        return $this->handleRedirect($request, $word);
    }

    public function sessionComplete(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $results = $request->input('results', []);
        
        foreach ($results as $item) {
            $word = Word::find($item['word_id']);
            if (!$word) continue;

            if ($item['action'] === 'know') {
                $this->srsService->recordCorrect($user, $word, $this->wordListAwardsXp($word));
            } else if ($item['action'] === 'learn') {
                $this->srsService->recordIncorrect($user, $word);
            }
        }

        $wordlistId = $request->input('wordlist_id');
        $xpEnabled = false;

        if ($wordlistId) {
            $category = \App\Models\WordList::with('category.creator')
                ->select('id', 'word_list_category_id')
                ->find((int) $wordlistId)
                    ?->category;

            $xpEnabled = $category?->creator?->email === 'admin@gmail.com';
        }

        if (!$xpEnabled) {
            return response()->json([
                'xp_awarded' => 0,
                'streak' => $this->streakService->getSummary($user),
            ]);
        }

        $this->streakService->recordActivity($user);
        $xpAwarded = $this->xpService->awardSessionXp($user);

        return response()->json([
            'status' => 'ok',
            'xp_awarded' => $xpAwarded,
            'streak' => $this->streakService->getSummary($user),
        ]);
    }

    /**
     * 📋 Revise landing page — shows filter options with word counts.
     *
     * GET /my/revise
     */
    public function revisePage()
    {
        $user = Auth::user();

        return Inertia::render('Revise', [
            'reviseCounts' => $this->getReviseCounts($user),
        ]);
    }

    /**
     * 🔁 Start a filtered revise session.
     *
     * GET /my/revise/session?filter=all|learning|reviewing|more_practice
     *
     * Filters against word_progress (box < MASTERED_BOX):
     *   all           — every word still in active rotation
     *   learning      — box 2
     *   reviewing     — box 3
     *   more_practice — incorrect_count >= 2
     */
    public function reviseSession(Request $request)
    {
        $user = Auth::user();
        $filter = $request->query('filter', 'all');

        $query = WordProgress::where('user_id', $user->id)
            ->where('box', '<', WordProgress::MASTERED_BOX);

        switch ($filter) {
            case 'learning':
                $query->where('box', 2);
                $sessionTitle = 'Learning Words';
                break;

            case 'reviewing':
                $query->where('box', 3);
                $sessionTitle = 'Reviewing Words';
                break;

            case 'more_practice':
                $query->where('incorrect_count', '>=', 2);
                $sessionTitle = 'More Practice Needed';
                break;

            default: // 'all'
                $sessionTitle = 'Revise — All Words';
                break;
        }

        $wordIds = $query->pluck('word_id')->toArray();

        // Try SRS-ordered due words first
        $words = $this->srsService->getDueWordsByIds($user, $wordIds);

        // Fallback: if SRS returns nothing, load all matched words directly
        // so the session still runs even when nothing is strictly "due today".
        if ($words->isEmpty() && !empty($wordIds)) {
            $words = Word::with([
                'images',
                'wordList.category:id,show_example_sentences',
            ])
                ->whereIn('id', $wordIds)
                ->orderBy('id')
                ->get()
                ->map(function ($w) {
                    $w->srs_box = 1;
                    $w->srs_label = 'New';
                    $w->srs_color = 'bg-gray-100 text-gray-600';
                    $w->show_example_sentences =
                        $w->wordList?->category?->show_example_sentences ?? true;
                    return $w;
                });
        }

        $wordList = (object) [
            'id' => null,
            'title' => $sessionTitle,
            'difficulty' => 'Mixed',
        ];

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words->values(),
            'subcategory' => null,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
            'backUrl' => route('words.revise'),
            'streak' => $this->streakService->getSummary($user),
        ]);
    }

    /**
     * 🔁 Start a focused exercise session using only the user's review words.
     */
    public function practiceReview()
    {
        $wordIds = ReviewWord::where('user_id', Auth::id())->pluck('word_id');

        $words = $this->srsService->getDueWordsByIds(
            auth()->user(),
            $wordIds->toArray()
        );

        $wordList = (object) [
            'id' => null,
            'title' => 'Review Words',
            'difficulty' => 'Mixed',
        ];

        $user = auth()->user();

        return Inertia::render('ExerciseSession', [
            'wordList' => $wordList,
            'words' => $words->values(),
            'subcategory' => null,
            'bookmarkedWordIds' => $this->bookmarkedIds($words->pluck('id')->toArray()),
            'backUrl' => route('words.review'),
            'streak' => $this->streakService->getSummary($user),
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Word counts per revise filter (used by both the landing page
     * and DashboardController).
     */
    public function getReviseCounts($user): array
    {
        if (!$user) {
            return ['all' => 0, 'learning' => 0, 'reviewing' => 0, 'more_practice' => 0];
        }

        $base = WordProgress::where('user_id', $user->id)
            ->where('box', '<', WordProgress::MASTERED_BOX);

        return [
            'all' => (clone $base)->count(),
            'learning' => (clone $base)->where('box', 2)->count(),
            'reviewing' => (clone $base)->where('box', 3)->count(),
            'more_practice' => (clone $base)->where('incorrect_count', '>=', 2)->count(),
        ];
    }

    private function wordListAwardsXp(Word $word): bool
    {
        $word->loadMissing('wordList.category.creator');
        return $word->wordList?->category?->creator?->email === 'admin@gmail.com';
    }

    private function bookmarkedIds(array $wordIds): array
    {
        if (!auth()->check())
            return [];
        return BookmarkedWord::where('user_id', auth()->id())
            ->whereIn('word_id', $wordIds)
            ->pluck('word_id')
            ->toArray();
    }

    private function handleRedirect(Request $request, Word $word)
    {
        if ($request->input('from') === 'session') {
            return redirect()->back();
        }

        return $this->redirectToNextWord($word);
    }

    private function redirectToNextWord(Word $word)
    {
        $nextWord = Word::where('wordlist_id', $word->wordlist_id)
            ->where('id', '>', $word->id)
            ->orderBy('id')
            ->first();

        if ($nextWord) {
            return redirect()->route('word.show', $nextWord->id);
        }

        return redirect()
            ->route('wordlist.show', $word->wordlist_id)
            ->with('success', 'You have reviewed all words in this group!');
    }
}