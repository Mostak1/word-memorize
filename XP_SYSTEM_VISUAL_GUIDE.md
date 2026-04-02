# XP System - Visual Mockups & User Experience

## 1. Desktop View - Header with XP Display

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [VocabPix Logo] VocabPix    [Home] [WordLists] [⚡ 1250] [👤 User ▼]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### XP Badge Style

- **Background**: Light blue/white with subtle background
- **Icon**: Yellow/Gold Zap (⚡) lightning bolt
- **Text**: Bold white "1250"
- **Size**: Small but visible (not intrusive)
- **Position**: Between WordLists and User dropdown

---

## 2. Mobile View - Header with XP Display

```
┌──────────────────────────────────────────────────────┐
│ [VocabPix] VocabPix            [🚩] [☰]              │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Mobile Menu (opened)                          [✕]   │
├──────────────────────────────────────────────────────┤
│  [🏠] Home                                           │
│  [📚] WordLists                                      │
│  [⚡ 1250 XP] ← XP display in menu                   │
│  [🚩] Report Error                                   │
│  ────────────────────────────────────────────────    │
│  👤 User Name                                        │
│  👤@user.email                                       │
│  [👤] Profile                                        │
│  [🚪] Log Out                                        │
└──────────────────────────────────────────────────────┘
```

### Mobile XP Badge Style

- **Background**: Light blue background
- **Icon**: Yellow/Gold Zap (⚡)
- **Text**: White "1250 XP" (labeled in mobile for clarity)
- **Position**: Full width, between WordLists and Report Error

---

## 3. Exercise Session - Completion Screen

```
┌────────────────────────────────────────────────┐
│                                                │
│              🎉 Session Complete! 🎉           │
│            Oxford 3000 - Basic Level          │
│                                                │
├────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────────────┐   │
│  │    12    │    3     │       15         │   │
│  │ Cleared  │ Retries  │   Total Reps     │   │
│  └──────────┴──────────┴──────────────────┘   │
├────────────────────────────────────────────────┤
│                                                │
│    📊 List Progress                            │
│    ████████░░░░░░░░░░░░░░░░░░  45%           │
│    12 of 27 words in this queue               │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│        ⚡        +100 XP        ⚡            │
│    Experience Points Earned                    │
│                                                │
├────────────────────────────────────────────────┤
│  [New Session]          [← Back to List]      │
│                                                │
└────────────────────────────────────────────────┘
```

### XP Box Styling

- **Background**: Bright yellow/gold (gold-100 light)
- **Border**: 2px solid golden border
- **Icons**: Zap (⚡) on both sides in yellow/gold
- **Title**: "Experience Points Earned" subtitle text
- **Amount**: Large "100" in bold white/dark gray
- **Animation**: (Optional) Subtle glow or pulse effect

---

## 4. XP Earning Examples Throughout the Day

```
Session 1 (Morning)
┌─────────────────────────┐
│ ✅ Completed: +100 XP   │
│ Header now shows: ⚡100  │
└─────────────────────────┘

Session 2 (Afternoon)
┌─────────────────────────┐
│ ✅ Completed: +100 XP   │
│ Header now shows: ⚡200  │
│ (daily cap reached)     │
└─────────────────────────┘

Word Mastery (During session)
┌─────────────────────────┐
│ ✅ "UBIQUITOUS" mastered│
│ Silent: +10 XP awarded  │
│ Header: ⚡210 (updated) │
│ (No immediate popup)    │
└─────────────────────────┘

7-Day Streak Milestone
┌─────────────────────────┐
│ 🏆 7-Day Streak!       │
│ Bonus: +50 XP          │
│ Header: ⚡260          │
│ (Could show popup)     │
└─────────────────────────┘
```

---

## 5. XP Header Behavior Across Pages

### Page Navigation Flow

```
Homepage (Logged In)
├─ Header: ⚡ 1250
├─ Click: Home
├─ Load Dashboard
│  └─ Header: ⚡ 1250 (fetches fresh from API)
│
├─ Click: WordLists
├─ Load WordList Category
│  └─ Header: ⚡ 1250
│
├─ Click: Start Exercise Session
├─ Load ExerciseSession
│  └─ Header: ⚡ 1250 (no change during session)
│
├─ Complete Session
├─ Render: "Session Complete" with "+100 XP" display
│  └─ Header: ⚡ 1250 (stale - will update on next page)
│
├─ Click: "New Session" or "Back to List"
├─ Load next page
│  └─ Header: ⚡ 1350 (refreshed from API ✅)
```

---

## 6. Color Scheme & Icons

### XP Display Colors

```
   XP Icon (Zap)
   │
   ├─ Color: #FCD34D (Yellow-300) or #FBBF24 (Amber-400)
   ├─ Opacity: 100%
   └─ Size: 16x16px (header), 20x20px (session complete)

   Text/Number
   ├─ Color: White (#FFFFFF) with dark text option
   ├─ Font-weight: Bold (600-700)
   ├─ Font-size: 14px desktop, 16px mobile
   └─ Mono-font option for number

   Background
   ├─ Desktop: bg-white/10 (semi-transparent white)
   ├─ Mobile: bg-white/10 (same)
   ├─ Session Complete: bg-yellow-50 / bg-yellow-950/30 (dark mode)
   └─ Border: border-yellow-200 / border-yellow-800 (dark mode)
```

### Icon Set

- **Zap**: ⚡ (Lightning bolt) for XP/Energy
- **Streak**: 🔥 (Fire) for streaks
- **Mastery**: ✨ (Stars) for mastered words
- **Celebration**: 🎉 (Confetti) for session complete

---

## 7. Responsive Behavior

### Desktop (1024px+)

- XP badge shows in top nav
- Compact format: "⚡ 1250"
- Session complete: Full card layout

### Tablet (768px - 1023px)

- XP badge shows in top nav
- Slightly larger: "⚡ 1250"
- Session complete: Same full card

### Mobile (< 768px)

- XP badge shows in mobile menu
- Full label: "⚡ 1250 XP"
- Session complete: Full width card with larger text

---

## 8. Animation & Interaction (Optional Future)

### XP Gain Animation

```
User completes session
    ↓
Session complete screen shows
    ↓
XP box appears with:
  - Fade in (0.3s)
  - Slight scale up (0.9 → 1.0)
  - Glow effect around box
    ↓
Hold for 2 seconds
    ↓
On navigation:
  - XP value animates from old → new
  - Counter increment effect (1250 → 1350)
```

### Header XP Update Animation

```
Old value: 1250
    ↓ (on page load)
    ↓
New value: 1350
    ↓
Animation options:
Option A: Instant update + pulse
Option B: Counter animation (1250...1300...1350)
Option C: Slide in from side
```

---

## 9. Dark Mode Support

### Light Mode (Default)

- Header: Red background (#E5201C)
- XP badge: White semi-transparent bg
- Text: White
- Icons: Yellow/Gold

### Dark Mode

- Header: Dark red (auto darkens)
- XP badge: Dark semi-transparent bg
- Text: Light gray/white
- Icons: Bright yellow
- Session complete box: Dark yellow-950/30 background

---

## 10. Error States & Edge Cases

### XP Not Loading

```
Header shows:
  [Home] [WordLists] [☰ User] (no XP displayed)

Reason: API call failed
Solution: Silent retry on next page navigation
```

### User Not Authenticated

```
Header shows:
  [WordLists] [Login] [Register] (no XP)

(Non-authenticated users don't need XP display)
```

### Session XP = 0 (Daily cap reached)

```
Session Complete Screen:
  Stats: 12 | 3 | 15
  (No XP box shown)
  ↓
  (User gets no XP notification)

  Reason: Already earned 200 XP today
```

---

## 11. Accessibility Features

- **Color**: XP isn't only indicated by color (has icon + text)
- **Contrast**: Yellow/gold meets WCAG AA standards
- **Icon**: Zap icon has aria-label option
- **Mobile**: Full label "XP" in mobile menu (not just icon)
- **Keyboard**: XP display is read-only (no interaction needed)

---

## 12. User Journey Map

```
┌─ User Logs In ──────────────────────────────────────┐
│                                                      │
│ Sees header with: ⚡ 1250                           │
│ "Oh cool, I have 1250 XP!"                         │
│                                                      │
└──────────────────┬─────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   Exercise           Browse Word Lists
   Session                   │
        │                     │
        │             ┌─────────────┐
        │             │ See mastery  │
        │             │ → +10 XP     │
        │             │ (silent)     │
        │             └─────────────┘
        │
        └──── Session Complete
              │
              ├─ Show: +100 XP 💫
              ├─ Header still shows: 1250
              │  (will update on next nav)
              │
              └─ Click: "New Session"
                 │
                 └─ Load new page
                    └─ Header UPDATES to: ⚡ 1350 ✨
                       "Wow, I earned 100 XP!"
```

---

**Visual Design Philosophy**:

- **Gamification**: Gold/yellow colors evoke rewards & treasure
- **Clarity**: Clear XP amounts, no confusion
- **Integration**: Fits naturally into existing design
- **Responsiveness**: Works on all screen sizes
- **Accessibility**: Not color-dependent, labeled properly
- **Engagement**: Satisfying visuals that encourage more learning

---

**Implementation Reference**:

- AppLayout: Lines 1-250+ (header display)
- ExerciseSession: Lines 437-465 (session complete XP display)
- Styling: Tailwind classes (yellow-50, yellow-100, yellow-300, etc.)
