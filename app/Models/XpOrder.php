<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class XpOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_name',
        'xp_amount',
        'payable_amount',
        'payment_method',
        'phone_number',
        'name',
        'transaction_id',
        'status',
        'note',
        'admin_note',
    ];

    protected $casts = [
        'xp_amount' => 'integer',
        'payable_amount' => 'double',
    ];

    /**
     * Defined XP packages available for purchase.
     */
    public const PACKAGES = [
        'starter' => [
            'name' => 'Starter Kit',
            'xp_amount' => 5000,
            'price' => 50.00,
        ],
        'booster' => [
            'name' => 'Booster Pack',
            'xp_amount' => 12000,
            'price' => 100.00,
        ],
        'legend' => [
            'name' => 'Legend Bundle',
            'xp_amount' => 30000,
            'price' => 200.00,
        ],
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Grant XP to user's balance atomically.
     */
    public function grantXp(): void
    {
        // Ensure user has a UserXp row; if not, create one
        $userXp = $this->user->xp ?? UserXp::create([
            'user_id' => $this->user_id,
            'xp_balance' => 0
        ]);

        $userXp->addXp($this->xp_amount);
    }

    /**
     * Refund/Deduct XP from user's balance atomically.
     */
    public function refundXp(): void
    {
        $userXp = $this->user->xp;
        if ($userXp) {
            DB::table('user_xp')
                ->where('user_id', $this->user_id)
                ->decrement('xp_balance', $this->xp_amount);
        }
    }
}
