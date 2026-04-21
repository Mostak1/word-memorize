import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function EmptyQueueScreen({ wordList, subcategory, backHref }) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title={t("exercise.empty.title")} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md dark:shadow-xl dark:shadow-slate-950 w-full max-w-md p-8 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                        {t("exercise.empty.title")}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">
                        {subcategory ? subcategory.name : wordList.title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                        {t("exercise.empty.desc")}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href={route("words.mastered")}
                            className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                        >
                            {t("exercise.empty.view_mastered")}
                        </Link>
                        <Link
                            href={backHref}
                            className="w-full py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900 transition"
                        >
                            <ChevronLeft className="h-4 w-4" /> {t("exercise.empty.back_to_list")}
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
