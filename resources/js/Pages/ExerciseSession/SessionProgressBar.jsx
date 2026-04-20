import { Link } from "@inertiajs/react";
import { ChevronLeft, Bookmark } from "lucide-react";

export default function SessionProgressBar({
    backHref,
    sessionProgress,
    answeredCount,
    initialQueueSize,
    auth,
}) {
    return (
        <div className="max-w-lg mx-auto px-3 pb-2">
            <div className="flex items-center gap-2.5">
                <Link
                    href={backHref}
                    className="flex-none p-1.5 rounded-lg text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#E5201C] rounded-full transition-all duration-500"
                        style={{ width: `${sessionProgress}%` }}
                    />
                </div>
                {/* Queue remaining badge */}
                <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-2.5 py-0.5 shadow-sm dark:shadow-lg">
                    {Math.max(0, initialQueueSize - answeredCount)} left
                </span>
                {/* Bookmarks shortcut */}
                {auth?.user && (
                    <Link
                        href={route("words.bookmarked")}
                        className="flex-none p-1.5 rounded-lg text-gray-400 dark:text-gray-600 hover:text-yellow-500 dark:hover:text-yellow-400 transition"
                        aria-label="View bookmarked words"
                    >
                        <Bookmark className="h-5 w-5" strokeWidth={1.8} />
                    </Link>
                )}
            </div>
        </div>
    );
}
