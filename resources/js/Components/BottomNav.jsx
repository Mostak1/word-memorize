import React from "react";
import { Link } from "@inertiajs/react";
import { Home, BookOpen, Zap, Trophy, ShoppingBag } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function BottomNav() {
    const { t } = useTranslation();

    const tabs = [
        {
            name: t("nav.home"),
            icon: Home,
            href: route("dashboard"),
            active: route().current("dashboard") || route().current("home"),
        },
        {
            name: t("nav.words"),
            icon: BookOpen,
            href: route("wordlistcategory.index"),
            active: route().current("wordlistcategory.*") || route().current("wordlist.*") || route().current("my.words.*"),
        },
        {
            name: t("nav.practice"),
            icon: Zap,
            href: route("quiz.index"),
            active: route().current("quiz.*") || route().current("mastery-test.*"),
        },
        {
            name: t("nav.leaderboard"),
            icon: Trophy,
            href: route("leaderboard"),
            active: route().current("leaderboard"),
        },
        {
            name: t("nav.shop"),
            icon: ShoppingBag,
            href: route("shop"),
            active: route().current("shop"),
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-4 py-3 pb-4 border-t border-white dark:border-slate-800 pointer-events-auto">
                <div className="flex items-center justify-around">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`flex flex-col items-center gap-1 p-2 min-w-[56px] transition-colors relative ${
                            tab.active
                                ? "text-[#E5201C]"
                                : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                        {tab.active && (
                            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-8 h-1 bg-[#E5201C] rounded-full" />
                        )}
                        <tab.icon
                            className={`h-6 w-6 ${tab.active ? "fill-[#E5201C]/10" : ""}`}
                        />
                        <span className="text-[10px] font-bold">
                            {tab.name}
                        </span>
                    </Link>
                ))}
                </div>
            </div>
        </div>
    );
}
