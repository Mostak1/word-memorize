import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { BookOpen, ChevronRight, Lock, Play } from "lucide-react";

export default function WordListCategoryIndex({ wordListCategories }) {
    // const getDifficultyBadge = (difficulty) => {
    //     const d = difficulty?.toLowerCase();
    //     const star =
    //         d === "easy" || d === "beginner"
    //             ? "⭐"
    //             : d === "medium" || d === "intermediate"
    //               ? "⭐⭐"
    //               : d === "hard" || d === "advanced"
    //                 ? "⭐⭐⭐"
    //                 : "⭐";
    //     const color =
    //         d === "easy" || d === "beginner"
    //             ? "bg-green-50 text-green-700 border-green-200"
    //             : d === "medium" || d === "intermediate"
    //               ? "bg-yellow-50 text-yellow-700 border-yellow-200"
    //               : "bg-red-50 text-red-700 border-red-200";
    //     return { star, color };
    // };

    return (
        <AppLayout>
            <Head title="Exercises" />
            <div className="min-h-screen bg-[#F0F2F5]">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    {wordListCategories && wordListCategories.length > 0 ? (
                        <div className="space-y-3">
                            {wordListCategories.map(
                                (wordListCategory, index) => {
                                    return (
                                        <Link
                                            key={wordListCategory.id}
                                            href={route(
                                                "wordlistcategory.wordlists",
                                                wordListCategory.id,
                                            )}
                                            className="block"
                                        >
                                            <div
                                                className="bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                                                style={{
                                                    animationDelay: `${index * 0.07}s`,
                                                    animation:
                                                        "fadeInUp 0.4s ease-out forwards",
                                                    opacity: 0,
                                                }}
                                            >
                                                <div className="flex-1">
                                                    <h2 className="text-base font-bold text-gray-900">
                                                        {wordListCategory.name}
                                                    </h2>

                                                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                wordListCategory.wordlists_count
                                                            }{" "}
                                                            {wordListCategory.wordlists_count ===
                                                            1
                                                                ? "Word List"
                                                                : "Word Lists"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                                            </div>
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No Word List Categories Available
                            </h3>
                            <p className="text-gray-500 text-sm mb-5">
                                There are no word list categories created yet.
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
