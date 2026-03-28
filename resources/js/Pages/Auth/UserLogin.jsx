import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import FlashMessages from "@/Components/FlashMessage";
import { toast } from "sonner";

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
            onError: (errors) => {
                // Show toast for validation errors
                if (errors.email) {
                    toast.error(errors.email);
                } else if (errors.password) {
                    toast.error(errors.password);
                }
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <FlashMessages />

            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Log in to continue your learning journey
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {status}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
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
                                autoFocus
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
                                autoComplete="current-password"
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

                    {/* Remember Me and Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData("remember", checked)
                                }
                                className="border-gray-300 data-[state=checked]:bg-[#E5201C] data-[state=checked]:border-[#E5201C]"
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-normal text-gray-700 dark:text-gray-300 cursor-pointer"
                            >
                                Remember me
                            </Label>
                        </div>

                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm font-medium text-[#E5201C] hover:text-red-700 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 bg-[#E5201C] hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? "Logging in..." : "Log in"}
                    </Button>

                    {/* Google Sign In */}
                    <a
                        href={route("google.redirect")}
                        className="w-full mt-2 block"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-2 border-gray-300 dark:border-zinc-700 hover:border-gray-400 font-semibold rounded-full transition-all flex items-center justify-center gap-3"
                        >
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
                            Continue with Google
                        </Button>
                    </a>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                            Don't have an account?
                        </span>
                    </div>
                </div>

                {/* Register Link */}
                <Link href={route("register")}>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-2 border-gray-300 dark:border-zinc-700 hover:border-[#E5201C] hover:text-[#E5201C] hover:bg-[#E5201C]/5 font-semibold rounded-full transition-all"
                    >
                        Create an account
                    </Button>
                </Link>
            </div>
        </GuestLayout>
    );
}
