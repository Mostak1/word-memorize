<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\ReferralDiscountCredit;
use App\Models\User;
use App\Models\UserWordListAccess;
use App\Models\WordListCategory;
use App\Models\WordListOrder;
use App\Models\WordListOrderItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReferralService
{
    public function isEnabled(): bool
    {
        return filter_var(config('settings.referral_system_enabled', false), FILTER_VALIDATE_BOOLEAN);
    }

    public function newUserDiscountPercent(): int
    {
        return $this->percentSetting('referral_new_user_discount_percent');
    }

    public function referrerDiscountPercent(): int
    {
        return $this->percentSetting('referral_referrer_discount_percent');
    }

    public function publicSettings(): array
    {
        return [
            'enabled' => $this->isEnabled(),
            'new_user_discount_percent' => $this->newUserDiscountPercent(),
            'referrer_discount_percent' => $this->referrerDiscountPercent(),
        ];
    }

    public function ensureReferralCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }

        do {
            $code = $this->generateCode();
        } while (User::where('referral_code', $code)->exists());

        $user->forceFill(['referral_code' => $code])->save();

        return $code;
    }

    public function generateCode(): string
    {
        return 'VPX' . Str::upper(Str::random(5));
    }

    public function findReferrer(?string $code, ?User $newUser = null): ?User
    {
        $code = $this->normalizeCode($code);

        if (!$this->isEnabled() || !$code) {
            return null;
        }

        $referrer = User::where('referral_code', $code)->first();

        if (!$referrer) {
            throw ValidationException::withMessages([
                'referral_code' => 'The referral code is invalid.',
            ]);
        }

        if ($newUser && $referrer->is($newUser)) {
            throw ValidationException::withMessages([
                'referral_code' => 'You cannot use your own referral code.',
            ]);
        }

        return $referrer;
    }

    public function createReferralRewards(User $newUser, ?User $referrer, ?string $code): ?Referral
    {
        if (!$this->isEnabled() || !$referrer || !$code) {
            return null;
        }

        if ($referrer->is($newUser)) {
            throw ValidationException::withMessages([
                'referral_code' => 'You cannot use your own referral code.',
            ]);
        }

        $referral = Referral::create([
            'referrer_user_id' => $referrer->id,
            'referred_user_id' => $newUser->id,
            'code_used' => $this->normalizeCode($code),
        ]);

        $credits = [];

        if ($newUserPercent = $this->newUserDiscountPercent()) {
            $credits[] = [
                'user_id' => $newUser->id,
                'referral_id' => $referral->id,
                'source' => 'new_user',
                'discount_percent' => $newUserPercent,
                'status' => ReferralDiscountCredit::STATUS_AVAILABLE,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($referrerPercent = $this->referrerDiscountPercent()) {
            $credits[] = [
                'user_id' => $referrer->id,
                'referral_id' => $referral->id,
                'source' => 'referrer',
                'discount_percent' => $referrerPercent,
                'status' => ReferralDiscountCredit::STATUS_AVAILABLE,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($credits) {
            ReferralDiscountCredit::insert($credits);
        }

        return $referral;
    }

    public function availableCredits(User $user): Collection
    {
        if (!$this->isEnabled()) {
            return collect();
        }

        return ReferralDiscountCredit::query()
            ->where('user_id', $user->id)
            ->where('status', ReferralDiscountCredit::STATUS_AVAILABLE)
            ->latest()
            ->get(['id', 'discount_percent', 'source', 'created_at']);
    }

    public function availableCreditPayload(User $user): array
    {
        return $this->availableCredits($user)
            ->map(fn(ReferralDiscountCredit $credit) => [
                'id' => $credit->id,
                'discount_percent' => $credit->discount_percent,
                'source' => $credit->source,
                'created_at' => $credit->created_at,
            ])
            ->values()
            ->all();
    }

    public function calculateOrderAmounts(User $user, Collection $categories, Collection $categoryIds, ?int $creditId): array
    {
        $subtotal = $this->orderSubtotal($user, $categories, $categoryIds);
        $credit = null;
        $discountPercent = 0;

        if ($this->isEnabled() && $creditId && $subtotal > 0) {
            $credit = ReferralDiscountCredit::where('user_id', $user->id)
                ->where('status', ReferralDiscountCredit::STATUS_AVAILABLE)
                ->lockForUpdate()
                ->find($creditId);

            if (!$credit) {
                throw ValidationException::withMessages([
                    'referral_discount_credit_id' => 'The selected referral discount is no longer available.',
                ]);
            }

            $discountPercent = $credit->discount_percent;
        }

        $discountAmount = round($subtotal * ($discountPercent / 100), 2);
        $payableAmount = max(round($subtotal - $discountAmount, 2), 0);

        return [
            'subtotal_amount' => $subtotal,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'payable_amount' => $payableAmount,
            'credit' => $credit,
        ];
    }

    public function markCreditUsed(?ReferralDiscountCredit $credit, WordListOrder $order): void
    {
        if (!$credit) {
            return;
        }

        $credit->update([
            'status' => ReferralDiscountCredit::STATUS_USED,
            'used_order_id' => $order->id,
            'used_at' => now(),
        ]);
    }

    private function orderSubtotal(User $user, Collection $categories, Collection $categoryIds): float
    {
        $adminCategoryIds = WordListCategory::where('is_locked', true)
            ->where('status', true)
            ->whereHas('creator', fn($query) => $query->where('email', 'admin@gmail.com'))
            ->pluck('id');

        if ($adminCategoryIds->isNotEmpty()) {
            $accessCategoryIds = UserWordListAccess::where('user_id', $user->id)
                ->pluck('word_list_category_id');

            $remainingCategoryIds = $adminCategoryIds->diff($accessCategoryIds)->values();
            $pendingCategoryIds = WordListOrderItem::whereIn('word_list_category_id', $remainingCategoryIds)
                ->whereHas('order', fn($query) => $query->where('user_id', $user->id)->where('status', 'pending'))
                ->pluck('word_list_category_id')
                ->unique()
                ->values();

            if ($pendingCategoryIds->isEmpty() && $remainingCategoryIds->sort()->values()->all() === $categoryIds->sort()->values()->all()) {
                return 999.0;
            }
        }

        return round((float) $categories->sum(fn(WordListCategory $category) => (float) $category->price), 2);
    }

    private function percentSetting(string $key): int
    {
        $value = (int) config("settings.{$key}", 0);

        return max(0, min(100, $value));
    }

    private function normalizeCode(?string $code): ?string
    {
        $code = Str::upper(trim((string) $code));

        return $code === '' ? null : $code;
    }
}
