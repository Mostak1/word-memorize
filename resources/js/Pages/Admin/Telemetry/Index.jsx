import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Activity,
    Users,
    MousePointer2,
    Clock,
    Monitor,
    Smartphone,
    Globe,
    ArrowRight,
    ExternalLink,
    Brain,
    HelpCircle,
    LogOut,
} from "lucide-react";
import { Badge } from "@/Components/ui/badge";

export default function TelemetryIndex({ 
    stats, 
    trends, 
    distribution, 
    topPages, 
    recentSessions, 
    userExerciseStats, 
    quizStats 
}) {
    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getSessionDuration = (session) => {
        if (!session.started_at || !session.last_seen_at) return "N/A";
        const start = new Date(session.started_at);
        const end = new Date(session.last_seen_at);
        const diffMs = end - start;
        const diffMins = Math.round(diffMs / 60000);
        return diffMins > 0 ? `${diffMins}m` : "< 1m";
    };

    const maxTrendCount = Math.max(...trends.sessions.map((t) => t.count), 1);

    return (
        <AdminLayout>
            <Head title="Telemetry Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Telemetry & Analytics</h1>
                        <p className="text-muted-foreground">
                            Real-time insights into user behavior and session activity.
                        </p>
                    </div>
                </div>

                {/* ── Highlight Stats ──────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                            <Activity className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_sessions.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
                            <MousePointer2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_page_views.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Session Time</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_session_duration}s</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                            <Globe className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_events.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Quiz & Practice Analytics ───────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Avg. Quiz Score</CardTitle>
                            <HelpCircle className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{quizStats.avg_score}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Quiz Completion</CardTitle>
                            <Brain className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{quizStats.completion_rate}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Avg. Practice Duration</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{quizStats.avg_duration}s</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-7">
                    {/* ── Session Trends Chart ──────────────────────────────── */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-base">Session Trends (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-[200px] items-end gap-1">
                                {trends.sessions.map((day, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                                        style={{ height: `${(day.count / maxTrendCount) * 100}%` }}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                            <div className="bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md border whitespace-nowrap">
                                                {day.date}: <span className="font-bold">{day.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                                <span>{trends.sessions[0]?.date}</span>
                                <span>{trends.sessions[trends.sessions.length - 1]?.date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Device & Browser Breakdown ────────────────────────── */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">Device & Browser Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Devices</p>
                                {distribution.device.map((d) => (
                                    <div key={d.device_type} className="flex items-center gap-3">
                                        {d.device_type === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                        <span className="text-sm capitalize flex-1">{d.device_type || 'Unknown'}</span>
                                        <span className="text-sm font-bold">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Top Browsers</p>
                                {distribution.browser.map((b) => (
                                    <div key={b.browser} className="flex items-center gap-2">
                                        <span className="text-sm flex-1 truncate">{b.browser || 'Unknown'}</span>
                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500" 
                                                style={{ width: `${(b.count / stats.total_sessions) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-8 text-right">{b.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── User Exercise Activity ────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            User Exercise Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-3 font-medium">User</th>
                                        <th className="text-center py-3 font-medium">Exercises</th>
                                        <th className="text-center py-3 font-medium">Completed</th>
                                        <th className="text-center py-3 font-medium">Abandoned</th>
                                        <th className="text-center py-3 font-medium">Quits (Rate)</th>
                                        <th className="text-right py-3 font-medium">Avg. Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userExerciseStats.map((user) => (
                                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-3">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </td>
                                            <td className="text-center py-3 font-semibold">{user.exercises_started}</td>
                                            <td className="text-center py-3 text-emerald-600 dark:text-emerald-400">{user.exercises_completed}</td>
                                            <td className="text-center py-3 text-rose-600 dark:text-rose-400">{user.exercises_abandoned}</td>
                                            <td className="text-center py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${user.abandonment_rate > 50 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${user.abandonment_rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold w-10">{user.abandonment_rate}%</span>
                                                </div>
                                            </td>
                                            <td className="text-right py-3 font-mono">{user.avg_exercise_duration}s</td>
                                        </tr>
                                    ))}
                                    {userExerciseStats.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-muted-foreground">No exercise data recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* ── Top Pages ────────────────────────────────────────── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Top Visited Pages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topPages.map((page, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                {page.title || 'No Title'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                {page.path}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{page.count.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground">views</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Recent Sessions ──────────────────────────────────── */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Recent Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {session.user?.name || `Guest (${session.anonymous_id.slice(0, 8)})`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(session.started_at)} • {session.browser}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-[10px]">
                                                {session.pageview_count} views
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {getSessionDuration(session)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
