import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    BookOpen,
    UserCheck,
    Shield,
    TrendingUp,
    BookMarked,
    ArrowRight,
} from "lucide-react";

export default function Dashboard({ stats }) {
    // Primary stats cards
    const statCards = [
        {
            title: "Total Users",
            value: stats.total_users,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            description: "Registered users",
        },
        {
            title: "Exercise Groups",
            value: stats.total_exercise_groups,
            icon: BookOpen,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            description: "Total groups",
        },
        // {
        //     title: "Active Users (30d)",
        //     value: stats.active_users,
        //     icon: UserCheck,
        //     color: "text-purple-600",
        //     bgColor: "bg-purple-50 dark:bg-purple-950",
        //     description: "Last 30 days",
        // },
        {
            title: "Administrators",
            value: stats.total_admins,
            icon: Shield,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
            description: "Admin users",
        },
    ];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome to your admin dashboard
                        </p>
                    </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                        {stat.value.toLocaleString()}
                                    </div>
                                    {stat.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stat.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Total Words */}
                    {/* <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Words
                            </CardTitle>
                            <div className="rounded-full p-2 bg-indigo-50 dark:bg-indigo-950">
                                <BookMarked className="h-4 w-4 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_words.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all groups
                            </p>
                        </CardContent>
                    </Card> */}

                    {/* New Users This Week */}
                    {/* <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                New Users (7d)
                            </CardTitle>
                            <div className="rounded-full p-2 bg-emerald-50 dark:bg-emerald-950">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.new_users_this_week.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Last 7 days
                            </p>
                        </CardContent>
                    </Card> */}

                    {/* Average Words per Group */}
                    {/* <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg Words/Group
                            </CardTitle>
                            <div className="rounded-full p-2 bg-pink-50 dark:bg-pink-950">
                                <BookOpen className="h-4 w-4 text-pink-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(
                                    stats.avg_words_per_group,
                                ).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Per exercise group
                            </p>
                        </CardContent>
                    </Card> */}
                </div>

                {/* Content Overview & Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Quick Stats Summary */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Quick Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            User Growth
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            New registrations this week
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-emerald-600">
                                            +{stats.new_users_this_week}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-b pb-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Content Library
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Exercise groups & words
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {stats.total_exercise_groups} groups
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {stats.total_words} words
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Administration
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Admin user accounts
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {stats.total_admins}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}

                    {/* Quick Actions */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link
                                        href={route(
                                            "admin.exercise-groups.create",
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Create Exercise Group
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-between"
                                    variant="outline"
                                >
                                    <Link
                                        href={route(
                                            "admin.exercise-groups.index",
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            <BookMarked className="h-4 w-4" />
                                            Manage Exercise Groups
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

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
                    </Card> */}
                </div>

                {/* Recent Activity Placeholder */}
                {/* <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Recent activity log will be displayed here. This
                            could include newly created exercise groups, user
                            registrations, and system events.
                        </p>
                    </CardContent>
                </Card> */}
            </div>
        </AdminLayout>
    );
}
