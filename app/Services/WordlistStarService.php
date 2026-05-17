<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserWordlistStar;
use App\Models\WordList;
use App\Models\WordProgress;
use Carbon\Carbon;

class WordlistStarService
{
    public const MAX_STARS = 3;

    private const REVIEW_INTERVAL_DAYS = [
        1 => 1,
        2 => 3,
    ];

    public function summariesFor(User $user, array $wordlistIds): array
    {
        $wordlistIds = array_values(array_unique(array_filter($wordlistIds)));
        if (empty($wordlistIds)) {
            return [];
        }

        $records = UserWordlistStar::where('user_id', $user->id)
            ->whereIn('wordlist_id', $wordlistIds)
            ->get()
            ->keyBy('wordlist_id');

        $wordCounts = WordList::whereIn('id', $wordlistIds)
            ->withCount('words')
            ->pluck('words_count', 'id')
            ->toArray();

        $masteredCounts = WordProgress::where('user_id', $user->id)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->whereIn('words.wordlist_id', $wordlistIds)
            ->selectRaw('words.wordlist_id, count(*) as cnt')
            ->groupBy('words.wordlist_id')
            ->pluck('cnt', 'wordlist_id')
            ->toArray();

        $summaries = [];
        foreach ($wordlistIds as $wordlistId) {
            $record = $records->get($wordlistId);
            $total = (int) ($wordCounts[$wordlistId] ?? 0);
            $mastered = (int) ($masteredCounts[$wordlistId] ?? 0);
            $isCompleted = $total > 0 && $mastered >= $total;
            $stars = $record ? (int) $record->stars : ($isCompleted ? 1 : 0);

            $summaries[$wordlistId] = $this->formatSummary($stars, $record, $isCompleted);
        }

        return $summaries;
    }

    public function recordCompletedSession(
        User $user,
        WordList $wordList,
        bool $isStarReview,
        bool $streakMaintained
    ): array {
        $wordList->loadCount('words');

        if (!$this->isCompleted($user, $wordList)) {
            return [
                'list_completed' => false,
                'list_name' => $wordList->title,
                'star_awarded' => false,
            ];
        }

        $record = UserWordlistStar::firstOrCreate(
            ['user_id' => $user->id, 'wordlist_id' => $wordList->id],
            ['stars' => 0]
        );

        $previousStars = (int) $record->stars;
        $starAwarded = false;
        $bonusReward = null;

        if ($previousStars <= 0) {
            $this->awardStar($record, 1);
            $starAwarded = true;
        } elseif (
            $isStarReview &&
            $streakMaintained &&
            $previousStars < self::MAX_STARS &&
            $this->isNextStarAvailable($record)
        ) {
            $newStars = $previousStars + 1;
            $this->awardStar($record, $newStars);
            $starAwarded = true;

            $bonusReward = [
                'type' => 'xp_multiplier',
                'label' => '2x XP',
                'multiplier' => 2,
            ];
        } elseif ($isStarReview) {
            $record->forceFill(['last_attempted_at' => now()])->save();
        }

        $record->refresh();

        return [
            'list_completed' => true,
            'list_name' => $wordList->title,
            'star_awarded' => $starAwarded,
            'previous_stars' => $previousStars,
            'star_progress' => $this->formatSummary((int) $record->stars, $record, true),
            'bonus_reward' => $bonusReward,
        ];
    }

    public function addRewardMetadata(UserWordlistStar $record, ?string $type, int $amount): void
    {
        $record->forceFill([
            'last_reward_type' => $type,
            'last_reward_amount' => max(0, $amount),
        ])->save();
    }

    private function awardStar(UserWordlistStar $record, int $stars): void
    {
        $nextAvailableAt = $stars < self::MAX_STARS
            ? now()->addDays(self::REVIEW_INTERVAL_DAYS[$stars] ?? 7)
            : null;

        $record->forceFill([
            'stars' => min($stars, self::MAX_STARS),
            'last_star_earned_at' => now(),
            'next_star_available_at' => $nextAvailableAt,
            'last_attempted_at' => now(),
        ])->save();
    }

    private function isCompleted(User $user, WordList $wordList): bool
    {
        if ((int) $wordList->words_count <= 0) {
            return false;
        }

        $masteredCount = WordProgress::where('user_id', $user->id)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->where('words.wordlist_id', $wordList->id)
            ->count();

        return $masteredCount >= (int) $wordList->words_count;
    }

    private function isNextStarAvailable(UserWordlistStar $record): bool
    {
        return !$record->next_star_available_at || $record->next_star_available_at->lte(now());
    }

    private function formatSummary(int $stars, ?UserWordlistStar $record, bool $isCompleted): array
    {
        $stars = min(max($stars, 0), self::MAX_STARS);
        $nextAvailableAt = $record?->next_star_available_at;
        $canAttempt = $isCompleted &&
            $stars > 0 &&
            $stars < self::MAX_STARS &&
            (!$nextAvailableAt || $nextAvailableAt->lte(Carbon::now()));

        $status = 'not_started';
        if ($stars >= self::MAX_STARS) {
            $status = 'max_stars';
        } elseif ($canAttempt) {
            $status = 'review_unlocked';
        } elseif ($stars > 0) {
            $status = 'review_locked';
        } elseif ($isCompleted) {
            $status = 'completed_1_star';
        }

        return [
            'stars' => $stars,
            'max_stars' => self::MAX_STARS,
            'is_completed' => $isCompleted,
            'can_attempt_next_star' => $canAttempt,
            'next_star_available_at' => $nextAvailableAt?->toIso8601String(),
            'next_reward_label' => $canAttempt ? '2x XP' : null,
            'status' => $status,
        ];
    }
}
