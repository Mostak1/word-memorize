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

export default function ExerciseSubcategory({ wordList, subcategory, words }) {
    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        return d === "easy" || d === "beginner"
            ? "bg-green-50 text-green-700 border-green-200"
            : d === "medium" || d === "intermediate"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-red-50 text-red-700 border-red-200";
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

    return (
        <AppLayout>
            <Head title={`${subcategory.name} — ${wordList.title}`} />
            <div className="min-h-screen bg-[#F0F2F5] pb-20">
                <div className="max-w-xl mx-auto px-4 pt-5">
                    {/* Sub-header */}
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href={route("wordlist.show", wordList.id)}
                            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition text-gray-500"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5 truncate">
                                {wordList.title}
                            </p>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 leading-tight">
                                <Layers className="h-5 w-5 text-[#E5201C] shrink-0" />
                                {subcategory.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(wordList.difficulty)}`}
                                >
                                    {wordList.difficulty}
                                </span>
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600">
                                    {subcategory.words_count} words
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Start Exercise button — subcategory-specific */}
                    <Link
                        href={route("wordlist.subcategory.start", {
                            wordListId: wordList.id,
                            subcategoryId: subcategory.id,
                        })}
                        className="w-full bg-[#E5201C] hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base shadow-md transition-colors mb-5"
                    >
                        <Play className="h-5 w-5 fill-white" />
                        Start Exercise
                    </Link>

                    {/* Words list */}
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
                                                            {word.definition}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-[#E5201C] font-semibold mt-2">
                                                        Click to view full
                                                        details →
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        speakWord(word.word);
                                                    }}
                                                    className="p-2 text-[#E5201C] hover:bg-red-50 rounded-full transition"
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
                            <BookOpen className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-800 mb-1">
                                No Words Yet
                            </h3>
                            <p className="text-sm text-gray-400">
                                No words have been added to this subcategory
                                yet.
                            </p>
                            <Link
                                href={route("wordlist.show", wordList.id)}
                                className="inline-flex items-center gap-1.5 mt-4 text-[#E5201C] text-sm font-semibold hover:text-red-700"
                            >
                                <ChevronLeft className="h-4 w-4" /> Back to
                                subcategories
                            </Link>
                        </div>
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
