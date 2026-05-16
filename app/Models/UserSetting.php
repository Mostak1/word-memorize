<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'show_bangla',
        'sound_effects',
        'ui_language',
        'dark_mode_unlocked',
        'discount_purchased',
    ];

    protected function casts(): array
    {
        return [
            'show_bangla' => 'boolean',
            'sound_effects' => 'boolean',
            'dark_mode_unlocked' => 'boolean',
            'discount_purchased' => 'boolean',
        ];
    }

    // ── Relationship ──────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    /**
     * Return (or lazily create) the settings row for a user.
     */
    public static function forUser(User $user): self
    {
        return self::firstOrCreate(
            ['user_id' => $user->id],
            ['show_bangla' => true, 'sound_effects' => true, 'dark_mode_unlocked' => false, 'discount_purchased' => false]
        );
    }
}
