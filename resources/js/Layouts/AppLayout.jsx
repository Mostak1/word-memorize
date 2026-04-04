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
} from "lucide-react";
import FlashMessages from "@/Components/FlashMessage";
import ReportErrorDialog from "@/Components/ReportErrorDialog";
import logo from "/public/img/logo.png";

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [xpData, setXpData] = useState(user?.xp ?? null);
    const lastScrollY = useRef(0);
    const xpRefreshKey = useRef(0);

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

    // Fetch XP status from API
    useEffect(() => {
        if (!user || xpData) return;

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
            } catch (error) {
                console.error("Failed to fetch XP status:", error);
            }
        };

        fetchXpStatus();
    }, [user, xpData, xpRefreshKey.current]);

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
            <FlashMessages />

            <ReportErrorDialog
                controlledOpen={reportDialogOpen}
                onControlledOpenChange={setReportDialogOpen}
            />

            {/* Fixed Top Nav */}
            <div
                className={`bg-[#E5201C] text-white shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
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
                            {user ? (
                                <>
                                    <Link
                                        href={route("dashboard")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </Link>
                                    <Link
                                        href={route("wordlistcategory.index")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        <span>WordLists</span>
                                    </Link>

                                    {/* XP balance pill — links to shop */}
                                    {xpData && (
                                        <Link
                                            href={route("xp-shop")}
                                            className="flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-2"
                                            title="XP Shop"
                                        >
                                            <Zap className="h-4 w-4 text-yellow-300" />
                                            <span>
                                                {xpData.balance.toLocaleString()}
                                            </span>
                                        </Link>
                                    )}

                                    {/* Shop link */}
                                    <Link
                                        href={route("xp-shop")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        <span>Shop</span>
                                    </Link>

                                    <ReportErrorDialog />

                                    {/* Profile dropdown */}
                                    <div className="relative group ml-1">
                                        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="max-w-[100px] truncate">
                                                {user.name}
                                            </span>
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                                            <Link
                                                href={route("profile.edit")}
                                                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors"
                                            >
                                                <User className="h-4 w-4" />{" "}
                                                Profile
                                            </Link>
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors border-t border-gray-100"
                                            >
                                                <LogOut className="h-4 w-4" />{" "}
                                                Log Out
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
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="flex items-center gap-1.5 bg-white text-[#E5201C] text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        <span>Register</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <div className="sm:hidden flex items-center gap-2">
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
                                        <Home className="h-4 w-4" /> Home
                                    </Link>
                                    <Link
                                        href={route("wordlistcategory.index")}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />{" "}
                                        WordLists
                                    </Link>

                                    {/* Shop link (mobile) */}
                                    <Link
                                        href={route("xp-shop")}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <ShoppingBag className="h-4 w-4" /> Shop
                                    </Link>

                                    {/* XP balance (mobile) */}
                                    {xpData && (
                                        <Link
                                            href={route("xp-shop")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-semibold px-3 py-2 rounded-lg bg-white/10 mx-3 mt-1"
                                        >
                                            <Zap className="h-4 w-4 text-yellow-300" />
                                            <span>
                                                {xpData.balance.toLocaleString()}{" "}
                                                XP
                                            </span>
                                        </Link>
                                    )}

                                    <button
                                        onClick={openReportDialog}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                                    >
                                        <Flag className="h-4 w-4 shrink-0" />
                                        Report Error
                                    </button>

                                    <div className="pt-3 mt-3 border-t border-white/20">
                                        <div className="flex items-center gap-3 px-3 mb-3">
                                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-white/70">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={route("profile.edit")}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <User className="h-4 w-4" /> Profile
                                        </Link>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            onClick={() => setMobileOpen(false)}
                                            className="w-full flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" /> Log
                                            Out
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
                                        WordLists
                                    </Link>
                                    <Link
                                        href={route("login")}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <LogIn className="h-4 w-4" /> Login
                                    </Link>
                                    <button
                                        onClick={openReportDialog}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                                    >
                                        <Flag className="h-4 w-4 shrink-0" />
                                        Report Error
                                    </button>
                                    <Link
                                        href={route("register")}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4" />{" "}
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[60px]" />
            <main>{children}</main>
        </div>
    );
}
