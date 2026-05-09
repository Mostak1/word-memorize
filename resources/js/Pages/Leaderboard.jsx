import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Trophy, Medal, Award, Users, Flame, BookOpen } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function Leaderboard({ users, currentUserRank, sortBy }) {
    const { t } = useTranslation();
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

    const getSortIcon = (type) => {
        switch (type) {
            case "xp":
                return <Trophy className="h-5 w-5" />;
            case "mastered":
                return <BookOpen className="h-5 w-5" />;
            case "streak":
                return <Flame className="h-5 w-5" />;
            default:
                return null;
        }
    };

    const sortOptions = [
        { key: "xp", label: t("leaderboard.xp") },
        { key: "mastered", label: t("leaderboard.mastered_words") },
        { key: "streak", label: t("leaderboard.current_streak") },
    ];

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("leaderboard.title")} />
            <div className="min-h-screen pb-28 sm:pb-12 bg-transparent">
                <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-8 sm:pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-1">
                                {t("leaderboard.title")}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {t("leaderboard.subtitle")}
                            </p>
                        </div>
                        {currentUserRank && (
                            <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center border border-red-100 dark:border-red-900/30">
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                                    {t("leaderboard.your_rank", "Your Rank")}
                                </span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                                    #{currentUserRank}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Sort Filters */}
                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {sortOptions.map(({ key, label }) => {
                            const isActive = currentSort === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSortChange(key)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 shadow-[0_4px_15px_rgba(0,0,0,0.03)] active:scale-95 ${
                                        isActive
                                            ? "bg-[#3B82F6] text-white shadow-[#3B82F6]/20"
                                            : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <div
                                        className={`${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`}
                                    >
                                        {getSortIcon(key)}
                                    </div>
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Leaderboard List */}
                    <div className="space-y-4 relative">
                        {users.map((user, index) => {
                            const rank = index + 1;
                            const isCurrentUser =
                                auth.user && user.id === auth.user.id;

                            // Determine rank icon/text styles
                            let rankDisplay;
                            if (rank === 1)
                                rankDisplay = (
                                    <Trophy className="h-6 w-6 text-yellow-500" />
                                );
                            else if (rank === 2)
                                rankDisplay = (
                                    <Medal className="h-6 w-6 text-gray-400" />
                                );
                            else if (rank === 3)
                                rankDisplay = (
                                    <Award className="h-6 w-6 text-amber-600" />
                                );
                            else
                                rankDisplay = (
                                    <span className="text-base font-bold text-gray-400 dark:text-gray-500 italic">
                                        #{rank}
                                    </span>
                                );

                            return (
                                <div
                                    key={user.id}
                                    className={`relative rounded-[24px] p-5 flex items-center transition-all ${
                                        isCurrentUser
                                            ? "bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-slate-900 shadow-[0_8px_30px_rgba(229,32,28,0.1)] border border-red-100 dark:border-red-900/30 scale-[1.02] z-10"
                                            : "bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white dark:border-slate-800"
                                    }`}
                                >
                                    {isCurrentUser && (
                                        <div className="absolute -top-3 -right-2 text-red-300 opacity-60">
                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                stroke="none"
                                            >
                                                <path d="M12 2C12.5 6.5 15.5 9.5 20 10C15.5 10.5 12.5 13.5 12 18C11.5 13.5 8.5 10.5 4 10C8.5 9.5 11.5 6.5 12 2Z" />
                                                <path
                                                    d="M20 16C20.2 18 21.5 19.3 23.5 19.5C21.5 19.7 20.2 21 20 23C19.8 21 18.5 19.7 16.5 19.5C18.5 19.3 19.8 18 20 16Z"
                                                    opacity="0.6"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-5 w-full">
                                        <div className="flex items-center justify-center w-8">
                                            {rankDisplay}
                                        </div>

                                        <div className="flex-1 flex items-center gap-3">
                                            <Link
                                                href={route(
                                                    "public.user.show",
                                                    user.id,
                                                )}
                                                className={`font-black text-[15px] tracking-tight ${
                                                    isCurrentUser
                                                        ? "text-gray-900 dark:text-white"
                                                        : "text-gray-800 dark:text-gray-200"
                                                } hover:text-blue-600 dark:hover:text-blue-400`}
                                            >
                                                {user.name}
                                            </Link>
                                            {isCurrentUser && (
                                                <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                                                    You
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-right flex flex-col items-end justify-center">
                                            {currentSort === "xp" && (
                                                <>
                                                    <span className="font-black text-base text-gray-800 dark:text-gray-100 leading-none">
                                                        {user.xp.toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                                                        XP
                                                    </span>
                                                </>
                                            )}
                                            {currentSort === "mastered" && (
                                                <>
                                                    <span className="font-black text-xl text-gray-900 dark:text-gray-100 leading-none">
                                                        {user.mastered_count}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                                                        Mastered
                                                    </span>
                                                </>
                                            )}
                                            {currentSort === "streak" && (
                                                <>
                                                    <span className="font-black text-xl text-gray-900 dark:text-gray-100 leading-none">
                                                        {user.current_streak}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                                                        Days
                                                    </span>
                                                </>
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
                                {t("leaderboard.no_users")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
