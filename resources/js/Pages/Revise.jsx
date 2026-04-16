import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import {
    RotateCcw,
    Brain,
    RefreshCw,
    AlertTriangle,
    ChevronRight,
    Play,
} from "lucide-react";

// ── Filter config ─────────────────────────────────────────────────────────────

const FILTERS = [
    {
        key: "all",
        label: "All Words",
        description: "Every word still in progress",
        icon: RotateCcw,
        iconColor: "text-indigo-500",
        iconBg: "bg-indigo-100 dark:bg-indigo-950/40",
        accent: "border-indigo-200 dark:border-indigo-800",
        countColor:
            "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
        key: "learning",
        label: "Learning",
        description: "Words you've seen once — getting familiar",
        icon: Brain,
        iconColor: "text-cyan-500",
        iconBg: "bg-cyan-100 dark:bg-cyan-950/40",
        accent: "border-cyan-200 dark:border-cyan-800",
        countColor:
            "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
    },
    {
        key: "reviewing",
        label: "Reviewing",
        description: "Words you're getting solid on",
        icon: RefreshCw,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-100 dark:bg-orange-950/40",
        accent: "border-orange-200 dark:border-orange-800",
        countColor:
            "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    },
    {
        key: "more_practice",
        label: "More Practice Needed",
        description: 'Marked "I don\'t know" 2 or more times',
        icon: AlertTriangle,
        iconColor: "text-red-500",
        iconBg: "bg-red-100 dark:bg-red-950/40",
        accent: "border-red-200 dark:border-red-800",
        countColor:
            "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    },
];

// ── Revise Page ───────────────────────────────────────────────────────────────

export default function Revise({ reviseCounts = {} }) {
    const totalAll = reviseCounts.all ?? 0;

    return (
        <AppLayout>
            <Head title="Revise" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    {/* ── Header ── */}
                    <div className="mb-5">
                        <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-50">
                            Revise
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-slate-400 mt-0.5">
                            {totalAll > 0
                                ? `You have ${totalAll} word${totalAll !== 1 ? "s" : ""} to practise. Pick a focus below.`
                                : "Choose a filter and start practising."}
                        </p>
                    </div>

                    {/* ── Filter cards ── */}
                    <div className="flex flex-col gap-3">
                        {FILTERS.map((f) => {
                            const Icon = f.icon;
                            const count = reviseCounts[f.key] ?? 0;
                            const isEmpty = count === 0;

                            return (
                                <div
                                    key={f.key}
                                    className={`block ${isEmpty ? "opacity-50 pointer-events-none" : ""} bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-4 shadow-sm border ${f.accent} hover:shadow-md transition-all`}
                                    aria-disabled={isEmpty}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`w-12 h-12 rounded-full ${f.iconBg} flex items-center justify-center shrink-0`}
                                    >
                                        <Icon
                                            className={`h-6 w-6 ${f.iconColor}`}
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                            {f.label}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {f.description}
                                        </p>
                                    </div>

                                    {/* Count badge + arrow */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.countColor}`}
                                        >
                                            {count}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-slate-600" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Empty state ── */}
                    {totalAll === 0 && (
                        <div className="mt-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-3">
                                <Play className="h-7 w-7 text-indigo-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Nothing to revise yet
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">
                                Start a word list exercise to add words to your
                                revision queue.
                            </p>
                            <Link
                                href={route("wordlistcategory.index")}
                                className="inline-block px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
                            >
                                Browse Word Lists
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
