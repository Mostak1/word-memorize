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
    RotateCcw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import FlashMessages from "@/Components/FlashMessage";
import { usePage } from "@inertiajs/react";

export default function ExerciseSession({
    wordList,
    subcategory,
    words,
    backUrl = null,
}) {
    const { auth } = usePage().props;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({}); // { wordId: 'known' | 'unknown' }
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionDone, setSessionDone] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const total = words.length;
    const word = words[currentIndex] ?? null;
    const isLastWord = currentIndex === total - 1;

    // Reset image index when word changes
    useEffect(() => {
        setActiveImageIndex(0);
    }, [currentIndex]);

    const speakWord = useCallback((text) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-US";
            window.speechSynthesis.speak(u);
        }
    }, []);

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

    const advance = () => {
        if (isLastWord) {
            setSessionDone(true);
        } else {
            setCurrentIndex((i) => i + 1);
        }
    };

    const handleMarkWord = (status) => {
        if (!word) return;
        if (!auth?.user) {
            setShowLoginDialog(true);
            return;
        }
        if (isSubmitting) return;

        setResults((prev) => ({ ...prev, [word.id]: status }));

        const routeName = status === "known" ? "word.know" : "word.learn";
        setIsSubmitting(true);

        router.post(
            route(routeName, word.id),
            { from: "session" }, // tells the controller to redirect back (not to word.show)
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    advance();
                },
                onError: () => {
                    setIsSubmitting(false);
                    advance(); // still advance even on error
                },
            },
        );
    };

    // ── Stats for done screen ─────────────────────────────────────────────────
    const knownCount = Object.values(results).filter(
        (v) => v === "known",
    ).length;
    const unknownCount = Object.values(results).filter(
        (v) => v === "unknown",
    ).length;
    const skippedCount = total - knownCount - unknownCount;

    // ── Collocation chips ─────────────────────────────────────────────────────
    const collocationList = word?.collocations
        ? word.collocations
              .split(/[\n,]+/)
              .map((c) => c.trim())
              .filter(Boolean)
        : [];

    const images = word?.images?.length > 0 ? word.images : [];
    const activeImage = images[activeImageIndex] ?? null;

    const backHref = backUrl
        ? backUrl
        : subcategory
          ? route("wordlist.subcategory", {
                wordListId: wordList.id,
                subcategoryId: subcategory.id,
            })
          : route("wordlist.show", wordList.id);

    // ── Session complete screen ───────────────────────────────────────────────
    if (sessionDone || total === 0 || !word) {
        return (
            <AppLayout>
                <Head title="Exercise Complete" />
                <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white rounded-3xl shadow-md w-full max-w-md p-8 text-center">
                        {/* Trophy */}
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                            Session Complete!
                        </h1>
                        <p className="text-gray-400 text-sm mb-6">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>

                        {/* Result pills */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-green-50 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-green-600">
                                    {knownCount}
                                </p>
                                <p className="text-xs text-green-500 mt-0.5 font-medium">
                                    Known
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-[#E5201C]">
                                    {unknownCount}
                                </p>
                                <p className="text-xs text-red-400 mt-0.5 font-medium">
                                    Learning
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-gray-400">
                                    {skippedCount}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                    Skipped
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setCurrentIndex(0);
                                    setResults({});
                                    setSessionDone(false);
                                }}
                                className="w-full py-3.5 bg-[#E5201C] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restart
                            </button>
                            <Link
                                href={backHref}
                                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to List
                            </Link>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // ── Main session card ─────────────────────────────────────────────────────
    return (
        <AppLayout>
            <Head title={`Exercise — ${word?.word ?? ""}`} />
            <FlashMessages />

            {/* Progress bar */}
            <div className="fixed top-[60px] left-0 right-0 z-30 h-1 bg-gray-200">
                <div
                    className="h-full bg-[#E5201C] transition-all duration-300"
                    style={{ width: `${(currentIndex / total) * 100}%` }}
                />
            </div>

            <div className="min-h-screen bg-[#F0F2F5] pb-32 pt-1">
                {/* Counter */}
                <div className="max-w-lg mx-auto px-3 pt-3 pb-1 flex items-center justify-between">
                    <Link
                        href={backHref}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <span className="text-sm text-gray-400 font-medium">
                        {currentIndex + 1} / {total}
                    </span>
                    <div className="w-8" /> {/* spacer */}
                </div>

                <main className="max-w-lg mx-auto px-3">
                    <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                        {/* Top row: bookmark + speaker */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-2">
                            <div className="p-1 text-gray-300">
                                <Bookmark
                                    className="h-6 w-6"
                                    strokeWidth={1.8}
                                />
                            </div>
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
                                            maxHeight: "220px",
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
                                <div className="h-px bg-gray-100 mb-3" />
                                <p className="text-sm font-semibold text-gray-600 mb-2">
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
                            <div className="px-4 pb-4 space-y-2">
                                <div className="h-px bg-gray-100" />
                                {word.synonym && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                            Synonyms
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {word.synonym}
                                        </p>
                                    </div>
                                )}
                                {word.antonym && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                            Antonyms
                                        </p>
                                        <p className="text-sm text-gray-800">
                                            {word.antonym}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Exercise group link */}
                        <div className="px-4 pb-4">
                            <div className="h-px bg-gray-100 mb-3" />
                            <p className="text-xs text-gray-400 text-center">
                                Part of Exercise:{" "}
                                {subcategory
                                    ? `${wordList.title} › ${subcategory.name}`
                                    : wordList.title}
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-20">
                <div className="max-w-lg mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                    {/* Dot progress */}
                    <div className="flex justify-center gap-1 mb-3">
                        {words
                            .slice(
                                Math.max(0, currentIndex - 3),
                                currentIndex + 6,
                            )
                            .map((w, i) => {
                                const absIdx =
                                    Math.max(0, currentIndex - 3) + i;
                                const result = results[w.id];
                                const isCurrent = absIdx === currentIndex;
                                const bg = isCurrent
                                    ? "bg-gray-600 w-5"
                                    : result === "known"
                                      ? "bg-green-400"
                                      : result === "unknown"
                                        ? "bg-red-400"
                                        : "bg-gray-200";
                                return (
                                    <div
                                        key={w.id}
                                        className={`h-2 rounded-full transition-all ${bg} ${isCurrent ? "" : "w-2"}`}
                                    />
                                );
                            })}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleMarkWord("unknown")}
                            disabled={isSubmitting}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-base font-bold bg-[#E5201C] text-white hover:bg-red-700 disabled:opacity-60 transition-all"
                        >
                            <XIcon className="h-5 w-5" strokeWidth={2.5} />
                            didn't know
                        </button>
                        <button
                            onClick={() => handleMarkWord("known")}
                            disabled={isSubmitting}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-base font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-all"
                        >
                            <Check className="h-5 w-5" strokeWidth={2.5} />
                            Check
                        </button>
                    </div>
                </div>
            </div>

            {/* Login Dialog */}
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
                            You need to be logged in to track your progress. Log
                            in to save your results.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel
                            onClick={advance}
                            className="w-full sm:w-auto"
                        >
                            Skip for now
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
