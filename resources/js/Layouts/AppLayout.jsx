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
    const lastScrollY = useRef(0);

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

    // Opens the report dialog and closes the mobile menu
    const openReportDialog = () => {
        setMobileOpen(false);
        setReportDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            <FlashMessages />

            {/* Always-mounted controlled ReportErrorDialog (used by mobile menu) */}
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
                                VocaPix
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
                                    {/* Desktop report button — self-contained */}
                                    <ReportErrorDialog />
                                    <div className="relative group ml-1">
                                        <button className="flex items-center gap-2 text-white font-medium px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="hidden lg:inline text-sm">
                                                {user.name}
                                            </span>
                                        </button>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 overflow-hidden">
                                            <Link
                                                href={route("profile.edit")}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <User className="w-4 h-4" />{" "}
                                                Profile
                                            </Link>
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <LogOut className="w-4 h-4" />{" "}
                                                Log Out
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route("wordlistcategory.index")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        <span>WordLists</span>
                                    </Link>
                                    <Link
                                        href={route("login")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        <span>Login</span>
                                    </Link>
                                    {/* Desktop report button — self-contained */}
                                    <ReportErrorDialog />
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
                            {/* Mobile header flag — opens controlled dialog directly */}
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
                                    {/* Mobile menu Report Error — uses lifted state so unmounting is safe */}
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
                                    {/* Mobile menu Report Error — uses lifted state */}
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
