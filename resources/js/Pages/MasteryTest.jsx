import Lottie from "lottie-react";
import doneAnimation from "../../../public/lottie/Done.json";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    playCorrect,
    playIncorrect,
    playSessionComplete,
} from "@/Utils/sounds";
import AppLayout from "@/Layouts/AppLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { toast, Toaster } from "sonner";
import XpCounter from "@/Components/XpCounter";
import {
    ChevronLeft,
    ArrowLeft,
    Trophy,
    Check,
    X,
    RotateCcw,
    Shuffle,
    Languages,
    BookOpen,
    ArrowLeftRight,
    Zap,
    Brain,
    Target,
    Bookmark,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "@/Contexts/LanguageContext";
import StreakPop from "@/Components/StreakPop";
import WordlistUnlockedOverlay from "@/Components/WordlistUnlockedOverlay";

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META = {
    fill_blank: {
        label: "Fill in the Blank",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        icon: BookOpen,
    },
    match_pairs: {
        label: "Match the Pairs",
        color: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
        icon: ArrowLeftRight,
    },
    synonym: {
        label: "Synonym Quiz",
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        icon: Shuffle,
    },
    antonym: {
        label: "Antonym Quiz",
        color: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
        icon: Shuffle,
    },
    translation_en_bn: {
        label: "Translation",
        color: "bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
        icon: Languages,
    },
};

// ── Shared helpers ────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
    const { t } = useTranslation();
    const meta = TYPE_META[type] ?? {
        label: type,
        color: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
    };
    const Icon = meta.icon ?? BookOpen;

    const localizedLabel = t(`quiz.${type.replace("_en_bn", "")}`);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}
        >
            <Icon className="h-3 w-3" />
            {localizedLabel !== `quiz.${type.replace("_en_bn", "")}`
                ? localizedLabel
                : meta.label}
        </span>
    );
}

function MCQOptions({ options, answered, selected, correct, onAnswer }) {
    const optionClass = (option) => {
        const base =
            "w-full px-4 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all text-left";
        if (!answered) {
            return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98] cursor-pointer`;
        }
        const isThisSelected = option === selected;
        const isThisCorrect = option.toLowerCase() === correct.toLowerCase();

        if (isThisSelected && isThisCorrect)
            return `${base} bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300`;
        if (isThisSelected && !isThisCorrect)
            return `${base} bg-red-50 dark:bg-red-950/30 border-[#E5201C] dark:border-red-600 text-red-700 dark:text-red-300`;
        return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-500`;
    };

    return (
        <div className="grid grid-cols-2 gap-3 mb-5">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onAnswer(option)}
                    className={optionClass(option)}
                    disabled={answered}
                >
                    <span className="flex items-center gap-2">
                        {answered &&
                            option === selected &&
                            option.toLowerCase() === correct.toLowerCase() && (
                                <Check className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                        {answered &&
                            option === selected &&
                            option.toLowerCase() !== correct.toLowerCase() && (
                                <X className="h-4 w-4 text-red-500 shrink-0" />
                            )}
                        {option.toLowerCase()}
                    </span>
                </button>
            ))}
        </div>
    );
}

// ── Fill-in-the-Blank ─────────────────────────────────────────────────────────

function FillBlankQuestion({ q, answered, selected, isCorrect, onAnswer }) {
    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5 shadow-sm mb-4">
                <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed text-center font-medium">
                    {q.sentence.split("___________").map((part, i, arr) => (
                        <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span
                                    className={`inline-block mx-1 border-b-2 font-bold min-w-[80px] text-center transition-all
                                    ${
                                        !answered
                                            ? "border-gray-400 dark:border-slate-600 text-transparent"
                                            : isCorrect
                                              ? "border-green-500 text-green-700 dark:text-green-400"
                                              : "border-gray-300 dark:border-slate-600 text-transparent"
                                    }`}
                                >
                                    {answered && isCorrect
                                        ? q.correct
                                        : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                                </span>
                            )}
                        </span>
                    ))}
                </p>
            </div>
            <MCQOptions
                options={q.options}
                answered={answered}
                selected={selected}
                correct={q.correct}
                onAnswer={onAnswer}
            />
        </>
    );
}

// ── Synonym / Antonym / Translation MCQ ───────────────────────────────────────

function SimpleQuestion({ q, answered, selected, isCorrect, onAnswer }) {
    const { t } = useTranslation();
    const promptText = {
        synonym: t("quiz.synonym_prompt", { word: q.word }),
        antonym: t("quiz.antonym_prompt", { word: q.word }),
        translation_en_bn: t("quiz.translation_prompt", { word: q.word }),
    }[q.type];

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-6 shadow-sm mb-5">
                <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed text-center font-medium">
                    {promptText}
                </p>
            </div>
            <MCQOptions
                options={q.options}
                answered={answered}
                selected={selected}
                correct={q.correct}
                onAnswer={onAnswer}
            />
        </>
    );
}

// ── Match the Pairs ───────────────────────────────────────────────────────────

function MatchPairsQuestion({ q, onSubmit }) {
    const { t } = useTranslation();
    const shuffledIndices = useMemo(() => {
        const idx = q.pairs.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        return idx;
    }, []);

    const [selectedWord, setSelectedWord] = useState(null);
    const [wordToMeaning, setWordToMeaning] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const allMatched = Object.keys(wordToMeaning).length === q.pairs.length;

    const handleWordClick = (wordIndex) => {
        if (submitted) return;
        setSelectedWord((prev) => (prev === wordIndex ? null : wordIndex));
    };

    const handleMeaningClick = (displayPos) => {
        if (submitted || selectedWord === null) return;
        setWordToMeaning((prev) => {
            const updated = { ...prev };
            for (const wi of Object.keys(updated)) {
                if (updated[wi] === displayPos) delete updated[wi];
            }
            updated[selectedWord] = displayPos;
            return updated;
        });
        setSelectedWord(null);
    };

    const handleCheckAnswers = () => {
        let correct = 0;
        q.pairs.forEach((_, wordIndex) => {
            const assignedDisplay = wordToMeaning[wordIndex];
            if (
                assignedDisplay !== undefined &&
                shuffledIndices[assignedDisplay] === wordIndex
            ) {
                correct++;
            }
        });
        setSubmitted(true);
        onSubmit(correct);
    };

    const wordClass = (wordIndex) => {
        const base =
            "w-full px-3 py-2.5 rounded-xl text-sm font-semibold border-2 text-center transition-all ";
        if (submitted) {
            const assignedDisplay = wordToMeaning[wordIndex];
            const correct =
                assignedDisplay !== undefined &&
                shuffledIndices[assignedDisplay] === wordIndex;
            return (
                base +
                (correct
                    ? "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-800 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/30 border-red-400 text-red-700 dark:text-red-400")
            );
        }
        if (selectedWord === wordIndex)
            return (
                base +
                "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-800 dark:text-blue-400"
            );
        if (wordToMeaning[wordIndex] !== undefined)
            return (
                base +
                "bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-800 dark:text-amber-400"
            );
        return (
            base +
            "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
        );
    };

    const meaningClass = (displayPos) => {
        const base =
            "w-full px-3 py-2.5 rounded-xl text-xs border-2 text-center transition-all leading-snug ";
        const takenByWord = Object.entries(wordToMeaning).find(
            ([, dp]) => Number(dp) === displayPos,
        );
        if (submitted) {
            if (!takenByWord)
                return (
                    base +
                    "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-300 dark:text-gray-500"
                );
            const wordIndex = Number(takenByWord[0]);
            const correct = shuffledIndices[displayPos] === wordIndex;
            return (
                base +
                (correct
                    ? "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/30 border-red-400 text-red-700 dark:text-red-400")
            );
        }
        if (takenByWord)
            return (
                base +
                "bg-amber-50 dark:amber-950/30 border-amber-400 text-amber-700 dark:text-amber-400"
            );
        return (
            base +
            "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
        );
    };

    return (
        <div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-4 shadow-sm mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                    {submitted
                        ? t("quiz.match_results")
                        : selectedWord !== null
                          ? t("quiz.tap_meaning")
                          : t("quiz.tap_word")}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-1">
                            {t("quiz.words")}
                        </p>
                        {q.pairs.map((pair, wordIndex) => (
                            <button
                                key={wordIndex}
                                className={wordClass(wordIndex)}
                                onClick={() => handleWordClick(wordIndex)}
                                disabled={submitted}
                            >
                                {pair.word}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-1">
                            {t("quiz.meanings")}
                        </p>
                        {shuffledIndices.map((pairIndex, displayPos) => (
                            <button
                                key={displayPos}
                                className={meaningClass(displayPos)}
                                onClick={() => handleMeaningClick(displayPos)}
                                disabled={submitted}
                                style={{ minHeight: "3rem" }}
                            >
                                {q.pairs[pairIndex].meaning.length > 55
                                    ? q.pairs[pairIndex].meaning.substring(
                                          0,
                                          52,
                                      ) + "…"
                                    : q.pairs[pairIndex].meaning}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {!submitted && allMatched && (
                <button
                    onClick={handleCheckAnswers}
                    className="w-full bg-[#E5201C] hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md"
                >
                    {t("quiz.check_answers")}
                </button>
            )}
        </div>
    );
}

// ── Main Quiz component ───────────────────────────────────────────────────────

export default function MasteryTest({
    questions = [],
    noMasteredWords = false,
    noUsableSentences = false,
    matchPassThreshold = 3,
    wordListTitle = null,
    wordlistId = null,
    categoryId = null,
}) {
    const { t } = useTranslation();
    const { userSettings } = usePage().props;
    const [showIntro, setShowIntro] = useState(true);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const [matchCorrectCount, setMatchCorrectCount] = useState(null);
    const [showNoWordsDialog, setShowNoWordsDialog] = useState(
        noMasteredWords || noUsableSentences,
    );
    const [showAnimation, setShowAnimation] = useState(true);
    const [showStreakEffect, setShowStreakEffect] = useState(false);
    const [streakCount, setStreakCount] = useState(0);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [showMistakes, setShowMistakes] = useState(false);
    const [bookmarks, setBookmarks] = useState({});
    const [unlockedListName, setUnlockedListName] = useState(null);
    const [showUnlockedOverlay, setShowUnlockedOverlay] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(0);


    const triggerAchievements = () => {
        window.dispatchEvent(new CustomEvent("check-achievements"));
    };

    const uniqueIncorrectWords = useMemo(() => {
        const wordMap = new Map();
        incorrectQuestions.forEach((iq) => {
            // Case 1: Matching pairs (MasteryTest uses iq.pairs, WordlistQuiz uses iq.matching_pairs)
            const pairs = iq.pairs || iq.matching_pairs;
            if (
                (iq.type === "match_pairs" || iq.type === "matching") &&
                pairs
            ) {
                pairs.forEach((p) => {
                    const id = p.id || p.word_id;
                    const word = p.word || p.left;
                    if (id && word && !wordMap.has(id)) {
                        wordMap.set(id, { id, word });
                    }
                });
            } else {
                // Case 2: Regular questions (MCQ, synonym, antonym, etc.)
                const id = iq.word_id || iq.id;
                const word =
                    iq.word ||
                    iq.question_text ||
                    iq.label ||
                    iq.targetWordWord ||
                    iq.correct;

                // Only add if we have both an ID and a word string
                if (id && word && !wordMap.has(id)) {
                    wordMap.set(id, { id, word });
                }
            }
        });
        return Array.from(wordMap.values());
    }, [incorrectQuestions]);

    const q = questions[current] ?? null;
    const total = questions.length;

    const handleMCQAnswer = (option) => {
        if (answered) return;
        setSelected(option);
        setAnswered(true);
        const correct = option.toLowerCase() === q.correct.toLowerCase();
        setIsCorrect(correct);
        if (correct) {
            setScore((s) => s + 1);
            playCorrect(userSettings);
            toast.success(t("quiz.mcq_correct"), { duration: 2000, icon: "✓" });
        } else {
            playIncorrect(userSettings);
            toast.error(t("quiz.mcq_wrong"), { duration: 2000, icon: "✗" });
            setIncorrectQuestions((prev) => [...prev, q]);
        }
    };

    const handleMatchSubmit = (correctCount) => {
        setMatchCorrectCount(correctCount);
        setAnswered(true);
        const passed = correctCount >= matchPassThreshold;
        if (passed) {
            setScore((s) => s + 1);
            playCorrect(userSettings);
            toast.success(
                t("quiz.match_passed", {
                    correct: correctCount,
                    total: q.pairs.length,
                }),
                { duration: 2500, icon: "✓" },
            );
        } else {
            playIncorrect(userSettings);
            setIncorrectQuestions((prev) => [...prev, q]);
            toast.error(
                t("quiz.match_failed", {
                    correct: correctCount,
                    total: q.pairs.length,
                }),
                { duration: 2500, icon: "✗" },
            );
        }
    };

    const handleBookmark = (wordId) => {
        setBookmarks((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
        router.post(
            route("word.bookmark", wordId),
            {},
            { preserveScroll: true },
        );
    };

    const handleDemote = (wordId) => {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(
                    route("word.demote-from-mastery", wordId),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: resolve,
                        onError: reject,
                    },
                );
            }),
            {
                loading: "Moving back to learning...",
                success: "Word moved back to learning phase!",
                error: "Failed to move word.",
            },
        );
    };

    const handleNext = async () => {
        if (current + 1 >= total) {
            try {
                const wordIds = questions
                    .flatMap((q) => {
                        if (q.type === "match_pairs") {
                            return q.pairs.map((p) => p.id);
                        }
                        return [q.id];
                    })
                    .filter((id) => !!id);

                const body = {
                    correct_count: score,
                    total_questions: total,
                    word_ids: wordIds,
                    ...(wordlistId ? { wordlist_id: wordlistId } : {}),
                };
                const csrfToken = document.cookie
                    .split("; ")
                    .find((r) => r.startsWith("XSRF-TOKEN="))
                    ?.split("=")[1];
                const res = await fetch(route("mastery-test.finish"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": decodeURIComponent(csrfToken || ""),
                        Accept: "application/json",
                    },
                    body: JSON.stringify(body),
                });
                const result = await res.json();

                if (result.xp_awarded) {
                    setXpAwarded(result.xp_awarded);
                }

                if (result.streak_increased) {
                    setStreakCount(result.streak?.current_streak ?? 0);
                    setShowStreakEffect(true);

                    if (result.unlocked_wordlist) {
                        setUnlockedListName(result.unlocked_wordlist);
                    }
                } else if (result.unlocked_wordlist) {
                    setUnlockedListName(result.unlocked_wordlist);
                    // We don't trigger it immediately if streak is not shown because 
                    // we want it to show after the Done Lottie animation or results screen.
                } else {
                    // Achievements will be triggered after Lottie/Streak
                }
            } catch (e) {
                console.error(e);
            }
            setDone(true);
            playSessionComplete(userSettings);
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
            setAnswered(false);
            setIsCorrect(false);
            setMatchCorrectCount(null);
        }
    };

    const handleRestart = () => {
        setCurrent(0);
        setSelected(null);
        setAnswered(false);
        setIsCorrect(false);
        setScore(0);
        setDone(false);
        setMatchCorrectCount(null);
        setShowAnimation(true);
    };

    if (showIntro && !noMasteredWords && !noUsableSentences) {
        return (
            <AppLayout hideHeader={true}>
                <Head title={t("quiz.title")} />
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex justify-center px-4 pt-4">
                    <div
                        className="w-full max-w-md mb-4"
                        style={{ animation: "fadeInUp 0.4s ease-out" }}
                    >
                        <Link
                            href={
                                categoryId
                                    ? route("wordlistcategory.wordlists", {
                                          category: categoryId,
                                      })
                                    : route("dashboard")
                            }
                            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mb-5 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> {t("quiz.back")}
                        </Link>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md overflow-hidden mb-4">
                            <div className="bg-gradient-to-br from-[#E5201C] to-rose-600 px-6 pt-8 pb-10 text-white text-center relative">
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                                        backgroundSize: "30px 30px",
                                    }}
                                />
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                                    <Brain className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-extrabold mb-1">
                                    {t("quiz.subtitle")}
                                </h1>
                                <p className="text-white/80 text-sm">
                                    {wordListTitle
                                        ? t("quiz.subtitle_wordlist", {
                                              title: wordListTitle,
                                          })
                                        : t("quiz.subtitle_desc")}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-800 border-b border-gray-100 dark:border-slate-800">
                                <div className="py-4 text-center">
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                                        {total}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-0.5">
                                        {t("quiz.stats.questions")}
                                    </p>
                                </div>
                                <div className="py-4 text-center">
                                    <p className="text-xl font-extrabold text-[#E5201C]">
                                        +{total}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-0.5">
                                        {t("quiz.stats.max_pts")}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3.5 mb-5 flex items-start gap-3">
                            <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                <span className="font-bold">
                                    {t("quiz.quick_tip")}
                                </span>{" "}
                                {t("quiz.tip_msg")}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowIntro(false)}
                            className="w-full py-4 bg-[#E5201C] hover:bg-red-700 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Target className="h-5 w-5" /> {t("quiz.lets_go")}
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (done) {
        const pct = Math.round((score / total) * 100);
        const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
        return (
            <AppLayout hideHeader={true}>
                <Head title={t("quiz.results_title")} />
                {done && showAnimation && !showStreakEffect && (
                    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                        <Lottie
                            animationData={doneAnimation}
                            loop={false}
                            style={{ width: 600, height: 600 }}
                            onComplete={() => {
                                setShowAnimation(false);
                                if (!showStreakEffect) {
                                    if (unlockedListName) {
                                        setShowUnlockedOverlay(true);
                                    } else {
                                        triggerAchievements();
                                    }
                                }
                            }}
                        />
                    </div>
                )}
                {showStreakEffect && (
                    <StreakPop
                        streakCount={streakCount}
                        onComplete={() => {
                            setShowStreakEffect(false);
                            if (unlockedListName) {
                                setShowUnlockedOverlay(true);
                            } else {
                                triggerAchievements();
                            }
                        }}
                    />
                )}

                {showUnlockedOverlay && (
                    <WordlistUnlockedOverlay
                        listName={unlockedListName}
                        onDismiss={() => {
                            setShowUnlockedOverlay(false);
                            triggerAchievements();
                        }}
                    />
                )}
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex justify-center px-4 pt-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md w-full max-w-md p-8 text-center h-fit mb-4">
                        <div className="text-6xl mb-4">{emoji}</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            {t("quiz.test_complete")}
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                            {t("quiz.answered_info", { score, total })}
                        </p>
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <svg
                                viewBox="0 0 36 36"
                                className="w-full h-full -rotate-90"
                            >
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="dark:stroke-slate-700 stroke-[#F0F2F5]"
                                />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke={
                                        pct >= 80
                                            ? "#16a34a"
                                            : pct >= 50
                                              ? "#f59e0b"
                                              : "#E5201C"
                                    }
                                    strokeWidth="3"
                                    strokeDasharray={`${pct} ${100 - pct}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-extrabold text-gray-900">
                                    {pct}%
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                                    {score}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {t("quiz.correct")}
                                </p>
                            </div>
                            <div
                                onClick={() => setShowMistakes(!showMistakes)}
                                className="bg-red-50 dark:bg-red-950/30 rounded-2xl py-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">
                                    {total - score}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 group-hover:text-red-500 transition-colors">
                                    {t("quiz.wrong")}
                                </p>
                            </div>
                        </div>

                        {xpAwarded > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl py-8 px-4 mb-8 text-center border-2 border-yellow-200 dark:border-yellow-800 shadow-sm overflow-hidden relative group">
                                <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <XpCounter targetXp={xpAwarded} />
                                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mt-2 tracking-wide uppercase">
                                    {t("exercise.complete.xp_earned")}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">

                            {uniqueIncorrectWords.length > 0 && (
                                <button
                                    onClick={() =>
                                        setShowMistakes(!showMistakes)
                                    }
                                    className={`w-full h-14 flex items-center justify-center gap-2 rounded-2xl border-2 transition-all font-bold shadow-sm ${showMistakes ? "bg-orange-600 text-white border-orange-600" : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40"}`}
                                >
                                    <Brain className="h-5 w-5" />
                                    {showMistakes
                                        ? "Hide Mistakes"
                                        : `Review Mistakes (${uniqueIncorrectWords.length})`}
                                </button>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-[#E5201C] text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 dark:shadow-none"
                            >
                                <RotateCcw className="h-5 w-5" />{" "}
                                {t("quiz.try_again")}
                            </button>
                            <Link
                                href={
                                    categoryId
                                        ? route("wordlistcategory.wordlists", {
                                              category: categoryId,
                                          })
                                        : route("dashboard")
                                }
                                className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                            >
                                <ChevronLeft className="h-5 w-5" />{" "}
                                {categoryId
                                    ? t("quiz.back_to_wordlist")
                                    : t("quiz.back_to_dashboard")}
                            </Link>
                        </div>

                        {showMistakes && (
                            <div className="mt-8 space-y-4 text-left border-t border-gray-100 dark:border-slate-800 pt-8">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-8 bg-red-500 rounded-full" />
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                            Incorrect Words
                                        </h2>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 px-2 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                        {uniqueIncorrectWords.length}
                                    </span>
                                </div>
                                {uniqueIncorrectWords.map((wordObj, idx) => (
                                    <div
                                        key={wordObj.id || `mistake-${idx}`}
                                        className=""
                                    >
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex-1 truncate">
                                                {wordObj.word}
                                            </h3>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() =>
                                                        handleBookmark(
                                                            wordObj.id,
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${bookmarks[wordObj.id] ? "bg-yellow-100 text-yellow-600 border border-yellow-200" : "bg-gray-50 dark:bg-slate-800 text-gray-500 border border-transparent hover:bg-gray-100 dark:hover:bg-slate-700"}`}
                                                >
                                                    <Bookmark
                                                        className={`h-3 w-3 ${bookmarks[wordObj.id] ? "fill-current" : ""}`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDemote(wordObj.id)
                                                    }
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-all"
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Remove Mastered
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout hideHeader={true}>
            <Head title={q?.word ? `${q.word} - Quiz` : t("quiz.title")} />
            <Toaster position="top-center" expand={false} richColors />
            {showStreakEffect && (
                <StreakPop
                    streakCount={streakCount}
                    onComplete={() => setShowStreakEffect(false)}
                />
            )}
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 px-4 py-8">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex-1 mr-4">
                            <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#E5201C] transition-all duration-500"
                                    style={{
                                        width: `${((current + 1) / total) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <button
                                onClick={() => {
                                    setStreakCount(5);
                                    setShowStreakEffect(true);
                                }}
                                className="shrink-0 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-full px-2 py-0.5 shadow-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                Test Streak
                            </button> */}
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                                {current + 1} / {total}
                            </span>
                        </div>
                    </div>
                    <div className="mb-6 flex justify-between items-center">
                        <TypeBadge type={q.type} />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />{" "}
                            {score} pts
                        </div>
                    </div>
                    <div
                        key={current}
                        style={{ animation: "fadeInUp 0.3s ease-out" }}
                    >
                        {q.type === "fill_blank" && (
                            <FillBlankQuestion
                                q={q}
                                answered={answered}
                                selected={selected}
                                isCorrect={isCorrect}
                                onAnswer={handleMCQAnswer}
                            />
                        )}
                        {q.type === "match_pairs" && (
                            <MatchPairsQuestion
                                q={q}
                                onSubmit={handleMatchSubmit}
                            />
                        )}
                        {(q.type === "synonym" ||
                            q.type === "antonym" ||
                            q.type === "translation_en_bn") && (
                            <SimpleQuestion
                                q={q}
                                answered={answered}
                                selected={selected}
                                isCorrect={isCorrect}
                                onAnswer={handleMCQAnswer}
                            />
                        )}
                        {answered && (
                            <button
                                onClick={handleNext}
                                className="w-full mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl shadow-lg transition active:scale-[0.98]"
                            >
                                {current + 1 === total
                                    ? t("quiz.finish_test")
                                    : t("quiz.next_question")}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={showNoWordsDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("quiz.no_words_title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {noUsableSentences
                                ? t("quiz.no_words_desc_sentences")
                                : t("quiz.no_words_desc_mastery")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2">
                        <AlertDialogAction
                            onClick={() =>
                                (window.location.href = route(
                                    "wordlistcategory.index",
                                ))
                            }
                            className="w-full bg-[#E5201C] hover:bg-red-700"
                        >
                            {t("quiz.start_exercising")}
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={() =>
                                (window.location.href = route("dashboard"))
                            }
                            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 shadow-none"
                        >
                            {t("quiz.go_back")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AppLayout>
    );
}
