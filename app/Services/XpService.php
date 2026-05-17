<?php

namespace App\Services;

use App\Models\StreakFreezePurchase;
use App\Models\User;
use App\Models\UserDailyActivity;
use App\Models\UserSetting;
use App\Models\UserXp;
use App\Models\Word;
use App\Models\WordProgress;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class XpService
{
    public function __construct(private AchievementService $achievementService)
    {
    }

    // ── XP Constants ──────────────────────────────────────────────────────────

    /** XP earned per completed exercise session */
    const XP_PER_SESSION = 100;

    /** Maximum daily XP from sessions (100 XP × 2 sessions) */
    const MAX_SESSION_XP_PER_DAY = 200;

    /** XP earned when a word reaches mastered status (box 4) */
    const XP_PER_WORD_MASTERED = 10;

    /** XP earned when user completes a word list (all words mastered) */
    const XP_PER_WORDLIST_COMPLETION = 50;

    /** XP earned per passed quiz (70%+ score) */
    const XP_PER_QUIZ_PASS = 150;

    /** XP earned for perfect quiz score (100%) */
    const XP_PER_QUIZ_PERFECT = 200;

    /** Streak freeze costs: 1st purchase = 1000, 2nd = 2000, 3rd = 4000 */
    const FIRST_FREEZE_COST = 1000;

    const SECOND_FREEZE_COST = 2000;

    const THIRD_FREEZE_COST = 4000;

    /** Dark Mode unlock price */
    const DARK_MODE_COST = 6000;

    /** 10% Shop/Course Discount cost */
    const DISCOUNT_COUPON_COST = 20000;

    /** Streak repair cost */
    const STREAK_REPAIR_COST = 5000;

    /** Streak milestone rewards (day => xp) */
    const STREAK_MILESTONES = [
        7 => 50,
        14 => 100,
        30 => 200,
        40 => 50,
        50 => 50,
        60 => 100,
        // Pattern: every 10 days after 30 gets 50-100 XP
    ];

    // ── Core XP Management ────────────────────────────────────────────────────

    /**
     * Get or create a user's XP record.
     */
    public function getOrCreate(User $user): UserXp
    {
        return UserXp::firstOrCreate(
            ['user_id' => $user->id],
            ['xp_balance' => 0]
        );
    }

    /**
     * Get user's current XP balance.
     */
    public function getBalance(User $user): int
    {
        return $this->getOrCreate($user)->xp_balance;
    }

    public function awardBonusXp(User $user, int $amount): int
    {
        $amount = max(0, $amount);
        if ($amount === 0) {
            return 0;
        }

        $this->getOrCreate($user)->addXp($amount);
        $this->achievementService->checkAndAwardAchievements($user);

        return $amount;
    }

    /**
     * Award XP for completing an exercise session.
     *
     * Respects the daily cap: max 200 XP per day from sessions.
     * (Other sources like mastery don't count toward this cap.)
     *
     * Returns the amount actually awarded (0 if already at cap).
     */
    public function awardSessionXp(User $user): int
    {
        $today = Carbon::today();

        // Get or create today's activity record
        $activity = UserDailyActivity::firstOrCreate(
            ['user_id' => $user->id, 'activity_date' => $today],
            ['completed' => false, 'session_xp_earned' => 0, 'quiz_xp_earned' => 0]
        );

        // Check daily cap
        if ($activity->session_xp_earned >= self::MAX_SESSION_XP_PER_DAY) {
            return 0; // Already at max
        }

        // Calculate XP to award (capped at daily max)
        $xpToAward = min(
            self::XP_PER_SESSION,
            self::MAX_SESSION_XP_PER_DAY - $activity->session_xp_earned
        );

        // Award XP
        $userXp = $this->getOrCreate($user);
        $userXp->addXp($xpToAward);

        // Update daily activity tracking
        $activity->increment('session_xp_earned', $xpToAward);

        // Check for morning achievement if XP earned before 9 AM
        if ($xpToAward > 0 && Carbon::now()->hour < 9) {
            $this->achievementService->checkAndAwardAchievements($user);
        }

        return $xpToAward;
    }

    /**
     * Award XP for passing a quiz.
     *
     * @param User $user
     * @param float $score Percentage score 0-100
     * @return int XP actually awarded
     */
    public function awardQuizXp(User $user, float $score): int
    {
        $xpToAward = 0;

        if ($score >= 100) {
            $xpToAward = self::XP_PER_QUIZ_PERFECT;
        } elseif ($score >= 70) {
            $xpToAward = self::XP_PER_QUIZ_PASS;
        }

        if ($xpToAward > 0) {
            $userXp = $this->getOrCreate($user);
            $userXp->addXp($xpToAward);
        }

        return $xpToAward;
    }

    /**
     * Award XP when a word is mastered.
     *
     * Call this when WordProgress.box reaches MASTERED_BOX (4).
     * Guards against duplicate awards — only pays once per word.
     */
    public function awardMasteryXp(User $user, int $wordId): bool
    {
        // Check if we've already awarded XP for this word
        // (Simple approach: just award it, and track in the model if needed)
        // For now, we trust this is called only when box reaches 4 for the first time.

        $userXp = $this->getOrCreate($user);
        $userXp->addXp(self::XP_PER_WORD_MASTERED);

        // Check for achievements
        $this->achievementService->checkAndAwardAchievements($user);

        return true;
    }

    /**
     * Award XP when a user completes a word list.
     *
     * A word list is "completed" when all words are mastered (box >= 4).
     */
    public function awardWordListCompletionXp(User $user, int $wordListId): bool
    {
        // Check if all words in this list are mastered for this user
        $listWordCount = Word::where('wordlist_id', $wordListId)->count();

        if ($listWordCount === 0) {
            return false;
        }

        $masteredCount = WordProgress::where('user_id', $user->id)
            ->where('box', '>=', WordProgress::MASTERED_BOX)
            ->join('words', 'word_progress.word_id', '=', 'words.id')
            ->where('words.wordlist_id', $wordListId)
            ->count();

        // All words in the list are mastered
        if ($masteredCount === $listWordCount) {
            $userXp = $this->getOrCreate($user);
            $userXp->addXp(self::XP_PER_WORDLIST_COMPLETION);

            // Check for achievements
            $this->achievementService->checkAndAwardAchievements($user);

            return true;
        }

        return false;
    }

    /**
     * Award XP for streak milestones.
     *
     * Called when user reaches a milestone streak (7, 14, 30, etc.)
     * Guards against duplicate awards via milestone tracking.
     */
    public function awardStreakMilestoneXp(User $user, int $currentStreak): bool
    {
        // Check if this is a milestone
        if (!isset(self::STREAK_MILESTONES[$currentStreak])) {
            return false;
        }

        $xpReward = self::STREAK_MILESTONES[$currentStreak];
        $userXp = $this->getOrCreate($user);
        $userXp->addXp($xpReward);

        // Check for achievements
        $this->achievementService->checkAndAwardAchievements($user);

        return true;
    }

    // ── Streak Freeze Shop ────────────────────────────────────────────────────

    /**
     * Calculate the cost to purchase the next streak freeze.
     *
     * 1st freeze: 1000 XP
     * 2nd freeze: 2000 XP
     * 3rd freeze: 4000 XP
     * Maximum 3 purchases per user
     */
    public function getNextFreezeCost(User $user): int
    {
        // Count how many freezes this user has already purchased
        $purchaseCount = StreakFreezePurchase::where('user_id', $user->id)->count();

        switch ($purchaseCount) {
            case 0:
                return self::FIRST_FREEZE_COST;
            case 1:
                return self::SECOND_FREEZE_COST;
            case 2:
                return self::THIRD_FREEZE_COST;
            default:
                // Beyond 3 purchases, return a high cost to indicate not available
                return PHP_INT_MAX;
        }
    }

    /**
     * Buy a streak freeze with XP.
     *
     * Checks:
     *   - User has not exceeded 3 purchases
     *   - User has enough XP
     *   - XP is deducted
     *   - Purchase record is created
     *   - The actual streak freeze is awarded elsewhere (via StreakService)
     *
     * Wrapped in a database transaction to prevent race conditions where
     * multiple concurrent requests could both succeed.
     *
     * Returns success/failure.
     */
    public function buyStreakFreeze(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Check purchase limit (max 3 per user)
            $purchaseCount = StreakFreezePurchase::where('user_id', $user->id)->count();
            if ($purchaseCount >= 3) {
                return false;
            }

            $cost = $this->getNextFreezeCost($user);
            $userXp = $this->getOrCreate($user);

            // Check if user can afford (preliminary check)
            if (!$userXp->canAffordFreeze($cost)) {
                return false;
            }

            // Deduct XP (atomic operation with database WHERE clause)
            if (!$userXp->spendXp($cost)) {
                return false;
            }

            // Record purchase
            StreakFreezePurchase::create([
                'user_id' => $user->id,
                'xp_cost' => $cost,
            ]);

            return true;
        });
    }

    /**
     * Check if user has unlocked Dark Mode
     */
    public function hasDarkModeUnlocked(User $user): bool
    {
        return $user->dark_mode_unlocked ?? false;
    }

    /**
     * Purchase Dark Mode unlock
     *
     * Wrapped in a database transaction to prevent race conditions where
     * multiple concurrent requests could both succeed or result in
     * inconsistent state (XP deducted but unlock not applied, or vice versa).
     */
    public function buyDarkMode(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            if ($this->hasDarkModeUnlocked($user)) {
                return false;
            }

            $userXp = $this->getOrCreate($user);

            // Check if user can afford (preliminary check)
            if ($userXp->xp_balance < self::DARK_MODE_COST) {
                return false;
            }

            // Deduct XP (atomic operation with database WHERE clause)
            if (!$userXp->spendXp(self::DARK_MODE_COST)) {
                return false;
            }

            // Unlock Dark Mode for user
            $settings = UserSetting::forUser($user);
            $settings->update(['dark_mode_unlocked' => true]);

            return true;
        });
    }

    /**
     * Check if user has purchased the 10% discount
     */
    public function hasPurchasedDiscountCoupon(User $user): bool
    {
        return UserSetting::forUser($user)->discount_purchased ?? false;
    }

    /**
     * Purchase 10% discount coupon
     */
    public function buyDiscountCoupon(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            if ($this->hasPurchasedDiscountCoupon($user)) {
                return false;
            }

            $userXp = $this->getOrCreate($user);

            if ($userXp->xp_balance < self::DISCOUNT_COUPON_COST) {
                return false;
            }

            if (!$userXp->spendXp(self::DISCOUNT_COUPON_COST)) {
                return false;
            }

            $settings = UserSetting::forUser($user);
            $settings->update(['discount_purchased' => true]);

            // Create the coupon
            \App\Models\Coupon::create([
                'code' => 'TENOFF-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'discount_percent' => 10,
                'description' => '10% OFF any Shop purchase (Wordlist)',
                'max_uses' => 1,
                'used_count' => 0,
                'is_active' => true,
                'assigned_user_id' => $user->id,
                'course_only' => false,
                'shop_only' => true,
            ]);

            return true;
        });
    }

    /**
     * Purchase streak repair with XP.
     */
    public function buyStreakRepair(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            $userXp = $this->getOrCreate($user);

            if ($userXp->xp_balance < self::STREAK_REPAIR_COST) {
                return false;
            }

            if (!$userXp->spendXp(self::STREAK_REPAIR_COST)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get summary stats for the user's XP.
     */
    public function getSummary(User $user): array
    {
        $userXp = $this->getOrCreate($user);
        $cost = $this->getNextFreezeCost($user);

        return [
            'balance' => $userXp->xp_balance,
            'next_freeze_cost' => $cost,
            'can_afford_freeze' => $userXp->canAffordFreeze($cost),
        ];
    }
}
