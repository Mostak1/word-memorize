import { Bookmark, Volume2 } from "lucide-react";
import { MASTERED_BOX, LEVEL_META } from "./constants";

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
    const currentBox = word?.srs_box ?? 1;
    const meta = LEVEL_META[currentBox] ?? LEVEL_META[1];
    const images = word?.images?.length > 0 ? word.images : [];
    const activeImage = images[activeImageIndex] ?? null;

    const wordFontSize = (w) => {
        if (!w) return "text-4xl";
        if (w.length <= 8) return "text-4xl";
        if (w.length <= 12) return "text-3xl";
        if (w.length <= 16) return "text-2xl";
        return "text-xl";
    };

    const formatIPA = (ipa) => {
        if (!ipa) return "";
        let f = ipa.trim();
        if (!f.startsWith("/")) f = "/" + f;
        if (!f.endsWith("/")) f = f + "/";
        return f;
    };

    const highlightWord = (sentence, targetWord) => {
        if (!sentence || !targetWord) return sentence;
        const regex = new RegExp(`(${targetWord})`, "gi");
        return sentence.split(regex).map((part, i) =>
            regex.test(part) ? (
                <strong key={i} className="font-bold text-gray-900 dark:text-yellow-300">
                    {part}
                </strong>
            ) : (
                part
            ),
        );
    };

    const animClass = exiting
        ? exitDir === "left"
            ? "card-exit-left"
            : "card-exit-right"
        : exitDir === "left"
          ? "card-enter-right"
          : "card-enter-left";

    return (
        <div
            key={cardKey}
            className={`bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 overflow-hidden select-none ${animClass}`}
        >
            {/* Exercise group label */}
            <div className="px-4">
                <div className="h-px bg-gray-100 dark:bg-slate-800 mb-3" />
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Part of Exercise:{" "}
                    {subcategory
                        ? `${wordList.title} › ${subcategory.name}`
                        : wordList.title}
                </p>
            </div>

            {/* Top row: bookmark | word | speaker */}
            <div className="flex items-center px-5 pt-5 pb-2">
                <div className="flex-none w-8 flex justify-start">
                    <button
                        onClick={() => onBookmark(word.id)}
                        className="p-1 transition-colors"
                        aria-label={bookmarks[word.id] ? "Remove bookmark" : "Bookmark word"}
                    >
                        <Bookmark
                            className={`h-6 w-6 transition-colors ${
                                bookmarks[word.id]
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center text-center px-2">
                    <h1 className={`${wordFontSize(word.word)} font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight break-words w-full`}>
                        {word.word}
                        {word.parts_of_speech_variations && (
                            <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-sm font-medium px-3 py-0.5 rounded-md ml-2">
                                {word.parts_of_speech_variations}
                            </span>
                        )}
                    </h1>
                </div>

                <div className="flex-none w-8 flex justify-end">
                    <button
                        onClick={() => onSpeak(word.word)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition"
                    >
                        <Volume2 className="h-6 w-6" strokeWidth={1.8} />
                    </button>
                </div>
            </div>

            {/* 4-dot SRS level badge */}
            {auth?.user && (
                <div className="flex justify-center pb-1">
                    <div
                        className="flex items-center gap-1.5"
                        style={{
                            transform: levelUpPulse ? "scale(1.25)" : "scale(1)",
                            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                        }}
                    >
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
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-1 ${meta.color}`}>
                            {meta.label}
                        </span>
                    </div>
                </div>
            )}

            {/* Pronunciation */}
            <div className="px-5 pb-4 text-center">
                {word.pronunciation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                        <span className="text-blue-600 dark:text-blue-400">
                            {word.pronunciation}{" "}
                        </span>
                        <span className="text-black">|</span>{" "}
                        <span className="text-teal-600 dark:text-teal-400">
                            {formatIPA(word.ipa)}{" "}
                        </span>
                        {userSettings?.show_bangla && word.bangla_pronunciation && (
                            <>
                                {" "}
                                <span className="text-black">|</span>{" "}
                                <span className="text-orange-600 dark:text-orange-400">
                                    {word.bangla_pronunciation}
                                </span>
                            </>
                        )}
                    </p>
                )}
            </div>

            {/* Image carousel */}
            {images.length > 0 && (
                <div className="px-4 pb-3">
                    <div className="relative rounded-2xl overflow-hidden bg-[#EEF6F5] dark:bg-slate-800">
                        <img
                            src={activeImage?.image_url_full}
                            alt={activeImage?.caption || word.word}
                            className="w-full h-auto object-contain"
                            style={{ maxHeight: "300px" }}
                        />
                        {currentBox >= MASTERED_BOX && (
                            <div className="absolute top-2 right-2">
                                <span className="bg-green-500 dark:bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md dark:shadow-lg">
                                    ✨ Mastered
                                </span>
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex justify-center gap-1.5 mt-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`rounded-full transition-all ${
                                        idx === activeImageIndex
                                            ? "w-5 h-2 bg-gray-500 dark:bg-gray-400"
                                            : "w-2 h-2 bg-gray-300 dark:bg-slate-700"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Example sentence */}
            {word.show_example_sentences &&
                (word.image_related_sentence || word.example_sentences) && (
                    <div className="mx-4 mb-4 border-l-4 border-green-400 dark:border-green-600 pl-3 py-1">
                        <p className="text-base text-gray-800 dark:text-gray-200 leading-snug">
                            {highlightWord(
                                word.image_related_sentence
                                    ? word.image_related_sentence
                                    : word.example_sentences
                                          ?.split(".")
                                          .map((s) => s.trim())
                                          .filter(Boolean)[0] + ".",
                                word.word,
                            )}
                        </p>
                    </div>
                )}

            {/* Tap to see meaning */}
            <div className="px-4 pb-3">
                <button
                    onClick={() => onToggleMeaning()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600 transition"
                >
                    {showMeaning ? (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Hide Meaning
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Tap to see meaning
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
