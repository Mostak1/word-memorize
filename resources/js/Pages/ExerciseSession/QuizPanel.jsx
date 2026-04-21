import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/Contexts/LanguageContext";

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

export default function QuizPanel({ question, onAnswer }) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState("idle"); // 'idle', 'correct', 'wrong'

    if (!question) return null;

    const currentBox = question.srs_box ?? 1;
    const meta = LEVEL_META[currentBox] ?? LEVEL_META[1];

    const handleOptionSelect = (option) => {
        if (status !== "idle") return;
        setSelected(option);
        const isCorrect = option === question.correct;
        setStatus(isCorrect ? "correct" : "wrong");

        setTimeout(() => {
            onAnswer(isCorrect);
            // Dont reset state visually right here because the card slides away
        }, 800);
    };

    const typeLabel = question.type === 'synonym' ? 'SYNONYM' : (question.type === 'translation' ? 'TRANSLATION' : 'DEFINITION');

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl pb-2">
            
            {/* Top row: 4-dot level badge (similar to word card) */}
            <div className="flex justify-center pt-5 pb-3">
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((box) => (
                        <div
                            key={box}
                            className={`rounded-full w-2 h-2 transition-all duration-200 ${
                                box <= currentBox
                                    ? (LEVEL_META[box]?.dot ?? "bg-gray-400")
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

            {/* Quiz Header: Icon + Label */}
            <div className="px-5 pb-4 flex items-center gap-2">
                <div className="bg-blue-600 rounded-md p-1.5 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white" />
                </div>
                <span className="text-red-500 font-bold text-xs tracking-widest uppercase">
                    {typeLabel}
                </span>
            </div>

            {/* Prompt */}
            <div className="px-5 mb-5">
                <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                    {t(`exercise.quiz.prompts.${question.type}`, {
                        word: question.targetWordWord ?? "",
                    })}
                </h3>
            </div>

            {/* Options */}
            <div className="px-5 pb-8 grid grid-cols-1 gap-3">
                {question.options.map((opt, i) => {
                    const isCorrectOpt = opt === question.correct;
                    const isSelectedOpt = opt === selected;
                    const letter = String.fromCharCode(65 + i);

                    let style = "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600";
                    if (status !== "idle") {
                        if (isCorrectOpt)
                            style = "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 scale-[1.01] shadow-sm shadow-green-100 dark:shadow-green-950/50";
                        else if (isSelectedOpt)
                            style = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 opacity-80";
                        else style = "opacity-40 border-gray-100 dark:border-slate-800";
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleOptionSelect(opt)}
                            disabled={status !== "idle"}
                            className={`group w-full p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3 ${style}`}
                        >
                            <span className="text-gray-400 dark:text-gray-500 font-medium text-sm">{letter})</span>
                            <span className="flex-1 text-left font-semibold text-[15px]">{opt}</span>
                            
                            {status !== "idle" && isCorrectOpt && (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            )}
                            {status !== "idle" && isSelectedOpt && !isCorrectOpt && (
                                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
