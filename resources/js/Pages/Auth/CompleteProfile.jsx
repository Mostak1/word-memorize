import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { Phone } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function CompleteProfile({ googleUser }) {
    const { data, setData, post, processing, errors } = useForm({
        phone_number: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("complete.profile.store"));
    };

    return (
        <GuestLayout>
            <Head title="Complete Your Profile" />

            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        One last step!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Complete your profile to finish setting up your account.
                    </p>
                </div>

                {/* Google account info card */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 mb-6">
                    <div className="flex-shrink-0">
                        {googleUser?.avatar ? (
                            <img
                                src={googleUser.avatar}
                                alt={googleUser.name}
                                referrerPolicy="no-referrer"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                {/* Google SVG */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 48 48"
                                    className="h-5 w-5"
                                >
                                    <path
                                        fill="#EA4335"
                                        d="M24 9.5c3.54 0 6.36 1.22 8.31 3.18l6.2-6.2C34.64 2.54 29.74 0 24 0 14.61 0 6.48 5.38 2.44 13.22l7.42 5.76C11.86 13.12 17.41 9.5 24 9.5z"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M46.1 24.55c0-1.63-.15-3.2-.42-4.73H24v9.01h12.42c-.54 2.91-2.2 5.37-4.68 7.03l7.24 5.62C43.98 37.18 46.1 31.4 46.1 24.55z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M9.86 28.98A14.5 14.5 0 0 1 9 24c0-1.73.3-3.4.86-4.98l-7.42-5.76A23.93 23.93 0 0 0 0 24c0 3.84.92 7.47 2.44 10.78l7.42-5.8z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.24-5.62c-2.02 1.36-4.6 2.17-8.65 2.17-6.59 0-12.14-3.62-14.14-8.98l-7.42 5.8C6.48 42.62 14.61 48 24 48z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {googleUser?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {googleUser?.email}
                        </p>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            {/* Google SVG */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 48 48"
                                className="h-5 w-5"
                            >
                                <path
                                    fill="#EA4335"
                                    d="M24 9.5c3.54 0 6.36 1.22 8.31 3.18l6.2-6.2C34.64 2.54 29.74 0 24 0 14.61 0 6.48 5.38 2.44 13.22l7.42 5.76C11.86 13.12 17.41 9.5 24 9.5z"
                                />
                                <path
                                    fill="#4285F4"
                                    d="M46.1 24.55c0-1.63-.15-3.2-.42-4.73H24v9.01h12.42c-.54 2.91-2.2 5.37-4.68 7.03l7.24 5.62C43.98 37.18 46.1 31.4 46.1 24.55z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M9.86 28.98A14.5 14.5 0 0 1 9 24c0-1.73.3-3.4.86-4.98l-7.42-5.76A23.93 23.93 0 0 0 0 24c0 3.84.92 7.47 2.44 10.78l7.42-5.8z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.24-5.62c-2.02 1.36-4.6 2.17-8.65 2.17-6.59 0-12.14-3.62-14.14-8.98l-7.42 5.8C6.48 42.62 14.61 48 24 48z"
                                />
                            </svg>
                            Google
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
                    {/* WhatsApp Number Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="phone_number"
                            className="text-sm font-medium"
                        >
                            WhatsApp Number
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Include your country code, e.g.{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                +8801XXXXXXXXX
                            </span>
                        </p>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="phone_number"
                                type="tel"
                                name="phone_number"
                                value={data.phone_number}
                                onChange={(e) =>
                                    setData("phone_number", e.target.value)
                                }
                                className="pl-10 h-12 border-gray-300 dark:border-zinc-700 focus:border-[#E5201C] focus:ring-[#E5201C]"
                                placeholder="+8801XXXXXXXXX"
                                autoComplete="tel"
                                autoFocus
                            />
                        </div>
                        {errors.phone_number && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.phone_number}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 bg-[#E5201C] hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {processing
                            ? "Finishing up..."
                            : "Complete registration"}
                    </Button>
                </form>

                {/* Fine print */}
                <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                    Your number will only be used for account-related
                    communications.
                </p>
            </div>
        </GuestLayout>
    );
}
