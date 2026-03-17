<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalWordLists = WordList::count();
        $totalWords = Word::count();

        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('is_admin', true)->count(),
            'total_categories' => WordListCategory::count(),
            'total_word_lists' => $totalWordLists,
            'active_users' => User::where('created_at', '>=', Carbon::now()->subDays(30))
                ->orWhere('updated_at', '>=', Carbon::now()->subDays(30))
                ->count(),
            'total_words' => $totalWords,
            'new_users_this_week' => User::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
            'avg_words_per_list' => $totalWordLists > 0
                ? round($totalWords / $totalWordLists, 1)
                : 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }

    public function reports()
    {
        $reports = [
            'user_growth' => User::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            'word_list_growth' => WordList::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            'popular_lists' => WordList::withCount('words')
                ->orderBy('words_count', 'desc')
                ->limit(10)
                ->get(),

            'recent_users' => User::latest()->limit(10)->get(),
            'recent_lists' => WordList::latest()->limit(10)->get(),
        ];

        return Inertia::render('Admin/Reports/Overview', [
            'reports' => $reports,
        ]);
    }

    public function userReports()
    {
        $reports = [
            'users_by_role' => [
                'admins' => User::where('is_admin', true)->count(),
                'regular_users' => User::where('is_admin', false)->count(),
            ],
            'users_by_verification' => [
                'verified' => User::whereNotNull('email_verified_at')->count(),
                'unverified' => User::whereNull('email_verified_at')->count(),
            ],
            'registration_trend' => User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'active_users' => User::orderBy('updated_at', 'desc')->limit(20)->get(),
        ];

        return Inertia::render('Admin/Reports/Users', [
            'reports' => $reports,
        ]);
    }
}