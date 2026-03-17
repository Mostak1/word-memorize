import { Head, Link, router } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    BookOpen,
    Plus,
    BarChart3,
    List,
    Star,
    Share2,
    Settings,
    LogOut,
    LogIn,
} from "lucide-react";
import { useState } from "react";
import logo from "/public/img/logo.png";

export default function Welcome({ auth }) {
    const [showStatsDialog, setShowStatsDialog] = useState(false);

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-[#F0F2F5]">
                <div className="bg-[#E5201C] text-white shadow-md sticky top-0 z-10">
                    <div className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white rounded-lg px-2 py-1">
                                <img src={logo} className="h-5" alt="Logo" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                WordWise
                            </span>
                        </div>
                        {auth.user ? (
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Link>
                        ) : (
                            <Link
                                href={route("login")}
                                className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <LogIn className="h-4 w-4" />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    <p className="text-gray-500 text-sm mb-5">
                        Start learning and expand your vocabulary
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[160px]">
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

                        {/* Exercise → category index (first step in the flow) */}
                        <Link
                            href={route("wordlistcategory.index")}
                            className="block"
                        >
                            <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[160px]">
                                <div className="w-16 h-16 rounded-full bg-[#E5201C]/10 flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-[#E5201C]" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 text-sm">
                                        Exercise
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Practice now
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <div
                            className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[160px]"
                            onClick={() => setShowStatsDialog(true)}
                        >
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <BarChart3 className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-900 text-sm">
                                    Statistics
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Track progress
                                </p>
                            </div>
                        </div>

                        {/* Word List → category index */}
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
                                        Word List
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Browse all
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

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

            <AlertDialog
                open={showStatsDialog}
                onOpenChange={setShowStatsDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            {auth.user
                                ? "Statistics Coming Soon!"
                                : "Login Required"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {auth.user
                                ? "We're working on an amazing statistics feature to help you track your learning progress."
                                : "You need to be logged in to view your statistics and track your learning progress."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                            {auth.user ? "Got it" : "Cancel"}
                        </AlertDialogCancel>
                        {!auth.user && (
                            <AlertDialogAction
                                onClick={() => router.visit(route("login"))}
                                className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                            >
                                Go to Login
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
