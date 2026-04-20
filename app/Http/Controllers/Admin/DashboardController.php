<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorReport;
use App\Models\User;
use App\Models\UserXp;
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
        $totalWords     = Word::count();

        $stats = [
            'total_users'         => User::count(),
            'total_admins'        => User::where('role', 'admin')->count(),
            'total_categories'    => WordListCategory::count(),
            'total_word_lists'    => $totalWordLists,
            'total_words'         => $totalWords,
            'active_users'        => User::where('updated_at', '>=', Carbon::now()->subDays(30))->count(),
            'new_users_this_week' => User::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
            'avg_words_per_list'  => $totalWordLists > 0
                ? round($totalWords / $totalWordLists, 1)
                : 0,
            'open_error_reports'  => ErrorReport::where('status', 'open')->count(),
            'total_xp_awarded'    => (int) UserXp::sum('xp_balance'),
        ];

        $recentUsers = User::latest()
            ->limit(5)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats'       => $stats,
            'recentUsers' => $recentUsers,
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
                'admins'      => User::where('role', 'admin')->count(),
                'instructors' => User::where('role', 'instructor')->count(),
                'students'    => User::where('role', 'student')->count(),
            ],
            'users_by_verification' => [
                'verified'   => User::whereNotNull('email_verified_at')->count(),
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