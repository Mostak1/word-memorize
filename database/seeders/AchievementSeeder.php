<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            // Longest Streak Badges
            [
                'key' => 'streak_bronze',
                'name' => 'Streak Bronze',
                'description' => 'Maintain a 7-day learning streak',
                'icon' => 'streak-bronze',
                'category' => 'streak',
                'tier' => 1,
                'milestone_value' => 7,
            ],
            [
                'key' => 'streak_silver',
                'name' => 'Streak Silver',
                'description' => 'Maintain a 14-day learning streak',
                'icon' => 'streak-silver',
                'category' => 'streak',
                'tier' => 2,
                'milestone_value' => 14,
            ],
            [
                'key' => 'streak_gold',
                'name' => 'Streak Gold',
                'description' => 'Maintain a 30-day learning streak',
                'icon' => 'streak-gold',
                'category' => 'streak',
                'tier' => 3,
                'milestone_value' => 30,
            ],
            [
                'key' => 'streak_platinum',
                'name' => 'Streak Platinum',
                'description' => 'Maintain a 60-day learning streak',
                'icon' => 'streak-platinum',
                'category' => 'streak',
                'tier' => 4,
                'milestone_value' => 60,
            ],
            [
                'key' => 'streak_diamond',
                'name' => 'Streak Diamond',
                'description' => 'Maintain a 100-day learning streak',
                'icon' => 'streak-diamond',
                'category' => 'streak',
                'tier' => 5,
                'milestone_value' => 100,
            ],

            // XP Tier Badges
            [
                'key' => 'xp_learner',
                'name' => 'Learner',
                'description' => 'Earn 100 XP total',
                'icon' => 'xp-learner',
                'category' => 'xp',
                'tier' => 1,
                'milestone_value' => 100,
            ],
            [
                'key' => 'xp_scholar',
                'name' => 'Scholar',
                'description' => 'Earn 1000 XP total',
                'icon' => 'xp-scholar',
                'category' => 'xp',
                'tier' => 2,
                'milestone_value' => 1000,
            ],
            [
                'key' => 'xp_wizard',
                'name' => 'Wizard',
                'description' => 'Earn 5000 XP total',
                'icon' => 'xp-wizard',
                'category' => 'xp',
                'tier' => 3,
                'milestone_value' => 5000,
            ],

            // Morning Learning Badge
            [
                'key' => 'explorer',
                'name' => 'Explorer',
                'description' => 'Earn XP before 9 AM',
                'icon' => 'explorer',
                'category' => 'morning',
                'tier' => 1,
                'milestone_value' => 1,
            ],

            // Perfect Lesson Badges
            [
                'key' => 'perfect_sharpshooter',
                'name' => 'Sharpshooter',
                'description' => 'Complete 1 perfect lesson (100% correct)',
                'icon' => 'perfect-sharpshooter',
                'category' => 'perfect',
                'tier' => 1,
                'milestone_value' => 1,
            ],
            [
                'key' => 'perfect_conqueror',
                'name' => 'Conqueror',
                'description' => 'Complete 10 perfect lessons (100% correct)',
                'icon' => 'perfect-conqueror',
                'category' => 'perfect',
                'tier' => 2,
                'milestone_value' => 10,
            ],
            [
                'key' => 'perfect_regal',
                'name' => 'Regal',
                'description' => 'Complete 50 perfect lessons (100% correct)',
                'icon' => 'perfect-regal',
                'category' => 'perfect',
                'tier' => 3,
                'milestone_value' => 50,
            ],

            // ── Words Mastered Badges ─────────────────────────────────────────
            [
                'key' => 'words_seedling',
                'name' => 'Seedling',
                'description' => 'Master 10 words',
                'icon' => 'words-seedling',
                'category' => 'words',
                'tier' => 1,
                'milestone_value' => 10,
            ],
            [
                'key' => 'words_bloom',
                'name' => 'Bloom',
                'description' => 'Master 50 words',
                'icon' => 'words-bloom',
                'category' => 'words',
                'tier' => 2,
                'milestone_value' => 50,
            ],
            [
                'key' => 'words_scholar',
                'name' => 'Word Scholar',
                'description' => 'Master 200 words',
                'icon' => 'words-scholar',
                'category' => 'words',
                'tier' => 3,
                'milestone_value' => 200,
            ],
            [
                'key' => 'words_lexicon',
                'name' => 'Lexicon',
                'description' => 'Master 500 words',
                'icon' => 'words-lexicon',
                'category' => 'words',
                'tier' => 4,
                'milestone_value' => 500,
            ],
            [
                'key' => 'words_polymath',
                'name' => 'Polymath',
                'description' => 'Master 1,000 words',
                'icon' => 'words-polymath',
                'category' => 'words',
                'tier' => 5,
                'milestone_value' => 1000,
            ],

            // ── Sessions Completed Badges ─────────────────────────────────────
            [
                'key' => 'sessions_rookie',
                'name' => 'Rookie',
                'description' => 'Complete your first learning session',
                'icon' => 'sessions-rookie',
                'category' => 'sessions',
                'tier' => 1,
                'milestone_value' => 1,
            ],
            [
                'key' => 'sessions_veteran',
                'name' => 'Veteran',
                'description' => 'Complete 50 learning sessions',
                'icon' => 'sessions-veteran',
                'category' => 'sessions',
                'tier' => 2,
                'milestone_value' => 50,
            ],
            [
                'key' => 'sessions_legend',
                'name' => 'Legend',
                'description' => 'Complete 200 learning sessions',
                'icon' => 'sessions-legend',
                'category' => 'sessions',
                'tier' => 3,
                'milestone_value' => 200,
            ],

            // ── Night Owl Badge ───────────────────────────────────────────────
            [
                'key' => 'night_owl',
                'name' => 'Night Owl',
                'description' => 'Earn XP after 10 PM',
                'icon' => 'night-owl',
                'category' => 'night',
                'tier' => 1,
                'milestone_value' => 1,
            ],

            // ── Mastery Test Badges ───────────────────────────────────────────
            [
                'key' => 'mastery_initiate',
                'name' => 'Initiate',
                'description' => 'Pass your first mastery test',
                'icon' => 'mastery-initiate',
                'category' => 'mastery',
                'tier' => 1,
                'milestone_value' => 1,
            ],
            [
                'key' => 'mastery_veteran',
                'name' => 'Mastery Veteran',
                'description' => 'Pass 10 mastery tests',
                'icon' => 'mastery-veteran',
                'category' => 'mastery',
                'tier' => 2,
                'milestone_value' => 10,
            ],
            [
                'key' => 'mastery_champion',
                'name' => 'Champion',
                'description' => 'Pass 25 mastery tests',
                'icon' => 'mastery-champion',
                'category' => 'mastery',
                'tier' => 3,
                'milestone_value' => 25,
            ],
            [
                'key' => 'mastery_flawless',
                'name' => 'Flawless',
                'description' => 'Score 100% on a mastery test',
                'icon' => 'mastery-flawless',
                'category' => 'mastery',
                'tier' => 1,
                'milestone_value' => 1,
            ],

            // ── Dedication Badges ─────────────────────────────────────────────
            [
                'key' => 'dedication_weekend_warrior',
                'name' => 'Weekend Warrior',
                'description' => 'Study on both Saturday and Sunday in the same weekend',
                'icon' => 'dedication-weekend-warrior',
                'category' => 'dedication',
                'tier' => 1,
                'milestone_value' => 1,
            ],
            [
                'key' => 'dedication_comeback_kid',
                'name' => 'Comeback Kid',
                'description' => 'Return and earn XP after a 7-day break',
                'icon' => 'dedication-comeback-kid',
                'category' => 'dedication',
                'tier' => 1,
                'milestone_value' => 1,
            ],
            [
                'key' => 'dedication_30_days',
                'name' => 'Monthly Devotee',
                'description' => 'Study on 30 different calendar days',
                'icon' => 'dedication-30-days',
                'category' => 'dedication',
                'tier' => 2,
                'milestone_value' => 30,
            ],
            [
                'key' => 'dedication_100_days',
                'name' => 'Century Club',
                'description' => 'Study on 100 different calendar days',
                'icon' => 'dedication-100-days',
                'category' => 'dedication',
                'tier' => 3,
                'milestone_value' => 100,
            ],
            [
                'key' => 'dedication_list_finisher',
                'name' => 'List Finisher',
                'description' => 'Complete every word in a word list',
                'icon' => 'dedication-list-finisher',
                'category' => 'dedication',
                'tier' => 2,
                'milestone_value' => 1,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::firstOrCreate(
                ['key' => $achievement['key']],  // lookup column — must be unique
                $achievement                      // values to fill on first insert
            );
        }
    }
}