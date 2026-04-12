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
                'milestone_value' => 1, // Just need to do it once
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
        ];

        foreach ($achievements as $achievement) {
            Achievement::create($achievement);
        }
    }
}
