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
    BookOpen,
    LogIn,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import FlashMessages from "@/Components/FlashMessage";
import { usePage } from "@inertiajs/react";

export default function ExerciseSession({
    wordList,
    subcategory,
    words,
    backUrl = null,
    bookmarkedWordIds = [],
}) {
    const { auth } = usePage().props;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState({}); // { wordId: 'known' | 'unknown' }
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionDone, setSessionDone] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [bookmarks, setBookmarks] = useState(() =>
        Object.fromEntries(bookmarkedWordIds.map((id) => [id, true])),
    );

    // ── Swipe state ───────────────────────────────────────────────────────────
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const [dragX, setDragX] = useState(0);
    const [swipeHint, setSwipeHint] = useState(null); // 'prev' | 'next' | null
    const SWIPE_THRESHOLD = 80;
    const slideDir = useRef("left"); // 'left' | 'right' — direction new card enters from
    const [cardKey, setCardKey] = useState(0); // bump to re-trigger entrance anim
    const [exiting, setExiting] = useState(false); // true while old card flies out

    const handleBookmark = (wordId) => {
        if (!auth?.user) {
            setShowLoginDialog(true);
            return;
        }

        setBookmarks((prev) => ({ ...prev, [wordId]: !prev[wordId] })); // optimistic

        router.post(
            route("word.bookmark", wordId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () =>
                    setBookmarks((prev) => ({
                        ...prev,
                        [wordId]: !prev[wordId],
                    })), // revert
            },
        );
    };

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

    const changeCard = (newIndex, direction) => {
        if (newIndex < 0 || newIndex > total) return;
        slideDir.current = direction;
        setExiting(true);
        setTimeout(() => {
            setExiting(false);
            if (newIndex >= total) {
                setSessionDone(true);
            } else {
                setCurrentIndex(newIndex);
                setCardKey((k) => k + 1);
            }
        }, 200); // exit anim duration
    };

    const advance = () => {
        changeCard(isLastWord ? total : currentIndex + 1, "left");
    };

    const goToPrev = () => {
        if (currentIndex > 0) changeCard(currentIndex - 1, "right");
    };

    // ── Touch / swipe handlers ────────────────────────────────────────────────
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        setDragX(0);
        setSwipeHint(null);
    };

    const onTouchMove = (e) => {
        if (touchStartX.current === null) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - touchStartY.current;
        // Only track horizontal swipes (ignore vertical scrolling)
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 10) return;
        setDragX(dx);
        if (dx > 30) setSwipeHint("prev");
        else if (dx < -30) setSwipeHint("next");
        else setSwipeHint(null);
    };

    const onTouchEnd = () => {
        const dx = dragX;
        setDragX(0);
        setSwipeHint(null);
        touchStartX.current = null;
        if (dx > SWIPE_THRESHOLD) {
            goToPrev(); // swipe right → previous word
        } else if (dx < -SWIPE_THRESHOLD) {
            advance(); // swipe left  → next word (skip)
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

        // Only call the API for "known"; skipping via swipe needs no API call
        const routeName = status === "known" ? "word.know" : "word.learn";
        setIsSubmitting(true);

        router.post(
            route(routeName, word.id),
            { from: "session" },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    advance();
                },
                onError: () => {
                    setIsSubmitting(false);
                    advance();
                },
            },
        );
    };

    // Mark known via the Check button
    const handleCheck = () => handleMarkWord("known");

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

    const images = word?.images?.length > 0 ? word.images : [];
    const activeImage = images[activeImageIndex] ?? null;

    const backHref = route(
        "wordlistcategory.wordlists",
        wordList.word_list_category_id,
    );
    // backUrl
    //     ? backUrl
    //     : subcategory
    //       ? route("wordlist.subcategory", {
    //             wordListId: wordList.id,
    //             subcategoryId: subcategory.id,
    //         })
    //       : wordList.category?.id
    //         ? route("wordlistcategory.wordlists", wordList.category.id)
    //         : route("wordlist.show", wordList.id);

    // ── Session complete screen ───────────────────────────────────────────────
    // ── All words already mastered — nothing left to practice ────────────────
    if (total === 0 || (!sessionDone && !word)) {
        return (
            <AppLayout>
                <Head title="All Mastered" />
                <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white rounded-3xl shadow-md w-full max-w-md p-8 text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                            All Words Mastered!
                        </h1>
                        <p className="text-gray-400 text-sm mb-2">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            You've already mastered every word in this list.
                            Great work!
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={route("words.mastered")}
                                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                            >
                                View Mastered Words
                            </Link>
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

    // ── Session done screen ───────────────────────────────────────────────────
    if (sessionDone) {
        const skippedCount = Math.max(0, total - knownCount);

        return (
            <AppLayout>
                <Head title="Exercise Complete" />
                <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4 py-10">
                    <div className="bg-white rounded-3xl shadow-md w-full max-w-md p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                            Session Complete!
                        </h1>
                        <p className="text-gray-400 text-sm mb-6">
                            {subcategory ? subcategory.name : wordList.title}
                        </p>

                        {/* Result pills */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-green-50 rounded-2xl py-4">
                                <p className="text-2xl font-extrabold text-green-600">
                                    {knownCount}
                                </p>
                                <p className="text-xs text-green-500 mt-0.5 font-medium">
                                    Mastered
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
                            {skippedCount > 0 && (
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
                            )}
                            {knownCount > 0 && (
                                <Link
                                    href={route("words.mastered")}
                                    className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    View Mastered Words
                                </Link>
                            )}
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

            <div className="min-h-screen bg-[#F0F2F5] pb-32 pt-1 mt-2">
                {/* Counter */}
                {/* <div className="max-w-lg mx-auto px-3 pt-3 pb-1 flex items-center justify-between">
                    <Link
                        href={backHref}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <span className="text-sm text-gray-400 font-medium">
                        {currentIndex + 1} / {total}
                    </span>
                    <div className="w-8" />
                </div> */}

                {/* Mobile fixed side arrows */}
                <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className="md:hidden fixed left-1 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md border border-gray-100 text-gray-500 active:scale-95 disabled:opacity-20 transition-all"
                    aria-label="Previous word"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={advance}
                    className="md:hidden fixed right-1 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md border border-gray-100 text-gray-500 active:scale-95 transition-all"
                    aria-label="Next word"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                <div className="relative flex items-start justify-center w-full overflow-hidden">
                    {/* Desktop prev button */}
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="hidden md:flex items-center justify-center self-center shrink-0 w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-gray-800 hover:shadow-lg disabled:opacity-25 disabled:cursor-not-allowed transition-all mr-3 mt-6"
                        aria-label="Previous word"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <main className="max-w-lg w-full px-3">
                        {/* Swipe hint labels */}
                        {/* <div className="flex justify-between px-1 mb-1 h-5">
                            <span
                                className={`text-xs font-semibold text-gray-400 transition-opacity duration-150 flex items-center gap-1 ${swipeHint === "prev" ? "opacity-100" : "opacity-0"}`}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </span>
                            <span
                                className={`text-xs font-semibold text-gray-400 transition-opacity duration-150 flex items-center gap-1 ${swipeHint === "next" ? "opacity-100" : "opacity-0"}`}
                            >
                                Next <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                        </div> */}
                        <div
                            key={cardKey}
                            className={`bg-white rounded-3xl shadow-md overflow-hidden select-none ${
                                exiting
                                    ? slideDir.current === "left"
                                        ? "card-exit-left"
                                        : "card-exit-right"
                                    : slideDir.current === "left"
                                      ? "card-enter-right"
                                      : "card-enter-left"
                            }`}
                            style={{
                                transform: `translateX(${dragX * 0.35}px) rotate(${dragX * 0.015}deg)`,
                                transition:
                                    dragX === 0 && !exiting
                                        ? "transform 0.25s ease"
                                        : "none",
                            }}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Top row: bookmark + speaker */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-2">
                                <button
                                    onClick={() => handleBookmark(word.id)}
                                    className="p-1 transition-colors"
                                    aria-label={
                                        bookmarks[word.id]
                                            ? "Remove bookmark"
                                            : "Bookmark word"
                                    }
                                >
                                    <Bookmark
                                        className={`h-6 w-6 transition-colors ${
                                            bookmarks[word.id]
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-400 hover:text-gray-600"
                                        }`}
                                        strokeWidth={1.8}
                                    />
                                </button>

                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                        {word.word}
                                    </h1>
                                    {word.parts_of_speech_variations && (
                                        <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-md self-center">
                                            {word.parts_of_speech_variations}
                                        </span>
                                    )}
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
                                {/* <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                        {word.word}
                                    </h1>
                                    {word.parts_of_speech_variations && (
                                        <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-md self-center">
                                            {word.parts_of_speech_variations}
                                        </span>
                                    )}
                                </div> */}
                                {word.pronunciation && (
                                    <p className="text-base text-gray-400 font-mono mt-1">
                                        {word.pronunciation} {word.ipa}{" "}
                                        {word.bangla_pronunciation}
                                    </p>
                                )}
                            </div>

                            {/* Image */}
                            {images.length > 0 && (
                                <div className="px-4 pb-3">
                                    <div className="rounded-2xl overflow-hidden bg-[#EEF6F5]">
                                        <img
                                            src={activeImage?.image_url_full}
                                            alt={
                                                activeImage?.caption ||
                                                word.word
                                            }
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

                            {/* Example / Image-related Sentence */}
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
                                    {/* English Synonyms | English Antonyms */}
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
                                    {/* Bangla Synonyms | Bangla Antonyms */}
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
                        {/* end swipeable card */}
                    </main>

                    {/* Desktop next button */}
                    <button
                        onClick={advance}
                        className="hidden md:flex items-center justify-center self-center shrink-0 w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-gray-800 hover:shadow-lg transition-all ml-3 mt-6"
                        aria-label="Next word"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-20">
                <div className="max-w-lg mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                    {/* Dot progress */}
                    {/* <div className="flex justify-center gap-1 mb-3">
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
                    </div> */}

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
                        <div className="w-8" />
                    </div>

                    <button
                        onClick={handleCheck}
                        disabled={isSubmitting}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-all shadow-lg shadow-green-100"
                    >
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                        {isSubmitting ? "Saving…" : "Mastered!"}
                    </button>
                </div>
            </div>

            {/* Card transition keyframes */}
            <style>{`
                @keyframes cardEnterRight {
                    from { opacity: 0; transform: translateX(60px) rotate(3deg) scale(0.96); }
                    to   { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
                }
                @keyframes cardEnterLeft {
                    from { opacity: 0; transform: translateX(-60px) rotate(-3deg) scale(0.96); }
                    to   { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
                }
                @keyframes cardExitLeft {
                    from { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
                    to   { opacity: 0; transform: translateX(-80px) rotate(-4deg) scale(0.94); }
                }
                @keyframes cardExitRight {
                    from { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
                    to   { opacity: 0; transform: translateX(80px) rotate(4deg) scale(0.94); }
                }
                .card-enter-right {
                    animation: cardEnterRight 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .card-enter-left {
                    animation: cardEnterLeft 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .card-exit-left {
                    animation: cardExitLeft 0.18s ease-in forwards;
                    pointer-events: none;
                }
                .card-exit-right {
                    animation: cardExitRight 0.18s ease-in forwards;
                    pointer-events: none;
                }
            `}</style>

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
