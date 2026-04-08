import { useState, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ChevronLeft,
    Trophy,
    Check,
    X,
    Lock,
    Unlock,
    Clock,
    GraduationCap,
    AlertCircle,
    CheckSquare,
    Square,
    ArrowRight,
    RotateCcw,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
    return (
        <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mb-5 overflow-hidden">
            <div
                className="h-full bg-[#E5201C] rounded-full transition-all duration-500"
                style={{ width: `${(current / total) * 100}%` }}
            />
        </div>
    );
}

function QuestionBadge({ type }) {
    const map = {
        mcq_single: {
            label: "Single Choice",
            cls: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        },
        mcq_multiple: {
            label: "Multiple Choice",
            cls: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
        },
        matching: {
            label: "Matching",
            cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        },
        true_false: {
            label: "True / False",
            cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        },
    };
    const meta = map[type] ?? {
        label: type,
        cls: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.cls}`}
        >
            {meta.label}
        </span>
    );
}

// ─── MCQ Single ───────────────────────────────────────────────────────────────

function McqSingleQuestion({ question, onAnswer, answered, selected }) {
    const correct = Array.isArray(question.correct_answer)
        ? question.correct_answer[0]
        : question.correct_answer;

    const optionCls = (opt) => {
        const base =
            "w-full px-4 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all text-left flex items-center gap-2.5";
        if (!answered) {
            return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98] cursor-pointer`;
        }
        const isCorrect = String(opt) === String(correct);
        const isSelected = String(opt) === String(selected);
        if (isCorrect)
            return `${base} bg-green-50 dark:bg-green-950/30 border-green-500 text-green-800 dark:text-green-300`;
        if (isSelected && !isCorrect)
            return `${base} bg-red-50 dark:bg-red-950/30 border-[#E5201C] text-red-700 dark:text-red-300`;
        return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400 opacity-60`;
    };

    return (
        <div className="grid grid-cols-1 gap-3 mb-5">
            {question.options.map((opt, i) => (
                <button
                    key={i}
                    disabled={answered}
                    onClick={() => onAnswer(opt)}
                    className={optionCls(opt)}
                >
                    {answered && String(opt) === String(correct) && (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    {answered &&
                        String(opt) === String(selected) &&
                        String(opt) !== String(correct) && (
                            <X className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                    <span>{opt}</span>
                </button>
            ))}
        </div>
    );
}

// ─── True / False ─────────────────────────────────────────────────────────────

function TrueFalseQuestion({ question, onAnswer, answered, selected }) {
    const correct = Array.isArray(question.correct_answer)
        ? String(question.correct_answer[0])
        : String(question.correct_answer);

    const optionCls = (opt) => {
        const base =
            "w-full px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2.5";
        if (!answered) {
            return `${base} cursor-pointer bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98]`;
        }
        const isCorrect = opt === correct;
        const isSelected = opt === String(selected);
        if (isCorrect)
            return `${base} bg-green-50 dark:bg-green-950/30 border-green-500 text-green-800 dark:text-green-300`;
        if (isSelected && !isCorrect)
            return `${base} bg-red-50 dark:bg-red-950/30 border-[#E5201C] text-red-700 dark:text-red-300`;
        return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400 opacity-60`;
    };

    return (
        <div className="grid grid-cols-2 gap-3 mb-5">
            {["True", "False"].map((opt) => (
                <button
                    key={opt}
                    disabled={answered}
                    onClick={() => onAnswer(opt)}
                    className={optionCls(opt)}
                >
                    {answered && opt === correct && (
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    {answered &&
                        opt === String(selected) &&
                        opt !== correct && (
                            <X className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                    <span>{opt}</span>
                </button>
            ))}
        </div>
    );
}

// ─── MCQ Multiple ─────────────────────────────────────────────────────────────

function McqMultipleQuestion({ question, onAnswer, answered, selected }) {
    const [checked, setChecked] = useState([]);
    const correctSet = new Set((question.correct_answer ?? []).map(String));

    const toggle = (opt) => {
        if (answered) return;
        setChecked((prev) =>
            prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
        );
    };

    const submit = () => {
        if (checked.length === 0) return;
        onAnswer(checked);
    };

    const optionCls = (opt) => {
        const base =
            "w-full px-4 py-3.5 rounded-2xl text-sm font-semibold border-2 transition-all text-left flex items-center gap-2.5";
        if (!answered) {
            const isChecked = checked.includes(opt);
            return `${base} cursor-pointer ${isChecked ? "border-[#E5201C] bg-red-50 dark:bg-red-950/20 text-gray-900 dark:text-gray-100" : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20"}`;
        }
        const isCorrect = correctSet.has(String(opt));
        const wasSelected = (selected ?? []).includes(opt);
        if (isCorrect)
            return `${base} bg-green-50 dark:bg-green-950/30 border-green-500 text-green-800 dark:text-green-300`;
        if (wasSelected)
            return `${base} bg-red-50 dark:bg-red-950/30 border-[#E5201C] text-red-700 dark:text-red-300`;
        return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400 opacity-60`;
    };

    return (
        <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium">
                Select all correct answers
            </p>
            <div className="grid grid-cols-1 gap-3 mb-5">
                {question.options.map((opt, i) => (
                    <button
                        key={i}
                        disabled={answered}
                        onClick={() => toggle(opt)}
                        className={optionCls(opt)}
                    >
                        {answered ? (
                            correctSet.has(String(opt)) ? (
                                <Check className="h-4 w-4 text-green-600 shrink-0" />
                            ) : (selected ?? []).includes(opt) ? (
                                <X className="h-4 w-4 text-red-500 shrink-0" />
                            ) : (
                                <Square className="h-4 w-4 text-gray-400 shrink-0" />
                            )
                        ) : checked.includes(opt) ? (
                            <CheckSquare className="h-4 w-4 text-[#E5201C] shrink-0" />
                        ) : (
                            <Square className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                        <span>{opt}</span>
                    </button>
                ))}
            </div>
            {!answered && (
                <button
                    onClick={submit}
                    disabled={checked.length === 0}
                    className="w-full bg-[#E5201C] disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-md mb-4"
                >
                    Check Answer
                </button>
            )}
        </>
    );
}

// ─── Matching ─────────────────────────────────────────────────────────────────

function MatchingQuestion({ question, onAnswer, answered }) {
    const pairs = question.matching_pairs ?? [];
    const lefts = pairs.map((p) => p.left);
    const rights = [...pairs.map((p) => p.right)].sort(
        () => Math.random() - 0.5,
    );

    const [matches, setMatches] = useState({});
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [result, setResult] = useState(null);

    const selectLeft = (l) => {
        if (answered) return;
        setSelectedLeft((prev) => (prev === l ? null : l));
    };

    const selectRight = (r) => {
        if (answered || !selectedLeft) return;
        setMatches((prev) => ({ ...prev, [selectedLeft]: r }));
        setSelectedLeft(null);
    };

    const submit = () => {
        if (Object.keys(matches).length < lefts.length) return;
        const correctMap = Object.fromEntries(
            pairs.map((p) => [p.left, p.right]),
        );
        let correct = 0;
        for (const l of lefts) {
            if (matches[l] === correctMap[l]) correct++;
        }
        setResult({ correct, total: lefts.length, correctMap });
        onAnswer(matches, correct, lefts.length);
    };

    const leftCls = (l) => {
        const base =
            "px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer text-center";
        if (answered && result) {
            const isCorrect = matches[l] === result.correctMap[l];
            return `${base} ${isCorrect ? "bg-green-50 border-green-400 text-green-800 dark:bg-green-950/30 dark:border-green-600 dark:text-green-300" : "bg-red-50 border-[#E5201C] text-red-700 dark:bg-red-950/30 dark:border-red-600 dark:text-red-300"}`;
        }
        if (selectedLeft === l)
            return `${base} bg-[#E5201C]/10 border-[#E5201C] text-[#E5201C] dark:bg-red-950/30 dark:border-red-500`;
        if (matches[l])
            return `${base} bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-600 dark:text-indigo-300`;
        return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20`;
    };

    const rightCls = (r) => {
        const base =
            "px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all text-center";
        if (answered && result) {
            const matchedLeft = lefts.find((l) => matches[l] === r);
            const isCorrect =
                matchedLeft && result.correctMap[matchedLeft] === r;
            const isWrong = matchedLeft && !isCorrect;
            if (isCorrect)
                return `${base} bg-green-50 border-green-400 text-green-800 dark:bg-green-950/30 dark:border-green-600 dark:text-green-300`;
            if (isWrong)
                return `${base} bg-red-50 border-[#E5201C] text-red-700 dark:bg-red-950/30 dark:border-red-600 dark:text-red-300`;
            return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400 opacity-50`;
        }
        const isMatched = Object.values(matches).includes(r);
        if (selectedLeft && !isMatched)
            return `${base} cursor-pointer bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20`;
        if (isMatched)
            return `${base} bg-indigo-50 border-indigo-300 text-indigo-700 opacity-60 cursor-not-allowed dark:bg-indigo-950/30 dark:border-indigo-600 dark:text-indigo-300`;
        return `${base} bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400`;
    };

    return (
        <>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium">
                {answered
                    ? `${result?.correct ?? 0} / ${result?.total ?? lefts.length} matched correctly`
                    : "Tap a word on the left, then its match on the right"}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="flex flex-col gap-2">
                    {lefts.map((l, i) => (
                        <button
                            key={i}
                            onClick={() => selectLeft(l)}
                            className={leftCls(l)}
                            disabled={answered}
                        >
                            {l}
                            {matches[l] && !answered && (
                                <span className="text-xs text-indigo-400 block truncate">
                                    → {matches[l]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                    {rights.map((r, i) => (
                        <button
                            key={i}
                            onClick={() => selectRight(r)}
                            className={rightCls(r)}
                            disabled={
                                answered ||
                                (!selectedLeft &&
                                    !Object.values(matches).includes(r))
                            }
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            {!answered && (
                <button
                    onClick={submit}
                    disabled={Object.keys(matches).length < lefts.length}
                    className="w-full bg-[#E5201C] disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-md mb-4"
                >
                    Check Matches
                </button>
            )}
        </>
    );
}

// ─── Explanation Banner ───────────────────────────────────────────────────────

function ExplanationBanner({ explanation, isCorrect }) {
    if (!explanation) return null;
    return (
        <div
            className={`rounded-2xl px-4 py-3 mb-4 text-sm ${isCorrect ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"}`}
            style={{ animation: "fadeInUp 0.2s ease-out" }}
        >
            <p className="font-semibold mb-0.5">
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className="text-xs leading-relaxed opacity-90">{explanation}</p>
        </div>
    );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
    quiz,
    wordList,
    score,
    total,
    passed,
    nextAttemptAt,
}) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div
            className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center px-4"
            style={{ animation: "fadeInUp 0.4s ease-out" }}
        >
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg text-center">
                    {/* Icon */}
                    <div
                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${passed ? "bg-green-100 dark:bg-green-950/40" : "bg-red-100 dark:bg-red-950/40"}`}
                    >
                        {passed ? (
                            <Trophy className="h-12 w-12 text-green-600" />
                        ) : (
                            <RotateCcw className="h-12 w-12 text-[#E5201C]" />
                        )}
                    </div>

                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                        {passed ? "You Passed! 🎉" : "Not Quite Yet"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        {quiz.title}
                    </p>

                    {/* Score ring */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <svg
                            className="w-full h-full -rotate-90"
                            viewBox="0 0 120 120"
                        >
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                className="text-gray-100 dark:text-slate-800"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ${passed ? "text-green-500" : "text-[#E5201C]"}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                                {pct}%
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {score}/{total}
                            </span>
                        </div>
                    </div>

                    {/* Pass mark info */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        Pass mark: {quiz.pass_mark}%
                    </p>

                    {passed && (
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl px-4 py-3 mb-5 text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                            <Unlock className="h-4 w-4 shrink-0" />
                            <span>
                                Next wordlist in{" "}
                                <strong>{wordList.title}</strong>'s category is
                                now unlocked!
                            </span>
                        </div>
                    )}

                    {!passed && nextAttemptAt && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl px-4 py-3 mb-5 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>
                                Try again after{" "}
                                <strong>
                                    {new Date(nextAttemptAt).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        },
                                    )}
                                </strong>
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <Link
                            href={route("wordlistcategory.wordlists", {
                                category: wordList.word_list_category_id,
                            })}
                            className="w-full bg-[#E5201C] dark:bg-red-700 text-white font-bold py-4 rounded-2xl text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-center"
                        >
                            Back to Word Lists
                        </Link>
                        <Link
                            href={route("dashboard")}
                            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-2xl text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-center"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Cannot Attempt Screen ────────────────────────────────────────────────────

function CannotAttemptScreen({ quiz, wordList, previousAttempt }) {
    const passed = previousAttempt?.passed;
    const nextAt = previousAttempt?.next_attempt_at;

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg text-center">
                    <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${passed ? "bg-green-100 dark:bg-green-950/40" : "bg-amber-100 dark:bg-amber-950/40"}`}
                    >
                        {passed ? (
                            <Trophy className="h-10 w-10 text-green-600" />
                        ) : (
                            <Clock className="h-10 w-10 text-amber-500" />
                        )}
                    </div>

                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                        {passed ? "Already Passed!" : "Try Again Tomorrow"}
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {quiz.title}
                    </p>

                    {passed && (
                        <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-2xl px-4 py-3 mb-5">
                            You scored {previousAttempt.score}% and passed this
                            quiz. The next wordlist is unlocked!
                        </p>
                    )}

                    {!passed && nextAt && (
                        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-2xl px-4 py-3 mb-5">
                            You can retry after{" "}
                            <strong>
                                {new Date(nextAt).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </strong>
                            .
                        </p>
                    )}

                    <Link
                        href={route("wordlistcategory.wordlists", {
                            category: wordList.word_list_category_id,
                        })}
                        className="w-full block bg-[#E5201C] dark:bg-red-700 text-white font-bold py-4 rounded-2xl text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-center"
                    >
                        Back to Word Lists
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Main Quiz Page ───────────────────────────────────────────────────────────

export default function WordlistQuiz({
    quiz,
    questions = [],
    wordList,
    previousAttempt = null,
    canAttempt = true,
}) {
    const total = questions.length;

    const [current, setCurrent] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selected, setSelected] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [scoreCount, setScoreCount] = useState(0);
    const [answers, setAnswers] = useState([]); // for submitting to server

    const [done, setDone] = useState(false);
    const [finalPassed, setFinalPassed] = useState(false);
    const [nextAttemptAt, setNextAttemptAt] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const q = questions[current] ?? null;

    // ── Grading helpers ────────────────────────────────────────────────────────

    const gradeMcqSingle = useCallback(
        (choice) => {
            if (answered) return;
            const correct = Array.isArray(q.correct_answer)
                ? String(q.correct_answer[0])
                : String(q.correct_answer);
            const ok = String(choice) === correct;
            setSelected(choice);
            setAnswered(true);
            setIsCorrect(ok);
            if (ok) setScoreCount((s) => s + 1);
            setAnswers((prev) => [
                ...prev,
                { question_id: q.id, given: choice, correct: ok },
            ]);
        },
        [q, answered],
    );

    const gradeMcqMultiple = useCallback(
        (choices) => {
            if (answered) return;
            const correctSet = new Set((q.correct_answer ?? []).map(String));
            const choiceSet = new Set(choices.map(String));
            const ok =
                choiceSet.size === correctSet.size &&
                [...correctSet].every((c) => choiceSet.has(c));
            setSelected(choices);
            setAnswered(true);
            setIsCorrect(ok);
            if (ok) setScoreCount((s) => s + 1);
            setAnswers((prev) => [
                ...prev,
                { question_id: q.id, given: choices, correct: ok },
            ]);
        },
        [q, answered],
    );

    const gradeMatching = useCallback(
        (matchMap, correctCount, totalPairs) => {
            const ok = correctCount >= Math.ceil(totalPairs * 0.6);
            setAnswered(true);
            setIsCorrect(ok);
            if (ok) setScoreCount((s) => s + 1);
            setAnswers((prev) => [
                ...prev,
                {
                    question_id: q.id,
                    given: matchMap,
                    correct: ok,
                    matchScore: `${correctCount}/${totalPairs}`,
                },
            ]);
        },
        [q, answered],
    );

    // ── Navigation ─────────────────────────────────────────────────────────────

    const handleNext = async () => {
        if (current + 1 >= total) {
            // Submit to server
            setSubmitting(true);
            try {
                const res = await fetch(route("quiz.wordlist.finish"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN":
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content") ?? "",
                    },
                    body: JSON.stringify({
                        quiz_id: quiz.id,
                        correct_count: scoreCount, // already updated before user clicks Next
                        total_questions: total,
                        answers,
                    }),
                });
                const data = await res.json();
                setFinalPassed(data.passed);
                setNextAttemptAt(data.next_attempt_at ?? null);
            } catch (e) {
                console.error(e);
            }
            setSubmitting(false);
            setDone(true);
            return;
        }
        setCurrent((c) => c + 1);
        setAnswered(false);
        setSelected(null);
        setIsCorrect(false);
    };

    // ── Cannot attempt guard ───────────────────────────────────────────────────

    if (!canAttempt) {
        return (
            <AppLayout>
                <Head title={quiz.title} />
                <CannotAttemptScreen
                    quiz={quiz}
                    wordList={wordList}
                    previousAttempt={previousAttempt}
                />
            </AppLayout>
        );
    }

    // ── No questions guard ─────────────────────────────────────────────────────

    if (total === 0) {
        return (
            <AppLayout>
                <Head title="Quiz" />
                <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg text-center max-w-sm w-full">
                        <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Quiz Not Ready
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            The admin hasn't finished setting up this quiz yet.
                            Please check back later.
                        </p>
                        <Link
                            href={route("wordlistcategory.wordlists", {
                                category: wordList.word_list_category_id,
                            })}
                            className="inline-block w-full bg-[#E5201C] text-white font-bold py-3 rounded-2xl text-sm hover:bg-red-700 transition-colors"
                        >
                            Go Back
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // ── Done screen ───────────────────────────────────────────────────────────

    if (done) {
        return (
            <AppLayout>
                <Head title="Quiz Results" />
                <ResultsScreen
                    quiz={quiz}
                    wordList={wordList}
                    score={scoreCount}
                    total={total}
                    passed={finalPassed}
                    nextAttemptAt={nextAttemptAt}
                />
            </AppLayout>
        );
    }

    // ── Quiz in progress ───────────────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title={quiz.title} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-xl mx-auto px-4 py-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href={route("wordlistcategory.wordlists", {
                                category: wordList.word_list_category_id,
                            })}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition text-gray-500 dark:text-gray-400"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                                {quiz.title}
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                {wordList.title} · Pass {quiz.pass_mark}%
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm dark:border dark:border-slate-700 shrink-0">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {scoreCount}
                            </span>
                        </div>
                    </div>

                    <ProgressBar current={current} total={total} />

                    {q && (
                        <div
                            key={current}
                            style={{ animation: "fadeInUp 0.3s ease-out" }}
                        >
                            {/* Counter + type badge */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Question {current + 1} of {total}
                                </p>
                                <QuestionBadge type={q.type} />
                            </div>

                            {/* Question text */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm mb-4">
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                                    {q.question}
                                </p>
                            </div>

                            {/* Question body */}
                            {q.type === "mcq_single" && (
                                <McqSingleQuestion
                                    question={q}
                                    onAnswer={gradeMcqSingle}
                                    answered={answered}
                                    selected={selected}
                                />
                            )}

                            {q.type === "true_false" && (
                                <TrueFalseQuestion
                                    question={q}
                                    onAnswer={gradeMcqSingle}
                                    answered={answered}
                                    selected={selected}
                                />
                            )}

                            {q.type === "mcq_multiple" && (
                                <McqMultipleQuestion
                                    question={q}
                                    onAnswer={gradeMcqMultiple}
                                    answered={answered}
                                    selected={selected}
                                />
                            )}

                            {q.type === "matching" && (
                                <MatchingQuestion
                                    question={q}
                                    onAnswer={gradeMatching}
                                    answered={answered}
                                />
                            )}

                            {/* Explanation + result feedback */}
                            {answered && (
                                <>
                                    {/* Correct/Wrong banner — shown for all types except matching */}
                                    {q.type !== "matching" && (
                                        <div
                                            className={`rounded-2xl px-4 py-3 mb-4 text-sm font-semibold flex items-center gap-2 ${isCorrect ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"}`}
                                            style={{
                                                animation:
                                                    "fadeInUp 0.2s ease-out",
                                            }}
                                        >
                                            {isCorrect ? (
                                                <Check className="h-4 w-4 shrink-0" />
                                            ) : (
                                                <X className="h-4 w-4 shrink-0" />
                                            )}
                                            {isCorrect
                                                ? "Correct!"
                                                : `Correct answer: ${Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : q.correct_answer}`}
                                        </div>
                                    )}

                                    {q.explanation && (
                                        <div
                                            className="rounded-2xl px-4 py-3 mb-4 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300"
                                            style={{
                                                animation:
                                                    "fadeInUp 0.25s ease-out",
                                            }}
                                        >
                                            <p className="font-semibold mb-0.5 text-xs uppercase tracking-wide opacity-70">
                                                Explanation
                                            </p>
                                            <p className="leading-relaxed">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        disabled={submitting}
                                        className="w-full bg-[#E5201C] dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md"
                                        style={{
                                            animation: "fadeInUp 0.2s ease-out",
                                        }}
                                    >
                                        {submitting
                                            ? "Saving…"
                                            : current + 1 >= total
                                              ? "See Results"
                                              : "Next Question →"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AppLayout>
    );
}
