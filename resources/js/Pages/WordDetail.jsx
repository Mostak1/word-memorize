import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    Volume2,
    Check,
    X as XIcon,
    BookOpen,
    LogIn,
    Bookmark,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import FlashMessages from "@/Components/FlashMessage";

export default function WordDetail({
    auth,
    word,
    wordList,
    subCategory,
    isMastered = false,
    isBookmarked: initialBookmarked = false,
    prevWordId = null,
    nextWordId = null,
}) {
    const [wordStatus, setWordStatus] = useState(null);
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        setWordStatus(null);
        setIsSubmitting(false);
        setActiveImageIndex(0);
        setBookmarked(initialBookmarked);
    }, [word.id, initialBookmarked]);

    const speakWord = (text) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-US";
            u.rate = 0.8;
            window.speechSynthesis.speak(u);
        }
    };

    const handleBookmark = () => {
        if (!auth.user) {
            setShowLoginDialog(true);
            return;
        }
        setBookmarked((prev) => !prev);
        router.post(
            route("word.bookmark", word.id),
            {},
            {
                preserveScroll: true,
                onError: () => setBookmarked((prev) => !prev),
            },
        );
    };

    const handleMarkWord = (status) => {
        if (!auth.user) {
            setShowLoginDialog(true);
            return;
        }
        if (isSubmitting) return;
        setWordStatus(status);
        setIsSubmitting(true);
        router.post(
            route(status === "known" ? "word.know" : "word.learn", word.id),
            {},
            {
                preserveScroll: false,
                onError: () => {
                    setWordStatus(null);
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const navigateTo = (wordId) => {
        if (!wordId) return;
        router.get(
            route("word.show", wordId) + "?from=mastered",
            {},
            { preserveScroll: false },
        );
    };

    const highlightWord = (sentence, targetWord) => {
        if (!sentence || !targetWord) return sentence;
        const regex = new RegExp(`(${targetWord})`, "gi");
        return sentence.split(regex).map((part, i) =>
            regex.test(part) ? (
                <strong key={i} className="font-bold text-gray-900">
                    {part}
                </strong>
            ) : (
                part
            ),
        );
    };

    const collocationList = word.collocations
        ? word.collocations
              .split(/[\n,]+/)
              .map((c) => c.trim())
              .filter(Boolean)
        : [];

    const collocationColors = [
        "bg-red-100/70 text-red-700 border-red-200",
        "bg-blue-100/70 text-blue-700 border-blue-200",
        "bg-green-100/70 text-green-700 border-green-200",
        "bg-amber-100/70 text-amber-700 border-amber-200",
        "bg-purple-100/70 text-purple-700 border-purple-200",
        "bg-teal-100/70 text-teal-700 border-teal-200",
        "bg-pink-100/70 text-pink-700 border-pink-200",
        "bg-indigo-100/70 text-indigo-700 border-indigo-200",
    ];

    const wordFontSize = (w) => {
        if (!w) return "text-4xl";
        if (w.length <= 8) return "text-4xl";
        if (w.length <= 12) return "text-3xl";
        if (w.length <= 16) return "text-2xl";
        return "text-xl";
    };

    const images = word.images?.length > 0 ? word.images : [];
    const activeImage = images[activeImageIndex] ?? null;

    return (
        <AppLayout>
            <Head title={`${word.word} - Word Details`} />
            <FlashMessages />

            <div
                className={`min-h-screen bg-[#F0F2F5] ${isMastered ? "pb-24" : "pb-32"} pt-1 mt-2`}
            >
                <main className="max-w-lg mx-auto px-3">
                    <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                        {/* Top row: bookmark | word + POS | speaker */}
                        <div className="flex items-center px-5 pt-5 pb-2">
                            <div className="flex-none w-8 flex justify-start">
                                <button
                                    onClick={handleBookmark}
                                    className="p-1 transition-colors"
                                    aria-label={
                                        bookmarked
                                            ? "Remove bookmark"
                                            : "Bookmark word"
                                    }
                                >
                                    <Bookmark
                                        className={`h-6 w-6 transition-colors ${
                                            bookmarked
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-400 hover:text-gray-600"
                                        }`}
                                        strokeWidth={1.8}
                                    />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center px-2">
                                <h1
                                    className={`${wordFontSize(word.word)} font-extrabold text-gray-900 tracking-tight leading-tight text-center break-words w-full`}
                                >
                                    {word.word}
                                </h1>
                                {word.parts_of_speech_variations && (
                                    <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-md">
                                        {word.parts_of_speech_variations}
                                    </span>
                                )}
                            </div>

                            <div className="flex-none w-8 flex justify-end">
                                <button
                                    onClick={() => speakWord(word.word)}
                                    className="p-1 text-gray-500 hover:text-gray-700 transition"
                                >
                                    <Volume2
                                        className="h-6 w-6"
                                        strokeWidth={1.8}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Pronunciation */}
                        {(word.pronunciation ||
                            word.ipa ||
                            word.bangla_pronunciation) && (
                            <div className="px-5 pb-4 text-center">
                                <p className="text-base text-gray-400 font-mono mt-1">
                                    {[
                                        word.pronunciation,
                                        word.ipa,
                                        word.bangla_pronunciation,
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                </p>
                            </div>
                        )}

                        {/* Images */}
                        {images.length > 0 && (
                            <div className="px-4 pb-3">
                                <div className="rounded-2xl overflow-hidden bg-[#EEF6F5]">
                                    <img
                                        src={activeImage?.image_url_full}
                                        alt={activeImage?.caption || word.word}
                                        className="w-full object-cover"
                                        style={{
                                            maxHeight: "220px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                                {activeImage?.caption && (
                                    <p className="text-xs text-gray-400 text-center mt-1.5 italic">
                                        {activeImage.caption}
                                    </p>
                                )}
                                {images.length > 1 && (
                                    <div className="flex justify-center gap-1.5 mt-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setActiveImageIndex(idx)
                                                }
                                                className={`rounded-full transition-all ${
                                                    idx === activeImageIndex
                                                        ? "w-5 h-2 bg-gray-500"
                                                        : "w-2 h-2 bg-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Example / Image-related sentence */}
                        {(word.image_related_sentence ||
                            word.example_sentences) && (
                            <div className="mx-4 mb-4 border-l-4 border-green-400 pl-3 py-1">
                                <p className="text-base text-gray-800 leading-snug">
                                    {highlightWord(
                                        word.image_related_sentence ||
                                            word.example_sentences,
                                        word.word,
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="h-px bg-gray-100 mx-4" />

                        {/* Definition two-column */}
                        {(word.definition || word.bangla_meaning) && (
                            <div className="grid grid-cols-2 gap-0 mx-4 my-4">
                                {word.definition && (
                                    <div className="border-l-4 border-[#E5201C] pl-3 pr-2 py-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                            English Definition
                                        </p>
                                        <p className="text-sm text-gray-900 leading-snug">
                                            {word.definition}
                                        </p>
                                    </div>
                                )}
                                {word.bangla_meaning && (
                                    <div className="border-l-4 border-blue-400 pl-3 pr-2 py-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                            Bangla Definition
                                        </p>
                                        <p className="text-sm text-gray-800 leading-snug font-medium">
                                            {word.bangla_meaning}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Collocations */}
                        {collocationList.length > 0 && (
                            <div className="px-4 pb-4">
                                <div className="h-px bg-gray-100 mb-3" />
                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                    Common Collocations
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {collocationList.map((col, i) => (
                                        <span
                                            key={i}
                                            className={`text-sm px-3 py-1.5 rounded-full border ${collocationColors[i % collocationColors.length]}`}
                                        >
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Synonym / Antonym */}
                        {(word.synonym ||
                            word.antonym ||
                            word.bangla_synonym ||
                            word.bangla_antonym) && (
                            <div className="pb-4">
                                <div className="h-px bg-gray-100 mx-4 mb-4" />

                                {/* English */}
                                {(word.synonym || word.antonym) && (
                                    <div className="grid grid-cols-2 gap-0 mx-4 mb-4">
                                        {word.synonym ? (
                                            <div className="border-l-4 border-[#E5201C] pl-3 pr-2 py-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                                    Synonyms
                                                </p>
                                                <p className="text-sm text-gray-800 leading-snug">
                                                    {word.synonym}
                                                </p>
                                            </div>
                                        ) : (
                                            <div />
                                        )}
                                        {word.antonym ? (
                                            <div className="border-l-4 border-blue-400 pl-3 pr-2 py-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                                    Antonyms
                                                </p>
                                                <p className="text-sm text-gray-800 leading-snug">
                                                    {word.antonym}
                                                </p>
                                            </div>
                                        ) : (
                                            <div />
                                        )}
                                    </div>
                                )}

                                {/* Bangla */}
                                {(word.bangla_synonym ||
                                    word.bangla_antonym) && (
                                    <div className="grid grid-cols-2 gap-0 mx-4">
                                        {word.bangla_synonym ? (
                                            <div className="border-l-4 border-[#E5201C] pl-3 pr-2 py-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                                    প্রতিশব্দ
                                                </p>
                                                <p className="text-sm text-gray-800 leading-snug font-medium">
                                                    {word.bangla_synonym}
                                                </p>
                                            </div>
                                        ) : (
                                            <div />
                                        )}
                                        {word.bangla_antonym ? (
                                            <div className="border-l-4 border-blue-400 pl-3 pr-2 py-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                                    বিপরীত শব্দ
                                                </p>
                                                <p className="text-sm text-gray-800 leading-snug font-medium">
                                                    {word.bangla_antonym}
                                                </p>
                                            </div>
                                        ) : (
                                            <div />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* WordList link */}
                        {wordList && (
                            <div className="px-4 pb-4">
                                <div className="h-px bg-gray-100 mb-3" />
                                <p className="text-xs text-gray-400 text-center">
                                    <Link
                                        href={route(
                                            "wordlist.show",
                                            wordList.id,
                                        )}
                                        className="inline-flex items-center gap-1 hover:text-gray-600 transition"
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Part of: {wordList.title}
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ── Mastered: Prev / Next navigation ── */}
            {isMastered && (
                <div className="fixed bottom-0 left-0 right-0 z-20">
                    <div className="max-w-lg mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigateTo(prevWordId)}
                                disabled={!prevWordId}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Previous
                            </button>

                            <Link
                                href={route("words.mastered")}
                                className="flex items-center justify-center w-12 h-14 rounded-2xl bg-white border border-gray-200 text-gray-400 shadow-sm hover:shadow-md transition-all shrink-0"
                                aria-label="Back to Mastered Words"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </Link>

                            <button
                                onClick={() => navigateTo(nextWordId)}
                                disabled={!nextWordId}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Normal exercise bottom bar ── */}
            {!isMastered && (
                <div className="fixed bottom-0 left-0 right-0 z-20">
                    <div className="max-w-lg mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleMarkWord("unknown")}
                                disabled={isSubmitting}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-[#E5201C] text-white hover:bg-red-700 disabled:opacity-60 transition-all shadow-lg shadow-red-100"
                            >
                                <XIcon className="h-5 w-5" strokeWidth={2.5} />
                                {isSubmitting && wordStatus === "unknown"
                                    ? "Saving…"
                                    : "Didn't Know"}
                            </button>
                            <button
                                onClick={() => handleMarkWord("known")}
                                disabled={isSubmitting}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-all shadow-lg shadow-green-100"
                            >
                                <Check className="h-5 w-5" strokeWidth={2.5} />
                                {isSubmitting && wordStatus === "known"
                                    ? "Saving…"
                                    : "Mastered!"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlertDialog
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-[#E5201C]" /> Login
                            Required
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            You need to be logged in to mark words as known or
                            unknown.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                window.location.href = route("login");
                            }}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            Go to Login
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
