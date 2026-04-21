import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { ArrowLeft, Users, Trophy, Heart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function PublicProfile({
    user,
    achievements,
    isFollowing,
    canFollow,
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [following, setFollowing] = useState(isFollowing);
    const [loading, setLoading] = useState(false);
    const [followerCount, setFollowerCount] = useState(user.follower_count);
    const [followingCount] = useState(user.following_count);

    const handleToggleFollow = () => {
        if (!auth.user) {
            router.visit(route("login"));
            return;
        }

        setLoading(true);

        const wasFollowing = following;
        const action = wasFollowing
            ? "public.user.unfollow"
            : "public.user.follow";
        const method = wasFollowing ? "delete" : "post";

        // Optimistic update — instant UI feedback
        setFollowing(!wasFollowing);
        setFollowerCount((count) => count + (wasFollowing ? -1 : 1));

        window.axios[method](route(action, user.id))
            .catch(() => {
                // Roll back on failure
                setFollowing(wasFollowing);
                setFollowerCount((count) => count + (wasFollowing ? 1 : -1));
            })
            .finally(() => setLoading(false));
    };

    return (
        <AppLayout>
            <Head title={t("profile.title", { name: user.name })} />

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-3xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6 gap-3">
                        <Link
                            href={route("leaderboard")}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> {t("profile.back_to_leaderboard")}
                        </Link>

                        {canFollow && (
                            <button
                                type="button"
                                onClick={handleToggleFollow}
                                disabled={loading}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                                    following
                                        ? "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                <Heart className="h-4 w-4" />
                                {loading
                                    ? "..."
                                    : following
                                      ? t("profile.following")
                                      : t("profile.follow")}
                            </button>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-3xl text-slate-500 dark:text-slate-400">
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {user.name}
                                    </h1>
                                    {user.headline && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.headline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("profile.xp")}
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.xp.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("profile.mastered")}
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.mastered_count}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("profile.followers")}
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {followerCount}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("profile.streak")}
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.current_streak}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {user.bio && (
                            <div className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                {user.bio}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {user.location && (
                                <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                    {user.location}
                                </span>
                            )}
                            {user.profession && (
                                <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                    {user.profession}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t("profile.community")}
                                </h2>
                            </div>
                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                <p>{t("profile.following_count", { count: followingCount })}</p>
                                <p>{t("profile.followers_count", { count: followerCount })}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t("profile.achievements")}
                                </h2>
                            </div>
                            {achievements.length > 0 ? (
                                <div className="space-y-3">
                                    {achievements.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {t(`achievements.items.${achievement.key}.name`, { defaultValue: achievement.name })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {t(`achievements.items.${achievement.key}.description`, { defaultValue: achievement.description })}
                                                    </p>
                                                </div>
                                                <span className="text-sm text-blue-600 dark:text-blue-300">
                                                    {t("achievements.tier", { tier: achievement.tier })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("profile.no_achievements")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
