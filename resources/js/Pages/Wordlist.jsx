import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    BookOpen,
    ChevronRight,
    ChevronLeft,
    Lock,
    Play,
    Trophy,
} from "lucide-react";

function Pagination({ links, meta }) {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page, from, to, total } = meta;

    const goTo = (url) => {
        if (url)
            router.get(url, {}, { preserveScroll: true, preserveState: true });
    };

    const getPages = () => {
        const pages = [];
        const delta = 1;

        for (let i = 1; i <= last_page; i++) {
            if (
                i === 1 ||
                i === last_page ||
                (i >= current_page - delta && i <= current_page + delta)
            ) {
                pages.push(i);
            } else if (
                i === current_page - delta - 1 ||
                i === current_page + delta + 1
            ) {
                pages.push("...");
            }
        }
        return pages;
    };

    const prevLink = links.find((l) => l.label.includes("Previous"))?.url;
    const nextLink = links.find((l) => l.label.includes("Next"))?.url;

    return (
        <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {from}–{to} of {total} lists
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(prevLink)}
                    disabled={!prevLink}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {getPages().map((page, i) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="w-9 h-9 flex items-center justify-center text-sm text-gray-400"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => {
                                const link = links.find(
                                    (l) => l.label === String(page),
                                );
                                goTo(link?.url);
                            }}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                                page === current_page
                                    ? "bg-[#E5201C] text-white border-[#E5201C] shadow-md shadow-red-100 dark:shadow-red-900/30"
                                    : "bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    onClick={() => goTo(nextLink)}
                    disabled={!nextLink}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function MasteredProgress({ mastered, total }) {
    if (!total) return null;

    const remaining = total - mastered;
    const pct = Math.round((mastered / total) * 100);
    const allDone = mastered >= total;

    return (
        <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Bar */}
            <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all ${allDone ? "bg-green-500" : "bg-[#E5201C]"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                />
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                    <Trophy className="h-3 w-3" />
                    {mastered} mastered
                </span>
                {allDone ? (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        ✓ Complete!
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {remaining} remaining
                    </span>
                )}
            </div>
        </div>
    );
}

export default function Wordlist({
    wordLists,
    currentDifficulty,
    currentCategory,
    masteredCounts, // { [wordListId]: count } — only present when auth'd
}) {
    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        const star =
            d === "easy" || d === "beginner"
                ? "⭐"
                : d === "medium" || d === "intermediate"
                  ? "⭐⭐"
                  : d === "hard" || d === "advanced"
                    ? "⭐⭐⭐"
                    : "⭐";
        const color =
            d === "easy" || d === "beginner"
                ? "bg-green-50 text-green-700 border-green-200"
                : d === "medium" || d === "intermediate"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200";
        return { star, color };
    };

    const items = Array.isArray(wordLists)
        ? wordLists
        : (wordLists?.data ?? []);
    const paginationLinks = wordLists?.links ?? [];
    const paginationMeta = wordLists?.meta ?? null;

    return (
        <AppLayout>
            <Head title="Exercises" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    {(currentCategory || currentDifficulty) && (
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Showing:
                            </span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm">
                                {currentCategory || currentDifficulty}
                            </span>
                        </div>
                    )}

                    {items.length > 0 ? (
                        <>
                            <div className="space-y-3">
                                {items.map((wordList, index) => {
                                    const { star, color } = getDifficultyBadge(
                                        wordList.difficulty,
                                    );
                                    const mastered =
                                        masteredCounts?.[wordList.id] ?? null;
                                    const total = wordList.words_count ?? 0;

                                    return (
                                        <div key={wordList.id}>
                                            {wordList.is_locked ? (
                                                /* ── LOCKED card — not clickable ── */
                                                <div
                                                    className="bg-white rounded-2xl px-5 py-4 shadow-sm opacity-75 cursor-not-allowed select-none"
                                                    style={{
                                                        animationDelay: `${index * 0.07}s`,
                                                        animation:
                                                            "fadeInUp 0.4s ease-out forwards",
                                                        opacity: 0,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <h2 className="text-base font-bold text-gray-500 leading-snug flex-1">
                                                            {wordList.title}
                                                        </h2>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                                                <Lock className="h-3.5 w-3.5 text-gray-500" />
                                                                <span className="text-xs font-bold text-gray-500">
                                                                    Locked
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span
                                                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color} opacity-60`}
                                                        >
                                                            {star}{" "}
                                                            {
                                                                wordList.difficulty
                                                            }
                                                        </span>
                                                        {total > 0 && (
                                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-400">
                                                                {total} words
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end mt-3">
                                                        <span className="text-gray-400 text-sm font-semibold flex items-center gap-1.5">
                                                            <Lock className="h-3.5 w-3.5" />
                                                            Content Locked
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ── UNLOCKED card — clickable ── */
                                                <Link
                                                    href={route(
                                                        "wordlist.start",
                                                        wordList.id,
                                                    )}
                                                    className="block"
                                                >
                                                    <div
                                                        className="bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
                                                        style={{
                                                            animationDelay: `${index * 0.07}s`,
                                                            animation:
                                                                "fadeInUp 0.4s ease-out forwards",
                                                            opacity: 0,
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <h2 className="text-base font-bold text-gray-900 leading-snug flex-1">
                                                                {wordList.title}
                                                            </h2>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {wordList.price >
                                                                0 ? (
                                                                    <div className="flex items-center gap-1 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                                                        <Lock className="h-3.5 w-3.5 text-amber-600" />
                                                                        <span className="text-xs font-bold text-amber-700">
                                                                            $
                                                                            {
                                                                                wordList.price
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                                        FREE
                                                                    </span>
                                                                )}
                                                                <ChevronRight className="h-4 w-4 text-gray-300" />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span
                                                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color}`}
                                                            >
                                                                {star}{" "}
                                                                {
                                                                    wordList.difficulty
                                                                }
                                                            </span>
                                                            {total > 0 && (
                                                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                                                    {total}{" "}
                                                                    words
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Mastered progress — only when logged in and data available */}
                                                        {mastered !== null && (
                                                            <MasteredProgress
                                                                mastered={
                                                                    mastered
                                                                }
                                                                total={total}
                                                            />
                                                        )}

                                                        {/* Start button — hide label if complete */}
                                                        <div className="flex justify-end mt-3">
                                                            <span className="text-[#E5201C] text-sm font-semibold flex items-center gap-1">
                                                                {mastered !==
                                                                    null &&
                                                                mastered >=
                                                                    total &&
                                                                total > 0
                                                                    ? "Completed"
                                                                    : "Start Exercise"}
                                                                <Play className="h-3.5 w-3.5 fill-[#E5201C]" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                links={paginationLinks}
                                meta={paginationMeta}
                            />
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-gray-400 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                No Word Lists Available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                                There are no word lists created yet.
                            </p>
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                Go Back Home
                            </Link>
                        </div>
                    )}
                </main>
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
