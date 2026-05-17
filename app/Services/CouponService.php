<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * Validate a coupon code for a specific user and order amount.
     *
     * @param string|null $code
     * @param User $user
     * @return Coupon|null
     * @throws ValidationException
     */
    public function validateCode(?string $code, User $user): ?Coupon
    {
        if (!$code) {
            return null;
        }

        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            throw ValidationException::withMessages([
                'coupon_code' => 'The coupon code is invalid.',
            ]);
        }

        if (!$coupon->is_active) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon is no longer active.',
            ]);
        }

        if ($coupon->assigned_user_id && $coupon->assigned_user_id !== $user->id) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon is not assigned to you.',
            ]);
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon has reached its maximum usage limit.',
            ]);
        }

        if ($coupon->start_date && $coupon->start_date->isFuture()) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon is not yet available.',
            ]);
        }

        if ($coupon->end_date && $coupon->end_date->isPast()) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon has expired.',
            ]);
        }

        if ($coupon->course_only) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This coupon is only valid for Course purchases.',
            ]);
        }

        return $coupon;
    }

    /**
     * Mark a coupon as used.
     */
    public function markAsUsed(Coupon $coupon): void
    {
        $coupon->increment('used_count');
        
        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            $coupon->update(['is_active' => false]);
        }
    }
}
