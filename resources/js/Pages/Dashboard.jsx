import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    Plus,
    BookOpen,
    List,
    Star,
    Share2,
    Settings,
    Trophy,
    RefreshCcw,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard({ masteredCount = 0, reviewCount = 0 }) {
    const [showComingSoon, setShowComingSoon] = useState(false);

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-[#F0F2F5]">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    <p className="text-gray-500 text-sm mb-5">
                        Start learning and expand your vocabulary
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Add New Word */}
                        <div
                            onClick={() => setShowComingSoon(true)}
                            className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[160px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Plus className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-900 text-sm">
                                    Add New Word
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Expand vocabulary
                                </p>
                            </div>
                        </div>

                        {/* Word Lists */}
                        <Link
                            href={route("wordlistcategory.index")}
                            className="block"
                        >
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                                    <List className="h-8 w-8 text-purple-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 text-sm">
                                        WordLists
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Browse All
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Mastered Words */}
                        <Link href={route("words.mastered")} className="block">
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-start justify-between gap-2 shadow-sm hover:shadow-md transition-shadow min-h-[160px] relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-green-50 opacity-60" />
                                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                    <Trophy className="h-7 w-7 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                        Mastered Words
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Words you know
                                    </p>
                                </div>
                                {masteredCount > 0 ? (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-2xl font-extrabold text-green-600">
                                            {masteredCount}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">
                                        No words yet
                                    </p>
                                )}
                            </div>
                        </Link>

                        {/* Quiz */}
                        <Link href={route("quiz.index")} className="block">
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-[#E5201C]/10 flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-[#E5201C]" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 text-sm">
                                        Quiz
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Practice now
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Bottom row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <Star className="h-6 w-6 text-amber-400" />
                            <span className="text-xs font-medium text-gray-600 text-center">
                                Rate 5 Stars
                            </span>
                        </div>
                        <div className="bg-white rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <Share2 className="h-6 w-6 text-blue-400" />
                            <span className="text-xs font-medium text-gray-600 text-center">
                                Share
                            </span>
                        </div>
                        <div className="bg-white rounded-2xl py-5 px-3 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <Settings className="h-6 w-6 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600 text-center">
                                Settings
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#E5201C] rounded-2xl py-5 px-6 text-center shadow-md cursor-pointer">
                        <p className="text-white font-bold text-sm">
                            Explore More Features
                        </p>
                        <p className="text-white/80 text-xs mt-1">
                            Discover advanced learning tools
                        </p>
                    </div>
                </div>
            </div>

            {/* Coming Soon Dialog */}
            <AlertDialog open={showComingSoon} onOpenChange={setShowComingSoon}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-500" />
                            Coming Soon!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            The{" "}
                            <span className="font-semibold text-gray-800">
                                Add New Word
                            </span>{" "}
                            feature is currently under development. Stay tuned —
                            it'll be available soon! 🚀
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="w-full bg-[#E5201C] text-white hover:bg-red-700 border-0">
                            Got it!
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
