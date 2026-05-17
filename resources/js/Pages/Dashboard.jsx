import React, { useEffect, useState, useRef } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    Plus,
    BookOpen,
    List,
    Settings,
    Trophy,
    Flame,
    ShieldCheck,
    Bookmark,
    RotateCcw,
    Users,
    ChevronRight,
    Zap,
    LayoutGrid,
} from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";
import StreakHistoryModal from "@/Components/StreakHistoryModal";
import StreakLostOverlay from "@/Components/StreakLostOverlay";
import FlameVisual from "@/Components/FlameVisual";
import axios from "axios";
import logo from "/public/img/logo.png";

// ── Components ───────────────────────────────────────────────────────────────

const FeatureCard = ({
    icon: Icon,
    title,
    subtitle,
    href,
    iconBg,
    iconColor,
}) => (
    <Link href={href} className="block group">
        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 h-full flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-[0.98] border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
            <div
                className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 mb-3 transition-transform group-hover:scale-110`}
            >
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xs leading-tight mb-1 line-clamp-1">
                    {title}
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight line-clamp-2">
                    {subtitle}
                </p>
            </div>
        </div>
    </Link>
);

function StreakBanner({ streak, onClick }) {
    const { t } = useTranslation();
    if (!streak) return null;

    const { current_streak, longest_streak, is_broken } = streak;

    return (
        <div
            onClick={onClick}
            className="relative overflow-hidden rounded-[32px] p-6 mb-8 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/10 border border-red-100/50 dark:border-red-900/30 cursor-pointer active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(229,32,28,0.05)]"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-red-200 dark:border-red-800 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm">
                            <FlameVisual isBroken={is_broken} size={42} />
                        </div>
                        {is_broken && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">
                                    !
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-gray-900 dark:text-gray-100">
                                {current_streak}
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                {t(
                                    current_streak !== 1
                                        ? "streak.days"
                                        : "streak.day",
                                )}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                            {t("streak.current")}
                        </p>
                    </div>
                </div>

                <div className="text-right border-l border-red-200/50 dark:border-red-800/50 pl-6">
                    <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        {longest_streak}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {t("streak.best")}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
                {is_broken ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 uppercase tracking-wider">
                        <Flame className="h-3 w-3" />
                        {t("streak.lost")}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 uppercase tracking-wider">
                        <Zap className="h-3 w-3" />
                        Active
                    </span>
                )}
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 italic">
                    {is_broken
                        ? "You missed too many days. Start a new streak today!"
                        : "Great job! Keep the momentum going."}
                </p>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-red-200/20 dark:bg-red-800/10 rounded-full blur-3xl pointer-events-none" />
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
    const { auth, assetUrl } = usePage().props;
    const user = auth?.user;
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [xpBalance, setXpBalance] = useState(350);
    const [showStreakLost, setShowStreakLost] = useState(
        (streak?.is_broken || (streak?.pre_broken_streak > 0)) && !streak?.broken_streak_notified,
    );
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchXp = async () => {
            if (!user) return;
            try {
                const response = await axios.get(route("api.xp-shop.status"));
                setXpBalance(response.data.xp.balance);
            } catch (err) {
                console.error("Failed to fetch XP status:", err);
            }
        };
        fetchXp();
        window.dispatchEvent(new CustomEvent("check-achievements"));
    }, [user]);

    const handleDismissStreakLost = async () => {
        setShowStreakLost(false);
        try {
            await axios.post(route("streak.dismiss-broken"));
        } catch (err) {
            console.error("Failed to dismiss streak lost notification:", err);
        }
    };

    const handleRepairStreak = async () => {
        try {
            const response = await axios.post(route("api.xp-shop.buy-streak-repair"));
            if (response.data.success) {
                setXpBalance(response.data.xp.balance);
                setShowStreakLost(false);
                router.reload({ only: ["streak"] });
            }
        } catch (err) {
            console.error("Failed to repair streak:", err);
        }
    };

    const features = [
        {
            title: t("dashboard.add_new_word"),
            subtitle: "Expand vocabulary",
            icon: Plus,
            href: route("my.words.index") + "?new=1",
            iconBg: "bg-blue-50 dark:bg-blue-950/30",
            iconColor: "text-blue-500",
        },
        {
            title: t("dashboard.word_lists"),
            subtitle: "Browse All",
            icon: List,
            href: route("wordlistcategory.index"),
            iconBg: "bg-purple-50 dark:bg-purple-950/30",
            iconColor: "text-purple-500",
        },
        {
            title: t("dashboard.mastered_words"),
            subtitle:
                masteredCount > 0
                    ? t("dashboard.words_count", { count: masteredCount })
                    : "Words you know",
            icon: Trophy,
            href: route("words.mastered"),
            iconBg: "bg-green-50 dark:bg-green-950/30",
            iconColor: "text-green-500",
        },
        {
            title: t("dashboard.test_your_learning"),
            subtitle: "Practice now",
            icon: BookOpen,
            href: route("quiz.index"),
            iconBg: "bg-red-50 dark:bg-red-950/30",
            iconColor: "text-red-500",
        },
        {
            title: t("dashboard.leaderboard"),
            subtitle: "See top learners",
            icon: Users,
            href: route("leaderboard"),
            iconBg: "bg-orange-50 dark:bg-orange-950/30",
            iconColor: "text-orange-500",
        },
        {
            title: t("dashboard.achievements"),
            subtitle: "View earned badges",
            icon: ShieldCheck,
            href: route("achievements"),
            iconBg: "bg-cyan-50 dark:bg-cyan-950/30",
            iconColor: "text-cyan-500",
        },
        {
            title: t("dashboard.revise"),
            subtitle:
                reviseCounts.all > 0
                    ? t("dashboard.words_count", { count: reviseCounts.all })
                    : "Practise & review",
            icon: RotateCcw,
            href: route("words.revise"),
            iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
            iconColor: "text-indigo-500",
        },
        {
            title: t("dashboard.bookmarked_words"),
            subtitle: "Saved for later review",
            icon: Bookmark,
            href: route("words.bookmarked"),
            iconBg: "bg-yellow-50 dark:bg-yellow-950/30",
            iconColor: "text-yellow-500",
        },
    ];

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("dashboard.title")} />
            <div className="min-h-screen pb-28 sm:pb-12 bg-transparent">
                <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-8 sm:pt-12">
                    {/* ── Greeting ── */}
                    <div className="flex items-center justify-between mb-10 mt-2 px-2 relative min-h-[120px]">
                        <div className="relative z-10 max-w-[70%]">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                                Hello<br></br>{" "}
                                {user?.name?.split(" ")[0] || "Learner"}
                                👋
                            </h1>
                            <p className="text-gray-400 dark:text-gray-500 font-bold mt-1 text-base">
                                Ready to practice?
                            </p>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-30px] w-44 h-44 opacity-100 pointer-events-none z-0">
                            {/* Pulsating Glow */}
                            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#e70013] rounded-full animate-glow -z-10" />
                            
                            <img
                                src={`${assetUrl}/img/learning_illustration.png`}
                                alt="Learning illustration"
                                className="w-full h-full object-contain transform drop-shadow-[0_20px_40px_rgba(229,32,28,0.15)] dark:hidden"
                            />
                            <img
                                src={`${assetUrl}/img/learning_illustration_dark.png`}
                                alt="Learning illustration"
                                className="w-full h-full object-contain transform drop-shadow-[0_20px_40px_rgba(229,32,28,0.15)] hidden dark:block"
                            />
                        </div>
                    </div>

                    {/* ── Streak ── */}
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
                        prevStreak={streak?.is_broken ? streak?.current_streak : streak?.pre_broken_streak}
                        xpBalance={xpBalance}
                        onRepair={handleRepairStreak}
                    />

                    {/* ── Feature Grid ── */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} {...feature} />
                        ))}
                    </div>

                    {/* ── Settings Card (Full width) ── */}
                    {/* <Link href={route("settings.show")} className="block mb-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-5 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-white dark:border-slate-800 transition-all active:scale-[0.98] hover:border-gray-200 dark:hover:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                                    <Settings className="h-7 w-7 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-base">
                                        {t("dashboard.settings")}
                                    </h3>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-0.5">
                                        Manage preferences
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-300" />
                        </div>
                    </Link> */}

                    {/* ── Main CTA ── */}
                    <Link href={route("my.words.index")}>
                        <div className="bg-gradient-to-r from-[#E5201C] to-[#ff4d4d] dark:from-red-700 dark:to-red-600 rounded-[36px] p-7 text-left shadow-[0_20px_40px_rgba(229,32,28,0.3)] hover:shadow-2xl transition-all active:scale-[0.98] group flex items-center justify-between overflow-hidden relative border-t border-white/20">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-[20px] bg-white shadow-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                                    <LayoutGrid className="h-8 w-8 text-[#E5201C]" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-lg leading-tight tracking-tight">
                                        {t("dashboard.my_word_collection")}
                                    </p>
                                    <p className="text-white/90 text-[10px] font-black mt-1 uppercase tracking-widest">
                                        View & manage all your words
                                    </p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center relative z-10 transition-transform group-hover:translate-x-2">
                                <ChevronRight className="h-7 w-7 text-white" />
                            </div>

                            {/* Decorative background patterns */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 border-[12px] border-white rounded-full" />
                                <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-white rounded-full blur-2xl" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
