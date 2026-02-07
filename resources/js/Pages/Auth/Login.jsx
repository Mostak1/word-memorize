import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Heading */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">
                    Welcome Back
                </h2>
                <p className="mt-2 text-sm sm:text-base text-center text-gray-600 dark:text-gray-400">
                    Sign in to continue learning
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {status}
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email Address"
                        className="text-sm font-medium"
                    />
                    <div className="mt-1.5 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-10 pr-4 py-3 border-gray-300 dark:border-zinc-700 rounded-lg focus:border-[#E5201C] focus:ring-[#E5201C] dark:bg-zinc-800 dark:text-white"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password Field */}
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className="text-sm font-medium"
                    />
                    <div className="mt-1.5 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="block w-full pl-10 pr-12 py-3 border-gray-300 dark:border-zinc-700 rounded-lg focus:border-[#E5201C] focus:ring-[#E5201C] dark:bg-zinc-800 dark:text-white"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            tabIndex="-1"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-sm font-medium text-[#E5201C] hover:text-red-700 dark:hover:text-red-400"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 px-4 rounded-lg text-base font-semibold bg-[#E5201C] hover:bg-red-700 focus:ring-[#E5201C] transition-colors shadow-md"
                        disabled={processing}
                    >
                        {processing ? "Signing in..." : "Sign In"}
                    </PrimaryButton>
                </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link
                        href={route("register")}
                        className="font-semibold text-[#E5201C] hover:text-red-700 dark:hover:text-red-400"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
