import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import Lottie from "lottie-react";
import { Bookmark, ChevronLeft, Zap } from "lucide-react";
import { CONFETTI } from "./constants";
import { useEffect } from "react";

export function StreakPop({ fireAnim, streakCount, onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 2400);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40">
            <div className="relative flex flex-col items-center">
                {fireAnim && (
                    <Lottie
                        animationData={fireAnim}
                        loop={false}
                        style={{ width: 340, height: 340 }}
                    />
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div
                        className="text-2xl font-black text-white tracking-[-6px] drop-shadow-[0_0_50px_#FF9500] animate-[streakPop_0.75s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                        style={{ textShadow: "0 20px 50px rgba(255, 0, 0, 0.95)" }}
                    >
                        +{streakCount}
                    </div>
                </div>
                <div className="absolute bottom-16 text-orange-600 font-bold text-2xl tracking-[4px] animate-pulse">
                    STREAK
                </div>
            </div>
        </div>
    );
}

export default function SessionCompleteScreen({
    wordList,
    subcategory,
    backHref,
    promotedCount,
    dontKnowCount,
    totalWordsInList,
    sessionXpAwarded,
    xp_enabled,
    streak,
    streakChange,
    showStreakEffect,
    setShowStreakEffect,
    approvedAnim,
    fireAnim,
    auth,
}) {
    const retries = dontKnowCount;

    return (
        <AppLayout>
            <Head title="Session Complete" />

            {/* StreakPop overlay — only on streak increase */}
            {showStreakEffect && streakChange === "up" && (
                <StreakPop
                    fireAnim={fireAnim}
                    streakCount={streak?.current_streak ?? 1}
                    onComplete={() => setShowStreakEffect(false)}
                />
            )}

            {/* Confetti */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {CONFETTI.map((p) => (
                    <div
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: p.left,
                            top: "-12px",
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            borderRadius: p.borderRadius,
                            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
                        }}
                    />
                ))}
            </div>

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                    {/* Lottie celebration */}
                    <div className="flex justify-center -mt-2 -mb-2">
                        {approvedAnim && (
                            <Lottie
                                animationData={approvedAnim}
                                loop={false}
                                style={{ height: 160, width: 160 }}
                            />
                        )}
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                        Session Complete!
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                        {subcategory ? subcategory.name : wordList.title}
                    </p>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div
                            className="bg-green-50 dark:bg-green-950/30 rounded-2xl py-4 animate-bounce-in"
                            style={{ animationDelay: "0.1s" }}
                        >
                            <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                                {promotedCount}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">
                                Cleared ✅
                            </p>
                        </div>
                        <div
                            className="bg-red-50 dark:bg-red-950/30 rounded-2xl py-4 animate-bounce-in"
                            style={{ animationDelay: "0.2s" }}
                        >
                            <p className="text-2xl font-extrabold text-red-400 dark:text-red-400">
                                {retries}
                            </p>
                            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 font-medium">
                                Retries
                            </p>
                        </div>
                        <div
                            className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl py-4 animate-bounce-in"
                            style={{ animationDelay: "0.3s" }}
                        >
                            <p className="text-2xl font-extrabold text-blue-500 dark:text-blue-400">
                                {promotedCount + retries}
                            </p>
                            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">
                                Total Reps 💪
                            </p>
                        </div>
                    </div>

                    {/* XP earned */}
                    {sessionXpAwarded > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl py-6 px-4 mb-8 text-center border-2 border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Zap className="h-6 w-6 text-yellow-500" />
                                <p className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">
                                    +{sessionXpAwarded}
                                </p>
                                <Zap className="h-6 w-6 text-yellow-500" />
                            </div>
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                Experience Points Earned
                            </p>
                        </div>
                    )}

                    {/* No-XP notice */}
                    {!xp_enabled && (
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl py-4 px-4 mb-8 text-center border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-center gap-2">
                                <Zap className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    XP is not awarded for custom word lists
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Streak (only shown when it increased) */}
                    {streak && streakChange === "up" && (
                        <div className="rounded-2xl py-4 px-4 mb-6 border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 animate-bounce-in">
                            <p className="text-lg font-bold mb-1 text-orange-600 dark:text-orange-400">
                                🔥 Current Streak: {streak.current_streak}{" "}
                                day{streak.current_streak !== 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                ✨ Amazing! You're on fire! Keep this momentum going! 🎉
                            </p>
                        </div>
                    )}

                    {/* List-level progress bar */}
                    {totalWordsInList > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                                <span>List Progress</span>
                                <span>
                                    {Math.round(
                                        (promotedCount / totalWordsInList) * 100,
                                    )}%
                                </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{
                                        width: `${Math.min(
                                            (promotedCount / totalWordsInList) * 100,
                                            100,
                                        )}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                                {promotedCount} of {totalWordsInList} words in this session's queue
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href={route("wordlist.start", wordList.id)}
                            className="w-full py-3.5 bg-[#E5201C] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition"
                        >
                            New Session
                        </Link>
                        {auth?.user && (
                            <Link
                                href={route("words.bookmarked")}
                                className="w-full py-3.5 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md transition"
                            >
                                <Bookmark
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                    strokeWidth={1.8}
                                />
                                View Bookmarks
                            </Link>
                        )}
                        <Link
                            href={backHref}
                            className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900 transition"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to List
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
