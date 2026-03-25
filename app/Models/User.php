<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

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

    public function streak()
    {
        return $this->hasOne(UserStreak::class);
    }
}