import { Eye, EyeOff, Info, MoveDiagonal2, Volume2 } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

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
    const { t } = useTranslation();

    if (!word || !showMeaning) return null;

    return (
        <div
            ref={meaningCardRef}
            className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10"
        >
            {/* Meaning & Details Group */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-gray-200/50 dark:shadow-slate-950/50 border border-gray-100/50 dark:border-slate-800/50 space-y-6">
                {/* Bengali Meaning */}
                {userSettings?.show_bangla && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-gray-200 dark:bg-slate-800" />
                            {t("exercise.card.bengali_meaning")}
                        </h4>
                        <div className="flex items-center gap-3">
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {word.bangla_meaning}
                            </p>
                        </div>
                    </div>
                )}

                {/* Definition */}
                <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-gray-200 dark:bg-slate-800" />
                        {t("exercise.card.definition")}
                    </h4>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {word.definition}
                    </p>
                </div>

                {/* Synonyms & Antonyms Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {word.synonym && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">
                                {t("exercise.card.synonym")}
                            </h4>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-xl border border-green-100 dark:border-green-900/30">
                                {word.synonym}
                            </p>
                        </div>
                    )}
                    {word.antonym && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500">
                                {t("exercise.card.antonym")}
                            </h4>
                            <p className="text-sm font-semibold text-red-400 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                                {word.antonym}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pronunciation & IPA */}
                {(word.phonetic || word.bangla_pronunciation) && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-gray-200 dark:bg-slate-800" />
                            {t("exercise.card.pronunciation")}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3">
                            {word.phonetic && (
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-slate-700">
                                    <Volume2 className="h-4 w-4 text-gray-400" />
                                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400 tracking-tight">
                                        /{word.phonetic}/
                                    </span>
                                </div>
                            )}
                            {word.bangla_pronunciation &&
                                userSettings?.show_bangla && (
                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                        {word.bangla_pronunciation}
                                    </span>
                                )}
                        </div>
                    </div>
                )}
            </div>

            {/* Collocations Section */}
            {collocationList.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-gray-200/50 dark:shadow-slate-950/50 border border-gray-100/50 dark:border-slate-800/50">
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 flex items-center gap-2 mb-4">
                        <span className="w-4 h-[1px] bg-gray-200 dark:bg-slate-800" />
                        {t("exercise.card.collocations")}
                    </h4>
                    <div className="space-y-4">
                        {collocationList.map((col, idx) => (
                            <div
                                key={idx}
                                className="group p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-[#E5201C]/20 transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 text-[#E5201C]">
                                        <MoveDiagonal2 className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                                {col.phrase}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    onSpeak(col.phrase)
                                                }
                                                className="p-1 text-gray-300 hover:text-[#E5201C] transition-colors"
                                            >
                                                <Volume2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {col.example_sentence && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                                "{col.example_sentence}"
                                            </p>
                                        )}
                                        {col.bangla_meaning &&
                                            userSettings?.show_bangla && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium bg-red-50/30 dark:bg-red-950/20 px-2 py-1 rounded-lg">
                                                    {col.bangla_meaning}
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Answer Controls */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[40px] shadow-2xl shadow-gray-200 dark:shadow-slate-950 sticky bottom-4 z-40 border border-white dark:border-white/5 mx-2">
                <div className="flex gap-4">
                    <button
                        onClick={handleDontKnow}
                        disabled={isSubmitting}
                        className="flex-1 h-14 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 font-black text-base rounded-[24px] border-2 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {t("exercise.card.dont_know_button")}
                    </button>
                    <button
                        onClick={handleKnow}
                        disabled={isSubmitting}
                        className="flex-[1.5] h-14 bg-[#E5201C] text-white font-black text-xl rounded-[24px] shadow-lg shadow-red-200 dark:shadow-red-950/50 hover:bg-red-700 transition-all active:scale-95 active:shadow-sm disabled:opacity-50 disabled:active:scale-100"
                    >
                        {t("exercise.card.know_button")}
                    </button>
                </div>
            </div>
        </div>
    );
}
