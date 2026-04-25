import React, { useEffect, useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Plus,
    BookOpen,
    List,
    Settings,
    Trophy,
    Flame,
    ShieldCheck,
    Snowflake,
    Bookmark,
    RotateCcw,
    Users,
} from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";
import StreakHistoryModal from "@/Components/StreakHistoryModal";
import StreakLostOverlay from "@/Components/StreakLostOverlay";
import axios from "axios";

// ── Streak Banner ─────────────────────────────────────────────────────────────

function StreakBanner({ streak, onClick }) {
    const { t } = useTranslation();
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

    const config = active_today
        ? {
              bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
              flame: "text-orange-500",
              label: null,
              message: t("streak.message_active_today", {
                  defaultValue: "Great job! Come back tomorrow to keep it going.",
              }),
          }
        : is_frozen
          ? {
                bg: "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-800",
                flame: "text-blue-400",
                label: {
                    text: t("streak.frozen"),
                    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                },
                message: t("streak.message_frozen", {
                    defaultValue:
                        "You missed yesterday, but your streak is saved! Complete a quiz or exercise to continue.",
                }),
            }
          : at_risk
            ? {
                  bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800",
                  flame: "text-yellow-400",
                  label: {
                      text: t("streak.at_risk"),
                      cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
                  },
                  message: t("streak.message_at_risk", {
                      defaultValue:
                          "No activity yet today — do a quiz or exercise before midnight!",
                  }),
              }
            : is_broken
              ? {
                    bg: "bg-gray-100 border-gray-300 dark:bg-slate-800 dark:border-slate-700",
                    flame: "text-gray-300",
                    label: {
                        text: t("streak.lost"),
                        cls: "bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
                    },
                    message: t("streak.message_lost", {
                        defaultValue:
                            "You missed too many days. Start a new streak today!",
                    }),
                }
              : {
                    bg: "bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-700",
                    flame: "text-gray-300",
                    label: null,
                    message: t("streak.message_start", {
                        defaultValue:
                            "Complete a quiz or exercise to start your streak.",
                    }),
                };

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border p-4 mb-3 ${config.bg} cursor-pointer active:scale-[0.98] transition-transform shadow-sm hover:shadow-md`}
        >
            <div className="flex items-center justify-between mb-2">
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
                                {t(current_streak !== 1 ? "streak.days" : "streak.day")}
                            </span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {t("streak.current")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            {longest_streak}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {t("streak.best")}
                        </p>
                    </div>

                    {freeze_count > 0 && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {freeze_count}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {t(freeze_count === 1 ? "streak.safe_day" : "streak.safe_days")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {config.label && (
                <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${config.label.cls}`}
                >
                    {config.label.text}
                </span>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.message}
            </p>

            {is_frozen && (
                <div className="mt-3 flex gap-2">
                    <Link
                        href={route("quiz.index")}
                        className="flex-1 text-center text-xs font-semibold bg-blue-500 text-white rounded-xl py-2 hover:bg-blue-600 transition-colors"
                    >
                        {t("streak.take_quiz")}
                    </Link>
                    <Link
                        href={route("wordlistcategory.index")}
                        className="flex-1 text-center text-xs font-semibold bg-white border border-blue-300 text-blue-600 rounded-xl py-2 hover:bg-blue-50 transition-colors dark:bg-slate-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-slate-700"
                    >
                        {t("streak.do_exercise")}
                    </Link>
                </div>
            )}

            {!active_today && !is_broken && auto_save_available && (
                <p className="text-xs text-blue-400 dark:text-blue-300 mt-1.5">
                    {t("streak.auto_save_message", {
                        defaultValue: "🛡️ Auto-save available — if you miss a day this week your streak will be saved.",
                    })}
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
    reviseCounts = {},
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [showStreakLost, setShowStreakLost] = useState(
        streak?.is_broken && !streak?.broken_streak_notified
    );

    const handleDismissStreakLost = async () => {
        setShowStreakLost(false);
        try {
            await axios.post(route("streak.dismiss-broken"));
        } catch (err) {
            console.error("Failed to dismiss streak lost notification:", err);
        }
    };

    useEffect(() => {
        // Check for unseen achievements when landing on the dashboard
        window.dispatchEvent(new CustomEvent("check-achievements"));
    }, []);

    return (
        <AppLayout>
            <Head title={t("dashboard.title")} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {user
                            ? t("dashboard.greeting", {
                                  name: user.name.split(" ")[0],
                              })
                            : t("dashboard.subtitle")}
                    </p>

                    <StreakBanner
                        streak={streak}
                        onClick={() => setShowStreakModal(true)}
                    />

                    <StreakHistoryModal
                        show={showStreakModal}
                        onClose={() => setShowStreakModal(false)}
                        streak={streak}
                    />

                    <StreakLostOverlay
                        isOpen={showStreakLost}
                        onClose={handleDismissStreakLost}
                        prevStreak={streak?.current_streak ?? 0}
                    />

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <Link
                            href={route("my.words.index") + "?new=1"}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                                    <Plus className="h-8 w-8 text-blue-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.add_new_word")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {t("dashboard.expand_vocabulary")}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("wordlistcategory.index")}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                                    <List className="h-8 w-8 text-purple-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.word_lists")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {t("dashboard.browse_all")}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href={route("words.mastered")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                                    <Trophy className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.mastered_words")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {masteredCount > 0 ? (
                                            <span className="font-extrabold text-green-600 text-base">
                                                {t("dashboard.words_count", {
                                                    count: masteredCount,
                                                })}
                                            </span>
                                        ) : (
                                            t("dashboard.words_you_know")
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href={route("quiz.index")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-[#E5201C]/10 dark:bg-red-950/30 flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-[#E5201C]" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.test_your_learning")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {t("dashboard.practice_now")}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href={route("leaderboard")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                                    <Users className="h-8 w-8 text-orange-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.leaderboard")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {t("dashboard.see_top_learners")}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href={route("achievements")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-950/30 flex items-center justify-center">
                                    <ShieldCheck className="h-8 w-8 text-cyan-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.achievements")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {t("dashboard.view_earned_badges")}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* ── Revise ── */}
                        <Link href={route("words.revise")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                                    <RotateCcw className="h-8 w-8 text-indigo-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {t("dashboard.revise")}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {reviseCounts.all > 0 ? (
                                            <span className="font-bold text-indigo-500 text-base">
                                                {t("dashboard.words_count", {
                                                    count: reviseCounts.all,
                                                })}
                                            </span>
                                        ) : (
                                            t("dashboard.practice_review")
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* ── Bookmarked Words ── */}
                    <Link
                        href={route("words.bookmarked")}
                        className="block mb-3"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center shrink-0">
                                <Bookmark
                                    className="h-6 w-6 fill-yellow-400 text-yellow-400"
                                    strokeWidth={1.8}
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                    {t("dashboard.bookmarked_words")}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {t("dashboard.saved_for_later")}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* ── Bottom bar: Settings ── */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <Link href={route("settings.show")} className="block">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow h-full">
                                <Settings className="h-6 w-6 text-gray-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                    {t("dashboard.settings")}
                                </span>
                            </div>
                        </Link>
                    </div>

                    <Link href={route("my.words.index")}>
                        <div className="bg-[#E5201C] dark:bg-red-700 rounded-2xl py-5 px-6 text-center shadow-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors cursor-pointer">
                            <p className="text-white font-bold text-sm">
                                {t("dashboard.my_word_collection")}
                            </p>
                            <p className="text-white/80 text-xs mt-1">
                                {t("dashboard.manage_personal_words")}
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
