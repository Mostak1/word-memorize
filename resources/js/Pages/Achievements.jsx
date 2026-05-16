import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Trophy,
    Target,
    Flame,
    Coins,
    Sunrise,
    Award,
    BookOpen,
    Clock,
    Moon,
    GraduationCap,
    Calendar,
    Gift,
    Copy,
    Check,
} from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";
import { BadgeSVG } from "@/Components/AchievementBadges";

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

const STREAK_REWARDS = {
    streak_bronze: 10,
    streak_gold: 15,
};

function AchievementCard({
    achievement,
    earned,
    progress,
    earnedAt,
    rewardCoupon,
    index,
}) {
    const { t } = useTranslation();
    const isEarned = earned;
    const [copied, setCopied] = useState(false);
    const progressPercent = Math.min(100, progress.percentage);
    const rewardPercent = STREAK_REWARDS[achievement.key] ?? null;
    const hasReward = rewardPercent !== null;
    const rewardAvailable = rewardCoupon?.status === "available";
    const gridColumn = index % 3;
    const tooltipPosition =
        gridColumn === 0
            ? "left-0 translate-x-0"
            : gridColumn === 2
              ? "right-0 translate-x-0"
              : "left-1/2 -translate-x-1/2";
    const achievementName = t(`achievements.items.${achievement.key}.name`, {
        defaultValue: achievement.name,
    });
    const achievementDescription = t(
        `achievements.items.${achievement.key}.description`,
        {
            defaultValue: achievement.description,
        },
    );
    const rewardText = hasReward
        ? t("achievements.course_reward", {
              percent: rewardPercent,
              defaultValue: `${rewardPercent}% course discount reward`,
          })
        : null;

    const copyCoupon = async () => {
        if (!rewardCoupon?.code) return;

        await navigator.clipboard.writeText(rewardCoupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "streak":
                return <Flame className="w-5 h-5" />;
            case "xp":
                return <Coins className="w-5 h-5" />;
            case "morning":
                return <Sunrise className="w-5 h-5" />;
            case "perfect":
                return <Target className="w-5 h-5" />;
            case "words":
                return <BookOpen className="w-5 h-5" />;
            case "sessions":
                return <Clock className="w-5 h-5" />;
            case "night":
                return <Moon className="w-5 h-5" />;
            case "mastery":
                return <GraduationCap className="w-5 h-5" />;
            case "dedication":
                return <Calendar className="w-5 h-5" />;
            default:
                return <Award className="w-5 h-5" />;
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
            tabIndex={0}
            title={`${achievementName} - ${achievementDescription}`}
            aria-label={`${achievementName}. ${achievementDescription}`}
            className={`group relative z-0 min-h-[154px] rounded-lg border p-3 text-center shadow-sm transition-all duration-200 hover:z-50 hover:-translate-y-1 hover:shadow-lg focus:z-50 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isEarned
                    ? "border-green-200 bg-gradient-to-b from-green-50 to-white dark:border-green-800 dark:from-green-900/30 dark:to-slate-800"
                    : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800"
            }`}
        >
            <div className="flex h-full flex-col items-center">
                {/* ── Badge SVG ── */}
                <div className="relative mb-2">
                    <BadgeSVG badge={achievement} earned={isEarned} size={58} />
                    <span
                        className={`absolute -right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${isEarned ? "text-green-600" : "text-slate-500 dark:text-slate-300"}`}
                    >
                        {getCategoryIcon(achievement.category)}
                    </span>
                </div>

                {/* ── Text content ── */}
                <div className="min-w-0 w-full">
                    <div className="mb-2 min-h-[44px]">
                        <h3
                            className={`line-clamp-2 text-sm font-semibold leading-snug ${isEarned ? "text-green-800 dark:text-green-200" : "text-gray-900 dark:text-white"}`}
                        >
                            {achievementName}
                        </h3>
                        {achievement.tier > 1 && (
                            <span
                                className={`text-[11px] font-semibold ${getTierColor(achievement.tier)}`}
                            >
                                {t("achievements.tier", {
                                    tier: achievement.tier,
                                })}
                            </span>
                        )}
                        {hasReward && (
                            <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                                <Gift className="h-3 w-3 shrink-0" />
                                <span className="line-clamp-1">
                                    {rewardText}
                                </span>
                            </p>
                        )}
                    </div>

                    {!isEarned && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                <span>{t("achievements.progress")}</span>
                                <span>
                                    {progress.current} / {progress.target}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {isEarned && earnedAt && (
                        <p className="text-[11px] text-green-600 dark:text-green-400">
                            {t("achievements.earned_at", {
                                date: new Date(earnedAt).toLocaleDateString(),
                            })}
                        </p>
                    )}

                    {isEarned && rewardCoupon && (
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-left dark:border-amber-800 dark:bg-amber-950/30">
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                                    {rewardAvailable
                                        ? t("achievements.reward_available", {
                                              defaultValue: "Available",
                                          })
                                        : t("achievements.reward_used", {
                                              defaultValue: "Used",
                                          })}
                                </span>
                                {rewardAvailable && (
                                    <button
                                        type="button"
                                        onClick={copyCoupon}
                                        className="inline-flex h-5 w-5 items-center justify-center rounded text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
                                        title={t(
                                            "achievements.copy_coupon",
                                            {
                                                defaultValue:
                                                    "Copy coupon code",
                                            },
                                        )}
                                    >
                                        {copied ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="truncate font-mono text-[11px] font-black text-amber-900 dark:text-amber-100">
                                {rewardCoupon.code}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`pointer-events-none absolute top-full z-[60] mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 text-left opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-focus:opacity-100 dark:border-slate-700 dark:bg-slate-900 ${tooltipPosition}`}
            >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {achievementName}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    {achievementDescription}
                </p>
                {!isEarned && (
                    <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {progress.current} / {progress.target}
                    </p>
                )}
                {hasReward && (
                    <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        {rewardText}
                    </p>
                )}
                {isEarned && rewardCoupon && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        {t("achievements.coupon_code", {
                            code: rewardCoupon.code,
                            defaultValue: `Coupon: ${rewardCoupon.code}`,
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Achievements() {
    const { t } = useTranslation();
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
            setError(t("achievements.failed_load"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const earnedCount = achievements.filter((a) => a.earned).length;
    const totalCount = achievements.length;

    if (loading) {
        return (
            <AppLayout hideHeader={true}>
                <Head title={t("achievements.title")} />
                <div className="py-1">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-slate-800 overflow-visible shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                        {[...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-36 bg-gray-200 dark:bg-slate-700 rounded-lg"
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
            <AppLayout hideHeader={true}>
                <Head title={t("achievements.title")} />
                <div className="py-1">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-slate-800 overflow-visible shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <p className="text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                                <button
                                    onClick={loadAchievements}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                >
                                    {t("achievements.try_again")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("achievements.title")} />

            <div className="py-1">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-visible shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {t("achievements.title")}
                                    </h1>
                                    <p className="text-gray-600 dark:text-slate-400">
                                        {t("achievements.badges_earned", {
                                            earned: earnedCount,
                                            total: totalCount,
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                {achievements.map((item, index) => (
                                    <AchievementCard
                                        key={item.achievement.key}
                                        achievement={item.achievement}
                                        earned={item.earned}
                                        progress={item.progress}
                                        earnedAt={item.earned_at}
                                        rewardCoupon={item.reward_coupon}
                                        index={index}
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
