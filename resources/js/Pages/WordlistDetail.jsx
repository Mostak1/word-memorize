import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Volume2,
    BookOpen,
    Layers,
} from "lucide-react";

export default function WordlistDetail({
    wordList,
    subcategories = [],
    words,
    category,
}) {
    const hasSubcategories = subcategories && subcategories.length > 0;

    const collocationColors = [
        "bg-red-100/70 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
        "bg-blue-100/70 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        "bg-green-100/70 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
        "bg-amber-100/70 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        "bg-purple-100/70 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
        "bg-teal-100/70 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
        "bg-pink-100/70 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
        "bg-indigo-100/70 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    ];

    // Parse word and show details
    const getCollocationList = (raw) => {
        if (!raw) return [];
        // Case 1: already array
        if (Array.isArray(raw)) return raw;
        // Case 2: JSON string
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        // Case 3: fallback (comma-separated or newline-separated string)
        return raw
            .split(/[\n,]+/)
            .map((c) => c.trim())
            .filter(Boolean)
            .map((phrase) => ({
                phrase,
                example_sentence: "",
            }));
    };

    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        return d === "easy" || d === "beginner"
            ? "bg-green-50 text-green-700 border-green-200"
            : d === "medium" || d === "intermediate"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : d === "hard" || d === "advanced"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-50 text-gray-600 border-gray-200";
    };

    const speakWord = (word) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.speak(
                Object.assign(new SpeechSynthesisUtterance(word), {
                    lang: "en-US",
                }),
            );
        }
    };

    // Back destination: category's wordlist page if available, else category index
    const backHref = category
        ? route("wordlistcategory.wordlists", category.id)
        : route("wordlistcategory.index");

    return (
        <AppLayout>
            <Head title={`${wordList.title}`} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-20">
                <div className="max-w-xl mx-auto px-4 pt-5">
                    {/* Sub-header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href={backHref}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition text-gray-500 dark:text-gray-400"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            {/* Breadcrumb */}
                            {category && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 truncate">
                                    {category.name}
                                </p>
                            )}
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                {wordList.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(wordList.difficulty)}`}
                                >
                                    {wordList.difficulty}
                                </span>
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400">
                                    {wordList.words_count} words
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Start Exercise button */}
                    <Link
                        href={route("wordlist.start", wordList.id)}
                        className="w-full bg-[#E5201C] hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base shadow-md transition-colors mb-5"
                    >
                        <Play className="h-5 w-5 fill-white" />
                        Start Exercise
                    </Link>

                    {/* ── SUBCATEGORY MODE ── */}
                    {hasSubcategories && (
                        <>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                                <Layers className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                    Subcategories ({subcategories.length})
                                </span>
                            </div>

                            <div className="space-y-2">
                                {subcategories.map((sub, index) => (
                                    <Link
                                        key={sub.id}
                                        href={route("wordlist.subcategory", [
                                            wordList.id,
                                            sub.id,
                                        ])}
                                        className="block"
                                    >
                                        <div
                                            className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
                                            style={{
                                                animationDelay: `${index * 0.06}s`,
                                                animation:
                                                    "fadeInUp 0.4s ease-out forwards",
                                                opacity: 0,
                                            }}
                                        >
                                            <div className="w-11 h-11 rounded-full bg-[#E5201C]/10 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                                                <Layers className="h-5 w-5 text-[#E5201C]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                    {sub.name}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {sub.words_count}{" "}
                                                    {sub.words_count === 1
                                                        ? "word"
                                                        : "words"}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-slate-600 shrink-0" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── WORD FALLBACK MODE ── */}
                    {!hasSubcategories && words && (
                        <>
                            {words.data && words.data.length > 0 ? (
                                <>
                                    <div className="space-y-3">
                                        {words.data.map((word, index) => (
                                            <Link
                                                key={word.id}
                                                href={route(
                                                    "word.show",
                                                    word.id,
                                                )}
                                                className="block"
                                            >
                                                <div
                                                    className="bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
                                                    style={{
                                                        animationDelay: `${index * 0.05}s`,
                                                        animation:
                                                            "fadeInUp 0.4s ease-out forwards",
                                                        opacity: 0,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-gray-900">
                                                                {word.word}
                                                            </h3>
                                                            {word.parts_of_speech_variations && (
                                                                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                                                                    {
                                                                        word.parts_of_speech_variations
                                                                    }
                                                                </span>
                                                            )}
                                                            {word.definition && (
                                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                                    {
                                                                        word.definition
                                                                    }
                                                                </p>
                                                            )}
                                                            {(() => {
                                                                const collocs =
                                                                    getCollocationList(
                                                                        word.collocations,
                                                                    );
                                                                return collocs.length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                                        {collocs
                                                                            .slice(
                                                                                0,
                                                                                3,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    c,
                                                                                    idx,
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className={`text-xs px-2 py-1 rounded-full border ${collocationColors[idx % collocationColors.length]}`}
                                                                                    >
                                                                                        {typeof c ===
                                                                                        "string"
                                                                                            ? c
                                                                                            : c.phrase}
                                                                                    </span>
                                                                                ),
                                                                            )}
                                                                        {collocs.length >
                                                                            3 && (
                                                                            <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                                                                                +
                                                                                {collocs.length -
                                                                                    3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : null;
                                                            })()}
                                                            <p className="text-xs text-[#E5201C] font-semibold mt-2">
                                                                Click to view
                                                                full details →
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                speakWord(
                                                                    word.word,
                                                                );
                                                            }}
                                                            className="p-2 text-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition"
                                                        >
                                                            <Volume2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {words.last_page > 1 && (
                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <button
                                                disabled={!words.prev_page_url}
                                                onClick={() =>
                                                    router.get(
                                                        words.prev_page_url,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="flex items-center gap-1 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md dark:border dark:border-slate-700 disabled:opacity-40 transition"
                                            >
                                                <ChevronLeft className="h-4 w-4" />{" "}
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-400 dark:text-gray-500">
                                                {words.current_page} /{" "}
                                                {words.last_page}
                                            </span>
                                            <button
                                                disabled={!words.next_page_url}
                                                onClick={() =>
                                                    router.get(
                                                        words.next_page_url,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="flex items-center gap-1 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md dark:border dark:border-slate-700 disabled:opacity-40 transition"
                                            >
                                                Next{" "}
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm">
                                    <BookOpen className="h-14 w-14 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                                        No Words Yet
                                    </h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        This word list doesn't have any words
                                        yet.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
