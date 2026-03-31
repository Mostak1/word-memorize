import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { BookOpen } from "lucide-react";

export default function WordListCategoryIndex({ wordListCategories }) {
    return (
        <AppLayout>
            <Head title="Word Lists" />
            <div className="min-h-screen bg-[#F0F2F5]">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    {wordListCategories && wordListCategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {wordListCategories.map((category, index) => (
                                <Link
                                    key={category.id}
                                    href={route(
                                        "wordlistcategory.wordlists",
                                        category.id,
                                    )}
                                    className="block"
                                    style={{
                                        animationDelay: `${index * 0.07}s`,
                                        animation:
                                            "fadeInUp 0.4s ease-out forwards",
                                        opacity: 0,
                                    }}
                                >
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex flex-col">
                                        {/* Thumbnail */}
                                        <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {category.thumbnail_url_full ? (
                                                <img
                                                    src={
                                                        category.thumbnail_url_full
                                                    }
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                /* Monogram placeholder */
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                                                    <span className="text-4xl font-black text-[#E5201C]/40 select-none">
                                                        {category.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="px-3.5 py-3 h-[72px] flex flex-col justify-between">
                                            <h2 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                                                {category.name}
                                            </h2>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                                                <span>
                                                    {category.wordlists_count}{" "}
                                                    {category.wordlists_count ===
                                                    1
                                                        ? "Word List"
                                                        : "Word Lists"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No Word List Categories Available
                            </h3>
                            <p className="text-gray-500 text-sm mb-5">
                                There are no word list categories created yet.
                            </p>
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                Go Back Home
                            </Link>
                        </div>
                    )}
                </main>
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
