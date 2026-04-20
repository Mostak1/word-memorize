import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import PurchaseOrderDialog from "@/Components/PurchaseOrderDialog";
import {
    BookOpen,
    ChevronRight,
    ChevronLeft,
    Lock,
    Play,
    Trophy,
    ShoppingCart,
    Clock,
    XCircle,
    GraduationCap,
    AlertCircle,
} from "lucide-react";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";

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
            <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all ${allDone ? "bg-green-500" : "bg-[#E5201C]"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                />
            </div>

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

/** Banner shown at the top when the whole category is locked */
function CategoryLockBanner({
    category,
    categoryOrder,
    userHasAccess,
    user,
    onPurchase,
}) {
    const orderStatus = categoryOrder?.status ?? null;

    if (!category?.is_locked) return null;
    // if (orderStatus === "approved") return null;
    if (userHasAccess) return null;

    return (
        <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                        <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                            This category is locked
                        </p>

                        {orderStatus === "pending" ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                Your order is under review. We'll notify you
                                once approved.
                            </div>
                        ) : orderStatus === "rejected" ? (
                            <div>
                                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-2">
                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                    Your order was rejected.
                                    {categoryOrder?.admin_note && (
                                        <span className="ml-1">
                                            Reason: {categoryOrder.admin_note}
                                        </span>
                                    )}
                                </div>
                                {user && (
                                    <button
                                        onClick={() =>
                                            onPurchase({
                                                ...category,
                                                _rejectedOrder: categoryOrder,
                                            })
                                        }
                                        className="flex items-center gap-1.5 text-xs font-semibold text-[#E5201C] hover:underline"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        Try Again
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    {category.price > 0
                                        ? `Purchase access for ৳${category.price} to unlock all word lists.`
                                        : "Purchase access to unlock all word lists."}
                                </p>
                                {user ? (
                                    <button
                                        onClick={() => onPurchase(category)}
                                        className="flex items-center gap-1.5 bg-[#E5201C] hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition shrink-0"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        Purchase Access
                                        {category.price > 0 && (
                                            <span className="ml-0.5">
                                                · ৳{category.price}
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        href={route("login")}
                                        className="text-xs font-semibold text-[#E5201C] hover:underline"
                                    >
                                        Login to Purchase
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Card shown when a word list requires passing a quiz first */
function QuizLockedCard({
    wordList,
    color,
    star,
    previousWordlistId, // ID of the wordlist whose quiz must be passed
    isTakeable, // true only when previousWordlistId is itself accessible
    user,
    index,
}) {
    const total = wordList.words_count ?? 0;

    return (
        <div
            className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm border border-indigo-100 dark:border-indigo-900/40"
            style={{
                animationDelay: `${index * 0.07}s`,
                animation: "fadeInUp 0.4s ease-out forwards",
                opacity: 0,
            }}
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 leading-snug flex-1">
                    {wordList.title}
                </h2>
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-indigo-400 dark:text-indigo-500" />
                    <Lock className="h-4 w-4 text-indigo-400 dark:text-indigo-500" />
                </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
                <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color} opacity-70`}
                >
                    {star} {wordList.difficulty}
                </span>
                {total > 0 && (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700 text-gray-400">
                        {total} words
                    </span>
                )}
            </div>

            {/* Lock notice + CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Pass the previous quiz to unlock
                </p>

                {isTakeable ? (
                    user ? (
                        <a
                            href={route("quiz.wordlist", previousWordlistId)}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                        >
                            <GraduationCap className="h-3.5 w-3.5" />
                            Take Quiz
                        </a>
                    ) : (
                        <Link
                            href={route("login")}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Login to take quiz
                        </Link>
                    )
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Unlock previous first
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
    category,
    masteredCounts,
    categoryOrder = null,
    userHasAccess = false,
    quizEligibleIds = [],
    hasQuizIds = [],
    quizUnlockedIds = [],
    previousWordlistIdMap = {},
    quizTakeableIds = [], // locked wordlists whose previous wordlist is accessible
    bkashNumber = "01825236112",
}) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [purchaseTarget, setPurchaseTarget] = useState(null);

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

    // Category is effectively locked when it has is_locked=true and no approved order
    // const categoryIsLocked =
    //     category?.is_locked && categoryOrder?.status !== "approved";
    const categoryIsLocked = category?.is_locked && !userHasAccess;

    return (
        <AppLayout>
            <Head title="Exercises" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    {(currentCategory || currentDifficulty) && (
                        <Breadcrumb className="mb-4">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        asChild
                                        className="hover:text-[#e70013] hover:underline transition-colors duration-200"
                                    >
                                        <Link href={route("home")}>Home</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        asChild
                                        className="hover:text-[#e70013] hover:underline transition-colors duration-200"
                                    >
                                        <Link
                                            href={route(
                                                "wordlistcategory.index",
                                            )}
                                        >
                                            Wordlist Categories
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-semibold">
                                        {currentCategory || currentDifficulty}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}

                    {/* Category lock banner — shown once for the whole page */}
                    {category && (
                        <CategoryLockBanner
                            category={category}
                            categoryOrder={categoryOrder}
                            userHasAccess={userHasAccess}
                            user={user}
                            onPurchase={setPurchaseTarget}
                        />
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

                                    // Locked by category purchase gate
                                    if (categoryIsLocked) {
                                        return (
                                            <div key={wordList.id}>
                                                <div
                                                    className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm opacity-60"
                                                    style={{
                                                        animationDelay: `${index * 0.07}s`,
                                                        animation:
                                                            "fadeInUp 0.4s ease-out forwards",
                                                        opacity: 0,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <h2 className="text-base font-bold text-gray-500 dark:text-gray-400 leading-snug flex-1">
                                                            {wordList.title}
                                                        </h2>
                                                        <Lock className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color} opacity-50`}
                                                        >
                                                            {star}{" "}
                                                            {
                                                                wordList.difficulty
                                                            }
                                                        </span>
                                                        {total > 0 && (
                                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700 text-gray-400">
                                                                {total} words
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Locked by quiz gate — is_locked=true and user hasn't passed yet
                                    if (
                                        wordList.is_locked &&
                                        !quizUnlockedIds.includes(wordList.id)
                                    ) {
                                        return (
                                            <div key={wordList.id}>
                                                <QuizLockedCard
                                                    wordList={wordList}
                                                    color={color}
                                                    star={star}
                                                    previousWordlistId={
                                                        previousWordlistIdMap[
                                                            wordList.id
                                                        ] ?? null
                                                    }
                                                    isTakeable={quizTakeableIds.includes(
                                                        wordList.id,
                                                    )}
                                                    user={user}
                                                    index={index}
                                                />
                                            </div>
                                        );
                                    }

                                    const canExercise = total >= 10;

                                    // ── UNLOCKED card — clickable ──
                                    return (
                                        <div key={wordList.id}>
                                            <div
                                                role={canExercise ? "button" : undefined}
                                                tabIndex={canExercise ? 0 : undefined}
                                                onClick={() =>
                                                    canExercise && router.visit(
                                                        route(
                                                            "wordlist.start",
                                                            wordList.id,
                                                        ),
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        canExercise && (e.key === "Enter" ||
                                                        e.key === " ")
                                                    )
                                                        router.visit(
                                                            route(
                                                                "wordlist.start",
                                                                wordList.id,
                                                            ),
                                                        );
                                                }}
                                                className={`bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm border border-transparent transition-all ${
                                                    canExercise 
                                                        ? "hover:shadow-md cursor-pointer" 
                                                        : "opacity-80 cursor-not-allowed"
                                                }`}
                                                style={{
                                                    animationDelay: `${index * 0.07}s`,
                                                    animation:
                                                        "fadeInUp 0.4s ease-out forwards",
                                                    opacity: 0,
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug flex-1">
                                                        {wordList.title}
                                                    </h2>
                                                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <span
                                                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color}`}
                                                    >
                                                        {star}{" "}
                                                        {wordList.difficulty}
                                                    </span>
                                                    {total > 0 && (
                                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                                            {total} words
                                                        </span>
                                                    )}
                                                </div>

                                                {mastered !== null && (
                                                    <MasteredProgress
                                                        mastered={mastered}
                                                        total={total}
                                                    />
                                                )}

                                                <div className="flex items-center justify-between mt-3">
                                                    <div>
                                                        {user &&
                                                        quizEligibleIds.includes(
                                                            wordList.id,
                                                        ) ? (
                                                            <Link
                                                                href={route(
                                                                    "quiz.wordlist",
                                                                    wordList.id,
                                                                )}
                                                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <GraduationCap className="h-3.5 w-3.5" />
                                                                Take a Quiz
                                                            </Link>
                                                        ) : user ? (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                Learn 20 words
                                                                to unlock quiz
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <span className={`${canExercise ? "text-[#E5201C]" : "text-gray-400"} text-sm font-semibold flex items-center gap-1`}>
                                                        {!canExercise 
                                                            ? "Needs 10 words"
                                                            : (mastered !== null &&
                                                               mastered >= total &&
                                                               total > 0
                                                                ? "Completed"
                                                                : "Start Exercise")}
                                                        {canExercise && <Play className="h-3.5 w-3.5 fill-[#E5201C]" />}
                                                    </span>
                                                </div>
                                            </div>
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

            {/* Purchase Dialog — targets the category */}
            {purchaseTarget && (
                <PurchaseOrderDialog
                    open={!!purchaseTarget}
                    onClose={() => setPurchaseTarget(null)}
                    category={purchaseTarget}
                    bkashNumber={bkashNumber}
                />
            )}
        </AppLayout>
    );
}
