import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Volume2,
    Trash2,
    BookOpen,
    Search,
    Lock,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/Contexts/LanguageContext";

// ── WordCard ──────────────────────────────────────────────────────────────────

function WordCard({ word, onRemove }) {
    const [removing, setRemoving] = useState(false);

    const handleRemove = () => {
        setRemoving(true);
        router.post(
            route("word.bookmark", word.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onRemove(word.id),
                onError: () => setRemoving(false),
            },
        );
    };

    const speakWord = () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(word.word);
            u.lang = "en-US";
            u.rate = 0.85;
            window.speechSynthesis.speak(u);
        }
    };

    const firstImage =
        word.images?.length > 0
            ? word.images[0]
            : word.image_url_full
              ? { url: word.image_url_full }
              : null;

    return (
        <div
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-lg overflow-hidden transition-all duration-300 ${
                removing ? "opacity-40 scale-95 pointer-events-none" : ""
            }`}
        >
            {/* Image strip */}
            {firstImage && (
                <div className="h-28 overflow-hidden">
                    <img
                        src={
                            firstImage.image_url_full ??
                            firstImage.url ??
                            firstImage.image_url
                        }
                        alt={word.word}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-4">
                {/* Top row: word + actions */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-tight break-words">
                                {word.word}
                            </h2>
                            {word.parts_of_speech_variations && (
                                <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-md">
                                    {word.parts_of_speech_variations}
                                </span>
                            )}
                        </div>
                        {word.ipa && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                /{word.ipa.trim().replace(/^\/|\/$/g, "")}/
                            </p>
                        )}
                        {word.bangla_pronunciation && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                                {word.bangla_pronunciation}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={speakWord}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                            aria-label="Pronounce word"
                        >
                            <Volume2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="p-1.5 text-yellow-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                            aria-label="Remove bookmark"
                        >
                            <Bookmark
                                className="h-4 w-4 fill-yellow-400"
                                strokeWidth={1.8}
                            />
                        </button>
                    </div>
                </div>

                {/* Definition */}
                {word.definition && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug mb-1.5 line-clamp-2">
                        {word.definition}
                    </p>
                )}

                {/* Bangla meaning */}
                {word.bangla_meaning && (
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        {word.bangla_meaning}
                    </p>
                )}

                {/* Footer: wordlist label + detail link */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {word.word_list?.title ?? word.wordList?.title ?? ""}
                        </span>
                        {word.is_locked && !word.has_access && (
                            <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center mb-5">
                <Bookmark
                    className="h-10 w-10 text-yellow-300 dark:text-yellow-600"
                    strokeWidth={1.5}
                />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                {t("bookmarks.no_bookmarks")}
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">
                {t("bookmarks.no_bookmarks_desc")}
            </p>
            <Link
                href={route("wordlistcategory.index")}
                className="px-6 py-3 bg-[#E5201C] text-white font-bold rounded-2xl text-sm hover:bg-red-700 transition-colors"
            >
                {t("bookmarks.start_studying")}
            </Link>
        </div>
    );
}

// ── BookmarkedWords ───────────────────────────────────────────────────────────

export default function BookmarkedWords({ words }) {
    const { t } = useTranslation();
    const [localWords, setLocalWords] = useState(words.data);

    const handleRemove = (wordId) => {
        setLocalWords((prev) => prev.filter((w) => w.id !== wordId));
    };

    const hasMore = words.next_page_url;

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("bookmarks.title")} />

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 pb-10">
                <div className="w-full max-w-2xl mx-auto px-4 pt-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <Link
                            href={route("dashboard")}
                            className="p-2 rounded-xl text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Bookmark
                                className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                strokeWidth={1.8}
                            />
                            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                                {t("bookmarks.title")}
                            </h1>
                        </div>
                        {localWords.length > 0 && (
                            <span className="ml-auto text-xs font-semibold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full">
                                {t("bookmarks.saved_count", { count: words.total })}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    {localWords.length === 0 && words.total === 0 ? (
                        <EmptyState />
                    ) : localWords.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 dark:text-gray-500 text-sm">
                                {t("bookmarks.all_removed")}
                            </p>
                            {hasMore && (
                                <Link
                                    href={words.next_page_url}
                                    className="mt-4 inline-block text-sm font-semibold text-[#E5201C]"
                                >
                                    {t("bookmarks.load_next")}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Word grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {localWords.map((word) => {
                                    if (!word) return null;
                                    return (
                                        <WordCard
                                            key={word.id}
                                            word={word}
                                            onRemove={handleRemove}
                                        />
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {(words.prev_page_url || words.next_page_url) && (
                                <div className="flex items-center justify-between mt-6">
                                    {words.prev_page_url ? (
                                        <Link
                                            href={words.prev_page_url}
                                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl hover:shadow-md transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            {t("bookmarks.previous")}
                                        </Link>
                                    ) : (
                                        <div />
                                    )}

                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {t("bookmarks.page_info", {
                                            current: words.current_page,
                                            total: words.last_page,
                                        })}
                                    </span>

                                    {words.next_page_url ? (
                                        <Link
                                            href={words.next_page_url}
                                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl hover:shadow-md transition-all"
                                        >
                                            {t("bookmarks.next")}
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
