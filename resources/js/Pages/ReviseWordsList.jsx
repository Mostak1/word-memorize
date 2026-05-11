import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ChevronLeft,
    ChevronRight,
    Volume2,
    RotateCcw,
    Brain,
    RefreshCw,
    AlertTriangle,
    Play,
    BookOpen,
    Lock,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { useTranslation } from "@/Contexts/LanguageContext";

const FILTER_META = {
    all: {
        icon: RotateCcw,
        iconColor: "text-indigo-500",
        badgeBg:
            "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400",
    },
    learning: {
        icon: Brain,
        iconColor: "text-cyan-500",
        badgeBg:
            "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400",
    },
    reviewing: {
        icon: RefreshCw,
        iconColor: "text-orange-500",
        badgeBg:
            "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
    },
    more_practice: {
        icon: AlertTriangle,
        iconColor: "text-red-500",
        badgeBg: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    },
};

export default function ReviseWordsList({ words, filter, title }) {
    const { t } = useTranslation();
    const [showLockedDialog, setShowLockedDialog] = useState(false);
    const meta = FILTER_META[filter] || FILTER_META.all;
    const Icon = meta.icon;

    // Use translated title if possible
    const pageTitle = t(`revise.filters.${filter}.label`, { defaultValue: title });

    const speakWord = (word) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.speak(
                Object.assign(new SpeechSynthesisUtterance(word), {
                    lang: "en-US",
                }),
            );
        }
    };

    const getDifficultyBadge = (difficulty) => {
        const d = difficulty?.toLowerCase();
        return d === "easy" || d === "beginner"
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
            : d === "medium" || d === "intermediate"
              ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
              : d === "hard" || d === "advanced"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-900 dark:text-gray-400 dark:border-slate-700";
    };

    return (
        <AppLayout hideHeader={true}>
            <Head title={pageTitle} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-20">
                <div className="max-w-xl mx-auto px-4 pt-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <Link
                            href={route("words.revise")}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition text-gray-500 dark:text-gray-400"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 leading-tight">
                                <Icon
                                    className={`h-5 w-5 ${meta.iconColor} shrink-0`}
                                />
                                {pageTitle}
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {t("revise.group_info", { 
                                    count: words.total,
                                    plural: words.total !== 1 ? "s" : ""
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Word list */}
                    {words.data && words.data.length > 0 ? (
                        <>
                            <div className="space-y-3">
                                {words.data.map((word, index) => {
                                    const isLocked = word.is_locked && !word.has_access;
                                    const CardWrapper = isLocked ? "div" : Link;
                                    const wrapperProps = isLocked 
                                        ? { 
                                            className: "block cursor-pointer",
                                            onClick: () => setShowLockedDialog(true)
                                          }
                                        : { 
                                            className: "block",
                                            href: route("word.show", word.id) + `?from=revise&filter=${filter}`
                                          };

                                    return (
                                        <CardWrapper key={word.id} {...wrapperProps}>
                                            <div
                                                className={`bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all ${isLocked ? "opacity-75" : ""}`}
                                                style={{
                                                    animationDelay: `${index * 0.05}s`,
                                                    animation:
                                                        "fadeInUp 0.4s ease-out forwards",
                                                    opacity: 0,
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                                {word.word}
                                                                {isLocked && <Lock className="h-4 w-4 text-[#E5201C]" />}
                                                            </h3>
                                                            {isLocked ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-[#E5201C] dark:text-red-400 border border-red-100 dark:border-red-900/50 uppercase tracking-wider">
                                                                    <Lock className="h-2.5 w-2.5" />
                                                                    {t("common.locked", { defaultValue: "Locked" })}
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badgeBg}`}
                                                                >
                                                                    <Icon className="h-3 w-3" />
                                                                    {filter === "all"
                                                                        ? t("revise.filters.all.badge")
                                                                        : pageTitle.replace(" Words", "")}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {word.parts_of_speech_variations && (
                                                            <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
                                                                {
                                                                    word.parts_of_speech_variations
                                                                }
                                                            </span>
                                                        )}

                                                        {word.definition && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                                                {word.definition}
                                                            </p>
                                                        )}

                                                        {word.word_list && (
                                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                <span
                                                                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(word.word_list.difficulty)}`}
                                                                >
                                                                    {t(`common.difficulties.${word.word_list.difficulty.toLowerCase()}`, {
                                                                        defaultValue: word.word_list.difficulty
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {
                                                                        word
                                                                            .word_list
                                                                            .title
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        {!isLocked && (
                                                            <p className="text-xs text-[#E5201C] font-semibold mt-2">
                                                                {t("revise.view_details")}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {!isLocked && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                speakWord(word.word);
                                                            }}
                                                            className="p-2 text-[#E5201C] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition shrink-0"
                                                        >
                                                            <Volume2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardWrapper>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {words.last_page > 1 && (
                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <button
                                        disabled={!words.prev_page_url}
                                        onClick={() =>
                                            router.get(
                                                words.prev_page_url,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="flex items-center gap-1 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md dark:border dark:border-slate-700 disabled:opacity-40 transition"
                                    >
                                        <ChevronLeft className="h-4 w-4" />{" "}
                                        {t("revise.previous")}
                                    </button>
                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                        {words.current_page} / {words.last_page}
                                    </span>
                                    <button
                                        disabled={!words.next_page_url}
                                        onClick={() =>
                                            router.get(
                                                words.next_page_url,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="flex items-center gap-1 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md dark:border dark:border-slate-700 disabled:opacity-40 transition"
                                    >
                                        {t("revise.next")}{" "}
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow-sm">
                            <div
                                className={`w-20 h-20 rounded-full ${meta.badgeBg.split(" ")[0]} flex items-center justify-center mx-auto mb-4`}
                            >
                                <Icon
                                    className={`h-10 w-10 ${meta.iconColor}`}
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">
                                {t("revise.not_found")}
                            </h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-5">
                                {t("revise.keep_learning")}
                            </p>
                            <Link
                                href={route("wordlistcategory.index")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                <BookOpen className="h-4 w-4" />
                                {t("revise.browse_lists")}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <AlertDialog
                open={showLockedDialog}
                onOpenChange={setShowLockedDialog}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("mastered.locked_alert_title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("mastered.locked_alert_desc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl flex-1">
                            {t("mastered.locked_alert_cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => router.get(route("shop"))}
                            className="rounded-xl flex-1 bg-[#E5201C] hover:bg-red-700 text-white"
                        >
                            {t("mastered.locked_alert_action")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
