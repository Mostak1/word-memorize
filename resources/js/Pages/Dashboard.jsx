import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Plus,
    BookOpen,
    List,
    Star,
    Share2,
    Settings,
    Trophy,
    Flame,
    ShieldCheck,
    Snowflake,
    ShoppingBag,
} from "lucide-react";

// ── Streak Banner ─────────────────────────────────────────────────────────────

function StreakBanner({ streak }) {
    if (!streak) return null;

    const {
        current_streak,
        longest_streak,
        freeze_count,
        active_today,
        at_risk,
        is_frozen,
        is_broken,
        auto_save_available,
    } = streak;

    // ── Visual config per state ───────────────────────────────────────────────
    const config = active_today
        ? {
              bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
              flame: "text-orange-500",
              label: null,
              message: "Great job! Come back tomorrow to keep it going.",
          }
        : is_frozen
          ? {
                bg: "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-800",
                flame: "text-blue-400",
                label: {
                    text: "🧊 Streak Frozen",
                    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                },
                message:
                    "You missed yesterday, but your streak is saved! Complete a quiz or exercise to continue.",
            }
          : at_risk
            ? {
                  bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800",
                  flame: "text-yellow-400",
                  label: {
                      text: "⚠️ At Risk",
                      cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
                  },
                  message:
                      "No activity yet today — do a quiz or exercise before midnight!",
              }
            : is_broken
              ? {
                    bg: "bg-gray-100 border-gray-300 dark:bg-slate-800 dark:border-slate-700",
                    flame: "text-gray-300",
                    label: {
                        text: "💀 Streak Lost",
                        cls: "bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
                    },
                    message:
                        "You missed too many days. Start a new streak today!",
                }
              : {
                    // No streak yet (brand new user)
                    bg: "bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-700",
                    flame: "text-gray-300",
                    label: null,
                    message:
                        "Complete a quiz or exercise to start your streak.",
                };

    return (
        <div className={`rounded-2xl border p-4 mb-3 ${config.bg}`}>
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
                {/* Flame + current streak */}
                <div className="flex items-center gap-2">
                    {is_frozen ? (
                        <Snowflake className="h-8 w-8 text-blue-400" />
                    ) : (
                        <Flame className={`h-8 w-8 ${config.flame}`} />
                    )}
                    <div>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 leading-none">
                            {current_streak}
                            <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 ml-1">
                                day{current_streak !== 1 ? "s" : ""}
                            </span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Current streak
                        </p>
                    </div>
                </div>

                {/* Right side: status badge + best + safe days */}
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            {longest_streak}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Best
                        </p>
                    </div>

                    {freeze_count > 0 && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {freeze_count}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                Safe {freeze_count === 1 ? "day" : "days"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status badge */}
            {config.label && (
                <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${config.label.cls}`}
                >
                    {config.label.text}
                </span>
            )}

            {/* Message */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.message}
            </p>

            {/* Frozen CTA */}
            {is_frozen && (
                <div className="mt-3 flex gap-2">
                    <Link
                        href={route("quiz.index")}
                        className="flex-1 text-center text-xs font-semibold bg-blue-500 text-white rounded-xl py-2 hover:bg-blue-600 transition-colors"
                    >
                        Take a Quiz
                    </Link>
                    <Link
                        href={route("wordlistcategory.index")}
                        className="flex-1 text-center text-xs font-semibold bg-white border border-blue-300 text-blue-600 rounded-xl py-2 hover:bg-blue-50 transition-colors dark:bg-slate-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-slate-700"
                    >
                        Do Exercise
                    </Link>
                </div>
            )}

            {/* Auto-save availability hint (only shown when not frozen and not active) */}
            {!is_frozen &&
                !active_today &&
                !is_broken &&
                auto_save_available && (
                    <p className="text-xs text-blue-400 dark:text-blue-300 mt-1.5">
                        🛡️ Auto-save available — if you miss a day this week
                        your streak will be saved.
                    </p>
                )}
        </div>
    );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({
    masteredCount = 0,
    reviewCount = 0,
    streak = null,
}) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Start learning and expand your vocabulary
                    </p>

                    <StreakBanner streak={streak} />

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <Link
                            href={route("my.words.index") + "?new=1"}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                                    <Plus className="h-8 w-8 text-blue-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        Add New Word
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        Expand vocabulary
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("wordlistcategory.index")}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                                    <List className="h-8 w-8 text-purple-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        WordLists
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        Browse All
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href={route("words.mastered")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                                    <Trophy className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        Mastered Words
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {masteredCount > 0 ? (
                                            <span className="font-extrabold text-green-600 text-base">
                                                {masteredCount} words
                                            </span>
                                        ) : (
                                            "Words you know"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href={route("quiz.index")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-[#E5201C]/10 dark:bg-red-950/30 flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-[#E5201C]" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        Quiz
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        Practice now
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("my.orders")}
                            className="block bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-indigo-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                    My Orders
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    View your order history
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <Star className="h-6 w-6 text-amber-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                Rate 5 Stars
                            </span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <Share2 className="h-6 w-6 text-blue-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                Share
                            </span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <Settings className="h-6 w-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                Settings
                            </span>
                        </div>
                    </div>

                    <Link href={route("my.words.index")}>
                        <div className="bg-[#E5201C] dark:bg-red-700 rounded-2xl py-5 px-6 text-center shadow-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors cursor-pointer">
                            <p className="text-white font-bold text-sm">
                                My Word Collection
                            </p>
                            <p className="text-white/80 text-xs mt-1">
                                View &amp; manage all your personal words
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
