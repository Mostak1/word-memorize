import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Volume2, BookOpen, List } from "lucide-react";

export default function ExerciseDetail({ auth, exerciseGroup }) {
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
        <>
            <Head title={`Exercise - ${exerciseGroup.title}`} />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
                {/* Header */}
                <div className="bg-[#E5201C] text-white shadow-lg sticky top-0 z-10">
                    <div className="max-w-xl mx-auto p-4">
                        <div className="flex items-center gap-4 mb-3">
                            <Link
                                href={route("exercise.index")}
                                className="text-white hover:bg-red-700 p-2 rounded-lg transition"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Link>
                            <h1 className="text-xl font-bold flex-1 line-clamp-1">
                                {exerciseGroup.title}
                            </h1>
                            {auth.user && (
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                                >
                                    Logout
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                                variant="outline"
                                className={`${getDifficultyColor(exerciseGroup.difficulty)} font-semibold border bg-white`}
                            >
                                {exerciseGroup.difficulty}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="bg-white text-gray-700 border-white"
                            >
                                {exerciseGroup.words?.length || 0} words
                            </Badge>
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

                    {exerciseGroup.words && exerciseGroup.words.length > 0 ? (
                        <div className="space-y-3">
                            {exerciseGroup.words.map((word, index) => (
                                <Link
                                    href={route("word.show", word.id)}
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
                                                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                                                        {word.word}
                                                    </CardTitle>
                                                    {word.hyphenation && (
                                                        <p className="text-sm text-gray-500 italic">
                                                            {word.hyphenation}
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
                                                        speakWord(word.word);
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

                <style jsx>{`
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
        </>
    );
}
