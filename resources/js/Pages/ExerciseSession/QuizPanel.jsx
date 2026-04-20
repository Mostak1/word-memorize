import { useState } from "react";

export default function QuizPanel({ question, onAnswer }) {
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);

    const handleSelect = (option) => {
        if (revealed) return;
        setSelected(option);
        setRevealed(true);
        const isCorrect = option === question.correct;
        // Auto-advance after 1.4s so the user can see the feedback
        setTimeout(() => onAnswer(isCorrect), 1400);
    };

    const optionStyle = (option) => {
        const base =
            "w-full text-left px-4 py-3.5 rounded-2xl border-2 font-semibold text-[15px] transition-all duration-200 ";
        if (!revealed)
            return (
                base +
                "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 hover:border-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95"
            );
        if (option === question.correct)
            return (
                base +
                "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 scale-[1.02]"
            );
        if (option === selected)
            return (
                base +
                "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
            );
        return base + "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-400 dark:text-gray-500 opacity-60";
    };

    const isCorrect = revealed && selected === question.correct;

    const TYPE_ICON = {
        fill_blank: "✏️",
        synonym: "🔁",
        antonym: "↔️",
        translation: "🌐",
    };
    const TYPE_LABEL = {
        fill_blank: "Fill in the Blank",
        synonym: "Synonym",
        antonym: "Antonym",
        translation: "Translation",
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 overflow-hidden animate-bounce-in">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                        {TYPE_ICON[question.type] ?? "🎯"}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E5201C]">
                        {TYPE_LABEL[question.type] ?? "Quick Quiz"}
                    </span>
                </div>
                <p className={`leading-snug ${
                    question.type === "fill_blank"
                        ? "text-[15px] font-mono text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2"
                        : "text-[15px] font-semibold text-gray-800 dark:text-gray-100"
                }`}>
                    {question.prompt}
                </p>
            </div>

            {/* Options */}
            <div className="px-5 py-4 flex flex-col gap-2.5">
                {question.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(opt)}
                        disabled={revealed}
                        className={optionStyle(opt)}
                    >
                        <span className="mr-2 opacity-50">{["A", "B", "C", "D"][i]})</span>
                        {opt}
                    </button>
                ))}
            </div>

            {/* Feedback bar */}
            {revealed && (
                <div
                    className={`mx-5 mb-5 rounded-2xl px-4 py-3 text-center font-bold text-sm ${
                        isCorrect
                            ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                    }`}
                >
                    {isCorrect
                        ? "✅ Correct! Marked as I Know"
                        : `❌ Oops! The answer was: ${question.correct}`}
                </div>
            )}
        </div>
    );
}
