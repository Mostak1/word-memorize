import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ChevronLeft,
    ChevronRight,
    Volume2,
    RefreshCcw,
    BookOpen,
} from "lucide-react";

export default function ReviewWords({ words }) {
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
            ? "bg-green-50 text-green-700 border-green-200"
            : d === "medium" || d === "intermediate"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : d === "hard" || d === "advanced"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-50 text-gray-600 border-gray-200";
    };

    return (
        <AppLayout>
            <Head title="Review Words" />
            <div className="min-h-screen bg-[#F0F2F5] pb-20">
                <div className="max-w-xl mx-auto px-4 pt-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <Link
                            href={route("dashboard")}
                            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition text-gray-500"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 leading-tight">
                                <RefreshCcw className="h-5 w-5 text-orange-500 shrink-0" />
                                Review Words
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {words.total} word{words.total !== 1 ? "s" : ""}{" "}
                                to review
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
                                        href={route("word.show", word.id)}
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
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {word.word}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                                            <RefreshCcw className="h-3 w-3" />
                                                            Reviewing
                                                        </span>
                                                    </div>

                                                    {word.parts_of_speech_variations && (
                                                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                                                            {
                                                                word.parts_of_speech_variations
                                                            }
                                                        </span>
                                                    )}

                                                    {word.definition && (
                                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                            {word.definition}
                                                        </p>
                                                    )}

                                                    {word.word_list && (
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <span
                                                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(word.word_list.difficulty)}`}
                                                            >
                                                                {
                                                                    word
                                                                        .word_list
                                                                        .difficulty
                                                                }
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {
                                                                    word
                                                                        .word_list
                                                                        .title
                                                                }
                                                            </span>
                                                        </div>
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
                                                    className="p-2 text-[#E5201C] hover:bg-red-50 rounded-full transition shrink-0"
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
                                        className="flex items-center gap-1 bg-white px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:shadow-md disabled:opacity-40 transition"
                                    >
                                        <ChevronLeft className="h-4 w-4" />{" "}
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-400">
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
                                        className="flex items-center gap-1 bg-white px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:shadow-md disabled:opacity-40 transition"
                                    >
                                        Next{" "}
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                <RefreshCcw className="h-10 w-10 text-orange-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No Review Words Yet
                            </h3>
                            <p className="text-gray-500 text-sm mb-5">
                                Press "Didn't Know" on a word during exercise
                                and it'll appear here for extra practice.
                            </p>
                            <Link
                                href={route("wordlistcategory.index")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                <BookOpen className="h-4 w-4" />
                                Start Exercising
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
