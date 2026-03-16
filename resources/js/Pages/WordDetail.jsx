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
} from "lucide-react";
import { useState, useEffect } from "react";
import FlashMessages from "@/Components/FlashMessage";

export default function WordDetail({
    auth,
    word,
    wordList,
    subCategory,
    isMastered = false,
}) {
    const [wordStatus, setWordStatus] = useState(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        setWordStatus(null);
        setIsSubmitting(false);
        setActiveImageIndex(0);
    }, [word.id]);

    const speakWord = (text) => {
        if ("speechSynthesis" in window) {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-US";
            window.speechSynthesis.speak(u);
        }
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

    const collocationList = word.collocations
        ? word.collocations
              .split(/[\n,]+/)
              .map((c) => c.trim())
              .filter(Boolean)
        : [];

    const images = word.images?.length > 0 ? word.images : [];
    const activeImage = images[activeImageIndex] ?? null;

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

    return (
        <AppLayout>
            <Head title={`${word.word} - Word Details`} />
            <FlashMessages />
            <div
                className={`min-h-screen bg-[#F0F2F5] ${isMastered ? "pb-6" : "pb-32"}`}
            >
                <main className="max-w-lg mx-auto px-3 pt-4">
                    <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                        {/* Top row */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-2">
                            <Link
                                href={
                                    subCategory
                                        ? route("wordlist.subcategory", {
                                              wordListId: wordList.id,
                                              subcategoryId: subCategory.id,
                                          })
                                        : route("wordlist.index")
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Bookmark
                                    className="h-6 w-6"
                                    strokeWidth={1.8}
                                />
                            </Link>
                            <button
                                onClick={() => speakWord(word.word)}
                                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <Volume2
                                    className="h-6 w-6"
                                    strokeWidth={1.8}
                                />
                            </button>
                        </div>

                        {/* Word + Pronunciation + POS */}
                        <div className="px-5 pb-4 text-center">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                {word.word}
                            </h1>
                            {word.pronunciation && (
                                <p className="text-base text-gray-400 font-mono mt-1">
                                    {word.pronunciation}
                                </p>
                            )}
                            {word.parts_of_speech_variations && (
                                <div className="mt-2 inline-flex">
                                    <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-md">
                                        {word.parts_of_speech_variations}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Image */}
                        {images.length > 0 && (
                            <div className="px-4 pb-3">
                                <div className="rounded-2xl overflow-hidden bg-[#EEF6F5]">
                                    <img
                                        src={activeImage?.image_url_full}
                                        alt={activeImage?.caption || word.word}
                                        className="w-full object-cover"
                                        style={{
                                            maxHeight: "240px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                                {images.length > 1 && (
                                    <div className="flex justify-center gap-1.5 mt-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setActiveImageIndex(idx)
                                                }
                                                className={`rounded-full transition-all ${idx === activeImageIndex ? "w-5 h-2 bg-gray-500" : "w-2 h-2 bg-gray-300"}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Example sentence */}
                        {word.example_sentences && (
                            <div className="mx-4 mb-4 border-l-4 border-green-400 pl-3 py-1">
                                <p className="text-base text-gray-800 leading-snug">
                                    {highlightWord(
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
                                        <p className="text-sm text-gray-900 leading-snug">
                                            বাংলা অর্থ
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
                                <div className="h-px bg-gray-100 mb-4" />
                                <p className="text-sm font-semibold text-gray-600 mb-3">
                                    Common Collocations
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {collocationList.map((col, i) => (
                                        <span
                                            key={i}
                                            className="bg-[#F5F5F5] text-gray-700 text-sm px-3 py-1.5 rounded-full border border-gray-200"
                                        >
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Synonym / Antonym */}
                        {(word.synonym || word.antonym) && (
                            <div className="px-4 pb-4 space-y-3">
                                <div className="h-px bg-gray-100" />
                                {word.synonym && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                            Synonyms
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {word.synonym}
                                        </p>
                                    </div>
                                )}
                                {word.antonym && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                            Antonyms
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {word.antonym}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* WordList link */}
                        {wordList && (
                            <div className="px-4 pb-5">
                                <div className="h-px bg-gray-100 mb-3" />
                                <Link
                                    href={route("wordlist.show", wordList.id)}
                                    className="inline-flex items-center gap-1.5 text-sm text-[#E5201C] hover:text-red-700 font-medium"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Part of: {wordList.title} →
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Fixed Bottom Bar — hidden when viewing from Mastered Words */}
            {!isMastered && (
                <div className="fixed bottom-0 left-0 right-0 z-20 ">
                    <div className="max-w-lg mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                        {wordList && (
                            <div className="text-center mb-2">
                                <Link
                                    href={route("wordlist.show", wordList.id)}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Part of Exercise: {wordList.title} →
                                </Link>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleMarkWord("unknown")}
                                disabled={isSubmitting}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-[#E5201C] text-white hover:bg-red-700 disabled:opacity-60 transition-all"
                            >
                                <XIcon className="h-5 w-5" strokeWidth={2.5} />
                                {isSubmitting && wordStatus === "unknown"
                                    ? "Saving…"
                                    : "didn't know"}
                            </button>
                            <button
                                onClick={() => handleMarkWord("known")}
                                disabled={isSubmitting}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-all"
                            >
                                <Check className="h-5 w-5" strokeWidth={2.5} />
                                {isSubmitting && wordStatus === "known"
                                    ? "Saving…"
                                    : "Check"}
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
