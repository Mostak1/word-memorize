import { Head, Link, router } from "@inertiajs/react";
import { Player } from "@lottiefiles/react-lottie-player";
import AppLayout from "@/Layouts/AppLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    Volume2,
    LogIn,
    Bookmark,
    ChevronLeft,
    X,
    Check,
    Zap,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import FlashMessages from "@/Components/FlashMessage";
import { usePage } from "@inertiajs/react";

// ── Constants ─────────────────────────────────────────────────────────────────
const MASTERED_BOX = 4;

const LEVEL_META = {
    1: {
        label: "New",
        color: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
        dot: "bg-gray-400 dark:bg-slate-600",
    },
    2: {
        label: "Learning",
        color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
        dot: "bg-cyan-400 dark:bg-cyan-500",
    },
    3: {
        label: "Reviewing",
        color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
        dot: "bg-orange-400 dark:bg-orange-500",
    },
    4: {
        label: "Mastered",
        color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
        dot: "bg-green-500 dark:bg-green-400",
    },
};

// Confetti pieces — stable (generated once outside component)
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${(i * 2.85) % 100}%`,
    delay: `${(i * 0.055) % 0.5}s`,
    duration: `${1.5 + (i % 5) * 0.18}s`,
    color: [
        "#E5201C",
        "#22c55e",
        "#3b82f6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
    ][i % 7],
    size: 6 + (i % 5) * 2,
    borderRadius: i % 3 === 0 ? "50%" : "2px",
}));

export default function ExerciseSession({
    wordList,
    subcategory,
    words: initialWords,
    totalWordsInList = 0,
    backUrl = null,
    bookmarkedWordIds = [],
}) {
    const { auth } = usePage().props;

    // ── Queue state ───────────────────────────────────────────────────────────
    // The Active Queue: queue[0] is always the current word.
    // "I Know"       → remove from front (word leaves session).
    // "I Don't Know" → move from front to back (word stays in session).
    const [queue, setQueue] = useState(() =>
        initialWords.map((w) => ({ ...w })),
    );
    const initialQueueSize = useMemo(() => initialWords.length, []); // cap at session start

    // ── Session stats ─────────────────────────────────────────────────────────
    const [promotedCount, setPromotedCount] = useState(0); // words answered "I Know"
    const [dontKnowCount, setDontKnowCount] = useState(0); // total "I Don't Know" taps
    const [sessionXpAwarded, setSessionXpAwarded] = useState(0); // XP earned this session

    // NEW: Total cards processed in this session (used for progress bar)
    const answeredCount = promotedCount + dontKnowCount;

    // ── UI state ──────────────────────────────────────────────────────────────
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [bookmarks, setBookmarks] = useState(() =>
        Object.fromEntries(bookmarkedWordIds.map((id) => [id, true])),
    );
    const [showMeaning, setShowMeaning] = useState(false);

    // ── Card animation state ──────────────────────────────────────────────────
    // exitDir: 'left' = I Know (word leaves), 'right' = I Don't Know (shuffles back)
    const exitDir = useRef("left");
    const [cardKey, setCardKey] = useState(0);
    const [exiting, setExiting] = useState(false);

    // ── Gamification state ────────────────────────────────────────────────────
    const [showConfetti, setShowConfetti] = useState(false);
    const [masteryFlash, setMasteryFlash] = useState(false);
    const [levelUpPulse, setLevelUpPulse] = useState(false);

    // Current word is always the front of the queue
    const word = queue[0] ?? null;
    const isDone = queue.length === 0 && !exiting;

    const [openCollocationIndex, setOpenCollocationIndex] = useState(null);
    const meaningCardRef = useRef(null);

    // Reset per-card UI when the front of the queue changes
    useEffect(() => {
        setActiveImageIndex(0);
        setShowMeaning(false);
    }, [word?.id]);

    // Auto-scroll to bottom of meaning card (buttons) when revealed
    useEffect(() => {
        if (showMeaning && meaningCardRef.current) {
            setTimeout(() => {
                meaningCardRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }, 50);
        }
    }, [showMeaning]);

    useEffect(() => {
        if (!isDone || !auth?.user) return;

        // Fire-and-forget completion signal with XP tracking
        const csrfToken = decodeURIComponent(
            document.cookie
                .split("; ")
                .find((row) => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1] ?? "",
        );

        fetch(route("word.session-complete"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.xp_awarded) {
                    setSessionXpAwarded(data.xp_awarded);
                }
            })
            .catch(() => {}); // silent fail - we don't want to break the UI
    }, [isDone, auth?.user]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const speakWord = useCallback((text) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-US";
            window.speechSynthesis.speak(u);
        }
    }, []);

    const highlightWord = (sentence, targetWord) => {
        if (!sentence || !targetWord) return sentence;
        const regex = new RegExp(`(${targetWord})`, "gi");
        return sentence.split(regex).map((part, i) =>
            regex.test(part) ? (
                <strong key={i} className="font-bold text-gray-900">
                    {part}
                </strong>
            ) : (
                part
            ),
        );
    };

    const handleBookmark = (wordId) => {
        if (!auth?.user) {
            setShowLoginDialog(true);
            return;
        }
        setBookmarks((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
        router.post(
            route("word.bookmark", wordId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    setBookmarks((prev) => ({
                        ...prev,
                        [wordId]: !prev[wordId],
                    })),
            },
        );
    };

    // ── Fire-and-forget server call ───────────────────────────────────────────
    const pingServer = (routeName, wordId) => {
        const csrfToken = decodeURIComponent(
            document.cookie
                .split("; ")
                .find((row) => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1] ?? "",
        );
        fetch(route(routeName, wordId), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            body: JSON.stringify({ from: "session" }),
        }).finally(() => setIsSubmitting(false));
    };

    // ── Animate then mutate queue ─────────────────────────────────────────────
    const animateThen = (direction, callback) => {
        exitDir.current = direction;
        setExiting(true);
        setTimeout(() => {
            setExiting(false);
            setCardKey((k) => k + 1);
            callback();
        }, 200);
    };

    // ── Core actions ──────────────────────────────────────────────────────────

    /**
     * "I Know"
     *
     * Level 1 (New/Learning):
     *   → Remove from queue (promoted to L2 via server)
     *
     * Level 2 / 3 (Review):
     *   → Remove from queue (promoted to next level via server)
     *
     * Level 3 → 4: triggers mastery celebration.
     */
    const handleKnow = () => {
        if (!word) return;
        if (!auth?.user) {
            setShowLoginDialog(true);
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);

        const currentBox = word.srs_box ?? 1;
        const willMaster = currentBox >= MASTERED_BOX - 1; // L3 → L4
        const willLevelUp = currentBox < MASTERED_BOX;

        if (willMaster) {
            setShowConfetti(true);
            setMasteryFlash(true);
            setTimeout(() => setMasteryFlash(false), 900);
            setTimeout(() => setShowConfetti(false), 2800);
        } else if (willLevelUp) {
            setLevelUpPulse(true);
            setTimeout(() => setLevelUpPulse(false), 500);
        }

        const wordId = word.id;
        animateThen("left", () => {
            setQueue((prev) => prev.slice(1)); // remove from front
            setPromotedCount((c) => c + 1);
        });

        pingServer("word.know", wordId);
    };

    /**
     * "I Don't Know"
     *
     * Level 1 (New/Learning):
     *   → Shuffle to back of queue at L1 (server records incorrect, box stays 1).
     *   → Word CANNOT leave the session until answered correctly.
     *
     * Level 2 / 3 (Review):
     *   → Demote to L1 on server.
     *   → Shuffle to back of queue with srs_box updated to 1 locally.
     *   → Word re-enters the learning phase in this session.
     */
    const handleDontKnow = () => {
        if (!word) return;
        if (!auth?.user) {
            setShowLoginDialog(true);
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        setDontKnowCount((c) => c + 1);

        const wordId = word.id;

        animateThen("right", () => {
            setQueue((prev) => prev.slice(1)); // ← word leaves session
        });

        pingServer("word.learn", wordId);
    };

    // ── Layout helpers ────────────────────────────────────────────────────────

    // const collocationList = word?.collocations
    //     ? word.collocations
    //           .split(/[\n,]+/)
    //           .map((c) => c.trim())
    //           .filter(Boolean)
    //     : [];

    const collocationList = (() => {
        const raw = word?.collocations;

        if (!raw) return [];

        // Case 1: already array (ideal future case)
        if (Array.isArray(raw)) return raw;

        // Case 2: JSON string
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}

        // Case 3: fallback (old comma-separated string)
        return raw
            .split(/[\n,]+/)
            .map((c) => c.trim())
            .filter(Boolean)
            .map((phrase) => ({
                phrase,
                example_sentence: "", // no example available
            }));
    })();

    const collocationColors = [
        "bg-red-100/70 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
        "bg-blue-100/70 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        "bg-green-100/70 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
        "bg-amber-100/70 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        "bg-purple-100/70 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
        "bg-teal-100/70 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
        "bg-pink-100/70 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
        "bg-indigo-100/70 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    ];

    const formatIPA = (ipa) => {
        if (!ipa) return "";
        let f = ipa.trim();
        if (!f.startsWith("/")) f = "/" + f;
        if (!f.endsWith("/")) f = f + "/";
        return f;
    };

    const wordFontSize = (w) => {
        if (!w) return "text-4xl";
        if (w.length <= 8) return "text-4xl";
        if (w.length <= 12) return "text-3xl";
        if (w.length <= 16) return "text-2xl";
        return "text-xl";
    };

    const images = word?.images?.length > 0 ? word.images : [];
    const activeImage = images[activeImageIndex] ?? null;

    const backHref =
        backUrl ??
        (wordList?.word_list_category_id
            ? route(
                  "wordlistcategory.wordlists",
                  wordList.word_list_category_id,
              )
            : route("wordlist.show", wordList?.id));

    // ── Empty queue (nothing due, nothing new) ────────────────────────────────
    if (initialQueueSize === 0) {
        return (
            <AppLayout>
                <Head title="All Caught Up!" />
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            All Caught Up!
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                            No words are due for review right now. Check back
                            tomorrow to keep your streak going!
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={route("words.mastered")}
                                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                            >
                                View Mastered Words
                            </Link>
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

    // ── Session complete screen ───────────────────────────────────────────────
    if (isDone) {
        const retries = dontKnowCount; // total "I Don't Know" taps during session
        return (
            <AppLayout>
                <Head title="Session Complete" />
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                        {/* Lottie celebration animation */}
                        <div className="flex justify-center -mt-2 -mb-2">
                            <Player
                                autoplay
                                loop={false}
                                keepLastFrame
                                src="https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json"
                                style={{ height: 160, width: 160 }}
                            />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            Session Complete!
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                                    {promotedCount}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">
                                    Cleared
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-red-400 dark:text-red-400">
                                    {retries}
                                </p>
                                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 font-medium">
                                    Retries
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-blue-500 dark:text-blue-400">
                                    {promotedCount + retries}
                                </p>
                                <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">
                                    Total Reps
                                </p>
                            </div>
                        </div>

                        {/* XP Earned Display */}
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

                        {/* List-level progress bar */}
                        {totalWordsInList > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                                    <span>List Progress</span>
                                    <span>
                                        {Math.round(
                                            (promotedCount / totalWordsInList) *
                                                100,
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min((promotedCount / totalWordsInList) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                                    {promotedCount} of {totalWordsInList} words
                                    in this session's queue
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Link
                                href={route("wordlist.start", wordList.id)}
                                className="w-full py-3.5 bg-[#E5201C] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition"
                            >
                                New Session
                            </Link>
                            {/* {promotedCount > 0 && (
                                <Link
                                    href={route("words.mastered")}
                                    className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    View Mastered Words
                                </Link>
                            )} */}
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

    // ── Main session card ─────────────────────────────────────────────────────
    const currentBox = word?.srs_box ?? 1;
    const meta = LEVEL_META[currentBox] ?? LEVEL_META[1];

    // Progress within this session: how many of the initial queue have been cleared
    // const sessionProgress =
    //     initialQueueSize > 0 ? (promotedCount / initialQueueSize) * 100 : 0;
    const sessionProgress =
        initialQueueSize > 0 ? (answeredCount / initialQueueSize) * 100 : 0;

    return (
        <AppLayout>
            <Head title={`Exercise — ${word?.word ?? ""}`} />
            <FlashMessages />

            {/* ── Confetti burst on mastery ────────────────────────────────── */}
            {showConfetti && (
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
                    <div className="absolute inset-x-0 top-24 flex justify-center pointer-events-none">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-slate-900 px-8 py-4 text-center animate-bounce-in border border-green-100 dark:border-green-900">
                            <p className="text-3xl mb-1">🌟</p>
                            <p className="text-lg font-extrabold text-green-600 dark:text-green-400">
                                Mastered!
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                Word added to your Mastery Garden
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mastery green flash ──────────────────────────────────────── */}
            {masteryFlash && (
                <div className="fixed inset-0 pointer-events-none z-40 bg-green-400/20" />
            )}

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-10 pt-1 mt-3">
                {/* ── Session progress bar ─────────────────────────────────── */}
                <div className="max-w-lg mx-auto px-3 pb-2">
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={backHref}
                            className="flex-none p-1.5 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#E5201C] rounded-full transition-all duration-500"
                                style={{ width: `${sessionProgress}%` }}
                            />
                        </div>
                        {/* Queue remaining badge */}
                        <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-2.5 py-0.5 shadow-sm dark:shadow-lg">
                            {queue.length} left
                        </span>
                    </div>
                </div>

                {/* ── Card area ────────────────────────────────────────────── */}
                <div className="flex items-start justify-center w-full">
                    <main className="max-w-lg w-full px-3">
                        {/* Swipeable / animating card */}

                        <div
                            key={cardKey}
                            className={`bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 overflow-hidden select-none ${
                                exiting
                                    ? exitDir.current === "left"
                                        ? "card-exit-left"
                                        : "card-exit-right"
                                    : exitDir.current === "left"
                                      ? "card-enter-right"
                                      : "card-enter-left"
                            }`}
                        >
                            {/* Exercise group label */}
                            <div className="px-4">
                                <div className="h-px bg-gray-100 dark:bg-slate-800 mb-3" />
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                    Part of Exercise:{" "}
                                    {subcategory
                                        ? `${wordList.title} › ${subcategory.name}`
                                        : wordList.title}
                                </p>
                            </div>
                            {/* Top row: bookmark | word | speaker */}
                            <div className="flex items-center px-5 pt-5 pb-2">
                                <div className="flex-none w-8 flex justify-start">
                                    <button
                                        onClick={() => handleBookmark(word.id)}
                                        className="p-1 transition-colors"
                                        aria-label={
                                            bookmarks[word.id]
                                                ? "Remove bookmark"
                                                : "Bookmark word"
                                        }
                                    >
                                        <Bookmark
                                            className={`h-6 w-6 transition-colors ${
                                                bookmarks[word.id]
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            }`}
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col items-center text-center px-2">
                                    <h1
                                        className={`${wordFontSize(word.word)} font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight break-words w-full`}
                                    >
                                        {word.word}
                                        {word.parts_of_speech_variations && (
                                            <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-sm font-medium px-3 py-0.5 rounded-md ml-2">
                                                {
                                                    word.parts_of_speech_variations
                                                }
                                            </span>
                                        )}
                                    </h1>
                                </div>
                                <div className="flex-none w-8 flex justify-end">
                                    <button
                                        onClick={() => speakWord(word.word)}
                                        className="p-1 text-gray-500 hover:text-gray-700 transition"
                                    >
                                        <Volume2
                                            className="h-6 w-6"
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* ── 4-dot level badge ──────────────────────────── */}
                            {auth?.user && (
                                <div className="flex justify-center pb-1">
                                    <div
                                        className="flex items-center gap-1.5"
                                        style={{
                                            transform: levelUpPulse
                                                ? "scale(1.25)"
                                                : "scale(1)",
                                            transition:
                                                "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                                        }}
                                    >
                                        {[1, 2, 3, 4].map((box) => (
                                            <div
                                                key={box}
                                                className={`rounded-full w-2 h-2 transition-all duration-300 ${
                                                    box <= currentBox
                                                        ? (LEVEL_META[box]
                                                              ?.dot ??
                                                          "bg-gray-400")
                                                        : "bg-gray-200 dark:bg-slate-700"
                                                }`}
                                            />
                                        ))}
                                        <span
                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-1 ${meta.color}`}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Pronunciation */}
                            <div className="px-5 pb-4 text-center">
                                {word.pronunciation && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                                        {word.pronunciation}{" "}
                                        <span className="text-black">|</span>{" "}
                                        {formatIPA(word.ipa)}{" "}
                                        <span className="text-black">|</span>{" "}
                                        {word.bangla_pronunciation}
                                    </p>
                                )}
                            </div>

                            {/* Image */}
                            {images.length > 0 && (
                                <div className="px-4 pb-3">
                                    <div className="relative rounded-2xl overflow-hidden bg-[#EEF6F5] dark:bg-slate-800">
                                        <img
                                            src={activeImage?.image_url_full}
                                            alt={
                                                activeImage?.caption ||
                                                word.word
                                            }
                                            className="w-full h-auto object-contain"
                                            style={{
                                                maxHeight: "300px",
                                            }}
                                        />
                                        {currentBox >= MASTERED_BOX && (
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-green-500 dark:bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md dark:shadow-lg">
                                                    ✨ Mastered
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {images.length > 1 && (
                                        <div className="flex justify-center gap-1.5 mt-2">
                                            {images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() =>
                                                        setActiveImageIndex(idx)
                                                    }
                                                    className={`rounded-full transition-all ${
                                                        idx === activeImageIndex
                                                            ? "w-5 h-2 bg-gray-500 dark:bg-gray-400"
                                                            : "w-2 h-2 bg-gray-300 dark:bg-slate-700"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Example sentence */}
                            {/* {(word.image_related_sentence ||
                                word.example_sentences) && (
                                <div className="mx-4 mb-4 border-l-4 border-green-400 dark:border-green-600 pl-3 py-1">
                                    <p className="text-base text-gray-800 dark:text-gray-200 leading-snug">
                                        {highlightWord(
                                            word.image_related_sentence ||
                                                word.example_sentences,
                                            word.word,
                                        )}
                                    </p>
                                </div>
                            )} */}

                            {/* Example sentence */}
                            {word.show_example_sentences &&
                                (word.image_related_sentence ||
                                    word.example_sentences) && (
                                    <div className="mx-4 mb-4 border-l-4 border-green-400 dark:border-green-600 pl-3 py-1">
                                        <p className="text-base text-gray-800 dark:text-gray-200 leading-snug">
                                            {highlightWord(
                                                word.image_related_sentence ||
                                                    word.example_sentences,
                                                word.word,
                                            )}
                                        </p>
                                    </div>
                                )}

                            {/* Tap to see meaning */}
                            <div className="px-4 pb-3">
                                <button
                                    onClick={() => setShowMeaning(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600 transition"
                                >
                                    {showMeaning ? (
                                        <>
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                            Hide Meaning
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                            Tap to see meaning
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* end main card */}

                        {/* ── Meaning card ─────────────────────────────────────── */}
                        <div
                            ref={meaningCardRef}
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                                maxHeight: showMeaning ? "2000px" : "0px",
                                opacity: showMeaning ? 1 : 0,
                                marginTop: showMeaning ? "12px" : "0px",
                            }}
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 overflow-hidden pb-2">
                                <div className="mx-4 mt-4 mb-3">
                                    <p
                                        className={`text-center text-lg font-bold text-gray-500 underline dark:text-gray-600 tracking-tight`}
                                    >
                                        {word.word}
                                    </p>
                                </div>

                                {(word.definition || word.bangla_meaning) && (
                                    <div className="mx-4 mt-4 mb-4">
                                        <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 py-1">
                                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                                                Definition
                                            </p>
                                            <p className="text-sm text-gray-900 dark:text-gray-200 leading-snug">
                                                {word.definition}
                                                {word.bangla_meaning && (
                                                    <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                                                        ({word.bangla_meaning})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* {collocationList.length > 0 && (
                                    <div className="px-4 pb-4">
                                        <div className="h-px bg-gray-100 mb-3" />
                                        <p className="text-sm font-semibold text-gray-600 mb-2">
                                            Common Collocations
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {collocationList.map((col, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-sm px-3 py-1.5 rounded-full border ${collocationColors[i % collocationColors.length]}`}
                                                >
                                                    {col}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )} */}

                                {collocationList.length > 0 && (
                                    <div className="px-4 pb-4">
                                        <div className="h-px bg-gray-100 dark:bg-slate-800 mb-3" />
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                                            Common Collocations
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            {collocationList
                                                .slice(0, 3)
                                                .map((col, i) => {
                                                    const colorClass =
                                                        collocationColors[
                                                            i %
                                                                collocationColors.length
                                                        ];

                                                    // Highlight the collocation phrase inside the example sentence
                                                    const renderHighlighted = (
                                                        sentence,
                                                        phrase,
                                                    ) => {
                                                        if (
                                                            !sentence ||
                                                            !phrase
                                                        )
                                                            return sentence;
                                                        const regex =
                                                            new RegExp(
                                                                `(${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                                                                "gi",
                                                            );
                                                        return sentence
                                                            .split(regex)
                                                            .map((part, idx) =>
                                                                regex.test(
                                                                    part,
                                                                ) ? (
                                                                    <mark
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="font-bold bg-transparent underline underline-offset-2 decoration-2 not-italic"
                                                                        style={{
                                                                            textDecorationColor:
                                                                                "currentColor",
                                                                        }}
                                                                    >
                                                                        {part}
                                                                    </mark>
                                                                ) : (
                                                                    part
                                                                ),
                                                            );
                                                    };

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`rounded-xl border px-3 py-2.5 ${colorClass}`}
                                                        >
                                                            {/* Phrase badge */}
                                                            {/* <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-75">
                                                            {col.phrase}
                                                        </p> */}
                                                            {/* Example sentence with phrase highlighted */}
                                                            {col.example_sentence ? (
                                                                <p className="text-sm leading-snug dark:text-gray-100">
                                                                    {renderHighlighted(
                                                                        col.example_sentence,
                                                                        col.phrase,
                                                                    )}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-75 dark:text-gray-100">
                                                                    {col.phrase}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        {/* {collocationList.length > 3 && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                                                +{collocationList.length - 3}{" "}
                                                more collocation
                                                {collocationList.length - 3 > 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                        )} */}
                                    </div>
                                )}

                                {(word.synonym ||
                                    word.antonym ||
                                    word.bangla_synonym ||
                                    word.bangla_antonym) && (
                                    <div className="pb-4">
                                        <div className="h-px bg-gray-100 dark:bg-slate-800 mx-4 mb-4" />
                                        {(word.synonym || word.antonym) && (
                                            <div className="grid grid-cols-2 gap-0 mx-4 mb-4">
                                                {word.synonym ? (
                                                    <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 pr-2 py-1">
                                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                                            Synonyms
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                            {word.synonym}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div />
                                                )}
                                                {word.antonym ? (
                                                    <div className="border-l-4 border-blue-400 dark:border-blue-600 pl-3 pr-2 py-1">
                                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                                            Antonyms
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                            {word.antonym}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div />
                                                )}
                                            </div>
                                        )}
                                        {(word.bangla_synonym ||
                                            word.bangla_antonym) && (
                                            <div className="grid grid-cols-2 gap-0 mx-4">
                                                {word.bangla_synonym ? (
                                                    <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 pr-2 py-1">
                                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                                            প্রতিশব্দ
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                                                            {
                                                                word.bangla_synonym
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div />
                                                )}
                                                {word.bangla_antonym ? (
                                                    <div className="border-l-4 border-blue-400 dark:border-blue-600 pl-3 pr-2 py-1">
                                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                                            বিপরীত শব্দ
                                                        </p>
                                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                                                            {
                                                                word.bangla_antonym
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── I Don't Know / I Know buttons ─────────── */}
                                <div className="px-4 pt-4 pb-5">
                                    <div className="h-px bg-gray-100 dark:bg-slate-800 mb-4" />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDontKnow}
                                            disabled={isSubmitting}
                                            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-[15px] hover:bg-red-100 dark:hover:bg-red-950/50 active:scale-95 disabled:opacity-50 transition-all shadow-sm dark:shadow-md"
                                        >
                                            <X
                                                className="h-5 w-5"
                                                strokeWidth={2.5}
                                            />
                                            I Don't Know
                                        </button>
                                        <button
                                            onClick={handleKnow}
                                            disabled={isSubmitting}
                                            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-green-600 text-white font-bold text-[15px] hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-green-100 dark:shadow-green-900/30"
                                        >
                                            <Check
                                                className="h-5 w-5"
                                                strokeWidth={2.5}
                                            />
                                            I Know
                                        </button>
                                    </div>
                                    {/* Context hint */}
                                    {auth?.user && (
                                        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                                            {currentBox <= 1
                                                ? "New word — master it today in another session ✨"
                                                : currentBox === 2
                                                  ? "Learning — keep going, one more session!"
                                                  : currentBox === 3
                                                    ? "Reviewing — final push to mastery!"
                                                    : "✨ Already mastered — just confirming!"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* end meaning card */}
                    </main>
                </div>
            </div>

            {/* Card animations + confetti keyframes */}
            <style>{`
                @keyframes cardEnterRight {
                    from { opacity: 0; transform: translateX(60px)  scale(0.96); }
                    to   { opacity: 1; transform: translateX(0)      scale(1);    }
                }
                @keyframes cardEnterLeft {
                    from { opacity: 0; transform: translateX(-60px) scale(0.96); }
                    to   { opacity: 1; transform: translateX(0)      scale(1);    }
                }
                @keyframes cardExitLeft {
                    from { opacity: 1; transform: translateX(0)    scale(1);    }
                    to   { opacity: 0; transform: translateX(-80px) scale(0.94); }
                }
                @keyframes cardExitRight {
                    from { opacity: 1; transform: translateX(0)   scale(1);    }
                    to   { opacity: 0; transform: translateX(80px) scale(0.94); }
                }
                .card-enter-right { animation: cardEnterRight 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
                .card-enter-left  { animation: cardEnterLeft  0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
                .card-exit-left   { animation: cardExitLeft   0.18s ease-in forwards; pointer-events: none; }
                .card-exit-right  { animation: cardExitRight  0.18s ease-in forwards; pointer-events: none; }

                @keyframes confettiFall {
                    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                    100% { transform: translateY(110vh)  rotate(720deg); opacity: 0; }
                }
                @keyframes bounceIn {
                    0%   { opacity: 0; transform: scale(0.5) translateY(-20px); }
                    60%  { opacity: 1; transform: scale(1.08) translateY(4px);  }
                    100% { opacity: 1; transform: scale(1)    translateY(0);    }
                }
                .animate-bounce-in { animation: bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
            `}</style>

            {/* Login Dialog */}
            <AlertDialog
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-[#E5201C]" /> Login
                            Required
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            You need to be logged in to track your progress. Log
                            in to save your results.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                            Skip for now
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                window.location.href = route("login");
                            }}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            Go to Login
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
