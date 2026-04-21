import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function LoadingScreen({ loadingProgress }) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title={t("common.loading")} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 border-4 border-[#E5201C] border-t-transparent rounded-full animate-spin" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {t("exercise.loading.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {t("exercise.loading.desc")}
                    </p>

                    <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-[#E5201C] transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>

                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500 text-center">
                        {loadingProgress}%
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
