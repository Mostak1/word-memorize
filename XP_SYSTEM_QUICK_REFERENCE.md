# XP System - Quick Reference Guide

## XP Economy at a Glance

| Activity                        | XP  | Frequency   | Notes                         |
| ------------------------------- | --- | ----------- | ----------------------------- |
| **Complete Exercise Session**   | 100 | Per session | Max 200/day (2 sessions)      |
| **Master a Word** (reach box 4) | 10  | Per word    | One-time per word             |
| **Complete Word List**          | 50  | Per list    | All words mastered            |
| **7-Day Streak Milestone**      | 50  | Once        | Awarded when reaching 7 days  |
| **14-Day Streak Milestone**     | 100 | Once        | Awarded when reaching 14 days |
| **30-Day Streak Milestone**     | 200 | Once        | Awarded when reaching 30 days |

## Shop - Streak Freezes

| Item            | Cost    | Details                  |
| --------------- | ------- | ------------------------ |
| **1st Freeze**  | 1000 XP | First purchase ever      |
| **2nd+ Freeze** | 2000 XP | All subsequent purchases |

---

## Files Modified/Created

### Database Migrations

✅ `2026_04_02_000001_create_user_xp_table.php`
✅ `2026_04_02_000002_create_streak_freeze_purchases_table.php`
✅ `2026_04_02_000003_add_session_xp_earned_to_user_daily_activities_table.php`

### Models

✅ `app/Models/UserXp.php` — New
✅ `app/Models/StreakFreezePurchase.php` — New
✅ `app/Models/User.php` — Updated (added xp & streakFreezePurchases relationships)

### Services

✅ `app/Services/XpService.php` — New (core XP logic)
✅ `app/Services/SrsService.php` — Updated (inject XpService, award mastery XP)
✅ `app/Services/StreakService.php` — Updated (inject XpService, award milestone XP)

### Controllers

✅ `app/Http/Controllers/ReviewWordController.php` — Updated (award session XP)
✅ `app/Http/Controllers/XpShopController.php` — New

### Routes

✅ `routes/api.php` — Updated (added /api/xp-shop/\* routes)

---

## Code Entry Points

### When Session Completes

**File**: [ReviewWordController.php](app/Http/Controllers/ReviewWordController.php#L67)

```php
public function sessionComplete(Request $request)
{
    $this->streakService->recordActivity($user);
    $xpAwarded = $this->xpService->awardSessionXp($user);
    return response()->json(['status' => 'ok', 'xp_awarded' => $xpAwarded]);
}
```

### When Word is Mastered

**File**: [SrsService.php](app/Services/SrsService.php#L60)

```php
if ($newBox >= WordProgress::MASTERED_BOX && $oldBox < WordProgress::MASTERED_BOX) {
    $this->xpService->awardMasteryXp($user, $word->id);
}
```

### When Streak Advances

**File**: [StreakService.php](app/Services/StreakService.php#L80)

```php
$this->xpService->awardStreakMilestoneXp($user, $newStreak);
```

### Buy Streak Freeze

**File**: [XpShopController.php](app/Http/Controllers/XpShopController.php#L47)

```php
POST /api/xp-shop/buy-streak-freeze
```

---

## Database Schema Quick Lookup

### user_xp

```sql
SELECT * FROM user_xp WHERE user_id = 1;
-- Returns: id, user_id, xp_balance, created_at, updated_at
```

### streak_freeze_purchases

```sql
SELECT COUNT(*) FROM streak_freeze_purchases WHERE user_id = 1;
-- Used to determine cost (0 = 1000 XP, 1+ = 2000 XP)
```

### user_daily_activities

```sql
SELECT session_xp_earned FROM user_daily_activities
WHERE user_id = 1 AND activity_date = DATE(NOW());
-- Tracks daily XP earned from sessions (max 200)
```

---

## Configuration

All numbers are configurable in [XpService.php](app/Services/XpService.php#L10-L36):

```php
const XP_PER_SESSION = 100;
const MAX_SESSION_XP_PER_DAY = 200;
const XP_PER_WORD_MASTERED = 10;
const XP_PER_WORDLIST_COMPLETION = 50;
const FIRST_FREEZE_COST = 1000;
const SUBSEQUENT_FREEZE_COST = 2000;
const STREAK_MILESTONES = [
    7 => 50,
    14 => 100,
    30 => 200,
];
```

---

## Frontend Integration Checklist

- [ ] Display XP balance in user dashboard/header
- [ ] Show "+100 XP" notification when session completes
- [ ] Show XP shop with current balance and freeze cost
- [ ] Disable "Buy Freeze" button if insufficient XP
- [ ] Show XP earned notification on word mastery
- [ ] Show milestone popup on streak milestones (7, 14, 30 day bonuses)
- [ ] Add XP progress bar for next milestone
- [ ] Link to XP shop from dashboard

---

## Testing Commands

```bash
# Check table creation
php artisan tinker
> DB::table('user_xp')->count()
> DB::table('streak_freeze_purchases')->count()

# Manually award XP
> $user = User::find(1);
> app('App\Services\XpService')->getOrCreate($user)->addXp(500);

# API test
curl -X GET http://localhost/api/xp-shop/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## System is Ready! 🚀

All backend functionality is complete and tested. The system:

- ✅ Tracks XP balance per user
- ✅ Awards XP for sessions, word mastery, and streaks
- ✅ Enforces daily 200 XP cap from sessions
- ✅ Provides shop for streak freeze purchases
- ✅ Escalates freeze cost (1000 → 2000 after first purchase)
- ✅ Has API endpoints for shop operations

Next: Connect frontend to `/api/xp-shop/*` endpoints and display XP throughout the UI.
