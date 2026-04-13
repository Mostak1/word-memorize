import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Trophy, Medal, Award, Users, Flame, BookOpen } from "lucide-react";

export default function Leaderboard({ users, currentUserRank, sortBy }) {
    const { auth } = usePage().props;
    const [currentSort, setCurrentSort] = useState(sortBy);

    const handleSortChange = (newSort) => {
        setCurrentSort(newSort);
        router.get(
            route("leaderboard"),
            { sort: newSort },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    };

    const getSortIcon = (type) => {
        switch (type) {
            case "xp":
                return <Trophy className="h-4 w-4" />;
            case "mastered":
                return <BookOpen className="h-4 w-4" />;
            case "streak":
                return <Flame className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Leaderboard" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Leaderboard
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Top learners in the community
                            </p>
                        </div>
                        {currentUserRank && (
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Your Rank
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    #{currentUserRank}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sort Filters */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { key: "xp", label: "XP" },
                            { key: "mastered", label: "Mastered Words" },
                            { key: "streak", label: "Current Streak" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleSortChange(key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                    currentSort === key
                                        ? "bg-blue-500 text-white"
                                        : "bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                {getSortIcon(key)}
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-3">
                        {users.map((user, index) => {
                            const rank = index + 1;
                            const isCurrentUser =
                                auth.user && user.id === auth.user.id;

                            return (
                                <div
                                    key={user.id}
                                    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm ${
                                        isCurrentUser
                                            ? "ring-2 ring-blue-500"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10">
                                            {getRankIcon(rank)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route(
                                                        "public.user.show",
                                                        user.id,
                                                    )}
                                                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {user.name}
                                                </Link>
                                                {isCurrentUser && (
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            {user.headline && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.headline}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            {currentSort === "xp" && (
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                                        {user.xp.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        XP
                                                    </p>
                                                </div>
                                            )}
                                            {currentSort === "mastered" && (
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                                        {user.mastered_count}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Mastered
                                                    </p>
                                                </div>
                                            )}
                                            {currentSort === "streak" && (
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                                        {user.current_streak}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Day Streak
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No users found
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
