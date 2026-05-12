<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorReport;
use App\Models\User;
use App\Models\UserXp;
use App\Models\Word;
use App\Models\WordList;
use App\Models\WordListCategory;
use App\Models\TelemetrySession;
use App\Models\TelemetryPageView;
use App\Models\TelemetryEvent;
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
            'total_sessions'      => TelemetrySession::count(),
            'sessions_today'      => TelemetrySession::where('created_at', '>=', Carbon::today())->count(),
            'page_views_today'    => TelemetryPageView::where('created_at', '>=', Carbon::today())->count(),
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

    public function telemetry()
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $stats = [
            'total_sessions' => TelemetrySession::count(),
            'total_page_views' => TelemetryPageView::count(),
            'total_events' => TelemetryEvent::count(),
            'avg_session_duration' => round(TelemetryPageView::avg('duration_ms') / 1000, 1),
        ];

        $sessionTrends = TelemetrySession::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $pageViewTrends = TelemetryPageView::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $deviceDistribution = TelemetrySession::select(
            'device_type',
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('device_type')
            ->get();

        $browserDistribution = TelemetrySession::select(
            'browser',
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('browser')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        $topPages = TelemetryPageView::select(
            'path',
            'title',
            DB::raw('COUNT(*) as count'),
            DB::raw('AVG(duration_ms) as avg_duration')
        )
            ->groupBy('path', 'title')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $recentSessions = TelemetrySession::with('user:id,name,email')
            ->latest()
            ->limit(20)
            ->get();

        // ── User Exercise & Quiz Analytics ───────────────────────────────────
        $userExerciseStats = User::select('id', 'name', 'email')
            ->whereHas('telemetryEvents', function($q) {
                $q->whereIn('name', ['exercise_started', 'exercise_completed', 'exercise_abandoned']);
            })
            ->withCount([
                'telemetryEvents as exercises_started' => function($q) { $q->where('name', 'exercise_started'); },
                'telemetryEvents as exercises_completed' => function($q) { $q->where('name', 'exercise_completed'); },
                'telemetryEvents as exercises_abandoned' => function($q) { $q->where('name', 'exercise_abandoned'); }
            ])
            ->get()
            ->map(function($user) {
                // Calculate abandonment rate
                $total = $user->exercises_started;
                $user->abandonment_rate = $total > 0 ? round(($user->exercises_abandoned / $total) * 100, 1) : 0;
                
                // Get average duration for exercises
                // We'll approximate using page views for the ExerciseSession component
                $user->avg_exercise_duration = round(TelemetryPageView::where('user_id', $user->id)
                    ->where('component', 'ExerciseSession')
                    ->avg('duration_ms') / 1000, 1);
                
                return $user;
            });

        $quizStats = [
            'avg_score' => round(TelemetryEvent::where('name', 'quiz_finished')->avg('properties->score'), 1),
            'completion_rate' => 0,
            'avg_duration' => round(TelemetryPageView::where('component', 'WordlistQuiz')
                ->avg('duration_ms') / 1000, 1),
        ];

        $quizStarts = TelemetryEvent::where('name', 'quiz_started')->count();
        $quizComps = TelemetryEvent::where('name', 'quiz_finished')->count();
        $quizStats['completion_rate'] = $quizStarts > 0 ? round(($quizComps / $quizStarts) * 100, 1) : 0;

        return Inertia::render('Admin/Telemetry/Index', [
            'stats' => $stats,
            'trends' => [
                'sessions' => $sessionTrends,
                'page_views' => $pageViewTrends,
            ],
            'distribution' => [
                'device' => $deviceDistribution,
                'browser' => $browserDistribution,
            ],
            'topPages' => $topPages,
            'recentSessions' => $recentSessions,
            'userExerciseStats' => $userExerciseStats,
            'quizStats' => $quizStats,
        ]);
    }
}