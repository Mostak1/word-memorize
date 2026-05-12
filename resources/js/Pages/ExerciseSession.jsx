import { Head, Link, router } from "@inertiajs/react";
import Lottie from "lottie-react";
import CryptoJS from "crypto-js";
import AppLayout from "@/Layouts/AppLayout";
import approvedAnimation from "../../../public/lottie/Approved.json";
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
import QuizPanel from "@/Pages/ExerciseSession/QuizPanel";
import StreakPop from "@/Components/StreakPop";
import ListCompletedOverlay from "@/Components/ListCompletedOverlay";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import FlashMessages from "@/Components/FlashMessage";
import XpCounter from "@/Components/XpCounter";
import { usePage } from "@inertiajs/react";
import {
    playCorrect,
    playIncorrect,
    playSessionComplete,
    playMastered,
} from "@/Utils/sounds";
import { useTranslation } from "@/Contexts/LanguageContext";
import { telemetry } from "@/Utils/telemetry";

// ── Constants ─────────────────────────────────────────────────────────────────
const MASTERED_BOX = 4;
const SECRET_KEY = "wm-cache-secure-key";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Confetti pieces — stable (generated once outside component)
const CONFETTI = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${(i * 1.66) % 100}%`,
    delay: `${(i * 0.06) % 0.8}s`,
    duration: `${2 + (i % 7) * 0.3}s`,
    color: [
        "#E5201C",
        "#22c55e",
        "#3b82f6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
    ][i % 7],
    size: 7 + (i % 6) * 2,
    borderRadius: i % 3 === 0 ? "50%" : "2px",
}));

const MAX_CACHED_SESSIONS = 2;

const pruneOldCaches = () => {
    const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("cached-session-"),
    );
    if (keys.length <= MAX_CACHED_SESSIONS) return;

    // Sort by the timestamp stored inside each cached JSON
    const entries = keys
        .map((key) => {
            try {
                const encrypted = localStorage.getItem(key);
                const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
                const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                return { key, timestamp: data.timestamp || 0 };
            } catch {
                return { key, timestamp: 0 };
            }
        })
        .sort((a, b) => a.timestamp - b.timestamp);

    const toRemove = entries.slice(0, entries.length - MAX_CACHED_SESSIONS);
    toRemove.forEach(({ key }) => localStorage.removeItem(key));
};

// Image preloader utility – now preloads EVERYTHING with progress
const preloadImages = async (words, onProgress) => {
    const allImages = [];

    words.forEach((word) => {
        if (word.images?.length) {
            word.images.forEach((img) => {
                if (img.image_url_full) allImages.push(img.image_url_full);
            });
        }
    });

    if (allImages.length === 0) {
        onProgress?.(100);
        return;
    }

    let loaded = 0;
    const total = allImages.length;
    const batchSize = 8;

    for (let i = 0; i < allImages.length; i += batchSize) {
        const batch = allImages.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(
                (src) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.onload = img.onerror = () => {
                            loaded++;
                            onProgress?.(Math.round((loaded / total) * 100));
                            resolve(null);
                        };
                        img.src = src;
                    }),
            ),
        );
    }

    onProgress?.(100);
};

function MasteryOverlay({ word }) {
    const { t } = useTranslation();
    const [flash, setFlash] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setFlash(false), 900);
        const t2 = setTimeout(() => setVisible(false), 1800);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    if (!visible) return null;

    return (
        <>
            {/* Green flash */}
            {flash && (
                <div className="fixed inset-0 pointer-events-none z-40 bg-green-400/20" />
            )}
            {/* Confetti + badge */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {CONFETTI.map((p) => (
                    <div
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: p.left,
                            top: "-40px",
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            borderRadius: p.borderRadius,
                            opacity: 0,
                            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
                        }}
                    />
                ))}
                <div className="absolute inset-x-0 top-24 flex justify-center pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-slate-900 px-8 py-4 text-center animate-bounce-in border border-green-100 dark:border-green-900">
                        <p className="text-3xl mb-1">🌟</p>
                        <p className="text-lg font-extrabold text-green-600 dark:text-green-400">
                            {/* {word}! */}
                            {t("exercise.mastery.title")}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {t("exercise.mastery.desc")}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ExerciseSession({
    wordList,
    subcategory,
    words: initialWords,
    totalWordsInList = 0,
    backUrl = null,
    bookmarkedWordIds = [],
    streak: initialStreak = null,
    xp_enabled = true,
    isQuizOnly = false,
}) {
    const { t } = useTranslation();

    const LEVEL_META = {
        1: {
            label: t("srs.new"),
            color: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
            dot: "bg-gray-400 dark:bg-slate-600",
        },
        2: {
            label: t("srs.learning"),
            color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
            dot: "bg-cyan-400 dark:bg-cyan-500",
        },
        3: {
            label: t("srs.reviewing"),
            color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
            dot: "bg-orange-400 dark:bg-orange-500",
        },
        4: {
            label: t("srs.mastered"),
            color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
            dot: "bg-green-500 dark:bg-green-400",
        },
    };

    const { auth, userSettings } = usePage().props;
    const [streak, setStreak] = useState(initialStreak);
    const [streakChange, setStreakChange] = useState(null);
    const [showStreakEffect, setShowStreakEffect] = useState(false);
    const [isPreloading, setIsPreloading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const previousStreak = useRef(initialStreak?.current_streak ?? 0);

    const [listCompletionData, setListCompletionData] = useState(null);
    const [showListOverlay, setShowListOverlay] = useState(false);

    const approvedAnim = approvedAnimation;

    // const [streakValue, setStreakValue] = useState(1);
    // ── Queue state ───────────────────────────────────────────────────────────
    // The Active Queue: queue[0] is always the current word.
    // "I Know"       → remove from front (word leaves session).
    // "I Don't Know" → remove from front (word leaves session).
    const [queue, setQueue] = useState(() =>
        initialWords.map((w) => ({ ...w })),
    );
    const initialQueueSize = useMemo(() => initialWords.length, []);

    // ── Session stats ─────────────────────────────────────────────────────────
    const [promotedCount, setPromotedCount] = useState(0); // words answered "I Know"
    const [dontKnowCount, setDontKnowCount] = useState(0); // total "I Don't Know" taps
    const [sessionXpAwarded, setSessionXpAwarded] = useState(0); // XP earned this session

    const [sessionResults, setSessionResults] = useState([]);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingVisit, setPendingVisit] = useState(null);
    const allowNavigation = useRef(false);

    // Total cards processed in this session (used for progress bar)
    const answeredCount = promotedCount + dontKnowCount;

    // ── UI state ──────────────────────────────────────────────────────────────
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [bookmarks, setBookmarks] = useState(() =>
        Object.fromEntries(bookmarkedWordIds.map((id) => [id, true])),
    );
    const [showMeaning, setShowMeaning] = useState(false);
    const [showAlreadyKnowDialog, setShowAlreadyKnowDialog] = useState(false);
    const [pendingKnowWord, setPendingKnowWord] = useState(null);

    // ── Card animation state ──────────────────────────────────────────────────
    // exitDir: 'left' = I Know (word leaves), 'right' = I Don't Know (shuffles back)
    const exitDir = useRef("left");
    const [cardKey, setCardKey] = useState(0);
    const [exiting, setExiting] = useState(false);

    // ── Gamification state ────────────────────────────────────────────────────
    // masteryEventKey increments on every mastery so each event gets its own
    // keyed overlay instance with independent timers — rapid presses each
    // play their full animation without cancelling the previous one.
    const [masteryEventKey, setMasteryEventKey] = useState(0);
    const [levelUpPulse, setLevelUpPulse] = useState(false);

    const triggerAchievements = () => {
        window.dispatchEvent(new CustomEvent("check-achievements"));
    };

    // Current word is always the front of the queue
    const word = queue[0] ?? null;
    const isDone = queue.length === 0 && !exiting;
    const isDoneRef = useRef(isDone);
    const completedRef = useRef(false);
    const latestSessionRef = useRef({
        answeredCount: 0,
        promotedCount: 0,
        dontKnowCount: 0,
        remainingCount: initialQueueSize,
        currentWordId: null,
    });
    useEffect(() => {
        isDoneRef.current = isDone;
    }, [isDone]);

    useEffect(() => {
        latestSessionRef.current = {
            answeredCount,
            promotedCount,
            dontKnowCount,
            remainingCount: queue.length,
            currentWordId: word?.id ?? null,
        };
    }, [answeredCount, promotedCount, dontKnowCount, queue.length, word?.id]);

    useEffect(() => {
        telemetry.track("exercise_started", {
            wordlist_id: wordList?.id ?? null,
            wordlist_title: wordList?.title ?? null,
            subcategory_id: subcategory?.id ?? null,
            total_words: initialQueueSize,
            is_quiz_only: !!isQuizOnly,
        });

        return () => {
            if (completedRef.current || initialQueueSize === 0) return;

            telemetry.track("exercise_abandoned", {
                wordlist_id: wordList?.id ?? null,
                wordlist_title: wordList?.title ?? null,
                subcategory_id: subcategory?.id ?? null,
                total_words: initialQueueSize,
                ...latestSessionRef.current,
            });
        };
    }, []);

    useEffect(() => {
        if (!word) return;

        telemetry.track("exercise_word_viewed", {
            word_id: word.id,
            wordlist_id: wordList?.id ?? null,
            srs_box: word.srs_box ?? 1,
            is_quiz: !!word.is_quiz,
            remaining_count: queue.length,
        });
    }, [word?.id]);

    // const [openCollocationIndex, setOpenCollocationIndex] = useState(null);
    const meaningCardRef = useRef(null);
    const buttonsRef = useRef(null);

    // Reset per-card UI when the front of the queue changes
    useEffect(() => {
        if (!word) return;

        // 🧠 Dynamic Quiz Filtering:
        // Quizzes should only show if the user has already "learned" the word
        // and is not already "mastered" (Box 5+).
        if (word.is_quiz) {
            const result = sessionResults.find((r) => r.word_id === word.id);
            const isReviewWord = (word.srs_box ?? 1) > 1;
            const isMastered =
                (word.srs_box ?? 1) >= 5 || result?.action === "master";

            // Skip conditions:
            // 1. User marked it as "Don't Know" in this session.
            // 2. It's a "New" word and hasn't been answered correctly yet in this session.
            // 3. The word is already Mastered (either before or during this session).
            const shouldSkip =
                result?.action === "learn" ||
                (!result && !isReviewWord) ||
                isMastered;

            if (shouldSkip) {
                // Silently skip to the next item in the queue
                setQueue((prev) => prev.slice(1));
                return;
            }
        }

        setActiveImageIndex(0);
        setShowMeaning(false);
    }, [word?.id, sessionResults]);

    // Auto-scroll to I Know / I Don't Know buttons when meaning is revealed
    useEffect(() => {
        if (showMeaning && buttonsRef.current) {
            setTimeout(() => {
                buttonsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center", // Center buttons to avoid being obscured by BottomNav
                });
            }, 300);
        }
    }, [showMeaning]);

    useEffect(() => {
        // Push a proxy state into the history API so the first back-button press
        // doesn't actually leave the page.
        window.history.pushState(null, "", window.location.href);

        const handlePopState = (event) => {
            if (!isDoneRef.current && !allowNavigation.current) {
                // Prevent Inertia from handling the popstate event
                event.stopPropagation();
                // Push the proxy state again to intercept the next back button
                window.history.pushState(null, "", window.location.href);
                setPendingVisit({ type: "popstate" });
                setShowLeaveDialog(true);
            }
        };

        window.addEventListener("popstate", handlePopState, { capture: true });

        const handleBefore = (event) => {
            if (!isDoneRef.current && !allowNavigation.current) {
                // Ignore bookmark actions as they don't leave the page
                if (event.detail.visit.url.toString().includes("/bookmark"))
                    return;

                event.preventDefault();
                setPendingVisit(event.detail.visit);
                setShowLeaveDialog(true);
            }
        };

        const handleBeforeUnload = (e) => {
            if (!isDoneRef.current && !allowNavigation.current) {
                e.preventDefault();
                e.returnValue =
                    "Are you sure you want to leave? You will lose the exercises progress";
            }
        };

        const removeListener = router.on("before", handleBefore);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("popstate", handlePopState, {
                capture: true,
            });
            removeListener();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!isDone || initialQueueSize === 0) return;

        completedRef.current = true;
        telemetry.track("exercise_completed", {
            wordlist_id: wordList?.id ?? null,
            wordlist_title: wordList?.title ?? null,
            subcategory_id: subcategory?.id ?? null,
            total_words: initialQueueSize,
            promoted_count: promotedCount,
            dont_know_count: dontKnowCount,
            result_count: sessionResults.length,
            is_quiz_only: !!isQuizOnly,
        });

        if (!auth?.user) return;

        playSessionComplete(userSettings);

        const _xsrfRow = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="));
        const csrfToken = _xsrfRow
            ? decodeURIComponent(_xsrfRow.substring("XSRF-TOKEN=".length))
            : "";

        let immediateAnimationTriggered = false;

        // ── Immediate Streak Animation ─────────────────────────────────────
        // Trigger animation immediately for better UX if it's the first session today
        if (
            !initialStreak?.active_today &&
            (initialStreak?.current_streak ?? 0) >= 0
        ) {
            immediateAnimationTriggered = true;
            setStreakChange("up");
            setShowStreakEffect(true);
            setTimeout(() => setShowStreakEffect(false), 2800);

            // Also update the local streak count immediately so the UI doesn't jump
            const predictedStreak = (initialStreak?.current_streak ?? 0) + 1;
            setStreak((prev) =>
                prev
                    ? {
                          ...prev,
                          current_streak: predictedStreak,
                          active_today: true,
                      }
                    : null,
            );
        }

        fetch(route("word.session-complete"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            body: JSON.stringify({
                wordlist_id: wordList?.id,
                results: sessionResults,
                is_quiz_only: !!isQuizOnly,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                let streakIncreased = false;

                if (data.xp_awarded && xp_enabled) {
                    setSessionXpAwarded(data.xp_awarded);
                    // playXpPurchase();
                }

                if (data.streak) {
                    const newStreak = data.streak.current_streak ?? 0;
                    const prevStreak = previousStreak.current;

                    // Only trigger if not already triggered by the immediate effect
                    if (
                        (newStreak > prevStreak ||
                            (newStreak === prevStreak &&
                                !initialStreak?.active_today &&
                                newStreak > 0)) &&
                        !immediateAnimationTriggered
                    ) {
                        streakIncreased = true;
                        setStreakChange("up");
                        // Show Fire Streak Animation with the NEW streak count
                        setShowStreakEffect(true);
                        // Auto hide after animation
                        setTimeout(() => setShowStreakEffect(false), 2800);
                    } else if (newStreak < prevStreak) {
                        setStreakChange("down");
                    }

                    previousStreak.current = newStreak;
                    setStreak(data.streak);
                }

                if (data.list_completed) {
                    setListCompletionData({ name: data.list_name });
                }

                // If streak increased, StreakPop will handle the achievement check onComplete
                if (!streakIncreased) {
                    triggerAchievements();
                }
            })
            .catch(() => {});
    }, [isDone, auth?.user]);

    useEffect(() => {
        const handleAchievementsDismissed = () => {
            if (listCompletionData) {
                setShowListOverlay(true);
            }
        };
        window.addEventListener(
            "achievements-dismissed",
            handleAchievementsDismissed,
        );
        return () =>
            window.removeEventListener(
                "achievements-dismissed",
                handleAchievementsDismissed,
            );
    }, [listCompletionData]);

    // Background preload next few words (fixed)
    useEffect(() => {
        if (!queue.length || isPreloading) return;
        // Only preload next 3 words, no progress needed
        const nextWords = queue.slice(0, 3);
        preloadImages(nextWords, null); // null = no progress callback
    }, [queue.length, isPreloading]);

    // Initial full preload + localStorage cache
    useEffect(() => {
        const runPreload = async () => {
            // ── Try cached version first ─────────────────────────────
            if (wordList?.id) {
                try {
                    const encrypted = localStorage.getItem(
                        `cached-session-${wordList.id}`,
                    );
                    if (encrypted) {
                        const bytes = CryptoJS.AES.decrypt(
                            encrypted,
                            SECRET_KEY,
                        );
                        const cacheData = JSON.parse(
                            bytes.toString(CryptoJS.enc.Utf8),
                        );
                        const age = Date.now() - (cacheData.timestamp ?? 0);
                        if (age < CACHE_TTL_MS && cacheData.words?.length) {
                            // Cache is fresh → skip preloading, use cached words
                            setQueue(cacheData.words.map((w) => ({ ...w })));
                            setIsPreloading(false);
                            return; // early exit – no preload needed
                        } else {
                            // Cache expired → remove it so it can be recreated
                            localStorage.removeItem(
                                `cached-session-${wordList.id}`,
                            );
                        }
                    }
                } catch (e) {
                    // Invalid cache data → just ignore and preload normally
                }
            }

            // ── Normal preload (first time or cache invalid) ─────────
            setIsPreloading(true);
            setLoadingProgress(0);

            await preloadImages(initialWords, setLoadingProgress);

            // Cache words JSON for future visits
            // if (wordList?.id && initialWords.length > 0) {
            //     try {
            //         const cacheData = JSON.stringify({
            //             words: initialWords,
            //             timestamp: Date.now(),
            //         });
            //         // Obfuscating cache data so casual users cannot read it
            //         const SECRET_KEY = "wm-cache-secure-key";
            //         const encryptedData = CryptoJS.AES.encrypt(
            //             cacheData,
            //             SECRET_KEY,
            //         ).toString();

            //         localStorage.setItem(
            //             `cached-session-${wordList.id}`,
            //             encryptedData,
            //         );
            //     } catch (e) {}
            // }

            // Cache the fresh data after preload
            if (wordList?.id && initialWords.length > 0) {
                try {
                    const cacheData = JSON.stringify({
                        words: initialWords,
                        timestamp: Date.now(),
                    });
                    const encrypted = CryptoJS.AES.encrypt(
                        cacheData,
                        SECRET_KEY,
                    ).toString();
                    localStorage.setItem(
                        `cached-session-${wordList.id}`,
                        encrypted,
                    );
                    pruneOldCaches();
                } catch (e) {}
            }

            setIsPreloading(false);
            setLoadingProgress(100);
        };

        runPreload();
    }, [initialWords, wordList?.id]);

    // Snap scroll to top when a new word appears — timed to coincide with the
    // card exit animation so the position reset is invisible to the user.
    useEffect(() => {
        if (!word?.id) return;
        // Fire at ~180ms so the page resets while the old card is fading out,
        // before the new card enters view (exit anim duration = 200ms).
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "instant" });
        }, 180);
        return () => clearTimeout(timer);
    }, [word?.id]);

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
                <strong
                    key={i}
                    className="font-bold text-gray-900 dark:text-yellow-300"
                >
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
        telemetry.track("bookmark_toggled", {
            word_id: wordId,
            source: "exercise_session",
            enabled: !bookmarks[wordId],
        });
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
    // Removed pingServer in favor of batch updating at the end of session.

    // ── Animate then mutate queue ─────────────────────────────────────────────
    // const animateThen = (direction, callback) => {
    //     exitDir.current = direction;

    //     setShowMeaning(false);

    //     setExiting(true);

    //     setTimeout(() => {
    //         setExiting(false);
    //         setCardKey((k) => k + 1);
    //         callback();
    //     }, 200);
    // };

    const animateThen = (direction, callback) => {
        exitDir.current = direction;

        // Force close meaning card immediately
        setShowMeaning(false);

        setExiting(true);

        // Increased from 200ms to 400ms to ensure mastery overlay animations
        // complete before the queue updates, preventing blank screen bugs
        // when multiple words are mastered consecutively
        setTimeout(() => {
            setExiting(false);
            setCardKey((k) => k + 1);
            callback();
        }, 400);
    };

    const handleToggleMeaning = () => {
        const nextValue = !showMeaning;
        setShowMeaning(nextValue);

        if (nextValue && word) {
            telemetry.track("exercise_meaning_revealed", {
                word_id: word.id,
                wordlist_id: wordList?.id ?? null,
                srs_box: word.srs_box ?? 1,
            });
        }
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
    // Duration of MasteryOverlay visibility (must match the t2 timeout inside MasteryOverlay)
    const MASTERY_ANIM_MS = 1800;

    const handleKnow = () => {
        if (!word) return;
        if (!auth?.user) {
            setShowLoginDialog(true);
            return;
        }
        if (isSubmitting) return;

        const currentBox = word.srs_box ?? 1;
        const willMaster = currentBox >= MASTERED_BOX - 1; // L3 → L4

        // ✅ "Double Know" check: if Box 2 and they have 1 correct / 0 incorrect,
        // it means this is their second time seeing it and they got it right twice.
        const isDoubleKnowCandidate =
            currentBox === 2 &&
            word.srs_correct === 1 &&
            word.srs_incorrect === 0;

        if (isDoubleKnowCandidate && !willMaster) {
            setPendingKnowWord(word);
            setShowAlreadyKnowDialog(true);
            return;
        }

        processKnowAction(false);
    };

    /**
     * Handles the decision from the "Do you already know this word?" popup.
     */
    const handleAlreadyKnowConfirm = (confirmMastery) => {
        setShowAlreadyKnowDialog(false);
        if (confirmMastery) {
            processKnowAction(true); // fast-track to mastery
        } else {
            processKnowAction(false); // normal progression to Box 3
        }
    };

    /**
     * Shared logic for "I Know" and "Already Know" confirmation.
     * @param {boolean} forceMaster - if true, the word is sent to MASTERED_BOX immediately.
     */
    const processKnowAction = (forceMaster = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const currentBox = word.srs_box ?? 1;
        const willMaster = forceMaster || currentBox >= MASTERED_BOX - 1;
        const willLevelUp = currentBox < MASTERED_BOX;

        if (willMaster) {
            playMastered(userSettings);
            setMasteryEventKey((k) => k + 1);
        } else {
            playCorrect(userSettings);
            if (willLevelUp) {
                setLevelUpPulse(true);
                setTimeout(() => setLevelUpPulse(false), 500);
            }
        }

        const wordId = word.id;
        const action = forceMaster ? "master" : "know";

        telemetry.track("exercise_word_answered", {
            word_id: wordId,
            wordlist_id: wordList?.id ?? null,
            action,
            srs_box: currentBox,
            will_master: willMaster,
            force_master: forceMaster,
        });

        // Update remaining items in the queue locally so that future occurrences
        // (like quizzes) of this same word reflect the updated SRS status.
        const syncUpdatedQueue = (prevQueue) => {
            return prevQueue.map((item) => {
                if (item.id === wordId) {
                    const nextBox = forceMaster
                        ? MASTERED_BOX
                        : Math.min((item.srs_box ?? 1) + 1, MASTERED_BOX);
                    const meta = LEVEL_META[nextBox] ?? LEVEL_META[1];
                    return {
                        ...item,
                        srs_box: nextBox,
                        srs_label: meta.label,
                        srs_color: meta.color,
                        srs_correct: (item.srs_correct ?? 0) + 1,
                    };
                }
                return item;
            });
        };

        if (willMaster) {
            setShowMeaning(false);
            window.scrollTo({ top: 0, behavior: "instant" });

            setTimeout(() => {
                exitDir.current = "left";
                setExiting(true);
            }, MASTERY_ANIM_MS - 300);

            setTimeout(() => {
                setExiting(false);
                setSessionResults((prev) => [
                    ...prev,
                    { word_id: wordId, action: action },
                ]);
                setQueue((prev) => syncUpdatedQueue(prev.slice(1)));
                setPromotedCount((c) => c + 1);
                setCardKey((k) => k + 1);
                setIsSubmitting(false);
                setPendingKnowWord(null);
            }, MASTERY_ANIM_MS);
        } else {
            animateThen("left", () => {
                setSessionResults((prev) => [
                    ...prev,
                    { word_id: wordId, action: action },
                ]);
                setQueue((prev) => syncUpdatedQueue(prev.slice(1)));
                setPromotedCount((c) => c + 1);
                setIsSubmitting(false);
                setPendingKnowWord(null);
            });
        }
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

        // playIncorrect(userSettings);
        setIsSubmitting(true);

        const wordId = word.id;

        telemetry.track("exercise_word_answered", {
            word_id: wordId,
            wordlist_id: wordList?.id ?? null,
            action: "learn",
            srs_box: word.srs_box ?? 1,
            will_master: false,
            force_master: false,
        });

        animateThen("right", () => {
            setSessionResults((prev) => [
                ...prev,
                { word_id: wordId, action: "learn" },
            ]);
            setDontKnowCount((c) => c + 1);
            setQueue((prev) => {
                const nextQueue = prev.slice(1);
                return nextQueue.map((item) => {
                    if (item.id === wordId) {
                        const meta = LEVEL_META[1];
                        return {
                            ...item,
                            srs_box: 1,
                            srs_label: meta.label,
                            srs_color: meta.color,
                            srs_incorrect: (item.srs_incorrect ?? 0) + 1,
                        };
                    }
                    return item;
                });
            });
            setIsSubmitting(false);
        });
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
        const rawBangla = word?.bangla_collocations;

        if (!raw) return [];

        let items = [];

        // Case 1: already array (ideal future case)
        if (Array.isArray(raw)) {
            items = raw;
        } else {
            // Case 2: JSON string
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) items = parsed;
            } catch (e) {
                // Case 3: fallback (old comma-separated string)
                items = raw
                    .split(/[\n,]+/)
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((phrase) => ({
                        phrase,
                        example_sentence: "",
                    }));
            }
        }

        // Merge Bangla if enabled
        if (userSettings?.show_bangla && rawBangla) {
            try {
                const parsedBangla = JSON.parse(rawBangla);
                if (Array.isArray(parsedBangla)) {
                    items = items.map((item, idx) => {
                        if (parsedBangla[idx]) {
                            return {
                                ...item,
                                bangla: parsedBangla[idx],
                            };
                        }
                        return item;
                    });
                }
            } catch (e) {}
        }

        return items;
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

    const handleQuizAnswer = (isCorrect) => {
        if (isCorrect) {
            handleKnow();
        } else {
            handleDontKnow();
        }
    };

    // ── Loading Screen ─────────────────────────────────────────────────────
    if (isPreloading) {
        return (
            <AppLayout hideHeader={true} showBottomNav={false}>
                <Head title="Loading Session..." />
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 border-4 border-[#E5201C] border-t-transparent rounded-full animate-spin" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {t("exercise.loading.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t("exercise.loading.desc")}
                        </p>

                        <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-[#E5201C] transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>

                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 text-center">
                            {loadingProgress}%
                            {/* — {initialWords.length} words •{" "}
                            {initialWords.reduce(
                                (sum, w) => sum + (w.images?.length || 0),
                                0,
                            )}{" "}
                            images */}
                        </p>

                        {/* <p className="text-[10px] text-gray-400 mt-8">
                            This only happens the first time.
                            <br />
                            Images are cached in your browser for future
                            sessions.
                        </p> */}
                    </div>
                </div>
            </AppLayout>
        );
    }

    // ── Empty queue (nothing due, nothing new) ────────────────────────────────
    if (initialQueueSize === 0) {
        return (
            <AppLayout hideHeader={true} showBottomNav={false}>
                <Head title="All Caught Up!" />
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            {t("exercise.empty.title")}
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                            {t("exercise.empty.desc")}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={route("words.mastered")}
                                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                            >
                                {t("exercise.empty.view_mastered")}
                            </Link>
                            <Link
                                href={backHref}
                                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900 transition"
                            >
                                <ChevronLeft className="h-4 w-4" />{" "}
                                {t("exercise.empty.back_to_list")}
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
            <AppLayout hideHeader={true} showBottomNav={false}>
                <Head title="Session Complete" />
                {/* StreakPop overlay — only for streak increase */}
                {showStreakEffect && streakChange === "up" && (
                    <StreakPop
                        streakCount={streak?.current_streak ?? 1}
                        onComplete={() => {
                            setShowStreakEffect(false);
                            triggerAchievements();
                        }}
                    />
                )}

                {showListOverlay && (
                    <ListCompletedOverlay
                        listName={listCompletionData?.name}
                        onDismiss={() => setShowListOverlay(false)}
                    />
                )}

                {/* Global confetti celebration for EVERY completed session */}
                <div
                    key="complete-confetti"
                    className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
                >
                    {CONFETTI.map((p) => (
                        <div
                            key={p.id}
                            style={{
                                position: "absolute",
                                left: p.left,
                                top: "-40px",
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                backgroundColor: p.color,
                                borderRadius: p.borderRadius,
                                opacity: 0,
                                animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
                            }}
                        />
                    ))}
                </div>

                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                        {/* Lottie celebration animation */}
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
                            {t("exercise.complete.title")}
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div
                                className="bg-green-50 dark:bg-green-950/30 rounded-2xl py-4 animate-bounce-in"
                                style={{ animationDelay: "0.1s" }}
                            >
                                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                                    {promotedCount}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">
                                    {t("exercise.complete.cleared")}
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
                                    {t("exercise.complete.retries")}
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
                                    {t("exercise.complete.total_reps")}
                                </p>
                            </div>
                        </div>

                        {/* XP Earned Display */}
                        {sessionXpAwarded > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl py-8 px-4 mb-8 text-center border-2 border-yellow-200 dark:border-yellow-800 shadow-sm overflow-hidden relative group">
                                <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <XpCounter targetXp={sessionXpAwarded} />
                                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mt-2 tracking-wide uppercase">
                                    {t("exercise.complete.xp_earned")}
                                </p>
                            </div>
                        )}

                        {/* No-XP notice for non-admin word lists */}
                        {!xp_enabled && (
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl py-4 px-4 mb-8 text-center border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-center gap-2">
                                    <Zap className="h-4 w-4 text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("exercise.complete.xp_custom_list")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Only show streak when streak INCREASED - hide completely when unchanged or decreased */}
                        {streak && streakChange === "up" && (
                            <div
                                className={`rounded-2xl py-4 px-4 mb-6 border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 animate-bounce-in`}
                            >
                                <p
                                    className={`text-lg font-bold mb-1 text-orange-600 dark:text-orange-400`}
                                >
                                    {t("exercise.complete.streak", {
                                        count: streak.current_streak,
                                        plural:
                                            streak.current_streak !== 1
                                                ? "s"
                                                : "",
                                    })}
                                </p>
                                <p
                                    className={`text-sm text-orange-700 dark:text-orange-300`}
                                >
                                    {t("exercise.complete.streak_message")}
                                </p>
                            </div>
                        )}

                        {/* List-level progress bar */}
                        {totalWordsInList > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                                    <span>
                                        {t("exercise.complete.progress_label")}
                                    </span>
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
                                    {t("exercise.complete.progress_detail", {
                                        count: promotedCount,
                                        total: totalWordsInList,
                                    })}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Link
                                href={route("wordlist.start", wordList.id)}
                                className="w-full py-3.5 bg-[#E5201C] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition"
                            >
                                {t("exercise.complete.new_session")}
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
                                    {t("exercise.complete.view_bookmarks")}
                                </Link>
                            )}
                            <Link
                                href={backHref}
                                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900 transition"
                            >
                                <ChevronLeft className="h-4 w-4" />{" "}
                                {t("exercise.complete.back_to_list")}
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
        initialQueueSize > 0
            ? ((initialQueueSize - queue.length) / initialQueueSize) * 100
            : 0;

    return (
        <AppLayout hideHeader={true} showBottomNav={false}>
            <Head title={`Exercise — ${word?.word ?? ""}`} />
            <FlashMessages />

            {/* ── Mastery overlay — keyed so each event is an independent instance ── */}
            {masteryEventKey > 0 && (
                <MasteryOverlay key={masteryEventKey} word={word?.word} />
            )}

            {/* ── Streak animation ── */}
            {showStreakEffect && (
                <StreakPop
                    streakCount={streak?.current_streak ?? 1}
                    onComplete={() => {
                        setShowStreakEffect(false);
                        triggerAchievements();
                    }}
                />
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
                        <div className="flex items-center gap-2">
                            {/* <button
                                onClick={() => {
                                    setStreakChange("up");
                                    setShowStreakEffect(true);
                                }}
                                className="shrink-0 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-full px-2 py-0.5 shadow-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                Test Streak
                            </button> */}
                            <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-2.5 py-0.5 shadow-sm dark:shadow-lg">
                                {t("exercise.left", {
                                    count: queue.length,
                                })}
                            </span>
                        </div>
                        {/* Bookmarks shortcut */}
                        {/* {auth?.user && (
                            <Link
                                href={route("words.bookmarked")}
                                className="flex-none p-1.5 rounded-lg text-gray-400 dark:text-gray-600 hover:text-yellow-500 dark:hover:text-yellow-400 transition"
                                aria-label="View bookmarked words"
                            >
                                <Bookmark
                                    className="h-5 w-5"
                                    strokeWidth={1.8}
                                />
                            </Link>
                        )} */}
                    </div>
                </div>

                {/* ── Card area ────────────────────────────────────────────── */}
                <div className="flex items-start justify-center w-full">
                    <main className="max-w-lg w-full px-3">
                        {word?.is_quiz ? (
                            <div
                                key={cardKey}
                                className={`py-4 ${
                                    exiting
                                        ? exitDir.current === "left"
                                            ? "card-exit-left"
                                            : "card-exit-right"
                                        : exitDir.current === "left"
                                          ? "card-enter-right"
                                          : "card-enter-left"
                                }`}
                            >
                                <QuizPanel
                                    question={word}
                                    onAnswer={handleQuizAnswer}
                                />
                            </div>
                        ) : (
                            <>
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
                                            {t(
                                                "exercise.card.part_of_exercise",
                                            )}{" "}
                                            {subcategory
                                                ? `${wordList.title} › ${subcategory.name}`
                                                : wordList.title}
                                        </p>
                                    </div>
                                    {/* Top row: bookmark | word | speaker */}
                                    <div className="flex items-center px-5 pt-5 pb-2">
                                        <div className="flex-none w-8 flex justify-start">
                                            <button
                                                onClick={() =>
                                                    handleBookmark(word.id)
                                                }
                                                className="p-1 transition-colors"
                                                aria-label={
                                                    bookmarks[word.id]
                                                        ? t(
                                                              "exercise.card.bookmark_remove",
                                                              "Remove bookmark",
                                                          )
                                                        : t(
                                                              "exercise.card.bookmark_add",
                                                              "Bookmark word",
                                                          )
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
                                                onClick={() =>
                                                    speakWord(word.word)
                                                }
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
                                                        className={`rounded-full w-2 h-2 transition-all duration-200 ${
                                                            box <= currentBox
                                                                ? (LEVEL_META[
                                                                      box
                                                                  ]?.dot ??
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
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    {word.pronunciation}{" "}
                                                </span>
                                                <span className="text-black">
                                                    |
                                                </span>{" "}
                                                <span className="text-teal-600 dark:text-teal-400">
                                                    {formatIPA(word.ipa)}{" "}
                                                </span>
                                                {userSettings?.show_bangla}
                                                {/* Show Bangla only if user setting allows it */}
                                                {userSettings?.show_bangla &&
                                                    word.bangla_pronunciation && (
                                                        <>
                                                            {" "}
                                                            <span className="text-black">
                                                                |
                                                            </span>{" "}
                                                            <span className="text-orange-600 dark:text-orange-400">
                                                                {
                                                                    word.bangla_pronunciation
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                            </p>
                                        )}
                                    </div>

                                    {/* Image */}
                                    {images.length > 0 && (
                                        <div className="px-4 pb-3">
                                            <div className="relative rounded-2xl overflow-hidden bg-[#EEF6F5] dark:bg-slate-800">
                                                <img
                                                    src={
                                                        activeImage?.image_url_full
                                                    }
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
                                                            {t(
                                                                "exercise.card.mastered_title",
                                                            )}
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
                                                                setActiveImageIndex(
                                                                    idx,
                                                                )
                                                            }
                                                            className={`rounded-full transition-all ${
                                                                idx ===
                                                                activeImageIndex
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
                                                        // Priority: image_related_sentence > first example sentence
                                                        word.image_related_sentence
                                                            ? word.image_related_sentence
                                                            : word.example_sentences
                                                                  ?.split(".")
                                                                  .map((s) =>
                                                                      s.trim(),
                                                                  )
                                                                  .filter(
                                                                      Boolean,
                                                                  )[0] + ".",
                                                        word.word,
                                                    )}
                                                </p>
                                                {userSettings?.show_bangla &&
                                                    word.image_related_sentence_bangla && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
                                                            {
                                                                word.image_related_sentence_bangla
                                                            }
                                                        </p>
                                                    )}
                                            </div>
                                        )}

                                    {/* Tap to see meaning */}
                                    <div className="px-4 pb-3">
                                        <button
                                            onClick={handleToggleMeaning}
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
                                                    {t(
                                                        "exercise.card.hide_meaning",
                                                    )}
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
                                                    {t(
                                                        "exercise.card.show_meaning",
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {/* end main card */}

                                {/* ── Meaning card ─────────────────────────────────────── */}
                                <div
                                    ref={meaningCardRef}
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        showMeaning
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                    style={{
                                        maxHeight: showMeaning
                                            ? "1600px"
                                            : "0px", // lowered from 2000px
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

                                        {word.definition && (
                                            <div className="mx-4 mt-4 mb-4">
                                                <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 py-1">
                                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                                                        {t(
                                                            "exercise.card.definition",
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-200 leading-snug">
                                                        {word.definition}

                                                        {userSettings?.show_bangla &&
                                                            word.bangla_meaning && (
                                                                <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                                                                    (
                                                                    {
                                                                        word.bangla_meaning
                                                                    }
                                                                    )
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
                                                    {t(
                                                        "exercise.card.collocations",
                                                    )}
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
                                                            const renderHighlighted =
                                                                (
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
                                                                        .split(
                                                                            regex,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                part,
                                                                                idx,
                                                                            ) =>
                                                                                regex.test(
                                                                                    part,
                                                                                ) ? (
                                                                                    <mark
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className="font-bold bg-transparent underline underline-offset-2 decoration-2 not-italic dark:text-white"
                                                                                        style={{
                                                                                            textDecorationColor:
                                                                                                "currentColor",
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            part
                                                                                        }
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
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1">
                                                                            {col.example_sentence ? (
                                                                                <>
                                                                                    <p className="text-sm leading-snug dark:text-gray-400">
                                                                                        {renderHighlighted(
                                                                                            col.example_sentence,
                                                                                            col.phrase,
                                                                                        )}
                                                                                    </p>
                                                                                    {userSettings?.show_bangla &&
                                                                                        col.bangla?.example_sentence && (
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                                                                                {
                                                                                                    col.bangla
                                                                                                        .example_sentence
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <p className="text-xs font-bold uppercase tracking-wide opacity-75 dark:text-gray-100">
                                                                                        {
                                                                                            col.phrase
                                                                                        }
                                                                                    </p>
                                                                                    {userSettings?.show_bangla &&
                                                                                        col.bangla?.phrase && (
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                                                                                                {
                                                                                                    col.bangla
                                                                                                        .phrase
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                speakWord(
                                                                                    col.example_sentence ||
                                                                                        col.phrase,
                                                                                )
                                                                            }
                                                                            className="flex-none p-1.5 rounded-full opacity-50 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                                                                            aria-label="Listen to collocation"
                                                                        >
                                                                            <Volume2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
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
                                                {(word.synonym ||
                                                    word.antonym) && (
                                                    <div className="grid grid-cols-2 gap-0 mx-4 mb-4">
                                                        {word.synonym ? (
                                                            <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 pr-2 py-1">
                                                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                                                    {t(
                                                                        "exercise.card.synonym",
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                                    {
                                                                        word.synonym
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div />
                                                        )}
                                                        {word.antonym ? (
                                                            <div className="border-l-4 border-blue-400 dark:border-blue-600 pl-3 pr-2 py-1">
                                                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                                                    {t(
                                                                        "exercise.card.antonym",
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                                    {
                                                                        word.antonym
                                                                    }
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
                                        <div
                                            ref={buttonsRef}
                                            className="px-4 pt-4 pb-5"
                                        >
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
                                                    {t(
                                                        "exercise.card.dont_know_button",
                                                    )}
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
                                                    {t(
                                                        "exercise.card.know_button",
                                                    )}
                                                </button>
                                            </div>
                                            {/* Context hint */}
                                            {auth?.user && (
                                                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                                                    {currentBox <= 1
                                                        ? t(
                                                              "exercise.card_hints.new",
                                                          )
                                                        : currentBox === 2
                                                          ? t(
                                                                "exercise.card_hints.learning",
                                                            )
                                                          : currentBox === 3
                                                            ? t(
                                                                  "exercise.card_hints.reviewing",
                                                              )
                                                            : t(
                                                                  "exercise.card_hints.already_mastered",
                                                              )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* end meaning card */}
                            </>
                        )}
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
                    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(115vh) rotate(720deg); opacity: 0; }
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
                            <LogIn className="h-5 w-5 text-[#E5201C]" />{" "}
                            {t("exercise.dialogs.login.title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {t("exercise.dialogs.login.desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                            {t("exercise.dialogs.login.skip")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                window.location.href = route("login");
                            }}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            {t("exercise.dialogs.login.login")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Leave Dialog */}
            <AlertDialog
                open={showLeaveDialog}
                onOpenChange={setShowLeaveDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <span className="text-[#E5201C] text-xl">
                                {t("exercise.dialogs.leave.title")}
                            </span>{" "}
                            {t("exercise.dialogs.leave.confirm")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-500">
                            {t("exercise.dialogs.leave.desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setPendingVisit(null);
                                setShowLeaveDialog(false);
                            }}
                        >
                            {t("exercise.dialogs.leave.stay")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                allowNavigation.current = true;
                                setShowLeaveDialog(false);
                                if (pendingVisit?.type === "popstate") {
                                    // Because we pushed a dummy state, we need to go back 2 times to actually leave
                                    window.history.go(-2);
                                } else if (pendingVisit) {
                                    router.visit(
                                        pendingVisit.url,
                                        pendingVisit,
                                    );
                                } else {
                                    window.history.back();
                                }
                            }}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            {t("exercise.dialogs.leave.leave")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Already Know (Double-Correct) Dialog */}
            <AlertDialog
                open={showAlreadyKnowDialog}
                onOpenChange={setShowAlreadyKnowDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-xl">
                            {t("exercise.dialogs.already_know.title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400">
                            {t("exercise.dialogs.already_know.desc", {
                                word: pendingKnowWord?.word,
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            onClick={() => handleAlreadyKnowConfirm(false)}
                            className="w-full sm:w-auto"
                        >
                            {t("exercise.dialogs.already_know.no")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleAlreadyKnowConfirm(true)}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                        >
                            {t("exercise.dialogs.already_know.yes")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
