import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ChevronLeft,
    ChevronRight,
    Trophy,
    BookOpen,
    Layers,
    Star,
} from "lucide-react";

export default function MasteredWords({ wordlists, totalMastered }) {
    const getDifficultyConfig = (difficulty) => {
        const d = difficulty?.toLowerCase();
        if (d === "easy" || d === "beginner")
            return {
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                bar: "bg-emerald-400",
                glow: "shadow-emerald-100",
            };
        if (d === "medium" || d === "intermediate")
            return {
                badge: "bg-amber-50 text-amber-700 border-amber-200",
                bar: "bg-amber-400",
                glow: "shadow-amber-100",
            };
        if (d === "hard" || d === "advanced")
            return {
                badge: "bg-red-50 text-red-700 border-red-200",
                bar: "bg-red-400",
                glow: "shadow-red-100",
            };
        return {
            badge: "bg-gray-50 text-gray-600 border-gray-200",
            bar: "bg-gray-300",
            glow: "",
        };
    };

    return (
        <AppLayout>
            <Head title="Mastered Words" />
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
                                <Trophy className="h-5 w-5 text-green-600 shrink-0" />
                                Mastered Words
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {totalMastered} word
                                {totalMastered !== 1 ? "s" : ""} mastered across{" "}
                                {wordlists?.length ?? 0} list
                                {(wordlists?.length ?? 0) !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Total mastered banner */}
                    {totalMastered > 0 && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-5 py-4 mb-5 flex items-center gap-4 shadow-md shadow-green-100">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-tight">
                                    {totalMastered} Words Mastered
                                </p>
                                <p className="text-green-100 text-xs mt-0.5">
                                    Keep going — you're doing great!
                                </p>
                            </div>
                            <Star className="h-5 w-5 text-yellow-300 ml-auto shrink-0 fill-yellow-300" />
                        </div>
                    )}

                    {/* Wordlist cards */}
                    {wordlists && wordlists.length > 0 ? (
                        <div className="space-y-3">
                            {wordlists.map((wl, index) => {
                                const cfg = getDifficultyConfig(wl.difficulty);
                                return (
                                    <Link
                                        key={wl.id}
                                        href={route(
                                            "words.mastered.byList",
                                            wl.id,
                                        )}
                                        className="block"
                                        style={{
                                            animationDelay: `${index * 0.06}s`,
                                            animation:
                                                "fadeInUp 0.4s ease-out forwards",
                                            opacity: 0,
                                        }}
                                    >
                                        <div
                                            className={`bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all ${cfg.glow}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                                        <Layers className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-bold text-gray-900 truncate">
                                                            {wl.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            {wl.difficulty && (
                                                                <span
                                                                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}
                                                                >
                                                                    {
                                                                        wl.difficulty
                                                                    }
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                                                                <Trophy className="h-3 w-3" />
                                                                {
                                                                    wl.mastered_count
                                                                }{" "}
                                                                mastered
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
                                            </div>

                                            {/* Progress bar */}
                                            {wl.total_words > 0 && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                        <span>
                                                            {wl.mastered_count}{" "}
                                                            / {wl.total_words}{" "}
                                                            words
                                                        </span>
                                                        <span>
                                                            {Math.round(
                                                                (wl.mastered_count /
                                                                    wl.total_words) *
                                                                    100,
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${cfg.bar} transition-all`}
                                                            style={{
                                                                width: `${Math.min(100, (wl.mastered_count / wl.total_words) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                                <Trophy className="h-10 w-10 text-green-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No Mastered Words Yet
                            </h3>
                            <p className="text-gray-500 text-sm mb-5">
                                Press "Check" on a word during exercise to mark
                                it as mastered.
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
