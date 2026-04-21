import {
    Bookmark,
    Eye,
    EyeOff,
    Info,
    LayoutGrid,
    Maximize2,
    Volume2,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function FlashCard({
    word,
    cardKey,
    exiting,
    exitDir,
    wordList,
    subcategory,
    bookmarks,
    onBookmark,
    onSpeak,
    showMeaning,
    onToggleMeaning,
    levelUpPulse,
    auth,
    userSettings,
    activeImageIndex,
    setActiveImageIndex,
}) {
    const { t } = useTranslation();
    const [fullImage, setFullImage] = useState(null);

    if (!word) return null;

    const images = word.images || [];

    return (
        <>
            <div
                key={cardKey}
                className={`w-full relative ${
                    exiting
                        ? exitDir === "left"
                            ? "card-exit-left"
                            : "card-exit-right"
                        : exitDir === "left"
                          ? "card-enter-right"
                          : "card-enter-left"
                }`}
            >
                {/* SRS Level Badge */}
                <div className="absolute -top-1.5 left-4 z-40 flex items-center gap-1.5">
                    <div
                        className={`px-3 py-1.5 rounded-2xl shadow-sm border overflow-hidden relative group transition-all duration-300 ${
                            levelUpPulse
                                ? "scale-110 shadow-lg border-[#E5201C] bg-white dark:bg-slate-900"
                                : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-gray-100 dark:border-slate-800"
                        }`}
                    >
                        <div className="flex items-center gap-1.5 relative z-10">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <div
                                        key={lvl}
                                        className={`w-1.5 h-3.5 rounded-full transition-all duration-500 ${
                                            lvl <= (word.srs_box ?? 1)
                                                ? "bg-[#E5201C] shadow-[0_0_8px_rgba(229,32,28,0.4)]"
                                                : "bg-gray-100 dark:bg-slate-800"
                                        }`}
                                        style={{
                                            transitionDelay: `${lvl * 50}ms`,
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
                                Level {word.srs_box ?? 1}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-slate-950/50 border border-gray-100/50 dark:border-slate-800/50">
                    {/* Media Area */}
                    <div className="aspect-[4/3] relative bg-gray-50 dark:bg-slate-800 group">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[activeImageIndex].image_url_full}
                                    alt={word.word}
                                    className="w-full h-full object-cover"
                                />
                                {/* Image Pagination Dots */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveImageIndex(i);
                                                }}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    i === activeImageIndex
                                                        ? "w-6 bg-white shadow-sm"
                                                        : "w-1.5 bg-white/40 hover:bg-white/60"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                                {/* Label for images */}
                                {images[activeImageIndex].label && (
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                                        <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/20">
                                            {images[activeImageIndex].label}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 opacity-60">
                                <LayoutGrid className="h-12 w-12 text-gray-200 dark:text-slate-700 mb-2" />
                            </div>
                        )}

                        {/* Top Action Bar */}
                        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                            <button
                                onClick={() => onBookmark(word.id)}
                                className={`p-2.5 rounded-2xl backdrop-blur-md shadow-lg transition-all active:scale-90 border ${
                                    bookmarks[word.id]
                                        ? "bg-yellow-400 border-yellow-400 text-white"
                                        : "bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800 text-gray-500"
                                }`}
                            >
                                <Bookmark
                                    className={`h-5 w-5 ${bookmarks[word.id] ? "fill-current" : ""}`}
                                />
                            </button>
                            {images.length > 0 && (
                                <button
                                    onClick={() =>
                                        setFullImage(
                                            images[activeImageIndex]
                                                .image_url_full,
                                        )
                                    }
                                    className="p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-gray-500 rounded-2xl border border-white/20 dark:border-slate-800 shadow-lg active:scale-90"
                                >
                                    <Maximize2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Banner Overlay */}
                        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </div>

                    {/* Word Info Area */}
                    <div className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                {word.word}
                            </h2>
                            <button
                                onClick={() => onSpeak(word.word)}
                                className="p-2 text-gray-400 hover:text-[#E5201C] transition-colors"
                            >
                                <Volume2 className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs font-bold rounded-full border border-gray-200 dark:border-slate-700">
                                {word.part_of_speech}
                            </span>
                            {word.is_personal && (
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                                    <Info className="h-3 w-3" /> {t("exercise.card.personal")}
                                </span>
                            )}
                        </div>

                        {/* Reveal/Definition Area */}
                        {!showMeaning ? (
                            <button
                                onClick={onToggleMeaning}
                                className="group w-full max-w-xs mx-auto py-4 bg-gray-50 dark:bg-slate-800/100 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-[#E5201C] dark:hover:border-[#E5201C]/50 transition-all duration-300 active:scale-[0.98]"
                            >
                                <div className="p-3 rounded-full bg-white dark:bg-slate-800 text-gray-400 group-hover:text-[#E5201C] group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-all shadow-sm">
                                    <Eye className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-bold text-gray-400 group-hover:text-[#E5201C] transition-colors">
                                    {t("exercise.card.tap_to_reveal")}
                                </span>
                            </button>
                        ) : (
                            <div className="px-2 py-4 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/30 relative">
                                <button
                                    onClick={onToggleMeaning}
                                    className="absolute top-2 right-2 p-1.5 text-red-300 dark:text-red-900 hover:text-red-500 transition-colors"
                                >
                                    <EyeOff className="h-4 w-4" />
                                </button>
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                    "{word.definition}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Preview Dialog */}
            <Dialog open={!!fullImage} onOpenChange={() => setFullImage(null)}>
                <DialogContent className="max-w-4xl w-[95vw] h-[85vh] bg-black border-none p-0 overflow-hidden outline-none">
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <img
                            src={fullImage}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={() => setFullImage(null)}
                            className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition z-50"
                        >
                            <LayoutGrid className="h-6 w-6" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
