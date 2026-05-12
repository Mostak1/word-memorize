import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { BookOpen, Lock } from "lucide-react";

import { useTranslation } from "@/Contexts/LanguageContext";

export default function WordListCategoryIndex({
    adminWordListCategories = [],
    userWordListCategories = [],
}) {
    const { t } = useTranslation();

    const renderCategoryGrid = (categories, sectionOffset = 0) => (
        <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
                <Link
                    key={category.id}
                    href={route("wordlistcategory.wordlists", category.id)}
                    className="block"
                    style={{
                        animationDelay: `${(index + sectionOffset) * 0.07}s`,
                        animation: "fadeInUp 0.4s ease-out forwards",
                        opacity: 0,
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex flex-col relative">
                        {/* Thumbnail */}
                        <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                            {category.thumbnail_url_full ? (
                                <img
                                    src={category.thumbnail_url_full}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                /* Monogram placeholder */
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 dark:from-red-950/30 to-red-100 dark:to-red-900/30">
                                    <span className="text-4xl font-black text-[#E5201C]/40 dark:text-[#E5201C]/20 select-none">
                                        {category.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            {/* Lock overlay */}
                            {category.is_locked && !category.has_access && (
                                <>
                                    <div className="absolute inset-0 bg-black/40 z-[5]" />
                                    <div
                                        className="absolute top-2.5 right-2.5 w-9 h-9 rounded-xl flex items-center justify-center border-2 border-white dark:border-slate-800 transition-transform group-hover:scale-110 z-10"
                                        style={{
                                            animation:
                                                "lockPulse 2s infinite alternate ease-in-out",
                                        }}
                                    >
                                        <Lock className="h-4.5 w-4.5 text-white" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Info */}
                        <div className="px-3.5 py-3 min-h-[80px] flex flex-col justify-between">
                            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                                {category.name}
                            </h2>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-slate-400">
                                {/* <BookOpen className="h-3 w-3 shrink-0" />
                                <span>
                                    {category.wordlists_count}{" "}
                                    {category.wordlists_count === 1
                                        ? t("shop.word_list")
                                        : t("shop.word_lists")}
                                </span> */}
                                <span className="mx-1">•</span>
                                <span>{category.words_count || 0} words</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

    const hasAnyCategories =
        userWordListCategories.length > 0 || adminWordListCategories.length > 0;

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("wordlists.breadcrumb_categories")} />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    {hasAnyCategories ? (
                        <div className="space-y-8">
                            {/* Admin/Global lists */}
                            {adminWordListCategories.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-gray-400 rounded-full" />
                                            {t("wordlists.all_categories")}
                                        </h3>
                                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full dark:bg-slate-800 dark:text-slate-400">
                                            {adminWordListCategories.length}
                                        </span>
                                    </div>
                                    {renderCategoryGrid(
                                        adminWordListCategories,
                                    )}
                                </section>
                            )}

                            {/* User created lists */}
                            {userWordListCategories.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-[#E5201C] rounded-full" />
                                            {t("wordlists.your_list")}
                                        </h3>
                                        <span className="text-[10px] font-medium px-2 py-0.5 bg-red-50 text-red-600 rounded-full dark:bg-red-950/30 dark:text-red-400">
                                            {userWordListCategories.length}
                                        </span>
                                    </div>
                                    {renderCategoryGrid(
                                        userWordListCategories,
                                        adminWordListCategories.length,
                                    )}
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-gray-400 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {t("wordlists.empty.title_categories")}
                            </h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mb-5">
                                {t("wordlists.empty.desc_categories")}
                            </p>
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                {t("wordlists.empty.go_home")}
                            </Link>
                        </div>
                    )}
                </main>
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes lockPulse {
                        0% { background-color: #B71C13; box-shadow: 0 4px 12px rgba(183, 28, 19, 0.4); }
                        50% { background-color: #E70013; box-shadow: 0 4px 20px rgba(231, 0, 19, 0.6); }
                        100% { background-color: #FF3B22; box-shadow: 0 4px 12px rgba(255, 59, 34, 0.4); }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
