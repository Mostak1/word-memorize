import { Head, Link, router, usePage } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ChevronLeft,
    Volume2,
    Check,
    X as XIcon,
    BookOpen,
    LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import FlashMessages from "@/Components/FlashMessage";

export default function WordDetail({ auth, word, exerciseGroup }) {
    const [wordStatus, setWordStatus] = useState(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const speakWord = (text) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleMarkWord = (status) => {
        if (!auth.user) {
            setShowLoginDialog(true);
            return;
        }

        setWordStatus(status); // instant UI change

        router.post(
            route("word.attempt", word.id),
            { result: status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Toast will be shown by FlashMessages component
                },
                onError: () => {
                    setWordStatus(null);
                    toast.error("Something went wrong");
                },
            },
        );
    };

    return (
        <>
            <Head title={`${word.word} - Word Details`} />
            <FlashMessages />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
                {/* Header */}
                <div className="bg-[#E5201C] text-white p-4 shadow-lg sticky top-0 z-10">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        <Link
                            href={
                                exerciseGroup
                                    ? route("exercise.show", exerciseGroup.id)
                                    : route("exercise.index")
                            }
                            className="text-white hover:bg-red-700 p-2 rounded-lg transition"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-xl font-bold flex items-center gap-2 flex-1">
                            <BookOpen className="h-6 w-6" />
                            Word Details
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
                </div>

                {/* Main Content */}
                <main className="max-w-2xl mx-auto px-4 py-6">
                    <Card className="overflow-hidden border-2 shadow-lg">
                        <CardContent className="p-0">
                            {/* Word Header Section */}
                            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                            {word.word}
                                        </h1>
                                        {word.hyphenation && (
                                            <p className="text-lg text-gray-500 italic mb-3">
                                                {word.hyphenation}
                                            </p>
                                        )}
                                        {word.parts_of_speech_variations && (
                                            <Badge
                                                variant="outline"
                                                className="text-sm font-semibold"
                                            >
                                                {
                                                    word.parts_of_speech_variations
                                                }
                                            </Badge>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => speakWord(word.word)}
                                        className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <Volume2 className="h-7 w-7 text-[#E5201C]" />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-4">
                                    <Button
                                        onClick={() => handleMarkWord("known")}
                                        className={`flex-1 h-12 text-base font-semibold transition-all ${
                                            wordStatus === "known"
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : "bg-white border-2 border-green-600 text-green-600 hover:bg-green-50"
                                        }`}
                                    >
                                        <Check className="h-5 w-5 mr-2" />
                                        I Know This
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleMarkWord("unknown")
                                        }
                                        className={`flex-1 h-12 text-base font-semibold transition-all ${
                                            wordStatus === "unknown"
                                                ? "bg-red-600 hover:bg-red-700 text-white"
                                                : "bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
                                        }`}
                                    >
                                        <XIcon className="h-5 w-5 mr-2" />
                                        Learning
                                    </Button>
                                </div>
                            </div>

                            {/* Image Section */}
                            {word.image_url_full && (
                                <div className="p-6 border-b bg-white">
                                    <img
                                        src={word.image_url_full}
                                        alt={word.word}
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                    {word.image_related_sentence && (
                                        <p className="text-sm text-gray-600 mt-3 italic text-center">
                                            {word.image_related_sentence}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Word Details Section */}
                            <div className="p-6 space-y-5">
                                {word.definition && (
                                    <div className="border-l-4 border-[#E5201C] pl-4 py-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Definition
                                        </h3>
                                        <p className="text-base text-gray-900 leading-relaxed">
                                            {word.definition}
                                        </p>
                                    </div>
                                )}

                                {word.bangla_translation && (
                                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            বাংলা অর্থ
                                        </h3>
                                        <p className="text-base text-gray-900 leading-relaxed">
                                            {word.bangla_translation}
                                        </p>
                                    </div>
                                )}

                                {word.example_sentences && (
                                    <div className="border-l-4 border-green-500 pl-4 py-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Example Sentence
                                        </h3>
                                        <p className="text-base text-gray-700 italic leading-relaxed">
                                            "{word.example_sentences}"
                                        </p>
                                    </div>
                                )}

                                {word.synonym && (
                                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Synonyms
                                        </h3>
                                        <p className="text-base text-gray-900 leading-relaxed">
                                            {word.synonym}
                                        </p>
                                    </div>
                                )}

                                {word.antonym && (
                                    <div className="border-l-4 border-orange-500 pl-4 py-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Antonyms
                                        </h3>
                                        <p className="text-base text-gray-900 leading-relaxed">
                                            {word.antonym}
                                        </p>
                                    </div>
                                )}

                                {word.collocations && (
                                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                            Common Collocations
                                        </h3>
                                        <p className="text-base text-gray-900 leading-relaxed">
                                            {word.collocations}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Exercise Group Info */}
                            {exerciseGroup && (
                                <div className="bg-gray-50 p-6 border-t">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Part of Exercise
                                    </h3>
                                    <Link
                                        href={route(
                                            "exercise.show",
                                            exerciseGroup.id,
                                        )}
                                        className="inline-flex items-center gap-2 text-[#E5201C] hover:text-red-700 font-semibold"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        {exerciseGroup.title}
                                        <span className="text-gray-400">→</span>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>

                {/* Login Alert Dialog */}
                <AlertDialog
                    open={showLoginDialog}
                    onOpenChange={setShowLoginDialog}
                >
                    <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <LogIn className="h-5 w-5 text-[#E5201C]" />
                                Login Required
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                                You need to be logged in to mark words as known
                                or unknown. This helps us track your progress
                                and personalize your learning experience.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    window.location.href = route("login");
                                }}
                                className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                            >
                                Go to Login
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}