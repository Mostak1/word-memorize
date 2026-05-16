<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Support\Str;

class CourseStreakRewardCouponService
{
    private const REWARDS = [
        'streak_bronze' => [
            'source' => 'streak_7_day',
            'prefix' => 'STREAK7',
            'discount_percent' => 10,
            'description' => '7-day streak reward: 10% course discount',
        ],
        'streak_gold' => [
            'source' => 'streak_30_day',
            'prefix' => 'STREAK30',
            'discount_percent' => 15,
            'description' => '30-day streak reward: 15% course discount',
        ],
    ];

    public function isRewardAchievement(Achievement $achievement): bool
    {
        return array_key_exists($achievement->key, self::REWARDS);
    }

    public function ensureForAchievement(User $user, Achievement $achievement): ?Coupon
    {
        if (!$this->isRewardAchievement($achievement)) {
            return null;
        }

        $reward = self::REWARDS[$achievement->key];

        $existing = Coupon::query()
            ->where('assigned_user_id', $user->id)
            ->where('source', $reward['source'])
            ->first();

        if ($existing) {
            return $existing;
        }

        return Coupon::create([
            'code' => $this->generateUniqueCode($reward['prefix']),
            'type' => 'percent',
            'discount_percent' => $reward['discount_percent'],
            'min_order_total' => null,
            'max_uses' => 1,
            'used_count' => 0,
            'start_date' => now(),
            'end_date' => null,
            'is_active' => true,
            'description' => $reward['description'],
            'assigned_user_id' => $user->id,
            'source' => $reward['source'],
            'achievement_id' => $achievement->id,
            'course_only' => true,
        ]);
    }

    public function payloadForAchievement(User $user, Achievement $achievement): ?array
    {
        if (!$this->isRewardAchievement($achievement)) {
            return null;
        }

        $coupon = $this->ensureForAchievement($user, $achievement);

        if (!$coupon) {
            return null;
        }

        $used = $coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses;

        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'discount_percent' => (int) $coupon->discount_percent,
            'source' => $coupon->source,
            'status' => $coupon->is_active && !$used ? 'available' : 'used',
            'used_count' => $coupon->used_count,
            'max_uses' => $coupon->max_uses,
            'course_only' => (bool) $coupon->course_only,
        ];
    }

    private function generateUniqueCode(string $prefix): string
    {
        do {
            $code = $prefix . '-' . Str::upper(Str::random(6));
        } while (Coupon::where('code', $code)->exists());

        return $code;
    }
}
