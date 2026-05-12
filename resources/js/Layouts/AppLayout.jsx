import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import {
    Menu,
    X,
    User,
    LogOut,
    Home,
    LogIn,
    UserPlus,
    BookOpen,
    Flag,
    Zap,
    ShoppingBag,
    Settings,
    RotateCw,
} from "lucide-react";
import FlashMessages from "@/Components/FlashMessage";
import ReportErrorDialog from "@/Components/ReportErrorDialog";
import { ThemeToggle } from "@/Components/ThemeToggle";
import { useTheme } from "@/Components/ThemeProvider";
import logo from "/public/img/logo.png";
import { setAssetBaseUrl } from "@/Utils/sounds";
import AchievementToaster from "@/Components/AchievementToaster";
import { useTranslation } from "@/Contexts/LanguageContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import OfflineOverlay from "@/Components/OfflineOverlay";
import BottomNav from "@/Components/BottomNav";
import TopHeader from "@/Components/TopHeader";
import PwaInstallButton from "@/Components/PwaInstallButton";

export default function AppLayout({
    children,
    hideHeader = false,
    showTopHeader = true,
    showBottomNav = true,
}) {
    const isOnline = useOnlineStatus();
    const { t } = useTranslation();
    const { props } = usePage();
    const auth = props?.auth;
    const assetUrl = props?.assetUrl;
    const user = auth?.user ?? null;
    const { setDarkModeUnlocked } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [xpData, setXpData] = useState(user?.xp ?? null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const lastScrollY = useRef(0);
    const xpRefreshKey = useRef(0);

    useEffect(() => {
        setAssetBaseUrl(assetUrl);
    }, [assetUrl]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY <= 0) {
                setHeaderVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                setHeaderVisible(false);
                setMobileOpen(false);
            } else {
                setHeaderVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const openReportDialog = () => {
        setMobileOpen(false);
        setReportDialogOpen(true);
    };

    const [darkModeUnlocked, setLocalDarkModeUnlocked] = useState(false);

    // Immediately unlock dark mode for admin users before API fetch
    useEffect(() => {
        if (user?.role === "admin") {
            setDarkModeUnlocked(true);
            setLocalDarkModeUnlocked(true);
        }
    }, [user, setDarkModeUnlocked]);

    // Fetch XP status from API
    useEffect(() => {
        if (!user) return;

        const fetchXpStatus = async () => {
            try {
                const csrfToken = decodeURIComponent(
                    document.cookie
                        .split("; ")
                        .find((row) => row.startsWith("XSRF-TOKEN="))
                        ?.split("=")[1] ?? "",
                );
                const response = await fetch(route("api.xp-shop.status"), {
                    credentials: "include",
                    headers: {
                        "X-XSRF-TOKEN": csrfToken,
                        Accept: "application/json",
                    },
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(
                        "Failed to fetch XP status:",
                        response.status,
                        errorText,
                    );
                    return;
                }
                const data = await response.json();
                setXpData(data.xp);
                let unlocked = data.dark_mode_unlocked || false;

                // Admin users always have dark mode unlocked
                if (user?.role === "admin") {
                    unlocked = true;
                }

                setDarkModeUnlocked(unlocked);
                setLocalDarkModeUnlocked(unlocked);
            } catch (error) {
                console.error("Failed to fetch XP status:", error);
            }
        };

        fetchXpStatus();
    }, [user, xpRefreshKey.current]);

    // Reset dark mode lock when user logs out
    useEffect(() => {
        if (!user) {
            setDarkModeUnlocked(false);
            setLocalDarkModeUnlocked(false);
        }
    }, [user, setDarkModeUnlocked]);

    // No early return for offline anymore to keep header visible

    const handleForceRefresh = async () => {
        setIsRefreshing(true);
        try {
            if ("serviceWorker" in navigator) {
                const registrations =
                    await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map((name) => caches.delete(name)),
                );
            }
            window.location.reload(true);
        } catch (err) {
            console.error("Failed to force refresh:", err);
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
            <FlashMessages />
            <AchievementToaster />

            <ReportErrorDialog
                controlledOpen={reportDialogOpen}
                onControlledOpenChange={setReportDialogOpen}
            />

            {/* Fixed Top Nav */}
            {!hideHeader && (
                <div
                    className={`bg-[#E70013] dark:bg-[#b80015] text-white shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
                        headerVisible ? "translate-y-0" : "-translate-y-full"
                    }`}
                >
                    <div className="w-full max-w-2xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            {/* Brand */}
                            <Link
                                href={user ? route("dashboard") : route("home")}
                                className="flex items-center gap-2"
                            >
                                <div className="bg-white rounded-lg px-2 py-1 flex items-center">
                                    <img src={logo} className="h-5" alt="Logo" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">
                                    VocabPix
                                </span>
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden sm:flex items-center gap-1">
                                <PwaInstallButton
                                    variant="solid"
                                    className="mr-1"
                                />
                                <button
                                    onClick={handleForceRefresh}
                                    disabled={isRefreshing}
                                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                                    title="Force refresh & clear cache"
                                >
                                    <RotateCw
                                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                                    />
                                </button>
                                {user ? (
                                    <>
                                        <Link
                                            href={route("wordlistcategory.index")}
                                            className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            <span>{t("nav.word_lists")}</span>
                                        </Link>

                                        {/* XP balance pill — links to shop */}
                                        {xpData && (
                                            <Link
                                                href={route("shop")}
                                                className="flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-2"
                                                title="Shop"
                                            >
                                                <Zap className="h-4 w-4 text-yellow-300" />
                                                <span>
                                                    {xpData.balance.toLocaleString()}
                                                </span>
                                            </Link>
                                        )}

                                        {/* Shop link */}
                                        <Link
                                            href={route("shop")}
                                            className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <ShoppingBag className="h-4 w-4" />
                                        </Link>

                                        <ThemeToggle />

                                        <ReportErrorDialog />
                                        <Link
                                            href={route("settings.show")}
                                            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                            title={t("nav.settings")}
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Link>

                                        {/* Profile dropdown */}
                                        <div className="relative group ml-1">
                                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                                                {/* Avatar */}
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold overflow-hidden text-gray-500 dark:text-gray-300">
                                                    {user.image && !imgError ? (
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
                                                        user.name
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    )}
                                                </div>

                                                <span className="max-w-[100px] truncate">
                                                    {user.name}
                                                </span>
                                            </button>

                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                                                <Link
                                                    href={route("profile.edit")}
                                                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-t-xl transition-colors"
                                                >
                                                    <User className="h-4 w-4" />
                                                    {t("nav.profile")}
                                                </Link>

                                                <Link
                                                    href={route("logout")}
                                                    method="post"
                                                    as="button"
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-b-xl transition-colors border-t border-gray-100 dark:border-slate-700"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    {t("nav.logout")}
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ReportErrorDialog />
                                        <Link
                                            href={route("login")}
                                            className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <LogIn className="h-4 w-4" />
                                            <span>{t("nav.login")}</span>
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="flex items-center gap-1.5 bg-white text-[#E5201C] text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            <span>{t("nav.register")}</span>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Toggle */}
                            <div className="sm:hidden flex items-center gap-2">
                                {!user && (
                                    <PwaInstallButton
                                        compact
                                        variant="ghost"
                                        className="h-9 w-9 px-0"
                                    />
                                )}
                                <button
                                    onClick={handleForceRefresh}
                                    disabled={isRefreshing}
                                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                                    title="Force refresh & clear cache"
                                >
                                    <RotateCw
                                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                                    />
                                </button>
                                <button
                                    onClick={openReportDialog}
                                    className="flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-full px-2.5 py-1.5 transition-all"
                                    aria-label="Report an error"
                                >
                                    <Flag className="h-3.5 w-3.5 shrink-0" />
                                </button>
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="text-white hover:bg-white/10 p-2 rounded-lg transition"
                                >
                                    {mobileOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Dropdown */}
                        {mobileOpen && (
                            <div className="sm:hidden mt-3 pt-3 border-t border-white/20 space-y-1">
                                {user ? (
                                    <>
                                        <Link
                                            href={route("dashboard")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <Home className="h-4 w-4" />{" "}
                                            {t("nav.home")}
                                        </Link>
                                        <Link
                                            href={route("wordlistcategory.index")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <BookOpen className="h-4 w-4" />{" "}
                                            {t("nav.word_lists")}
                                        </Link>

                                        {/* Shop link (mobile) */}
                                        <Link
                                            href={route("shop")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-between text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="h-4 w-4" />
                                                <span>{t("nav.shop")}</span>
                                            </div>

                                            {xpData && (
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-yellow-300" />
                                                    <span>
                                                        {xpData.balance.toLocaleString()}{" "}
                                                        XP
                                                    </span>
                                                </div>
                                            )}
                                        </Link>

                                        <div className="px-3 py-2">
                                            <ThemeToggle />
                                        </div>

                                        <button
                                            onClick={openReportDialog}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                                        >
                                            <Flag className="h-4 w-4 shrink-0" />
                                            {t("nav.report_error")}
                                        </button>

                                        <Link
                                            href={route("settings.show")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                                        >
                                            <Settings className="h-4 w-4 shrink-0" />
                                            {t("nav.settings")}
                                        </Link>

                                        <div className="pt-3 mt-3 border-t border-white/20">
                                            <Link
                                                href={route("profile.edit")}
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold overflow-hidden text-gray-500 dark:text-gray-300">
                                                    {user.image && !imgError ? (
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
                                                        user.name
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-white/70">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </Link>
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                onClick={() => setMobileOpen(false)}
                                                className="w-full flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />{" "}
                                                {t("nav.logout")}
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("wordlistcategory.index")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <BookOpen className="h-4 w-4" />{" "}
                                            {t("nav.word_lists")}
                                        </Link>
                                        <Link
                                            href={route("login")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <LogIn className="h-4 w-4" />{" "}
                                            {t("nav.login")}
                                        </Link>

                                        <Link
                                            href={route("register")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <UserPlus className="h-4 w-4" />{" "}
                                            {t("nav.register")}
                                        </Link>
                                        <button
                                            onClick={openReportDialog}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                                        >
                                            <Flag className="h-4 w-4 shrink-0" />
                                            {t("nav.report_error")}
                                        </button>

                                        <Link
                                            href={route("settings.show")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                                        >
                                            <Settings className="h-4 w-4 shrink-0" />
                                            {t("nav.settings")}
                                        </Link>

                                        <div className="px-3 py-2">
                                            <ThemeToggle />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!hideHeader && <div className="h-[60px]" />}

            {hideHeader && showTopHeader && (
                <div className="w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-12 relative z-50">
                    <TopHeader />
                </div>
            )}

            <main className={`relative z-10 ${showBottomNav ? "pb-32" : "pb-12"}`}>
                {isOnline ? children : <OfflineOverlay />}
            </main>

            {showBottomNav && <BottomNav />}

            {/* Background Gradients (Mobile optimized) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden sm:hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[40%] bg-red-50/50 dark:bg-red-950/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] left-[-10%] w-[60%] h-[40%] bg-pink-50/30 dark:bg-pink-950/5 blur-[80px] rounded-full" />
            </div>
        </div>
    );
}
