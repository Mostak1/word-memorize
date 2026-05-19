import React, { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Zap, Loader2, User, Settings, LogOut, RotateCw } from "lucide-react";
import logo from "/public/img/logo.png";
import axios from "axios";
import { ThemeToggle } from "@/Components/ThemeToggle";
import { useTranslation } from "@/Contexts/LanguageContext";
import PwaInstallButton from "@/Components/PwaInstallButton";

export default function TopHeader() {
    const { t } = useTranslation();
    const { auth, assetUrl } = usePage().props;
    const user = auth?.user;

    const [showDropdown, setShowDropdown] = useState(false);
    const [imgError, setImgError] = useState(false);
    const xpBalance = user?.xp?.balance ?? 0;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const dropdownRef = useRef(null);
    const assetBaseUrl = assetUrl?.replace(/\/$/, "") ?? "";
    const defaultAvatarUrl = `${assetBaseUrl}/img/default_pic.jpeg`;
    const userImage = user?.image?.trim();
    const hasUsableUserImage =
        userImage &&
        !userImage.includes("default-files/avatar.png") &&
        !imgError;
    const userImageUrl = hasUsableUserImage
        ? userImage.startsWith("http")
            ? userImage
            : `${assetBaseUrl}/${userImage.replace(/^\//, "")}`
        : defaultAvatarUrl;

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

    // No redundant on-mount XP fetching; we read the globally shared Inertia props directly

    const handleForceRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Unregister Service Workers
            if ("serviceWorker" in navigator) {
                const registrations =
                    await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // Clear Cache Storage
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map((name) => caches.delete(name)),
                );
            }

            // Forced Reload (bypass cache)
            window.location.reload(true);
        } catch (err) {
            console.error("Failed to force refresh:", err);
            window.location.reload();
        }
    };

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
            <div className="flex items-center gap-2 sm:gap-3 pr-1">
                {!user && (
                    <PwaInstallButton
                        compact
                        className="sm:hidden h-10 w-10 px-0"
                    />
                )}
                {!user && (
                    <button
                        onClick={handleForceRefresh}
                        disabled={isRefreshing}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all active:scale-95 disabled:opacity-50 border border-gray-100 dark:border-slate-700 shadow-sm"
                        title="Force refresh & clear cache"
                    >
                        <RotateCw
                            className={`h-4 w-4 ${isRefreshing ? "animate-spin text-red-500" : ""}`}
                        />
                    </button>
                )}
                <PwaInstallButton className="hidden sm:inline-flex" />
                {user ? (
                    <>
                        <div className="bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-yellow-100 dark:border-yellow-900/30">
                            <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-black text-yellow-700 dark:text-yellow-400">
                                {xpBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="active:scale-95 transition-transform outline-none"
                            >
                                <div className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-700 shadow-md overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                                    {hasUsableUserImage ? (
                                        <img
                                            src={userImageUrl}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <img
                                            src={defaultAvatarUrl}
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
                                    <PwaInstallButton
                                        variant="menu"
                                        className="w-full !justify-start gap-3 rounded-none px-4 py-2 text-sm font-normal"
                                    />
                                    <button
                                        onClick={handleForceRefresh}
                                        disabled={isRefreshing}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                    >
                                        <RotateCw
                                            className={`h-4 w-4 opacity-70 ${isRefreshing ? "animate-spin text-red-500" : ""}`}
                                        />
                                        {t("nav.force_refresh")}
                                    </button>
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
