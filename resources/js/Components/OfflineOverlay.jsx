import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function OfflineOverlay() {
    const { t } = useTranslation();

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-full max-w-sm">
                <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                    <div className="relative bg-white dark:bg-slate-900 p-8 rounded-full shadow-2xl border border-gray-100 dark:border-slate-800">
                        <WifiOff className="h-16 w-16 text-[#E70013]" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                    {t("offline.title", { defaultValue: "Connection Lost" })}
                </h1>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 px-4">
                    {t("offline.message", { 
                        defaultValue: "It looks like you're offline. VocabPix needs an internet connection to continue your learning journey." 
                    })}
                </p>

                <button
                    onClick={handleRetry}
                    className="w-full bg-[#E70013] hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <RefreshCw className="h-5 w-5" />
                    <span>{t("offline.retry", { defaultValue: "Try Again" })}</span>
                </button>
                
                <p className="mt-8 text-xs text-gray-400 dark:text-gray-600 font-medium tracking-widest uppercase">
                    VocabPix • Offline Mode
                </p>
            </div>
        </div>
    );
}
