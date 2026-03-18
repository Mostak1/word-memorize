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
import { ChevronLeft, Trophy, Check, X, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function Quiz({ questions = [], noMasteredWords = false }) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const [showNoWordsDialog, setShowNoWordsDialog] = useState(noMasteredWords);

    const q = questions[current] ?? null;
    const total = questions.length;

    const handleAnswer = (option) => {
        if (answered) return;
        setSelected(option);
        setAnswered(true);

        const correct = option.toLowerCase() === q.correct.toLowerCase();
        setIsCorrect(correct);

        if (correct) {
            setScore((s) => s + 1);
            toast.success("Correct! Well done.", {
                duration: 2000,
                icon: "✓",
            });
        } else {
            toast.error("Wrong answer!", {
                duration: 2000,
                icon: "✗",
            });
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
        }
    };

    const handleRestart = () => {
        setCurrent(0);
        setSelected(null);
        setAnswered(false);
        setIsCorrect(false);
        setScore(0);
        setDone(false);
    };

    /* ── option styling — only highlight selected; never reveal correct ── */
    const optionClass = (option) => {
        const base =
            "w-full px-4 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all text-left";
        if (!answered) {
            return `${base} bg-white border-gray-200 text-gray-800 hover:border-[#E5201C] hover:bg-red-50 active:scale-[0.98]`;
        }
        const isThisCorrect = option.toLowerCase() === q.correct.toLowerCase();
        const isThisSelected = option === selected;

        if (isThisSelected && isCorrect) {
            // User picked correctly — show green
            return `${base} bg-green-50 border-green-500 text-green-800`;
        }
        if (isThisSelected && !isCorrect) {
            // User picked wrong — show red on their choice only
            return `${base} bg-red-50 border-[#E5201C] text-red-700`;
        }
        // All other options — muted, no hints
        return `${base} bg-white border-gray-200 text-gray-400`;
    };

    /* ── Done screen ── */
    if (done) {
        const pct = Math.round((score / total) * 100);
        const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
        return (
            <AppLayout>
                <Head title="Quiz Results" />
                <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
                    <div className="bg-white rounded-3xl shadow-md w-full max-w-md p-8 text-center">
                        <div className="text-6xl mb-4">{emoji}</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                            Quiz Complete!
                        </h1>
                        <p className="text-gray-400 text-sm mb-6">
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
                                    stroke="#F0F2F5"
                                    strokeWidth="3"
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
                            <div className="bg-green-50 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-green-600">
                                    {score}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Correct
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-[#E5201C]">
                                    {total - score}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Wrong
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleRestart}
                                className="w-full py-3.5 bg-[#E5201C] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition"
                            >
                                <RotateCcw className="h-4 w-4" /> Try Again
                            </button>
                            <Link
                                href={route("dashboard")}
                                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md transition"
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

    /* ── Main quiz screen ── */
    return (
        <AppLayout>
            <Head title="Quiz" />
            <Toaster position="top-center" richColors />

            <div className="min-h-screen bg-[#F0F2F5] pb-10">
                <div className="max-w-lg mx-auto px-4 pt-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href={route("dashboard")}
                            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition text-gray-500"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-gray-900">
                                Quiz
                            </h1>
                            <p className="text-xs text-gray-400">
                                Fill in the blank
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-bold text-gray-700">
                                {score}
                            </span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
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
                            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                                Question {current + 1} of {total}
                            </p>

                            {/* Sentence */}
                            <div className="bg-white rounded-2xl px-5 py-5 shadow-sm mb-4">
                                <p className="text-base text-gray-800 leading-relaxed text-center font-medium">
                                    {q.sentence
                                        .split("___________")
                                        .map((part, i, arr) => (
                                            <span key={i}>
                                                {part}
                                                {i < arr.length - 1 && (
                                                    <span
                                                        className={`inline-block mx-1 border-b-2 font-bold min-w-[80px] text-center transition-all
                                                        ${
                                                            !answered
                                                                ? "border-gray-400 text-transparent"
                                                                : isCorrect
                                                                  ? "border-green-500 text-green-700"
                                                                  : "border-gray-300 text-transparent"
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

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {q.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(option)}
                                        className={optionClass(option)}
                                        disabled={answered}
                                    >
                                        <span className="flex items-center gap-2">
                                            {answered &&
                                                option === selected &&
                                                isCorrect && (
                                                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                )}
                                            {answered &&
                                                option === selected &&
                                                !isCorrect && (
                                                    <X className="h-4 w-4 text-red-500 shrink-0" />
                                                )}
                                            {option}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Next button */}
                            {answered && (
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-[#E5201C] hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md"
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
                            No Mastered Words Yet
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            You need to master some words first before taking
                            the quiz. Complete some exercises and mark words as
                            "Check" to master them!
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
