import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { BookOpen, Menu, X, User, LogOut, Home } from "lucide-react";

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            {/* Mobile-First Header matching Welcome.jsx */}
            <div className="bg-[#E5201C] text-white p-4 shadow-lg sticky top-0 z-10">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="flex justify-between items-center">
                        <Link
                            href={route("dashboard")}
                            className="flex items-center gap-2"
                        >
                            <div className="p-2 bg-white/10 rounded-lg">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h1 className="text-lg font-bold">
                                Memorize Words
                            </h1>
                        </Link>

                        {/* Desktop User Menu */}
                        <div className="hidden sm:flex items-center gap-3">
                            <Link
                                href={route("dashboard")}
                                className="text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                <Home className="h-4 w-4 inline mr-1" />
                                <span className="hidden md:inline">Home</span>
                            </Link>
                            <Link
                                href={route("exercise.index")}
                                className="text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                <BookOpen className="h-4 w-4 inline mr-1" />
                                <span className="hidden md:inline">
                                    Exercises
                                </span>
                            </Link>
                            <div className="relative group">
                                <button className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden lg:inline text-sm">
                                        {user.name}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
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
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    !showingNavigationDropdown,
                                )
                            }
                            className="sm:hidden text-white hover:bg-red-700 p-2 rounded-lg transition"
                        >
                            {showingNavigationDropdown ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    {showingNavigationDropdown && (
                        <div className="sm:hidden mt-4 pt-4 border-t border-white/20">
                            <div className="space-y-2">
                                <Link
                                    href={route("dashboard")}
                                    className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Home className="h-4 w-4" />
                                    Home
                                </Link>
                                <Link
                                    href={route("exercise.index")}
                                    className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Exercises
                                </Link>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-white/70">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Link
                                        href={route("profile.edit")}
                                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Link>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log Out
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}
