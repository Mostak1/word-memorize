import { CheckCircle2, ChevronRight, GraduationCap, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function QuizPanel({ question, onAnswer }) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState("idle"); // 'idle', 'correct', 'wrong'

    if (!question) return null;

    const handleOptionSelect = (option) => {
        if (status !== "idle") return;
        setSelected(option);
        const isCorrect = option === question.correct;
        setStatus(isCorrect ? "correct" : "wrong");

        setTimeout(() => {
            onAnswer(isCorrect);
            setSelected(null);
            setStatus("idle");
        }, 1200);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-xl shadow-indigo-100/50 dark:shadow-slate-950/50 border border-indigo-50 dark:border-indigo-900/40 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-wider">
                        {t("exercise.quiz.title")}
                    </span>
                </div>
            </div>

            <div className="p-6">
                {/* Prompt */}
                <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-indigo-900/40">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center leading-relaxed">
                        {t(`exercise.quiz.prompts.${question.type}`, {
                            word: question.targetWordWord ?? "",
                        })}
                    </h3>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                    {question.options.map((opt, i) => {
                        const isCorrectOpt = opt === question.correct;
                        const isSelectedOpt = opt === selected;

                        let style =
                            "border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-gray-50/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300";
                        if (status !== "idle") {
                            if (isCorrectOpt)
                                style =
                                    "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 scale-[1.02] shadow-lg shadow-green-100 dark:shadow-green-950/50";
                            else if (isSelectedOpt)
                                style = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 opacity-60";
                            else style = "opacity-30 border-gray-100 dark:border-slate-800";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleOptionSelect(opt)}
                                disabled={status !== "idle"}
                                className={`group relative w-full p-4 md:p-5 rounded-2xl border-2 font-bold text-base md:text-lg text-left transition-all duration-200 flex items-center justify-between ${style}`}
                            >
                                <span className="flex-1 pr-6">{opt}</span>
                                {status !== "idle" && isCorrectOpt && (
                                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                                )}
                                {status !== "idle" &&
                                    isSelectedOpt &&
                                    !isCorrectOpt && (
                                        <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                                    )}
                                {status === "idle" && (
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Status Indicator */}
                {status !== "idle" && (
                    <div className="mt-6 flex justify-center animate-in fade-in zoom-in-90 fill-mode-both">
                        <span
                            className={`px-6 py-2.5 rounded-full text-base font-black uppercase tracking-widest shadow-lg ${
                                status === "correct"
                                    ? "bg-green-500 text-white shadow-green-200 dark:shadow-none"
                                    : "bg-red-500 text-white shadow-red-200 dark:shadow-none"
                            }`}
                        >
                            {status === "correct"
                                ? t("exercise.quiz.correct")
                                : t("exercise.quiz.incorrect")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
