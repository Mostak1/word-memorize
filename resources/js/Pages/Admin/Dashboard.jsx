import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Users,
    BookOpen,
    Shield,
    TrendingUp,
    BookMarked,
    ArrowRight,
    UserCheck,
    LayoutGrid,
    Zap,
    AlertTriangle,
    Settings,
    Clock,
} from "lucide-react";

export default function Dashboard({ stats, recentUsers }) {
    // ── Primary stat cards ────────────────────────────────────────────────────
    const statCards = [
        {
            title: "Total Users",
            value: stats.total_users.toLocaleString(),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            description: "Registered accounts",
        },
        {
            title: "Active Users (30d)",
            value: stats.active_users.toLocaleString(),
            icon: UserCheck,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
            description: "Active last 30 days",
        },
        {
            title: "Word Lists",
            value: stats.total_word_lists.toLocaleString(),
            icon: BookOpen,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            description: "Total word lists",
        },
        {
            title: "Administrators",
            value: stats.total_admins.toLocaleString(),
            icon: Shield,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
            description: "Admin accounts",
        },
    ];

    // ── Secondary stat cards ──────────────────────────────────────────────────
    const secondaryCards = [
        {
            title: "Total Words",
            value: stats.total_words.toLocaleString(),
            icon: BookMarked,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-950",
            description: "Across all word lists",
        },
        {
            title: "New Users (7d)",
            value: stats.new_users_this_week.toLocaleString(),
            icon: TrendingUp,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-950",
            description: "Joined this week",
        },
        {
            title: "Categories",
            value: stats.total_categories.toLocaleString(),
            icon: LayoutGrid,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50 dark:bg-cyan-950",
            description: "Word list categories",
        },
        {
            title: "Total XP Awarded",
            value: stats.total_xp_awarded.toLocaleString(),
            icon: Zap,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-950",
            description: "XP across all users",
        },
    ];

    // ── Role badge helper ─────────────────────────────────────────────────────
    const roleBadge = (role) => {
        const map = {
            admin: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
            instructor:
                "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
            student:
                "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        };
        return map[role] ?? "bg-gray-100 text-gray-700";
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back — here's what's happening in VocabPix.
                        </p>
                    </div>

                    {/* Open error-reports alert badge */}
                    {stats.open_error_reports > 0 && (
                        <Link href={route("admin.error-reports.index")}>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                {stats.open_error_reports} Open Report
                                {stats.open_error_reports !== 1 ? "s" : ""}
                            </Button>
                        </Link>
                    )}
                </div>

                {/* ── Primary Stats ────────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div
                                        className={`rounded-full p-2 ${stat.bgColor}`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${stat.color}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* ── Secondary Stats ──────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {secondaryCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div
                                        className={`rounded-full p-2 ${stat.bgColor}`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${stat.color}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* ── Bottom Row: Recent Users + Quick Actions ─────────────── */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Users table — spans 2 cols */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Recent Users
                            </CardTitle>
                            <Link href={route("admin.users.index")}>
                                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                    View all <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-xs text-muted-foreground">
                                            <th className="pb-2 text-left font-medium">
                                                Name
                                            </th>
                                            <th className="pb-2 text-left font-medium">
                                                Email
                                            </th>
                                            <th className="pb-2 text-left font-medium">
                                                Role
                                            </th>
                                            <th className="pb-2 text-left font-medium">
                                                Joined
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(recentUsers ?? []).map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-muted/40 transition-colors"
                                            >
                                                <td className="py-2.5 pr-4 font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="py-2.5 pr-4 text-muted-foreground truncate max-w-[180px]">
                                                    {user.email}
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadge(user.role)}`}
                                                    >
                                                        {user.role ?? "user"}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-muted-foreground text-xs">
                                                    {formatDate(
                                                        user.created_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2.5">
                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link href={route("admin.users.index")}>
                                        <span className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Manage Users
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link href={route("admin.word-lists.index")}>
                                        <span className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Manage Word Lists
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link href={route("admin.error-reports.index")}>
                                        <span className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Error Reports
                                            {stats.open_error_reports > 0 && (
                                                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-white">
                                                    {stats.open_error_reports}
                                                </span>
                                            )}
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link href={route("admin.user-progress.index")}>
                                        <span className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            User Progress
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link href={route("admin.settings.index")}>
                                        <span className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            System Settings
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Content Summary Bar ──────────────────────────────────── */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-6 sm:grid-cols-3 text-center">
                            <div>
                                <p className="text-3xl font-bold">
                                    {stats.avg_words_per_list.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Avg. words per list
                                </p>
                            </div>
                            <div className="sm:border-x">
                                <p className="text-3xl font-bold">
                                    {stats.total_categories.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Active categories
                                </p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">
                                    {stats.total_xp_awarded.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Total XP earned by users
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
