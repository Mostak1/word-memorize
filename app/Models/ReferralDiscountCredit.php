<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralDiscountCredit extends Model
{
    use HasFactory;

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_USED = 'used';

    protected $fillable = [
        'user_id',
        'referral_id',
        'source',
        'discount_percent',
        'status',
        'used_order_id',
        'used_at',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function referral()
    {
        return $this->belongsTo(Referral::class);
    }

    public function usedOrder()
    {
        return $this->belongsTo(WordListOrder::class, 'used_order_id');
    }
}
