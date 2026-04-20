import { Head, Link, router } from "@inertiajs/react";
import CryptoJS from "crypto-js";
import AppLayout from "@/Layouts/AppLayout";
import approvedAnimation from "../../../public/lottie/Approved.json";
import fireStreakAnimation from "../../../public/lottie/FireStreakOrange.json";
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
import { LogIn } from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import FlashMessages from "@/Components/FlashMessage";
import { usePage } from "@inertiajs/react";
import {
    playCorrect,
    playMastered,
    playSessionComplete,
} from "@/Utils/sounds";

// ── Sub-components ────────────────────────────────────────────────────────────
import { MASTERED_BOX, preloadImages } from "./ExerciseSession/constants";
import MasteryOverlay from "./ExerciseSession/MasteryOverlay";
import QuizPanel from "./ExerciseSession/QuizPanel";
import LoadingScreen from "./ExerciseSession/LoadingScreen";
import EmptyQueueScreen from "./ExerciseSession/EmptyQueueScreen";
import SessionCompleteScreen from "./ExerciseSession/SessionCompleteScreen";
import SessionProgressBar from "./ExerciseSession/SessionProgressBar";
import FlashCard from "./ExerciseSession/FlashCard";
import MeaningCard from "./ExerciseSession/MeaningCard";

// ── Inline CSS keyframes (card animations, confetti, streak pop) ──────────────
const SESSION_STYLES = `
    @keyframes streakPop {
        0%   { opacity: 0; transform: scale(0.2) translateY(60px); }
        40%  { transform: scale(1.25) translateY(-15px); }
        70%  { transform: scale(0.95) translateY(5px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
    }
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
`;

// ── Quiz builder helpers ───────────────────────────────────────────────────────
const pickOne = (str) => {
    if (!str?.trim()) return null;
    const parts = str.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts[Math.floor(Math.random() * parts.length)] : null;
};

const makeFillBlank = (word, sentences) => {
    if (!sentences) return null;
    const parts = sentences.split(/(?<=[.!?])\s+/);
    for (const s of parts) {
        const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (re.test(s)) return s.replace(re, "___________");
    }
    return null;
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ExerciseSession({
    wordList,
    subcategory,
    words: initialWords,
    totalWordsInList = 0,
    backUrl = null,
    bookmarkedWordIds = [],
    streak: initialStreak = null,
    xp_enabled = true,
}) {
    const { auth, userSettings } = usePage().props;

    // ── Streak ────────────────────────────────────────────────────────────────
    const [streak, setStreak] = useState(initialStreak);
    const [streakChange, setStreakChange] = useState(null);
    const [showStreakEffect, setShowStreakEffect] = useState(false);
    const previousStreak = useRef(initialStreak?.current_streak ?? 0);

    // ── Loading ───────────────────────────────────────────────────────────────
    const [isPreloading, setIsPreloading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // ── Queue ─────────────────────────────────────────────────────────────────
    const [queue, setQueue] = useState(() => initialWords.map((w) => ({ ...w })));
    const initialQueueSize = useMemo(() => initialWords.length, []);

    // ── Session stats ─────────────────────────────────────────────────────────
    const [promotedCount, setPromotedCount] = useState(0);
    const [dontKnowCount, setDontKnowCount] = useState(0);
    const [sessionXpAwarded, setSessionXpAwarded] = useState(0);
    const [sessionResults, setSessionResults] = useState([]);
    const answeredCount = promotedCount + dontKnowCount;

    // ── Navigation guard ──────────────────────────────────────────────────────
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingVisit, setPendingVisit] = useState(null);
    const allowNavigation = useRef(false);

    // ── Inline quiz ───────────────────────────────────────────────────────────
    const QUIZ_INTERVAL = 4;
    const [seenWordBuffer, setSeenWordBuffer] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [bookmarks, setBookmarks] = useState(() =>
        Object.fromEntries(bookmarkedWordIds.map((id) => [id, true])),
    );
    const [showMeaning, setShowMeaning] = useState(false);

    // ── Card animation ────────────────────────────────────────────────────────
    const exitDir = useRef("left");
    const [cardKey, setCardKey] = useState(0);
    const [exiting, setExiting] = useState(false);

    // ── Gamification ──────────────────────────────────────────────────────────
    const [masteryEventKey, setMasteryEventKey] = useState(0);
    const [levelUpPulse, setLevelUpPulse] = useState(false);

    // ── "Already Know" popup ──────────────────────────────────────────────────
    const [showAlreadyKnowDialog, setShowAlreadyKnowDialog] = useState(false);
    const alreadyKnowWordRef = useRef(null); // the word pending mastery confirmation
    const consecutiveKnowMap = useRef({}); // wordId → count of consecutive knows (no incorrect)

    // ── Refs ──────────────────────────────────────────────────────────────────
    const meaningCardRef = useRef(null);
    const isDoneRef = useRef(false);

    // ── Derived ───────────────────────────────────────────────────────────────
    const word = queue[0] ?? null;
    const isDone =
        (queue.length === 0 || (answeredCount >= initialQueueSize && !activeQuiz)) &&
        !exiting;

    const backHref =
        backUrl ??
        (wordList?.word_list_category_id
            ? route("wordlistcategory.wordlists", wordList.word_list_category_id)
            : route("wordlist.show", wordList?.id));

    const sessionProgress =
        initialQueueSize > 0 ? (answeredCount / initialQueueSize) * 100 : 0;

    // ── Collocation parser ────────────────────────────────────────────────────
    const collocationList = (() => {
        const raw = word?.collocations;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return raw
            .split(/[\n,]+/)
            .map((c) => c.trim())
            .filter(Boolean)
            .map((phrase) => ({ phrase, example_sentence: "" }));
    })();

    // ── Sync isDoneRef ────────────────────────────────────────────────────────
    useEffect(() => {
        isDoneRef.current = isDone;
    }, [isDone]);

    // ── Reset per-card UI ─────────────────────────────────────────────────────
    useEffect(() => {
        setActiveImageIndex(0);
        setShowMeaning(false);
    }, [word?.id]);

    // ── Auto-scroll to buttons when meaning revealed ──────────────────────────
    useEffect(() => {
        if (showMeaning && meaningCardRef.current) {
            setTimeout(() => {
                meaningCardRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 250);
        }
    }, [showMeaning]);

    // ── Snap scroll to top on word change ────────────────────────────────────
    useEffect(() => {
        if (!word?.id) return;
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "instant" });
        }, 180);
        return () => clearTimeout(timer);
    }, [word?.id]);

    // ── Navigation guard (back button + Inertia + beforeunload) ──────────────
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);

        const handlePopState = (event) => {
            if (!isDoneRef.current && !allowNavigation.current) {
                event.stopPropagation();
                window.history.pushState(null, "", window.location.href);
                setPendingVisit({ type: "popstate" });
                setShowLeaveDialog(true);
            }
        };

        const handleBefore = (event) => {
            if (!isDoneRef.current && !allowNavigation.current) {
                event.preventDefault();
                setPendingVisit(event.detail.visit);
                setShowLeaveDialog(true);
            }
        };

        const handleBeforeUnload = (e) => {
            if (!isDoneRef.current && !allowNavigation.current) {
                e.preventDefault();
                e.returnValue = "Are you sure you want to leave? You will lose the exercises progress";
            }
        };

        window.addEventListener("popstate", handlePopState, { capture: true });
        const removeListener = router.on("before", handleBefore);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("popstate", handlePopState, { capture: true });
            removeListener();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // ── Session complete — batch save + streak ────────────────────────────────
    useEffect(() => {
        if (!isDone || !auth?.user || initialQueueSize === 0) return;

        playSessionComplete(userSettings);

        const _xsrfRow = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="));
        const csrfToken = _xsrfRow
            ? decodeURIComponent(_xsrfRow.substring("XSRF-TOKEN=".length))
            : "";

        fetch(route("word.session-complete"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            body: JSON.stringify({ wordlist_id: wordList?.id, results: sessionResults }),
        })
            .then((r) => r.json())
            .then((data) => {
                window.dispatchEvent(new Event("check-achievements"));

                if (data.xp_awarded && xp_enabled) {
                    setSessionXpAwarded(data.xp_awarded);
                }

                if (data.streak) {
                    const newStreak = data.streak.current_streak ?? 0;
                    const prevStreak = previousStreak.current;
                    const today = new Date().toDateString();
                    const lastSessionDay = localStorage.getItem("lastSessionDay");

                    if (
                        newStreak > prevStreak ||
                        (newStreak === prevStreak && lastSessionDay !== today && newStreak > 0)
                    ) {
                        setStreakChange("up");
                        setShowStreakEffect(true);
                        setTimeout(() => setShowStreakEffect(false), 2800);
                        localStorage.setItem("lastSessionDay", today);
                    } else if (newStreak < prevStreak) {
                        setStreakChange("down");
                    }

                    previousStreak.current = newStreak;
                    setStreak(data.streak);
                }
            })
            .catch(() => {});
    }, [isDone, auth?.user]);

    // ── Background preload next words ─────────────────────────────────────────
    useEffect(() => {
        if (!queue.length || isPreloading) return;
        preloadImages(queue.slice(0, 3), null);
    }, [queue.length, isPreloading]);

    // ── Initial preload + localStorage cache (24-hour TTL) ───────────────────
    useEffect(() => {
        const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
        const CACHE_PREFIX = "cached-session-";

        // Evict ALL stale cached-session-* entries on mount
        try {
            Object.keys(localStorage)
                .filter((k) => k.startsWith(CACHE_PREFIX))
                .forEach((key) => {
                    try {
                        const raw = localStorage.getItem(key);
                        if (!raw) { localStorage.removeItem(key); return; }
                        const decrypted = CryptoJS.AES.decrypt(raw, "wm-cache-secure-key").toString(CryptoJS.enc.Utf8);
                        const { timestamp } = JSON.parse(decrypted);
                        if (!timestamp || Date.now() - timestamp > CACHE_TTL_MS) {
                            localStorage.removeItem(key);
                        }
                    } catch {
                        // Corrupt entry — delete it
                        localStorage.removeItem(key);
                    }
                });
        } catch (e) {}

        const runPreload = async () => {
            setIsPreloading(true);
            setLoadingProgress(0);
            await preloadImages(initialWords, setLoadingProgress);

            // Write a fresh cache entry (only used for potential future optimisation;
            // the session always runs from the server-provided initialWords prop).
            if (wordList?.id && initialWords.length > 0) {
                try {
                    const cacheKey = `${CACHE_PREFIX}${wordList.id}`;
                    const cacheData = JSON.stringify({ words: initialWords, timestamp: Date.now() });
                    const encrypted = CryptoJS.AES.encrypt(cacheData, "wm-cache-secure-key").toString();
                    localStorage.setItem(cacheKey, encrypted);
                } catch (e) {}
            }

            setIsPreloading(false);
            setLoadingProgress(100);
        };
        runPreload();
    }, [initialWords, wordList?.id]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const speakWord = useCallback((text) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-US";
            window.speechSynthesis.speak(u);
        }
    }, []);

    const handleBookmark = (wordId) => {
        if (!auth?.user) { setShowLoginDialog(true); return; }
        setBookmarks((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
        router.post(route("word.bookmark", wordId), {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => setBookmarks((prev) => ({ ...prev, [wordId]: !prev[wordId] })),
        });
    };

    const animateThen = (direction, callback) => {
        exitDir.current = direction;
        setShowMeaning(false);
        setExiting(true);
        setTimeout(() => {
            setExiting(false);
            setCardKey((k) => k + 1);
            callback();
        }, 400);
    };

    // ── Quiz builder ──────────────────────────────────────────────────────────
    const buildQuizFromBuffer = (buffer) => {
        if (buffer.length < 2) return null;

        const targetIdx = Math.floor(Math.random() * buffer.length);
        const target = buffer[targetIdx];
        const others = buffer.filter((_, i) => i !== targetIdx);

        const candidates = [];

        // 1. Definition
        const defAnswer = target.definition?.trim();
        if (defAnswer) {
            const distractors = others.map((w) => w.definition?.trim()).filter(Boolean).filter((d) => d !== defAnswer).slice(0, 3);
            if (distractors.length >= 1) {
                candidates.push({
                    type: "definition",
                    prompt: `What does "${target.word}" mean?`,
                    options: [defAnswer, ...distractors].sort(() => Math.random() - 0.5),
                    correct: defAnswer,
                });
            }
        }

        // 2. Fill-in-the-blank
        const blank = makeFillBlank(target.word, target.example_sentences);
        if (blank) {
            const distractors = others.map((w) => w.word).filter((w) => w.toLowerCase() !== target.word.toLowerCase()).slice(0, 3);
            if (distractors.length >= 1) {
                candidates.push({
                    type: "fill_blank",
                    prompt: blank,
                    options: [target.word, ...distractors].sort(() => Math.random() - 0.5),
                    correct: target.word,
                });
            }
        }

        // 3. Synonym
        const synAnswer = pickOne(target.synonym);
        if (synAnswer) {
            const distractors = others.map((w) => w.word).filter((w) => w.toLowerCase() !== target.word.toLowerCase()).slice(0, 3);
            if (distractors.length >= 1) {
                candidates.push({
                    type: "synonym",
                    prompt: `Which word is a synonym of "${target.word}"?`,
                    options: [synAnswer, ...distractors].sort(() => Math.random() - 0.5),
                    correct: synAnswer,
                });
            }
        }

        // 4. Antonym
        const antAnswer = pickOne(target.antonym);
        if (antAnswer) {
            const distractors = others.map((w) => w.word).filter((w) => w.toLowerCase() !== target.word.toLowerCase()).slice(0, 3);
            if (distractors.length >= 1) {
                candidates.push({
                    type: "antonym",
                    prompt: `Which word is the opposite of "${target.word}"?`,
                    options: [antAnswer, ...distractors].sort(() => Math.random() - 0.5),
                    correct: antAnswer,
                });
            }
        }

        // 5. Translation (only if user has Bangla enabled)
        const banglaAnswer = target.bangla_meaning?.trim();
        if (banglaAnswer && userSettings?.show_bangla) {
            const distractors = others.map((w) => w.bangla_meaning?.trim()).filter(Boolean).filter((d) => d !== banglaAnswer).slice(0, 3);
            if (distractors.length >= 1) {
                candidates.push({
                    type: "translation",
                    prompt: `What is the Bengali meaning of "${target.word}"?`,
                    options: [banglaAnswer, ...distractors].sort(() => Math.random() - 0.5),
                    correct: banglaAnswer,
                });
            }
        }

        if (candidates.length === 0) return null;
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        return { ...chosen, targetWordId: target.id, targetBox: target.srs_box ?? 1 };
    };

    const maybeShowQuiz = (updatedBuffer) => {
        if (updatedBuffer.length >= QUIZ_INTERVAL) {
            const quiz = buildQuizFromBuffer(updatedBuffer);
            if (quiz) { setActiveQuiz(quiz); return; }
            setSeenWordBuffer([]);
        }
    };

    const handleQuizAnswer = (isCorrect) => {
        if (!activeQuiz) return;
        const { targetWordId, targetBox } = activeQuiz;

        if (isCorrect) {
            if (targetBox >= MASTERED_BOX - 1) { playMastered(userSettings); setMasteryEventKey((k) => k + 1); }
            else { playCorrect(userSettings); }
            setSessionResults((prev) => [...prev, { word_id: targetWordId, action: "know" }]);
            setPromotedCount((c) => c + 1);
        } else {
            setSessionResults((prev) => [...prev, { word_id: targetWordId, action: "learn" }]);
            setDontKnowCount((c) => c + 1);
        }

        setActiveQuiz(null);
        setSeenWordBuffer([]);
    };

    // ── Core flashcard actions ────────────────────────────────────────────────

    /**
     * Called when user confirms "Yes, I already know this word" in the dialog.
     * Fast-tracks the word to Mastered immediately.
     */
    const handleConfirmAlreadyKnow = () => {
        const w = alreadyKnowWordRef.current;
        if (!w) return;
        setShowAlreadyKnowDialog(false);
        alreadyKnowWordRef.current = null;
        playMastered(userSettings);
        setMasteryEventKey((k) => k + 1);
        // The word was already removed from the queue by handleKnow's animateThen.
        // We just need to record the master action and update counts.
        setSessionResults((prev) => [
            ...prev,
            { word_id: w.id, action: "master" },
        ]);
    };

    const handleKnow = () => {
        if (!word || !auth?.user || isSubmitting) { if (!auth?.user) setShowLoginDialog(true); return; }
        setIsSubmitting(true);
        const currentBox = word.srs_box ?? 1;
        if (currentBox >= MASTERED_BOX - 1) { playMastered(userSettings); setMasteryEventKey((k) => k + 1); }
        else {
            playCorrect(userSettings);
            if (currentBox < MASTERED_BOX) { setLevelUpPulse(true); setTimeout(() => setLevelUpPulse(false), 500); }
        }
        const wordId = word.id;
        const seenWord = { ...word };
        const noErrors = (word.srs_incorrect ?? 0) === 0;

        // Track consecutive "I Know" presses for words the user has never gotten wrong
        let triggerAlreadyKnow = false;
        if (noErrors) {
            const prev = consecutiveKnowMap.current[wordId] ?? 0;
            const next = prev + 1;
            consecutiveKnowMap.current[wordId] = next;
            if (next >= 2) {
                triggerAlreadyKnow = true;
                // Reset so it doesn't trigger again
                consecutiveKnowMap.current[wordId] = 0;
            }
        } else {
            // Reset counter if they've ever gotten it wrong
            consecutiveKnowMap.current[wordId] = 0;
        }

        animateThen("left", () => {
            setSessionResults((prev) => [...prev, { word_id: wordId, action: "know" }]);
            setQueue((prev) => prev.slice(1));
            setPromotedCount((c) => c + 1);
            setIsSubmitting(false);
            setSeenWordBuffer((prev) => { const updated = [...prev, seenWord]; maybeShowQuiz(updated); return updated; });
            if (triggerAlreadyKnow) {
                alreadyKnowWordRef.current = seenWord;
                setShowAlreadyKnowDialog(true);
            }
        });
    };

    const handleDontKnow = () => {
        if (!word || !auth?.user || isSubmitting) { if (!auth?.user) setShowLoginDialog(true); return; }
        setIsSubmitting(true);
        setDontKnowCount((c) => c + 1);
        const wordId = word.id;
        const seenWord = { ...word };
        animateThen("right", () => {
            setSessionResults((prev) => [...prev, { word_id: wordId, action: "learn" }]);
            setQueue((prev) => prev.slice(1));
            setIsSubmitting(false);
            setSeenWordBuffer((prev) => { const updated = [...prev, seenWord]; maybeShowQuiz(updated); return updated; });
        });
    };

    // ── Early returns ─────────────────────────────────────────────────────────
    if (isPreloading) return <LoadingScreen loadingProgress={loadingProgress} />;

    if (initialQueueSize === 0)
        return (
            <EmptyQueueScreen
                wordList={wordList}
                subcategory={subcategory}
                backHref={backHref}
            />
        );

    if (isDone)
        return (
            <SessionCompleteScreen
                wordList={wordList}
                subcategory={subcategory}
                backHref={backHref}
                promotedCount={promotedCount}
                dontKnowCount={dontKnowCount}
                totalWordsInList={totalWordsInList}
                sessionXpAwarded={sessionXpAwarded}
                xp_enabled={xp_enabled}
                streak={streak}
                streakChange={streakChange}
                showStreakEffect={showStreakEffect}
                setShowStreakEffect={setShowStreakEffect}
                approvedAnim={approvedAnimation}
                fireAnim={fireStreakAnimation}
                auth={auth}
            />
        );

    // ── Main session UI ───────────────────────────────────────────────────────
    return (
        <AppLayout>
            <Head title={`Exercise — ${word?.word ?? ""}`} />
            <FlashMessages />
            <style>{SESSION_STYLES}</style>

            {/* Mastery overlay — keyed per event */}
            {masteryEventKey > 0 && <MasteryOverlay key={masteryEventKey} />}

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-10 pt-1 mt-3">
                {/* Progress bar */}
                <SessionProgressBar
                    backHref={backHref}
                    sessionProgress={sessionProgress}
                    answeredCount={answeredCount}
                    initialQueueSize={initialQueueSize}
                    auth={auth}
                />

                {/* Card area */}
                <div className="flex items-start justify-center w-full">
                    <main className="max-w-lg w-full px-3">

                        {/* Inline quiz */}
                        {activeQuiz && !exiting && (
                            <QuizPanel
                                key={activeQuiz.targetWordId}
                                question={activeQuiz}
                                onAnswer={handleQuizAnswer}
                            />
                        )}

                        {/* Flashcard + meaning (hidden during quiz) */}
                        {!activeQuiz && (
                            <>
                                <FlashCard
                                    word={word}
                                    cardKey={cardKey}
                                    exiting={exiting}
                                    exitDir={exitDir.current}
                                    wordList={wordList}
                                    subcategory={subcategory}
                                    bookmarks={bookmarks}
                                    onBookmark={handleBookmark}
                                    onSpeak={speakWord}
                                    showMeaning={showMeaning}
                                    onToggleMeaning={() => setShowMeaning((p) => !p)}
                                    levelUpPulse={levelUpPulse}
                                    auth={auth}
                                    userSettings={userSettings}
                                    activeImageIndex={activeImageIndex}
                                    setActiveImageIndex={setActiveImageIndex}
                                />
                                <MeaningCard
                                    word={word}
                                    collocationList={collocationList}
                                    showMeaning={showMeaning}
                                    handleKnow={handleKnow}
                                    handleDontKnow={handleDontKnow}
                                    isSubmitting={isSubmitting}
                                    auth={auth}
                                    userSettings={userSettings}
                                    onSpeak={speakWord}
                                    meaningCardRef={meaningCardRef}
                                />
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Login dialog */}
            <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-[#E5201C]" /> Login Required
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            You need to be logged in to track your progress. Log in to save your results.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Skip for now</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => { window.location.href = route("login"); }}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            Go to Login
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* "Already Know" dialog */}
            <AlertDialog open={showAlreadyKnowDialog} onOpenChange={setShowAlreadyKnowDialog}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">🎓</span> Do you already know this word?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            You pressed <strong>«I Know»</strong> twice in a row for{" "}
                            <strong className="text-gray-900 dark:text-gray-100">
                                {alreadyKnowWordRef.current?.word ?? "this word"}
                            </strong>. Want to send it straight to your{" "}
                            <strong>Mastered</strong> list and skip it in future sessions?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setShowAlreadyKnowDialog(false);
                                alreadyKnowWordRef.current = null;
                            }}
                        >
                            No, keep reviewing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAlreadyKnow}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Yes, I know it! ✓
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Leave dialog */}
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <span className="text-[#E5201C] text-xl">Wait!</span> Are you sure you want to leave?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-500">
                            You will lose the exercises progress if you leave before completing the session.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            className="w-full sm:w-auto"
                            onClick={() => { setPendingVisit(null); setShowLeaveDialog(false); }}
                        >
                            Stay Here
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                allowNavigation.current = true;
                                setShowLeaveDialog(false);
                                if (pendingVisit?.type === "popstate") {
                                    window.history.go(-2);
                                } else if (pendingVisit) {
                                    router.visit(pendingVisit.url, pendingVisit);
                                } else {
                                    window.history.back();
                                }
                            }}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            Yes, Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
