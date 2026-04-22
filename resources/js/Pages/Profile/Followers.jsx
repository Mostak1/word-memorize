import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import { Users, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function Followers({
    followers,
    followerCount,
    followingCount,
}) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title={t("profile_edit.followers")} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route("profile.edit")}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> {t("profile_edit.back_to_profile")}
                        </Link>
                    </div>

                    {/* Stats Tabs */}
                    <div className="mb-8 grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm ring-2 ring-blue-500">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("profile_edit.followers")}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {followerCount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route("profile.following")}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t("profile_edit.following")}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {followingCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Followers List */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {t("profile_edit.your_followers")}
                        </h1>

                        {followers.data.length > 0 ? (
                            <div className="space-y-4">
                                {followers.data.map((follower) => (
                                    <Link
                                        key={follower.id}
                                        href={route(
                                            "public.user.show",
                                            follower.id,
                                        )}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-lg font-semibold text-gray-600 dark:text-gray-300">
                                                    {follower.image ? (
                                                        <img
                                                            src={follower.image}
                                                            alt={follower.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        follower.name
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {follower.name}
                                                    </p>
                                                    {follower.headline && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {follower.headline}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t("profile_edit.no_followers_yet")}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {followers.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                {followers.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || "#"}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
