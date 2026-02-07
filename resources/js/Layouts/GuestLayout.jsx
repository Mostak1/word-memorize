import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { BookOpen } from "lucide-react";

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 px-4 py-8 sm:py-12">
            {/* Logo/Brand Section */}
            <div className="w-full max-w-md mx-auto mb-8">
                <Link href="/" className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E5201C] shadow-lg">
                        <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            Memorize Words
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Expand your vocabulary effortlessly
                        </p>
                    </div>
                </Link>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 sm:p-8 shadow-lg">
                    {children}
                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                </p>
            </div>

            {/* Bottom Decoration */}
            <div className="w-full max-w-md mx-auto mt-8">
                <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
                    <span className="text-xs font-medium">
                        LEARN • PRACTICE • MASTER
                    </span>
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
}
