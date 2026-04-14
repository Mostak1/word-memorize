import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Trophy,
    Lock,
    CheckCircle,
    Target,
    Flame,
    Coins,
    Sunrise,
    Award,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCsrf() {
    return decodeURIComponent(
        document.cookie
            .split("; ")
            .find((r) => r.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] ?? "",
    );
}

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            "X-XSRF-TOKEN": getCsrf(),
            Accept: "application/json",
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });
    return res.json();
}

// ── Achievement Card ──────────────────────────────────────────────────────────

function AchievementCard({ achievement, earned, progress, earnedAt }) {
    const isEarned = earned;
    const progressPercent = Math.min(100, progress.percentage);

    const getCategoryIcon = (category) => {
        switch (category) {
            case "streak":
                return <Flame className="w-6 h-6" />;
            case "xp":
                return <Coins className="w-6 h-6" />;
            case "morning":
                return <Sunrise className="w-6 h-6" />;
            case "perfect":
                return <Target className="w-6 h-6" />;
            default:
                return <Award className="w-6 h-6" />;
        }
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 1:
                return "text-yellow-500";
            case 2:
                return "text-gray-400";
            case 3:
                return "text-yellow-600";
            case 4:
                return "text-purple-500";
            case 5:
                return "text-blue-500";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div
            className={`p-4 rounded-lg border-2 transition-all ${
                isEarned
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`p-2 rounded-full ${
                        isEarned
                            ? "bg-green-100 dark:bg-green-800"
                            : "bg-gray-100 dark:bg-gray-700"
                    }`}
                >
                    {isEarned ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(achievement.category)}
                        <h3
                            className={`font-semibold ${isEarned ? "text-green-800 dark:text-green-200" : "text-gray-900 dark:text-white"}`}
                        >
                            {achievement.name}
                        </h3>
                        {achievement.tier > 1 && (
                            <span
                                className={`text-sm font-medium ${getTierColor(achievement.tier)}`}
                            >
                                Tier {achievement.tier}
                            </span>
                        )}
                    </div>

                    <p
                        className={`text-sm mb-3 ${isEarned ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"}`}
                    >
                        {achievement.description}
                    </p>

                    {!isEarned && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Progress</span>
                                <span>
                                    {progress.current} / {progress.target}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {isEarned && earnedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Earned {new Date(earnedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Achievements() {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(route("api.achievements.index"));
            setAchievements(data.achievements || []);
        } catch (err) {
            setError("Failed to load achievements");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const earnedCount = achievements.filter((a) => a.earned).length;
    const totalCount = achievements.length;

    if (loading) {
        return (
            <AppLayout>
                <Head title="Achievements" />
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                                    <div className="space-y-3">
                                        {[...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-24 bg-gray-200 dark:bg-slate-700 rounded"
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <Head title="Achievements" />
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <p className="text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                                <button
                                    onClick={loadAchievements}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Achievements" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                        Achievements
                                    </h1>
                                    <p className="text-gray-600 dark:text-slate-400">
                                        {earnedCount} of {totalCount} badges
                                        earned
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {achievements.map((item) => (
                                    <AchievementCard
                                        key={item.achievement.key}
                                        achievement={item.achievement}
                                        earned={item.earned}
                                        progress={item.progress}
                                        earnedAt={item.earned_at}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
