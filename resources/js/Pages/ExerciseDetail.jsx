import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Volume2,
    BookOpen,
    List,
    Layers,
} from "lucide-react";

export default function ExerciseDetail({
    exerciseGroup,
    subcategories = [],
    words,
}) {
    const hasSubcategories = subcategories && subcategories.length > 0;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-green-100 text-green-700 border-green-300";
            case "medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "hard":
                return "bg-red-100 text-red-700 border-red-300";
            case "beginner":
                return "bg-green-100 text-green-700 border-green-300";
            case "intermediate":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "advanced":
                return "bg-red-100 text-red-700 border-red-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    const speakWord = (word) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = "en-US";
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <AppLayout>
            <Head title={`Exercise - ${exerciseGroup.title}`} />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 pb-20 mt-4">
                {/* Sub-header */}
                <div className="max-w-xl mx-auto px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href={route("exercise.index")}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-600 dark:text-gray-400"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                                {exerciseGroup.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge
                                    variant="outline"
                                    className={`${getDifficultyColor(exerciseGroup.difficulty)} font-semibold border`}
                                >
                                    {exerciseGroup.difficulty}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                                >
                                    {exerciseGroup.words_count} words
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Exercise Button */}
                <div className="max-w-xl mx-auto px-4 py-3">
                    <Button
                        asChild
                        className="w-full bg-[#E5201C] hover:bg-red-700 text-white font-semibold py-6 text-lg shadow-lg"
                    >
                        <Link href={route("exercise.start", exerciseGroup.id)}>
                            <Play className="mr-2 h-5 w-5" />
                            Start Exercise
                        </Link>
                    </Button>
                </div>

                <main className="max-w-xl mx-auto px-4">
                    {/* ── SUBCATEGORY MODE ──────────────────────────────── */}
                    {hasSubcategories && (
                        <>
                            <div className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Layers className="h-5 w-5" />
                                <h2 className="font-semibold">
                                    Subcategories ({subcategories.length})
                                </h2>
                            </div>

                            <div>
                                {subcategories.map((sub, index) => (
                                    <Link
                                        key={sub.id}
                                        href={route("exercise.subcategory", [
                                            exerciseGroup.id,
                                            sub.id,
                                        ])}
                                    >
                                        <Card
                                            className="overflow-hidden border-2 hover:border-[#E5201C] transition-all duration-200 hover:shadow-md cursor-pointer mb-2"
                                            style={{
                                                animationDelay: `${index * 0.06}s`,
                                                animation:
                                                    "fadeInUp 0.4s ease-out forwards",
                                                opacity: 0,
                                            }}
                                        >
                                            <CardContent className="flex items-center justify-between px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5201C]/10">
                                                        <Layers className="h-5 w-5 text-[#E5201C]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {sub.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {sub.words_count}{" "}
                                                            {sub.words_count ===
                                                            1
                                                                ? "word"
                                                                : "words"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── FALLBACK: NO SUBCATEGORIES → SHOW WORDS DIRECTLY ── */}
                    {!hasSubcategories && words && (
                        <>
                            <div className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <List className="h-5 w-5" />
                                <h2 className="font-semibold">Word List</h2>
                            </div>

                            {words.data && words.data.length > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        {words.data.map((word, index) => (
                                            <Link
                                                href={route(
                                                    "word.show",
                                                    word.id,
                                                )}
                                                key={word.id}
                                            >
                                                <Card
                                                    className="overflow-hidden border-2 hover:border-[#E5201C] transition-all cursor-pointer"
                                                    style={{
                                                        animationDelay: `${index * 0.05}s`,
                                                        animation:
                                                            "fadeInUp 0.4s ease-out forwards",
                                                        opacity: 0,
                                                    }}
                                                >
                                                    <CardHeader className="pb-2 pt-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                                    {word.word}
                                                                </CardTitle>
                                                                {word.hyphenation && (
                                                                    <p className="text-sm text-gray-500 italic">
                                                                        {
                                                                            word.hyphenation
                                                                        }
                                                                    </p>
                                                                )}
                                                                {word.parts_of_speech_variations && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="mt-2 text-xs"
                                                                    >
                                                                        {
                                                                            word.parts_of_speech_variations
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    speakWord(
                                                                        word.word,
                                                                    );
                                                                }}
                                                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition"
                                                            >
                                                                <Volume2 className="h-5 w-5 text-[#E5201C]" />
                                                            </button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="pt-2 pb-4">
                                                        {word.definition && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                {
                                                                    word.definition
                                                                }
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-[#E5201C] font-medium mt-2">
                                                            Click to view full
                                                            details →
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>

                                    {words.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between gap-3">
                                            <Button
                                                variant="outline"
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
                                                className="flex items-center gap-1"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-500">
                                                Page {words.current_page} of{" "}
                                                {words.last_page}
                                            </span>
                                            <Button
                                                variant="outline"
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
                                                className="flex items-center gap-1"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Card className="p-8 text-center">
                                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        No Words Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        This exercise group doesn't have any
                                        words yet.
                                    </p>
                                </Card>
                            )}
                        </>
                    )}
                </main>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(15px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
