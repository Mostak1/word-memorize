import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Start your vocabulary learning journey today
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="pl-10 h-12 border-gray-300 dark:border-zinc-700 focus:border-[#E5201C] focus:ring-[#E5201C]"
                                placeholder="John Doe"
                                autoComplete="name"
                                autoFocus
                                required
                            />
                        </div>
                        {errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="pl-10 h-12 border-gray-300 dark:border-zinc-700 focus:border-[#E5201C] focus:ring-[#E5201C]"
                                placeholder="your@email.com"
                                autoComplete="username"
                                required
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className="pl-10 pr-10 h-12 border-gray-300 dark:border-zinc-700 focus:border-[#E5201C] focus:ring-[#E5201C]"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-sm font-medium"
                        >
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="password_confirmation"
                                type={
                                    showPasswordConfirmation
                                        ? "text"
                                        : "password"
                                }
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                className="pl-10 pr-10 h-12 border-gray-300 dark:border-zinc-700 focus:border-[#E5201C] focus:ring-[#E5201C]"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswordConfirmation(
                                        !showPasswordConfirmation,
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                            >
                                {showPasswordConfirmation ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 bg-[#E5201C] hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {processing ? "Creating account..." : "Create account"}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                            Already have an account?
                        </span>
                    </div>
                </div>

                {/* Login Link */}
                <Link href={route("login")}>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-2 border-gray-300 dark:border-zinc-700 hover:border-[#E5201C] hover:bg-[#E5201C]/5 font-semibold rounded-full transition-all"
                    >
                        Log in to existing account
                    </Button>
                </Link>
            </div>
        </GuestLayout>
    );
}
