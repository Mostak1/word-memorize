import { useRef } from "react";
import { Volume2, X, Check } from "lucide-react";

const COLLOCATION_COLORS = [
    "bg-red-100/70 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    "bg-blue-100/70 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    "bg-green-100/70 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
    "bg-amber-100/70 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    "bg-purple-100/70 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
    "bg-teal-100/70 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
    "bg-pink-100/70 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
    "bg-indigo-100/70 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
];

export default function MeaningCard({
    word,
    collocationList,
    showMeaning,
    handleKnow,
    handleDontKnow,
    isSubmitting,
    auth,
    userSettings,
    onSpeak,
    meaningCardRef,
}) {
    const currentBox = word?.srs_box ?? 1;

    const renderHighlighted = (sentence, phrase) => {
        if (!sentence || !phrase) return sentence;
        const regex = new RegExp(
            `(${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi",
        );
        return sentence.split(regex).map((part, idx) =>
            regex.test(part) ? (
                <mark
                    key={idx}
                    className="font-bold bg-transparent underline underline-offset-2 decoration-2 not-italic dark:text-white"
                    style={{ textDecorationColor: "currentColor" }}
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
            ref={meaningCardRef}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showMeaning ? "opacity-100" : "opacity-0"
            }`}
            style={{
                maxHeight: showMeaning ? "1600px" : "0px",
                marginTop: showMeaning ? "12px" : "0px",
            }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 overflow-hidden pb-2">
                {/* Word header */}
                <div className="mx-4 mt-4 mb-3">
                    <p className="text-center text-lg font-bold text-gray-500 underline dark:text-gray-600 tracking-tight">
                        {word.word}
                    </p>
                </div>

                {/* Definition */}
                {word.definition && (
                    <div className="mx-4 mt-4 mb-4">
                        <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 py-1">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                                Definition
                            </p>
                            <p className="text-sm text-gray-900 dark:text-gray-200 leading-snug">
                                {word.definition}
                                {userSettings?.show_bangla && word.bangla_meaning && (
                                    <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">
                                        ({word.bangla_meaning})
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Collocations */}
                {collocationList.length > 0 && (
                    <div className="px-4 pb-4">
                        <div className="h-px bg-gray-100 dark:bg-slate-800 mb-3" />
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                            Common Collocations
                        </p>
                        <div className="flex flex-col gap-3">
                            {collocationList.slice(0, 3).map((col, i) => {
                                const colorClass = COLLOCATION_COLORS[i % COLLOCATION_COLORS.length];
                                return (
                                    <div
                                        key={i}
                                        className={`rounded-xl border px-3 py-2.5 ${colorClass}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                {col.example_sentence ? (
                                                    <p className="text-sm leading-snug dark:text-gray-400">
                                                        {renderHighlighted(
                                                            col.example_sentence,
                                                            col.phrase,
                                                        )}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs font-bold uppercase tracking-wide opacity-75 dark:text-gray-100">
                                                        {col.phrase}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    onSpeak(
                                                        col.example_sentence || col.phrase,
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
                    </div>
                )}

                {/* Synonym / Antonym grid */}
                {(word.synonym || word.antonym || word.bangla_synonym || word.bangla_antonym) && (
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
                                ) : <div />}
                                {word.antonym ? (
                                    <div className="border-l-4 border-blue-400 dark:border-blue-600 pl-3 pr-2 py-1">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                            Antonyms
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                            {word.antonym}
                                        </p>
                                    </div>
                                ) : <div />}
                            </div>
                        )}
                        {(word.bangla_synonym || word.bangla_antonym) && (
                            <div className="grid grid-cols-2 gap-0 mx-4">
                                {word.bangla_synonym ? (
                                    <div className="border-l-4 border-[#E5201C] dark:border-red-600 pl-3 pr-2 py-1">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                            প্রতিশব্দ
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                                            {word.bangla_synonym}
                                        </p>
                                    </div>
                                ) : <div />}
                                {word.bangla_antonym ? (
                                    <div className="border-l-4 border-blue-400 dark:border-blue-600 pl-3 pr-2 py-1">
                                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                            বিপরীত শব্দ
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug font-medium">
                                            {word.bangla_antonym}
                                        </p>
                                    </div>
                                ) : <div />}
                            </div>
                        )}
                    </div>
                )}

                {/* I Don't Know / I Know buttons */}
                <div className="px-4 pt-4 pb-5">
                    <div className="h-px bg-gray-100 dark:bg-slate-800 mb-4" />
                    <div className="flex gap-3">
                        <button
                            onClick={handleDontKnow}
                            disabled={isSubmitting}
                            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-[15px] hover:bg-red-100 dark:hover:bg-red-950/50 active:scale-95 disabled:opacity-50 transition-all shadow-sm dark:shadow-md"
                        >
                            <X className="h-5 w-5" strokeWidth={2.5} />
                            I Don't Know
                        </button>
                        <button
                            onClick={handleKnow}
                            disabled={isSubmitting}
                            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-green-600 text-white font-bold text-[15px] hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-green-100 dark:shadow-green-900/30"
                        >
                            <Check className="h-5 w-5" strokeWidth={2.5} />
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
    );
}
