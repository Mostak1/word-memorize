import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Plus,
    BookOpen,
    List,
    Star,
    Share2,
    Settings,
    Trophy,
} from "lucide-react";

export default function Dashboard({ masteredCount = 0, reviewCount = 0 }) {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-[#F0F2F5]">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    <p className="text-gray-500 text-sm mb-5">
                        Start learning and expand your vocabulary
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Add New Word — opens dialog on My Words page */}
                        <Link
                            href={route("my.words.index") + "?new=1"}
                            className="block"
                        >
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
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
                        </Link>

                        {/* Word Lists */}
                        <Link
                            href={route("wordlistcategory.index")}
                            className="block"
                        >
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
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
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <Trophy className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 text-sm">
                                        Mastered Words
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {masteredCount > 0 ? (
                                            <span className="font-extrabold text-green-600 text-base">
                                                {masteredCount} words
                                            </span>
                                        ) : (
                                            "Words you know"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Quiz */}
                        <Link href={route("quiz.index")} className="block">
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
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

                    {/* My Words collection banner */}
                    <Link href={route("my.words.index")}>
                        <div className="bg-[#E5201C] rounded-2xl py-5 px-6 text-center shadow-md hover:bg-red-700 transition-colors cursor-pointer">
                            <p className="text-white font-bold text-sm">
                                My Word Collection
                            </p>
                            <p className="text-white/80 text-xs mt-1">
                                View &amp; manage all your personal words
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
