import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

export default function EmptyQueueScreen({ wordList, subcategory, backHref }) {
    return (
        <AppLayout>
            <Head title="All Caught Up!" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                        All Caught Up!
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">
                        {subcategory ? subcategory.name : wordList.title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                        No words are due for review right now. Check back
                        tomorrow to keep your streak going!
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href={route("words.mastered")}
                            className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                        >
                            View Mastered Words
                        </Link>
                        <Link
                            href={backHref}
                            className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900 transition"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back to List
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
