<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Services\ReferralService;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role',
        'image',
        'name',
        'headline',
        'email',
        'phone_number',
        'profession',
        'location',
        'bio',
        'gender',
        'document',
        'password',
        'facebook',
        'x',
        'linkedin',
        'website',
        'github',
        'approve_status',
        'login_as',
        'wallet',
        'referral_code',
        'google_id',
        'provider',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $user) {
            if (!$user->referral_code) {
                do {
                    $code = app(ReferralService::class)->generateCode();
                } while (self::where('referral_code', $code)->exists());

                $user->referral_code = $code;
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'wallet' => 'double',
        ];
    }

    // ─── Role Helpers ────────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isInstructor(): bool
    {
        return $this->role === 'instructor';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isApproved(): bool
    {
        return $this->approve_status === 'approved';
    }

    // ─── Relationships ────────────────────────────────────────────────────────────

    public function reviewWords()
    {
        return $this->hasMany(ReviewWord::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function wordProgresses()
    {
        return $this->hasMany(WordProgress::class);
    }

    public function streak()
    {
        return $this->hasOne(UserStreak::class);
    }

    public function xp()
    {
        return $this->hasOne(UserXp::class);
    }

    public function streakFreezePurchases()
    {
        return $this->hasMany(StreakFreezePurchase::class);
    }

    public function settings()
    {
        return $this->hasOne(UserSetting::class);
    }

    public function userAchievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function referredBy()
    {
        return $this->hasOne(Referral::class, 'referred_user_id');
    }

    public function referralsMade()
    {
        return $this->hasMany(Referral::class, 'referrer_user_id');
    }

    public function referralDiscountCredits()
    {
        return $this->hasMany(ReferralDiscountCredit::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'following_id', 'user_id')
            ->using(UserFollow::class)
            ->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'user_follows', 'user_id', 'following_id')
            ->using(UserFollow::class)
            ->withTimestamps();
    }

    public function telemetryEvents()
    {
        return $this->hasMany(TelemetryEvent::class);
    }

    // ─── Accessors ───────────────────────────────────────────────────────────────

    public function followerCount()
    {
        return $this->followers()->count();
    }

    public function followingCount()
    {
        return $this->following()->count();
    }

    /**
     * Get dark mode unlocked status from user settings
     */
    public function getDarkModeUnlockedAttribute(): bool
    {
        // Admin users always have dark mode unlocked
        if ($this->isAdmin()) {
            return true;
        }

        return $this->settings?->dark_mode_unlocked ?? false;
    }

    /**
     * Check if the user can access a specific word list.
     * Accessible if: wordlist is NOT locked OR user has category access OR user is admin.
     */
    public function canAccessWordList(WordList $wordList): bool
    {
        if (!$wordList->is_locked) {
            return true;
        }

        if ($this->isAdmin()) {
            return true;
        }

        return UserWordListAccess::where('user_id', $this->id)
            ->where('word_list_category_id', $wordList->word_list_category_id)
            ->exists();
    }
}
