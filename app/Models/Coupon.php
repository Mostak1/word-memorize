<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'discount_percent',
        'min_order_total',
        'max_uses',
        'used_count',
        'start_date',
        'end_date',
        'is_active',
        'description',
        'assigned_user_id',
        'source',
        'achievement_id',
        'course_only',
        'shop_only',
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'min_order_total' => 'float',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'course_only' => 'boolean',
        'shop_only' => 'boolean',
    ];

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }
}
