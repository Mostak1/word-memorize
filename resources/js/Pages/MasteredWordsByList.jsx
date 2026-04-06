import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ChevronLeft,
    ChevronRight,
    Volume2,
    Trophy,
    BookOpen,
} from "lucide-react";

export default function MasteredWordsByList({ words, wordlist }) {
    const speakWord = (word) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.speak(
                Object.assign(new SpeechSynthesisUtterance(word), {
                    lang: "en-US",
                }),
            );
        }
    };

    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        return d === "easy" || d === "beginner"
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
            : d === "medium" || d === "intermediate"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"
              : d === "hard" || d === "advanced"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    };

    return (
        <AppLayout>
            <Head title={`Mastered — ${wordlist?.title ?? "Word List"}`} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-20">
                <div className="max-w-xl mx-auto px-4 pt-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <Link
                            href={route("words.mastered")}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition text-gray-500 dark:text-gray-400"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 leading-tight truncate">
                                <Trophy className="h-5 w-5 text-green-600 shrink-0" />
                                <span className="truncate">
                                    {wordlist?.title ?? "Word List"}
                                </span>
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {words.total} word{words.total !== 1 ? "s" : ""}{" "}
                                mastered
                                {wordlist?.difficulty && (
                                    <span
                                        className={`ml-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${getDifficultyBadge(wordlist.difficulty)}`}
                                    >
                                        {wordlist.difficulty}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Word list */}
                    {words.data && words.data.length > 0 ? (
                        <>
                            <div className="space-y-3">
                                {words.data.map((word, index) => (
                                    <Link
                                        key={word.id}
                                        href={
                                            route("word.show", word.id) +
                                            "?from=mastered"
                                        }
                                        className="block"
                                    >
                                        <div
                                            className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
                                            style={{
                                                animationDelay: `${index * 0.05}s`,
                                                animation:
                                                    "fadeInUp 0.4s ease-out forwards",
                                                opacity: 0,
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                            {word.word}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                                                            <Trophy className="h-3 w-3" />
                                                            Mastered
                                                        </span>
                                                    </div>

                                                    {word.parts_of_speech_variations && (
                                                        <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
                                                            {
                                                                word.parts_of_speech_variations
                                                            }
                                                        </span>
                                                    )}

                                                    {word.definition && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                                            {word.definition}
                                                        </p>
                                                    )}

                                                    <p className="text-xs text-[#E5201C] font-semibold mt-2">
                                                        View full details →
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        speakWord(word.word);
                                                    }}
                                                    className="p-2 text-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition shrink-0"
                                                >
                                                    <Volume2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {words.last_page > 1 && (
                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <button
                                        disabled={!words.prev_page_url}
                                        onClick={() =>
                                            router.get(
                                                words.prev_page_url,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="flex items-center gap-1 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md dark:border dark:border-slate-700 disabled:opacity-40 transition"
                                    >
                                        <ChevronLeft className="h-4 w-4" />{" "}
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                        {words.current_page} / {words.last_page}
                                    </span>
                                    <button
                                        disabled={!words.next_page_url}
                                        onClick={() =>
                                            router.get(
                                                words.next_page_url,
                                                {},
                                                { preserveScroll: true },
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
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="h-10 w-10 text-green-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No Mastered Words in This List
                            </h3>
                            <p className="text-gray-500 text-sm mb-5">
                                Press "Check" on a word during exercise to mark
                                it as mastered.
                            </p>
                            <Link
                                href={route("wordlist.start", wordlist?.id)}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                <BookOpen className="h-4 w-4" />
                                Practice This List
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AppLayout>
    );
}
