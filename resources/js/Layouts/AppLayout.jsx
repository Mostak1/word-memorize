import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    BookOpen,
    Menu,
    X,
    User,
    LogOut,
    Home,
    LogIn,
    UserPlus,
} from "lucide-react";
import FlashMessages from "@/Components/FlashMessage";

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <FlashMessages />

            {/* Sticky Top Nav */}
            <div className="bg-[#E5201C] text-white shadow-lg sticky top-0 z-10">
                <div className="w-full max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Brand */}
                        <Link
                            href={user ? route("dashboard") : route("home")}
                            className="flex items-center gap-2"
                        >
                            <div className="p-2 bg-white/10 rounded-lg">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold leading-none">
                                Memorize Words
                            </span>
                        </Link>

                        {/* Desktop Right Side */}
                        <div className="hidden sm:flex items-center gap-1">
                            {user ? (
                                <>
                                    {/* Nav links */}
                                    <Link
                                        href={route("dashboard")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Home className="h-4 w-4" />
                                        <span className="hidden md:inline">
                                            Home
                                        </span>
                                    </Link>
                                    <Link
                                        href={route("exercise.index")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        <span className="hidden md:inline">
                                            Exercises
                                        </span>
                                    </Link>

                                    {/* User avatar + dropdown */}
                                    <div className="relative group ml-1">
                                        <button className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="hidden lg:inline text-sm">
                                                {user.name}
                                            </span>
                                        </button>
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                                            <Link
                                                href={route("profile.edit")}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            >
                                                <User className="w-4 h-4" />
                                                Profile
                                            </Link>
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Log Out
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Guest links */
                                <>
                                    <Link
                                        href={route("exercise.index")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        <span className="hidden md:inline">
                                            Exercises
                                        </span>
                                    </Link>
                                    <Link
                                        href={route("login")}
                                        className="flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
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

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="sm:hidden text-white hover:bg-red-700 p-2 rounded-lg transition"
                        >
                            {mobileOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Dropdown */}
                    {mobileOpen && (
                        <div className="sm:hidden mt-3 pt-3 border-t border-white/20 space-y-1">
                            {user ? (
                                <>
                                    <Link
                                        href={route("dashboard")}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Home className="h-4 w-4" />
                                        Home
                                    </Link>
                                    <Link
                                        href={route("exercise.index")}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Exercises
                                    </Link>

                                    <div className="pt-3 mt-3 border-t border-white/20">
                                        <div className="flex items-center gap-3 px-3 mb-3">
                                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white leading-tight">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-white/70">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={route("profile.edit")}
                                            className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-full flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Log Out
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route("exercise.index")}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Exercises
                                    </Link>
                                    <Link
                                        href={route("login")}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Login
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
