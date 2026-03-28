import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { Phone } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { FcGoogle } from "react-icons/fc";

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
                                <FcGoogle className="h-6 w-6" />
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
                            <FcGoogle className="h-3 w-3" />
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
