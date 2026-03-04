import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Volume2,
    BookOpen,
    List,
} from "lucide-react";

export default function ExerciseDetail({ exerciseGroup, words }) {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-green-100 text-green-700 border-green-300";
            case "medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "hard":
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
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
                {/* Page Sub-header */}
                <div className="max-w-xl mx-auto px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href={route("exercise.index")}
                            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
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
                                    className="bg-gray-50 text-gray-700"
                                >
                                    {exerciseGroup.words_count} words
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Exercise Button */}
                <div className="max-w-xl mx-auto px-4 py-4">
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

                {/* Words List */}
                <main className="max-w-xl mx-auto px-4">
                    <div className="mb-4 flex items-center gap-2 text-gray-600">
                        <List className="h-5 w-5" />
                        <h2 className="font-semibold">Word List</h2>
                    </div>

                    {words.data && words.data.length > 0 ? (
                        <>
                            <div className="">
                                {words.data.map((word, index) => (
                                    <Link
                                        href={route("word.show", word.id)}
                                        key={word.id}
                                    >
                                        <Card
                                            className="mb-2 overflow-hidden border-2 hover:border-[#E5201C] transition-all cursor-pointer"
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
                                                        <CardTitle className="text-xl font-bold text-gray-900 mb-1">
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            speakWord(
                                                                word.word,
                                                            );
                                                        }}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition"
                                                    >
                                                        <Volume2 className="h-5 w-5 text-[#E5201C]" />
                                                    </button>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-2 pb-4">
                                                {word.definition && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {word.definition}
                                                    </p>
                                                )}
                                                <p className="text-xs text-[#E5201C] font-medium mt-2">
                                                    Click to view full details →
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {words.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between gap-3">
                                    <Button
                                        variant="outline"
                                        disabled={!words.prev_page_url}
                                        onClick={() =>
                                            router.get(
                                                words.prev_page_url,
                                                {},
                                                { preserveScroll: true },
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
                                                { preserveScroll: true },
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Words Yet
                            </h3>
                            <p className="text-gray-600">
                                This exercise group doesn't have any words yet.
                            </p>
                        </Card>
                    )}
                </main>

                <style>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(15px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
