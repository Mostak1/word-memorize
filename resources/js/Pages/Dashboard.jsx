import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    BookOpen,
    Plus,
    BarChart3,
    List,
    Star,
    Share2,
    Settings,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
    const [showStatsDialog, setShowStatsDialog] = useState(false);

    const handleStatsClick = () => {
        setShowStatsDialog(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                <div className="w-full max-w-2xl mx-auto">
                    {/* Welcome Message */}
                    <div className="px-4 pt-6 pb-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Start learning and expand your vocabulary
                        </p>
                    </div>

                    {/* Main Actions Grid */}
                    <div className="px-4 pb-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Card className="cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all group">
                                <CardContent className="flex flex-col items-center justify-center h-40 p-4">
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                        <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                                        Add New Word
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Expand vocabulary
                                    </span>
                                </CardContent>
                            </Card>

                            <Link href={route("exercise.index")}>
                                <Card className="cursor-pointer hover:shadow-lg hover:border-[#E5201C] transition-all group h-full">
                                    <CardContent className="flex flex-col items-center justify-center h-40 p-4">
                                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5201C]/10 group-hover:bg-[#E5201C]/20 transition-colors">
                                            <BookOpen className="h-8 w-8 text-[#E5201C]" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                                            Exercise
                                        </span>
                                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Practice now
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Card
                                className="cursor-pointer hover:shadow-lg hover:border-green-500 transition-all group"
                                onClick={handleStatsClick}
                            >
                                <CardContent className="flex flex-col items-center justify-center h-40 p-4">
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                        <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                                        Statistics
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Track progress
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className="cursor-pointer hover:shadow-lg hover:border-purple-500 transition-all group">
                                <CardContent className="flex flex-col items-center justify-center h-40 p-4">
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                        <List className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                                        Word List
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Browse all
                                    </span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Smaller Action Buttons */}
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-28 p-3 hover:border-[#E5201C] hover:bg-[#E5201C]/5 transition-colors group"
                            >
                                <Star className="h-6 w-6 text-amber-500 group-hover:text-[#E5201C] mb-2 transition-colors" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                    Rate 5 Stars
                                </span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-28 p-3 hover:border-[#E5201C] hover:bg-[#E5201C]/5 transition-colors group"
                            >
                                <Share2 className="h-6 w-6 text-blue-500 group-hover:text-[#E5201C] mb-2 transition-colors" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                    Share
                                </span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-28 p-3 hover:border-[#E5201C] hover:bg-[#E5201C]/5 transition-colors group"
                            >
                                <Settings className="h-6 w-6 text-gray-500 group-hover:text-[#E5201C] mb-2 transition-colors" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                    Settings
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-4 mb-6 mx-4">
                        <div className="rounded-lg bg-gradient-to-r from-[#E5201C] to-red-600 text-white text-center py-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                            <p className="text-sm font-semibold mb-1">
                                Explore More Features
                            </p>
                            <p className="text-xs opacity-90">
                                Discover advanced learning tools
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Coming Soon Dialog */}
            <AlertDialog
                open={showStatsDialog}
                onOpenChange={setShowStatsDialog}
            >
                <AlertDialogContent className="max-w-md mx-4">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            Statistics Coming Soon!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            We're working on an amazing statistics feature to
                            help you track your learning progress. Stay tuned
                            for updates!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setShowStatsDialog(false)}
                            className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700"
                        >
                            Got it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
