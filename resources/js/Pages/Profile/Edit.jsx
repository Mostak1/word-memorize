import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { User, Lock, AlertTriangle } from "lucide-react";

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile Settings
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Profile Information Card */}
                    <Card className="border-0 shadow-lg dark:border dark:border-zinc-800">
                        <CardHeader className="border-b border-gray-200 dark:border-zinc-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg sm:text-xl">
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        Update your account's profile
                                        information and email address
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
                    <Card className="border-0 shadow-lg dark:border dark:border-zinc-800">
                        <CardHeader className="border-b border-gray-200 dark:border-zinc-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg sm:text-xl">
                                        Update Password
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        Ensure your account is using a strong
                                        password
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <UpdatePasswordForm className="max-w-xl" />
                        </CardContent>
                    </Card>

                    {/* Delete Account Card */}
                    <Card className="border-0 shadow-lg border-red-200 dark:border-red-900/50">
                        <CardHeader className="border-b border-red-200 dark:border-red-900/50 pb-4 bg-red-50 dark:bg-red-900/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg sm:text-xl text-red-900 dark:text-red-200">
                                        Delete Account
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1 text-red-700 dark:text-red-300">
                                        Permanently delete your account and all
                                        data
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
        </AuthenticatedLayout>
    );
}
