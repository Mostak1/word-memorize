<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ExerciseGroup;
use App\Models\Word;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Calculate total exercise groups
        $totalExerciseGroups = ExerciseGroup::count();

        // Calculate total words
        $totalWords = Word::count();

        $stats = [
            // Total users
            'total_users' => User::count(),

            // Total exercise groups
            'total_exercise_groups' => $totalExerciseGroups,

            // Active users in last 30 days (based on updated_at or created_at)
            'active_users' => User::where('created_at', '>=', Carbon::now()->subDays(30))
                ->orWhere('updated_at', '>=', Carbon::now()->subDays(30))
                ->count(),

            // Total administrators
            'total_admins' => User::where('is_admin', true)->count(),

            // Total words across all exercise groups
            'total_words' => $totalWords,

            // New users in the last 7 days
            'new_users_this_week' => User::where('created_at', '>=', Carbon::now()->subDays(7))->count(),

            // Average words per exercise group
            'avg_words_per_group' => $totalExerciseGroups > 0
                ? $totalWords / $totalExerciseGroups
                : 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * Get detailed reports
     */
    public function reports()
    {
        $reports = [
            // User growth over the last 12 months
            'user_growth' => User::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            // Exercise groups created over time
            'exercise_group_growth' => ExerciseGroup::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            // Most popular exercise groups by word count
            'popular_groups' => ExerciseGroup::withCount('words')
                ->orderBy('words_count', 'desc')
                ->limit(10)
                ->get(),

            // Recent activity
            'recent_users' => User::latest()->limit(10)->get(),
            'recent_groups' => ExerciseGroup::latest()->limit(10)->get(),
        ];

        return Inertia::render('Admin/Reports/Overview', [
            'reports' => $reports
        ]);
    }

    /**
     * Get user-specific reports
     */
    public function userReports()
    {
        $reports = [
            // Users by admin status
            'users_by_role' => [
                'admins' => User::where('is_admin', true)->count(),
                'regular_users' => User::where('is_admin', false)->count(),
            ],

            // Users by email verification status
            'users_by_verification' => [
                'verified' => User::whereNotNull('email_verified_at')->count(),
                'unverified' => User::whereNull('email_verified_at')->count(),
            ],

            // User registration trends (last 30 days)
            'registration_trend' => User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            // Most active users (by updated_at)
            'active_users' => User::orderBy('updated_at', 'desc')->limit(20)->get(),
        ];

        return Inertia::render('Admin/Reports/Users', [
            'reports' => $reports
        ]);
    }
}