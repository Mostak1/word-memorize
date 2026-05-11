import React, { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Zap, Loader2, User, Settings, LogOut } from "lucide-react";
import logo from "/public/img/logo.png";
import axios from "axios";
import { ThemeToggle } from "@/Components/ThemeToggle";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function TopHeader() {
    const { t } = useTranslation();
    const { auth, assetUrl } = usePage().props;
    const user = auth?.user;

    const [showDropdown, setShowDropdown] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [xpBalance, setXpBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!dropdownRef.current) return;

            // Check if the click is inside the dropdown
            const isInside = dropdownRef.current.contains(event.target);

            // Check if the click is inside a Radix UI portal (like the theme toggle dropdown)
            const isPortal =
                event.target.closest("[data-radix-portal]") ||
                event.target.closest('[role="menu"]') ||
                event.target.closest('[role="dialog"]');

            if (!isInside && !isPortal) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchXp = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const response = await axios.get(route("api.xp-shop.status"));
                setXpBalance(response.data.xp.balance);
            } catch (err) {
                console.error("Failed to fetch XP status:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchXp();
    }, [user]);

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[28px] p-2 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.04)] mb-2 border border-white dark:border-slate-800 sticky top-4 z-50 transition-all">
            <Link
                href={user ? route("dashboard") : route("home")}
                className="flex items-center gap-2 outline-none active:scale-95 transition-transform cursor-pointer"
            >
                <div className="bg-red-50 dark:bg-red-900/90 p-1.5 rounded-xl">
                    <img src={logo} className="h-5" alt="Logo" />
                </div>
                <span className="text-xl font-black tracking-tighter text-[#E5201C]">
                    VocabPix
                </span>
            </Link>
            <div className="flex items-center gap-3 pr-1">
                {user ? (
                    <>
                        <div className="bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-yellow-100 dark:border-yellow-900/30">
                            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                            ) : (
                                <span className="text-sm font-black text-yellow-700 dark:text-yellow-400">
                                    {xpBalance.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="active:scale-95 transition-transform outline-none"
                            >
                                <div className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-700 shadow-md overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                                    {isLoading ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-700 dark:to-slate-800">
                                            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                        </div>
                                    ) : user?.image && !imgError ? (
                                        <img
                                            src={
                                                user.image.startsWith("http")
                                                    ? user.image
                                                    : `${assetUrl?.replace(/\/$/, "")}/${user.image.replace(/^\//, "")}`
                                            }
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <img
                                            src={`${assetUrl?.replace(/\/$/, "")}/img/default_pic.jpeg`}
                                            alt={user?.name}
                                            className="w-full h-full object-cover dark:brightness-[0.85] dark:opacity-40 transition-all"
                                        />
                                    )}
                                </div>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-2 flex items-center justify-between">
                                        <div className="max-w-[120px]">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="scale-90 origin-right">
                                            <ThemeToggle />
                                        </div>
                                    </div>
                                    <Link
                                        href={route("profile.edit")}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <User className="h-4 w-4 opacity-70" />
                                        {t("nav.profile")}
                                    </Link>
                                    <Link
                                        href={route("settings.show")}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <Settings className="h-4 w-4 opacity-70" />
                                        {t("nav.settings")}
                                    </Link>
                                    <div className="border-t border-gray-100 dark:border-slate-700 mt-2 pt-2">
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t("nav.logout")}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link
                        href={route("login")}
                        className="px-4 py-2 bg-[#E5201C] text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                        {t("nav.login")}
                    </Link>
                )}
            </div>
        </div>
    );
}
