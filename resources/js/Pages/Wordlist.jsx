import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { BookOpen, ChevronRight, Lock, Play } from "lucide-react";

export default function Exercise({ wordLists }) {
    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        const star =
            d === "easy" || d === "beginner"
                ? "⭐"
                : d === "medium" || d === "intermediate"
                  ? "⭐⭐"
                  : d === "hard" || d === "advanced"
                    ? "⭐⭐⭐"
                    : "⭐";
        const color =
            d === "easy" || d === "beginner"
                ? "bg-green-50 text-green-700 border-green-200"
                : d === "medium" || d === "intermediate"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200";
        return { star, color };
    };

    return (
        <AppLayout>
            <Head title="Exercises" />
            <div className="min-h-screen bg-[#F0F2F5]">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    {wordLists && wordLists.length > 0 ? (
                        <div className="space-y-3">
                            {wordLists.map((wordList, index) => {
                                const { star, color } = getDifficultyBadge(
                                    wordList.difficulty,
                                );
                                return (
                                    <Link
                                        key={wordList.id}
                                        href={route(
                                            "wordlist.show",
                                            wordList.id,
                                        )}
                                        className="block"
                                    >
                                        <div
                                            className="bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
                                            style={{
                                                animationDelay: `${index * 0.07}s`,
                                                animation:
                                                    "fadeInUp 0.4s ease-out forwards",
                                                opacity: 0,
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <h2 className="text-base font-bold text-gray-900 leading-snug flex-1">
                                                    {wordList.title}
                                                </h2>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {wordList.price > 0 ? (
                                                        <div className="flex items-center gap-1 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                                            <Lock className="h-3.5 w-3.5 text-amber-600" />
                                                            <span className="text-xs font-bold text-amber-700">
                                                                $
                                                                {wordList.price}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                                            FREE
                                                        </span>
                                                    )}
                                                    <ChevronRight className="h-4 w-4 text-gray-300" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span
                                                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color}`}
                                                >
                                                    {star} {wordList.difficulty}
                                                </span>
                                                {wordList.words_count > 0 && (
                                                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                                        {wordList.words_count}{" "}
                                                        words
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-end">
                                                <span className="text-[#E5201C] text-sm font-semibold flex items-center gap-1">
                                                    Start Exercise
                                                    <Play className="h-3.5 w-3.5 fill-[#E5201C]" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No Word Lists Available
                            </h3>
                            <p className="text-gray-500 text-sm mb-5">
                                There are no word lists created yet.
                            </p>
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                Go Back Home
                            </Link>
                        </div>
                    )}
                </main>
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
