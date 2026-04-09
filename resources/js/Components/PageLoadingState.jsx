import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function PageLoadingState() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        router.on("start", handleStart);
        router.on("finish", handleFinish);

        return () => {
            router.off("start", handleStart);
            router.off("finish", handleFinish);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
            <div className="text-center">
                {/* Custom Spinner SVG */}
                <div className="mb-6">
                    <svg
                        className="w-16 h-16 mx-auto animate-spin"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Background circle */}
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-slate-200 dark:text-slate-700"
                        />
                        {/* Rotating arc - Brand Red */}
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="#e70013"
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray="31.4 125.6"
                            strokeLinecap="round"
                            className="drop-shadow-md"
                        />
                    </svg>
                </div>

                {/* App Name */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-wide">
                    VocabPix
                </h2>

                {/* Loading text */}
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}
