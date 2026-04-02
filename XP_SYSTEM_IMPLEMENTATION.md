# XP System Implementation Summary

**Status**: ✅ Complete and Ready to Use

---

## 1. Database Schema

### `user_xp` Table

Stores the current XP balance for each user.

```
id (PK)
user_id (FK) — unique constraint
xp_balance (integer, default 0)
timestamps
```

### `streak_freeze_purchases` Table

Tracks when users buy streak freezes (used for cost escalation and history).

```
id (PK)
user_id (FK)
xp_cost (integer) — how much XP was paid
purchased_at (timestamp)
is_used (boolean) — whether the freeze has been claimed
timestamps
```

### `user_daily_activities` Table (Updated)

Added `session_xp_earned` column to track daily session XP cap.

```
... existing columns ...
session_xp_earned (integer, default 0) — XP earned from sessions today
```

---

## 2. Models Created

### `UserXp` — [app/Models/UserXp.php](app/Models/UserXp.php)

- Represents user's XP balance
- Methods:
    - `canAffordFreeze(int $cost)` — checks if user has enough XP
    - `addXp(int $amount)` — increments XP balance
    - `spendXp(int $amount)` — decrements balance, returns success

### `StreakFreezePurchase` — [app/Models/StreakFreezePurchase.php](app/Models/StreakFreezePurchase.php)

- Tracks purchase history for streak freezes
- Used to enforce cost escalation logic

---

## 3. Services

### `XpService` — [app/Services/XpService.php](app/Services/XpService.php)

**Constants**:

```php
XP_PER_SESSION = 100              // Per completed session
MAX_SESSION_XP_PER_DAY = 200      // Cap: 2 sessions × 100 XP
XP_PER_WORD_MASTERED = 10         // Per word reaching box 4
XP_PER_WORDLIST_COMPLETION = 50   // Per completed word list

FIRST_FREEZE_COST = 1000          // First streak freeze cost
SUBSEQUENT_FREEZE_COST = 2000     // 2nd+ freeze cost

STREAK_MILESTONES = [
    7 => 50,      // 7-day streak = 50 XP
    14 => 100,    // 14-day = 100 XP
    30 => 200,    // 30-day = 200 XP
    // Scaling: every 10 days after 30 gets additional XP
]
```

**Key Methods**:

- `awardSessionXp(User $user): int` — Awards 100 XP for completing a session (respects 200 XP/day cap)
- `awardMasteryXp(User $user, int $wordId): bool` — Awards 10 XP when a word is mastered
- `awardWordListCompletionXp(User $user, int $wordListId): bool` — Awards 50 XP when all words in a list are mastered
- `awardStreakMilestoneXp(User $user, int $currentStreak): bool` — Awards XP at streak milestones
- `getNextFreezeCost(User $user): int` — Returns 1000 or 2000 based on purchase count
- `buyStreakFreeze(User $user): bool` — Deducts XP, creates purchase record
- `getSummary(User $user): array` — Returns current balance and freeze shop status

---

## 4. Integration Points

### **ReviewWordController** → Award Session XP

When `sessionComplete()` is called:

1. Records activity in streak system
2. Calls `XpService::awardSessionXp()` to award 100 XP (or less if at daily cap)
3. Returns `xp_awarded` in response

```json
{
    "status": "ok",
    "xp_awarded": 100
}
```

### **SrsService** → Award Mastery XP

When `recordCorrect()` moves a word to box 4 (mastered):

1. Removes word from review queue
2. Calls `XpService::awardMasteryXp()` to award 10 XP
3. (Only on first mastery, not if word slips back)

### **StreakService** → Award Milestone XP

When `recordActivity()` updates the streak:

1. Calculates new streak count
2. Calls `XpService::awardStreakMilestoneXp()` if streak is a milestone (7, 14, 30, etc.)
3. Awards appropriate bonus XP

---

## 5. API Endpoints

### `GET /api/xp-shop/status` ✅ (Protected)

Returns current XP status and shop prices.

**Response**:

```json
{
    "xp": {
        "balance": 1500,
        "next_freeze_cost": 1000,
        "can_afford_freeze": true
    },
    "streak": {
        "current_streak": 7,
        "freeze_count": 2,
        "active_today": true
    }
}
```

### `POST /api/xp-shop/buy-streak-freeze` ✅ (Protected)

Purchase a streak freeze with XP.

**Success (200)**:

```json
{
    "success": true,
    "message": "Streak freeze purchased!",
    "xp": {
        "balance": 500,
        "next_freeze_cost": 2000,
        "can_afford_freeze": false
    },
    "streak": {
        "freeze_count": 3
    }
}
```

**Error (400)** - Insufficient XP:

```json
{
    "error": "Insufficient XP",
    "balance": 500,
    "required": 2000
}
```

---

## 6. XP Earning Flow

### Daily Session Completion

```
User completes exercise → sessionComplete() called
  → StreakService::recordActivity() [streak advances]
  → XpService::awardSessionXp() [+100 XP, capped at 200/day]
  → If streak milestone reached: XpService::awardStreakMilestoneXp() [bonus XP]
```

### Word Mastery

```
User answers correctly 3 times → word moves to box 4
  → SrsService::recordCorrect() detects box 4 transition
  → XpService::awardMasteryXp() [+10 XP per word]
```

### Word List Completion

```
Last word in a wordlist reaches box 4
  → Can call XpService::awardWordListCompletionXp() [+50 XP]
  → (Manual trigger needed in controller, not yet integrated)
```

### Streak Milestones

```
7-day streak → +50 XP
14-day streak → +100 XP
30-day streak → +200 XP
```

---

## 7. Streak Freeze Shop

User can spend XP to buy streak freezes:

- **1st freeze**: 1000 XP
- **2nd+ freeze**: 2000 XP each

On purchase:

1. XP is deducted from balance
2. `StreakFreezePurchase` record created
3. Freeze is awarded via `StreakService::awardFreeze()`
4. User can now use freeze if streak breaks

---

## 8. User Model Updates

Added relationships:

```php
public function xp() → hasOne(UserXp::class)
public function streakFreezePurchases() → hasMany(StreakFreezePurchase::class)
```

---

## 9. Next Steps (Optional)

To enable word list completion XP:

1. Create an event listener when word reaches box 4
2. Check if all words in the associated list are now mastered
3. Call `XpService::awardWordListCompletionXp()`

Example (in a job or event):

```php
// After a word is mastered
$xpService->awardWordListCompletionXp($user, $word->wordlist_id);
```

---

## 10. Testing the System

### Verify Tables Created

```bash
php artisan tinker
> DB::table('user_xp')->count()
> DB::table('streak_freeze_purchases')->count()
```

### Award XP Manually

```php
$user = User::find(1);
$xpService = app('App\Services\XpService');
$xpService->getOrCreate($user)->addXp(500);
```

### Buy Streak Freeze

```bash
POST /api/xp-shop/buy-streak-freeze
Authorization: Bearer {token}
```

---

## 11. Configuration Notes

All XP amounts are defined as constants in `XpService`:

- Edit these constants to adjust reward amounts
- Modify `STREAK_MILESTONES` array to change milestone schedule
- Change `FIRST_FREEZE_COST` and `SUBSEQUENT_FREEZE_COST` for different pricing

---

**Implementation Date**: April 2, 2026  
**Status**: Ready for Frontend Integration
