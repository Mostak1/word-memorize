import { useState, useEffect, useId } from "react";
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
    Leaf,
    Zap,
    Flame,
    Sparkles,
    Heart,
} from "lucide-react";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { useTranslation } from "@/Contexts/LanguageContext";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/Components/ui/alert-dialog";

function LoadMore({ meta, onLoadMore, loading }) {
    const { t } = useTranslation();
    const hasNext = meta?.next_page_url || meta?.current_page < meta?.last_page;

    if (!meta || !hasNext) return null;

    return (
        <div className="flex flex-col items-center gap-3 mt-8">
            <button
                onClick={onLoadMore}
                disabled={loading}
                className="group flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E5201C]/10 hover:border-[#E5201C] text-[#E5201C] font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 active:scale-95"
            >
                {loading ? (
                    <Clock className="h-4 w-4 animate-spin" />
                ) : (
                    <Play className="h-4 w-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
                )}
                {loading ? t("common.loading") : t("wordlists.load_more")}
            </button>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
                {t("wordlists.pagination.showing", {
                    from: 1,
                    to: meta.to,
                    total: meta.total,
                })}
            </p>
        </div>
    );
}

function MasteredProgress({ mastered, total }) {
    const { t } = useTranslation();
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
                    {t("wordlists.mastered_count", { count: mastered })}
                </span>
                {allDone ? (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        {t("wordlists.complete")}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {t("wordlists.remaining_count", { count: remaining })}
                    </span>
                )}
            </div>
        </div>
    );
}

function EarnedStarSvg({ className = "" }) {
    const gradientId = useId();
    const shadowId = useId();

    return (
        <svg
            viewBox="0 0 128 128"
            aria-hidden="true"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="24"
                    y1="20"
                    x2="96"
                    y2="108"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor="#FFF7AE" />
                    <stop offset="45%" stopColor="#FFD54F" />
                    <stop offset="100%" stopColor="#F4A300" />
                </linearGradient>
                <filter
                    id={shadowId}
                    x="0"
                    y="0"
                    width="128"
                    height="128"
                    filterUnits="userSpaceOnUse"
                >
                    <feDropShadow
                        dx="0"
                        dy="4"
                        stdDeviation="4"
                        floodColor="#B36B00"
                        floodOpacity="0.35"
                    />
                </filter>
            </defs>

            <g filter={`url(#${shadowId})`}>
                <path
                    d="M64 14L76.36 39.05L104 43.07L84 62.56L88.72 90.07L64 77.07L39.28 90.07L44 62.56L24 43.07L51.64 39.05L64 14Z"
                    fill={`url(#${gradientId})`}
                    stroke="#D88900"
                    strokeWidth="4"
                    strokeLinejoin="round"
                />
                <path
                    d="M64 24L73.2 42.65L93.8 45.64L78.9 60.16L82.42 80.66L64 70.98L45.58 80.66L49.1 60.16L34.2 45.64L54.8 42.65L64 24Z"
                    fill="white"
                    fillOpacity="0.18"
                />
            </g>
        </svg>
    );
}

function StarHolderSvg({ className = "" }) {
    return (
        <svg
            viewBox="0 0 128 128"
            aria-hidden="true"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M64 14L76.36 39.05L104 43.07L84 62.56L88.72 90.07L64 77.07L39.28 90.07L44 62.56L24 43.07L51.64 39.05L64 14Z"
                stroke="#D88900"
                strokeWidth="5"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function StarRating({ stars = 0, max = 3, locked = false, align = "left" }) {
    return (
        <div
            className={`flex items-center gap-0.5 ${align === "right" ? "justify-end" : ""}`}
            aria-label={`${stars} of ${max} stars`}
        >
            {Array.from({ length: max }).map((_, i) => {
                const filled = i < stars;
                return filled ? (
                    <EarnedStarSvg
                        key={i}
                        className="h-6 drop-shadow-[0_1px_1px_rgba(245,158,11,0.35)]"
                    />
                ) : (
                    <StarHolderSvg
                        key={i}
                        className={`h-6 ${locked ? "opacity-70" : ""}`}
                    />
                );
            })}
        </div>
    );
}

function StarOpportunity({ progress }) {
    if (!progress || progress.stars <= 0) return null;

    if (progress.status === "max_stars") {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Trophy className="h-3.5 w-3.5" />
                Fully reinforced
            </span>
        );
    }

    if (progress.can_attempt_next_star) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400">
                <Sparkles className="h-3.5 w-3.5" />
                New star unlocked: {progress.next_reward_label || "2x XP"}
            </span>
        );
    }

    if (progress.next_star_available_at) {
        const unlockDate = new Date(progress.next_star_available_at);
        const label = unlockDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });

        return (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Next star unlocks {label}
            </span>
        );
    }

    return null;
}

/** Banner shown at the top when the whole category is locked */
function CategoryLockBanner({
    category,
    categoryOrder,
    userHasAccess,
    user,
    onPurchase,
}) {
    const { t } = useTranslation();
    const orderStatus = categoryOrder?.status ?? null;

    if (!category?.is_locked) return null;
    // if (orderStatus === "approved") return null;
    if (userHasAccess) return null;

    return (
        <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
            <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                    <div
                        className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            animation:
                                "lockPulse 2s infinite alternate ease-in-out",
                        }}
                    >
                        <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-900 dark:text-red-300 mb-0.5">
                            {t("wordlists.category_locked.title")}
                        </p>

                        {orderStatus === "pending" ? (
                            <div className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                {t("wordlists.category_locked.pending")}
                            </div>
                        ) : orderStatus === "rejected" ? (
                            <div>
                                <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-2">
                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                    {t("wordlists.category_locked.rejected")}
                                    {categoryOrder?.admin_note && (
                                        <span className="ml-1">
                                            {t(
                                                "wordlists.category_locked.reason",
                                                {
                                                    reason: categoryOrder.admin_note,
                                                },
                                            )}
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
                                        {t(
                                            "wordlists.category_locked.try_again",
                                        )}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                                <p className="text-xs text-red-700 dark:text-red-400">
                                    {category.price > 0
                                        ? t(
                                              "wordlists.category_locked.purchase_desc",
                                              { price: category.price },
                                          )
                                        : t(
                                              "wordlists.category_locked.purchase_desc_free",
                                          )}
                                </p>
                                {user ? (
                                    <button
                                        onClick={() => onPurchase(category)}
                                        className="flex items-center gap-1.5 bg-[#E5201C] hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition shrink-0"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        {t(
                                            "wordlists.category_locked.purchase_button",
                                        )}
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
                                        {t(
                                            "wordlists.category_locked.login_to_purchase",
                                        )}
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
    const { t } = useTranslation();
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
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                        <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
                <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${color} opacity-70`}
                >
                    {star}
                    {t(
                        `common.difficulties.${wordList.difficulty?.toLowerCase()}`,
                    )}
                </span>
                {total > 0 && (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700 text-gray-400">
                        {t("wordlists.words_count", { count: total })}
                    </span>
                )}
            </div>

            {/* Lock notice + CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                <div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                        {t("wordlists.quiz_locked.pass_previous")}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StarRating stars={0} max={3} locked align="right" />
                    {isTakeable ? (
                        user ? (
                            <a
                                href={route(
                                    "quiz.wordlist",
                                    previousWordlistId,
                                )}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                            >
                                <GraduationCap className="h-3.5 w-3.5" />
                                {t("wordlists.quiz_locked.take_quiz")}
                            </a>
                        ) : (
                            <Link
                                href={route("login")}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {t("wordlists.quiz_locked.login_to_take")}
                            </Link>
                        )
                    ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                            {t("wordlists.quiz_locked.unlock_previous")}
                        </span>
                    )}
                </div>
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
    starProgressByWordlist = {},
    bkashNumber = "01825236112",
    sideQuestUnlock = null,
    isSideQuestUnlocked = false,
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [purchaseTarget, setPurchaseTarget] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

    const handleConfirmUnlock = () => {
        setShowUnlockConfirm(false);
        router.post(
            route("sidequests.unlock", category.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    // Dynamic state to accumulate items across loads
    const [items, setItems] = useState(wordLists?.data ?? []);
    const [meta, setMeta] = useState(wordLists?.meta ?? wordLists);
    const [counts, setCounts] = useState(masteredCounts || {});
    const [eligible, setEligible] = useState(quizEligibleIds || []);
    const [hasQuiz, setHasQuiz] = useState(hasQuizIds || []);
    const [unlocked, setUnlocked] = useState(quizUnlockedIds || []);
    const [prevMap, setPrevMap] = useState(previousWordlistIdMap || {});
    const [takeable, setTakeable] = useState(quizTakeableIds || []);
    const [starProgress, setStarProgress] = useState(
        starProgressByWordlist || {},
    );

    // Reset when category changes
    useEffect(() => {
        if (category?.id) {
            setItems(wordLists?.data ?? []);
            setMeta(wordLists?.meta ?? wordLists);
            setCounts(masteredCounts || {});
            setEligible(quizEligibleIds || []);
            setHasQuiz(hasQuizIds || []);
            setUnlocked(quizUnlockedIds || []);
            setPrevMap(previousWordlistIdMap || {});
            setTakeable(quizTakeableIds || []);
            setStarProgress(starProgressByWordlist || {});
        }
    }, [category?.id]);

    const handleLoadMore = () => {
        const nextUrl =
            meta?.next_page_url ||
            meta?.links?.find((l) => l.label.includes("Next"))?.url;
        if (!nextUrl || isLoadingMore) return;

        setIsLoadingMore(true);
        router.get(
            nextUrl,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: [
                    "wordLists",
                    "masteredCounts",
                    "quizEligibleIds",
                    "hasQuizIds",
                    "quizUnlockedIds",
                    "previousWordlistIdMap",
                    "quizTakeableIds",
                    "starProgressByWordlist",
                ],
                onSuccess: (page) => {
                    const p = page.props;
                    const newItems = p.wordLists?.data ?? [];

                    setItems((prev) => [...prev, ...newItems]);
                    setMeta(p.wordLists?.meta ?? p.wordLists);
                    setCounts((prev) => ({
                        ...prev,
                        ...(p.masteredCounts || {}),
                    }));
                    setEligible((prev) => [
                        ...new Set([...prev, ...(p.quizEligibleIds || [])]),
                    ]);
                    setHasQuiz((prev) => [
                        ...new Set([...prev, ...(p.hasQuizIds || [])]),
                    ]);
                    setUnlocked((prev) => [
                        ...new Set([...prev, ...(p.quizUnlockedIds || [])]),
                    ]);
                    setPrevMap((prev) => ({
                        ...prev,
                        ...(p.previousWordlistIdMap || {}),
                    }));
                    setTakeable((prev) => [
                        ...new Set([...prev, ...(p.quizTakeableIds || [])]),
                    ]);
                    setStarProgress((prev) => ({
                        ...prev,
                        ...(p.starProgressByWordlist || {}),
                    }));

                    setIsLoadingMore(false);
                },
                onError: () => setIsLoadingMore(false),
            },
        );
    };

    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        const isBeginner = d === "easy" || d === "beginner";
        const isIntermediate = d === "medium" || d === "intermediate";
        const isAdvanced = d === "hard" || d === "advanced";

        const star = isBeginner ? (
            <Leaf className="h-3 w-3" />
        ) : isIntermediate ? (
            <Zap className="h-3 w-3" />
        ) : isAdvanced ? (
            <Flame className="h-3 w-3" />
        ) : (
            <Leaf className="h-3 w-3" />
        );

        const color = isBeginner
            ? "bg-green-50 text-green-700 border-green-200"
            : isIntermediate
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-red-50 text-red-700 border-red-200";
        return { star, color };
    };

    // const items = Array.isArray(wordLists)
    //     ? wordLists
    //     : (wordLists?.data ?? []);
    // const paginationLinks = wordLists?.meta?.links ?? wordLists?.links ?? [];
    // const paginationMeta = wordLists?.meta ?? (wordLists?.current_page ? wordLists : null);

    // Category is effectively locked when it has is_locked=true and no approved order
    // const categoryIsLocked =
    //     category?.is_locked && categoryOrder?.status !== "approved";
    const categoryIsLocked = category?.is_locked && !userHasAccess;

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("wordlists.title")} />
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
                                        <Link href={route("home")}>
                                            {t("wordlists.breadcrumb_home")}
                                        </Link>
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
                                            {t(
                                                "wordlists.breadcrumb_categories",
                                            )}
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

                    {/* Survival Gauntlet Card */}
                    {!categoryIsLocked &&
                        category &&
                        category.enable_side_quest && (
                            <div className="mb-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-red-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-800 dark:text-white rounded-3xl p-6 shadow-xl border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
                                {/* Background micro-illustrations or glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-red-400/20 dark:bg-red-500/10 rounded-full blur-xl pointer-events-none" />

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                                                {t(
                                                    "wordlists.side_quest.badge_quest",
                                                )}
                                            </span>
                                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {t(
                                                    "wordlists.side_quest.badge_practice",
                                                )}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                            🎮 {t("wordlists.side_quest.title")}
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md leading-relaxed">
                                            {t(
                                                "wordlists.side_quest.description",
                                            )}
                                        </p>
                                    </div>

                                    <div className="shrink-0 bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center min-w-[70px] shadow-inner">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {t("wordlists.side_quest.xp_cost")}
                                        </span>
                                        <span className="text-lg font-black text-yellow-600 dark:text-yellow-400 mt-0.5 flex items-center gap-0.5">
                                            <Zap className="h-4 w-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                                            {category.side_quest_xp_cost ?? 150}
                                        </span>
                                    </div>
                                </div>

                                {/* Action / Status Row */}
                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 relative z-10">
                                    {!isSideQuestUnlocked ? (
                                        <>
                                            {/* <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {t(
                                                    "wordlists.side_quest.unlock_desc",
                                                )}
                                                {user && (
                                                    <span className="block text-[11px] font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">
                                                        {t(
                                                            "wordlists.side_quest.balance",
                                                            {
                                                                balance:
                                                                    user?.xp
                                                                        ?.balance ??
                                                                    0,
                                                            },
                                                        )}
                                                    </span>
                                                )}
                                            </div> */}
                                            {user ? (
                                                <button
                                                    onClick={() =>
                                                        setShowUnlockConfirm(
                                                            true,
                                                        )
                                                    }
                                                    className="bg-[#E5201C] hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-red-500/20 active:scale-95 transition-all"
                                                >
                                                    <Lock className="h-3.5 w-3.5" />
                                                    {t(
                                                        "wordlists.side_quest.unlock_button",
                                                    )}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={route("login")}
                                                    className="text-xs font-bold text-red-500 dark:text-red-400 hover:underline"
                                                >
                                                    {t(
                                                        "wordlists.side_quest.login_to_unlock",
                                                    )}
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-3 gap-4 text-center bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl py-2.5 px-4 flex-1">
                                                <div>
                                                    <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                                                        {t(
                                                            "wordlists.side_quest.best_score",
                                                        )}
                                                    </span>
                                                    <span className="text-sm font-black text-green-600 dark:text-green-400 mt-1 block">
                                                        {sideQuestUnlock?.best_score ??
                                                            0}{" "}
                                                        / 20
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                                                        {t(
                                                            "wordlists.side_quest.best_lives",
                                                        )}
                                                    </span>
                                                    <span className="text-sm font-black text-red-500 dark:text-red-400 flex items-center justify-center gap-0.5 mt-1.5">
                                                        {Array.from({
                                                            length: 3,
                                                        }).map((_, i) => {
                                                            const isFilled =
                                                                sideQuestUnlock &&
                                                                i <
                                                                    sideQuestUnlock.best_lives_remaining;
                                                            return (
                                                                <Heart
                                                                    key={i}
                                                                    className={`h-3.5 w-3.5 ${
                                                                        isFilled
                                                                            ? "fill-red-500 text-red-500"
                                                                            : "text-red-500/40 dark:text-red-500/30"
                                                                    }`}
                                                                />
                                                            );
                                                        })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                                                        {t(
                                                            "wordlists.side_quest.attempts",
                                                        )}
                                                    </span>
                                                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1 block">
                                                        {sideQuestUnlock?.attempts_count ??
                                                            0}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                href={route(
                                                    "sidequests.start",
                                                    category.id,
                                                )}
                                                className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-green-500/20 active:scale-95 transition-all justify-center"
                                            >
                                                <Play className="h-3.5 w-3.5 fill-white" />
                                                {t(
                                                    "wordlists.side_quest.play_button",
                                                )}
                                            </Link>
                                        </>
                                    )}
                                </div>
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
                                        counts?.[wordList.id] ?? null;
                                    const total = wordList.words_count ?? 0;
                                    const progress = starProgress?.[
                                        wordList.id
                                    ] || {
                                        stars: 0,
                                        max_stars: 3,
                                        can_attempt_next_star: false,
                                    };

                                    // Locked by category purchase gate — skip this block if wordlist is NOT locked
                                    if (
                                        categoryIsLocked &&
                                        wordList.is_locked
                                    ) {
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
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                                                            <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span
                                                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${color} opacity-50`}
                                                            >
                                                                {star}
                                                                {t(
                                                                    `common.difficulties.${wordList.difficulty?.toLowerCase()}`,
                                                                )}
                                                            </span>
                                                            {total > 0 && (
                                                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 dark:bg-slate-800 dark:border-slate-700 text-gray-400">
                                                                    {t(
                                                                        "wordlists.words_count",
                                                                        {
                                                                            count: total,
                                                                        },
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <StarRating
                                                            stars={0}
                                                            max={3}
                                                            locked
                                                            align="right"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Locked by quiz gate — is_locked=true and user hasn't passed yet
                                    if (
                                        wordList.is_locked &&
                                        !unlocked.includes(wordList.id)
                                    ) {
                                        return (
                                            <div key={wordList.id}>
                                                <QuizLockedCard
                                                    wordList={wordList}
                                                    color={color}
                                                    star={star}
                                                    previousWordlistId={
                                                        prevMap[wordList.id] ??
                                                        null
                                                    }
                                                    isTakeable={takeable.includes(
                                                        wordList.id,
                                                    )}
                                                    user={user}
                                                    index={index}
                                                />
                                            </div>
                                        );
                                    }

                                    const canExercise = total >= 10;
                                    const startUrl =
                                        progress.can_attempt_next_star
                                            ? `${route("wordlist.start", wordList.id)}?mode=star-review`
                                            : route(
                                                  "wordlist.start",
                                                  wordList.id,
                                              );
                                    const actionLabel = !canExercise
                                        ? t("wordlists.needs_words", {
                                              count: 10,
                                          })
                                        : progress.can_attempt_next_star
                                          ? "Earn Star"
                                          : mastered !== null &&
                                              mastered >= total &&
                                              total > 0
                                            ? t("wordlists.completed_status")
                                            : t("wordlists.start_exercise");

                                    // ── UNLOCKED card — clickable ──
                                    return (
                                        <div key={wordList.id}>
                                            <div
                                                role={
                                                    canExercise
                                                        ? "button"
                                                        : undefined
                                                }
                                                tabIndex={
                                                    canExercise ? 0 : undefined
                                                }
                                                onClick={() =>
                                                    canExercise &&
                                                    router.visit(startUrl)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        canExercise &&
                                                        (e.key === "Enter" ||
                                                            e.key === " ")
                                                    )
                                                        router.visit(startUrl);
                                                }}
                                                className={`bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm border transition-all ${
                                                    progress.can_attempt_next_star
                                                        ? "border-violet-200 dark:border-violet-800 shadow-violet-100/70 dark:shadow-violet-950/20"
                                                        : "border-transparent"
                                                } ${
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
                                                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug flex-1 min-w-0">
                                                        {wordList.title}
                                                    </h2>
                                                    <div className="flex items-start gap-1.5 shrink-0">
                                                        <StarRating
                                                            stars={
                                                                progress.stars ||
                                                                0
                                                            }
                                                            max={
                                                                progress.max_stars ||
                                                                3
                                                            }
                                                            align="right"
                                                        />
                                                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${color}`}
                                                    >
                                                        {star}
                                                        {t(
                                                            `common.difficulties.${wordList.difficulty?.toLowerCase()}`,
                                                        )}
                                                    </span>
                                                    {total > 0 && (
                                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                                            {t(
                                                                "wordlists.words_count",
                                                                {
                                                                    count: total,
                                                                },
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                {mastered !== null && (
                                                    <MasteredProgress
                                                        mastered={mastered}
                                                        total={total}
                                                    />
                                                )}

                                                <div className="flex items-end justify-between gap-3 mt-3">
                                                    <div className="min-w-0">
                                                        {user &&
                                                        eligible.includes(
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
                                                                {t(
                                                                    "wordlists.take_a_quiz",
                                                                )}
                                                            </Link>
                                                        ) : user ? (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                {t(
                                                                    "wordlists.learn_to_unlock",
                                                                    {
                                                                        count: 20,
                                                                    },
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                                                        <StarOpportunity
                                                            progress={progress}
                                                        />
                                                        <span
                                                            className={`${canExercise ? "text-[#E5201C]" : "text-gray-400"} text-sm font-semibold flex items-center justify-end gap-1`}
                                                        >
                                                            {actionLabel}
                                                            {canExercise && (
                                                                <Play className="h-3.5 w-3.5 fill-[#E5201C]" />
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <LoadMore
                                meta={meta}
                                onLoadMore={handleLoadMore}
                                loading={isLoadingMore}
                            />
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-gray-400 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {t("wordlists.empty.title_lists")}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                                {t("wordlists.empty.desc_lists")}
                            </p>
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                {t("wordlists.empty.go_home")}
                            </Link>
                        </div>
                    )}
                </main>
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes lockPulse {
                        0% { background-color: #B71C13; box-shadow: 0 4px 12px rgba(183, 28, 19, 0.4); }
                        50% { background-color: #E70013; box-shadow: 0 4px 20px rgba(231, 0, 19, 0.6); }
                        100% { background-color: #FF3B22; box-shadow: 0 4px 12px rgba(255, 59, 34, 0.4); }
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

            {/* Unlock Confirmation Dialog */}
            <AlertDialog
                open={showUnlockConfirm}
                onOpenChange={setShowUnlockConfirm}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("wordlists.side_quest.confirm_title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-400">
                            {t("wordlists.side_quest.confirm_desc", {
                                cost: category?.side_quest_xp_cost ?? 150,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white">
                            {t("wordlists.side_quest.confirm_cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmUnlock}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700 text-white font-bold"
                        >
                            {t("wordlists.side_quest.confirm_action")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
