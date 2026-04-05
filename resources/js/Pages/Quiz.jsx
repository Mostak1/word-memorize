import { Player } from "@lottiefiles/react-lottie-player";
import doneAnimation from "../../../public/lottie/Done.json";
import { Head, Link } from "@inertiajs/react";
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
import { Toaster, toast } from "sonner";
import {
    ChevronLeft,
    Trophy,
    Check,
    X,
    RotateCcw,
    Shuffle,
    Languages,
    BookOpen,
    ArrowLeftRight,
} from "lucide-react";
import { useState, useMemo } from "react";

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
    const meta = TYPE_META[type] ?? {
        label: type,
        color: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
    };
    const Icon = meta.icon ?? BookOpen;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}
        >
            <Icon className="h-3 w-3" />
            {meta.label}
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
    const prompt = {
        synonym: (
            <>
                Which word is a <strong>synonym</strong> of{" "}
                <span className="text-[#E5201C] font-bold">{q.word}</span>?
            </>
        ),
        antonym: (
            <>
                Which word is an <strong>antonym</strong> of{" "}
                <span className="text-[#E5201C] font-bold">{q.word}</span>?
            </>
        ),
        translation_en_bn: (
            <>
                What does{" "}
                <span className="text-[#E5201C] font-bold">{q.word}</span> mean
                in <strong>Bangla</strong>?
            </>
        ),
    }[q.type];

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-5 shadow-sm mb-4">
                <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed text-center">
                    {prompt}
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
    // Shuffle meanings once per mount (question change)
    const shuffledIndices = useMemo(() => {
        const idx = q.pairs.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        return idx; // shuffledIndices[displayPos] = pairIndex
    }, []);

    // wordToMeaning: { wordIndex (number) -> displayPos (number) }
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
            // Free any other word previously linked to this meaning slot
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

    // Styling helpers
    const wordClass = (wordIndex) => {
        const base =
            "w-full px-3 py-2.5 rounded-xl text-sm font-semibold border-2 text-center transition-all ";
        const isSelected = selectedWord === wordIndex;
        const isMatched = wordToMeaning[wordIndex] !== undefined;

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
        if (isSelected)
            return (
                base +
                "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-800 dark:text-blue-400"
            );
        if (isMatched)
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
                "bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-700 dark:text-amber-400"
            );
        if (selectedWord !== null)
            return (
                base +
                "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
            );
        return (
            base +
            "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400"
        );
    };

    return (
        <div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-4 shadow-sm mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                    {submitted
                        ? "Here are the results:"
                        : selectedWord !== null
                          ? "Now tap a meaning on the right →"
                          : "Tap a word on the left to start"}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    {/* Words column */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-1">
                            Words
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

                    {/* Meanings column */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center mb-1">
                            Meanings
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
                    style={{ animation: "fadeInUp 0.2s ease-out" }}
                >
                    Check Answers
                </button>
            )}
        </div>
    );
}

// ── Main Quiz component ───────────────────────────────────────────────────────

export default function Quiz({
    questions = [],
    noMasteredWords = false,
    noUsableSentences = false,
    matchPassThreshold = 3,
    wordListTitle = null,
}) {
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

    const q = questions[current] ?? null;
    const total = questions.length;

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleMCQAnswer = (option) => {
        if (answered) return;
        setSelected(option);
        setAnswered(true);

        const correct = option.toLowerCase() === q.correct.toLowerCase();
        setIsCorrect(correct);
        if (correct) {
            setScore((s) => s + 1);
            toast.success("Correct! Well done.", { duration: 2000, icon: "✓" });
        } else {
            toast.error("Wrong answer!", { duration: 2000, icon: "✗" });
        }
    };

    // Called by MatchPairsQuestion when the user clicks "Check Answers"
    const handleMatchSubmit = (correctCount) => {
        setMatchCorrectCount(correctCount);
        setAnswered(true);
        const passed = correctCount >= matchPassThreshold;
        if (passed) setScore((s) => s + 1);
        if (passed) {
            toast.success(
                `${correctCount}/${q.pairs.length} correct — great job!`,
                { duration: 2500, icon: "✓" },
            );
        } else {
            toast.error(
                `${correctCount}/${q.pairs.length} correct — keep practising!`,
                { duration: 2500, icon: "✗" },
            );
        }
    };

    const handleNext = () => {
        if (current + 1 >= total) {
            setDone(true);
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
    };

    // ── Done screen ────────────────────────────────────────────────────────────

    if (done) {
        const pct = Math.round((score / total) * 100);
        const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
        return (
            <AppLayout>
                <Head title="Quiz Results" />
                {/* Fullscreen Lottie overlay */}
                {showAnimation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <Player
                            autoplay
                            keepLastFrame={false}
                            src={doneAnimation}
                            style={{ height: "100%", width: "100%" }}
                            onEvent={(event) => {
                                if (event === "complete")
                                    setShowAnimation(false);
                            }}
                        />
                    </div>
                )}
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md w-full max-w-md p-8 text-center">
                        <div className="text-6xl mb-4">{emoji}</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            Quiz Complete!
                        </h1>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                            You answered {score} out of {total} correctly
                        </p>

                        {/* Score ring */}
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
                                    Correct
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-[#E5201C] dark:text-red-400">
                                    {total - score}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    Wrong
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleRestart}
                                className="w-full py-3.5 bg-[#E5201C] dark:bg-red-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 dark:hover:bg-red-800 transition"
                            >
                                <RotateCcw className="h-4 w-4" /> Try Again
                            </button>
                            <Link
                                href={route("dashboard")}
                                className="w-full py-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md dark:hover:shadow-md transition"
                            >
                                <ChevronLeft className="h-4 w-4" /> Back to
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // ── Main quiz screen ───────────────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title="Quiz" />
            <Toaster position="top-center" richColors />

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-10">
                <div className="max-w-lg mx-auto px-4 pt-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href={route("dashboard")}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition text-gray-500 dark:text-gray-400"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {wordListTitle ? wordListTitle : "Quiz"}
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {wordListTitle
                                    ? "Word list quiz"
                                    : "Mixed question types"}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm dark:border dark:border-slate-700">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {score}
                            </span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mb-5 overflow-hidden">
                        <div
                            className="h-full bg-[#E5201C] rounded-full transition-all duration-500"
                            style={{ width: `${(current / total) * 100}%` }}
                        />
                    </div>

                    {q && (
                        <div
                            key={current}
                            style={{ animation: "fadeInUp 0.3s ease-out" }}
                        >
                            {/* Question counter + type badge */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Question {current + 1} of {total}
                                </p>
                                <TypeBadge type={q.type} />
                            </div>

                            {/* ── Fill in the Blank ── */}
                            {q.type === "fill_blank" && (
                                <FillBlankQuestion
                                    q={q}
                                    answered={answered}
                                    selected={selected}
                                    isCorrect={isCorrect}
                                    onAnswer={handleMCQAnswer}
                                />
                            )}

                            {/* ── Synonym / Antonym / Translation ── */}
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

                            {/* ── Match the Pairs ── */}
                            {q.type === "match_pairs" && (
                                <MatchPairsQuestion
                                    q={q}
                                    onSubmit={handleMatchSubmit}
                                />
                            )}

                            {/* Match-pairs result summary */}
                            {q.type === "match_pairs" && answered && (
                                <div
                                    className={`rounded-2xl px-4 py-3 mb-4 text-sm font-semibold text-center ${
                                        matchCorrectCount >= matchPassThreshold
                                            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                                            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                                    }`}
                                    style={{
                                        animation: "fadeInUp 0.2s ease-out",
                                    }}
                                >
                                    {matchCorrectCount >= matchPassThreshold ? (
                                        <>
                                            <Check className="inline h-4 w-4 mr-1" />
                                            {matchCorrectCount}/{q.pairs.length}{" "}
                                            correct — point earned!
                                        </>
                                    ) : (
                                        <>
                                            <X className="inline h-4 w-4 mr-1" />
                                            {matchCorrectCount}/{q.pairs.length}{" "}
                                            correct — need {matchPassThreshold}+
                                            to score
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Next button (all types except match_pairs handle their own "Check") */}
                            {answered && (
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-[#E5201C] dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md"
                                    style={{
                                        animation: "fadeInUp 0.2s ease-out",
                                    }}
                                >
                                    {current + 1 >= total
                                        ? "See Results"
                                        : "Next Question →"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* No mastered words dialog */}
            <AlertDialog
                open={showNoWordsDialog}
                onOpenChange={setShowNoWordsDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            {noUsableSentences
                                ? "Words Not Ready for Quiz"
                                : "No Mastered Words Yet"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {noUsableSentences
                                ? "Your mastered words don't have enough data for the quiz yet. Keep exercising and mastering more words!"
                                : 'You need to master some words first before taking the quiz. Complete some exercises and mark words as "Check" to master them!'}
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
                            Start Exercising
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={() =>
                                (window.location.href = route("dashboard"))
                            }
                            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 shadow-none"
                        >
                            Go Back
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
