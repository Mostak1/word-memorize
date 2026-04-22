import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { User, Lock, AlertTriangle, Users } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function Edit({
    mustVerifyEmail,
    status,
    followerCount,
    followingCount,
}) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title={t("profile_edit.title")} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Community Stats Tabs */}
                    <div className="mb-8 grid grid-cols-2 gap-3">
                        <Link
                            href={route("profile.followers")}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">
                                            {t("profile_edit.followers")}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {followerCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href={route("profile.following")}
                            className="block"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">
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

                    {/* Profile Information Card */}
                    <div className="space-y-6">
                        {/* Profile Information Card */}
                        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700">
                            <CardHeader className="border-b border-gray-200 dark:border-slate-700 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg sm:text-xl dark:text-white">
                                            {t("profile_edit.profile_info_title")}
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-1 dark:text-slate-400">
                                            {t("profile_edit.profile_info_desc")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </CardContent>
                        </Card>

                        {/* Update Password Card */}
                        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700">
                            <CardHeader className="border-b border-gray-200 dark:border-slate-700 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg sm:text-xl dark:text-white">
                                            {t("profile_edit.password_title")}
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-1 dark:text-slate-400">
                                            {t("profile_edit.password_desc")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <UpdatePasswordForm className="max-w-xl" />
                            </CardContent>
                        </Card>

                        {/* Delete Account Card */}
                        <Card className="border-0 shadow-lg border-red-200 dark:border-red-900/50 dark:bg-slate-800">
                            <CardHeader className="border-b border-red-200 dark:border-red-900/50 pb-4 bg-red-50 dark:bg-red-900/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg sm:text-xl text-red-900 dark:text-red-200">
                                            {t("profile_edit.delete_account_title")}
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-1 text-red-700 dark:text-red-300">
                                            {t("profile_edit.delete_account_desc")}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 bg-red-50/50 dark:bg-red-900/5">
                                <DeleteUserForm className="max-w-xl" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
