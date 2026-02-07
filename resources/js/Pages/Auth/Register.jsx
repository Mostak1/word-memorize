import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            {/* Heading */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">
                    Create Account
                </h2>
                <p className="mt-2 text-sm sm:text-base text-center text-gray-600 dark:text-gray-400">
                    Start your learning journey today
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* Name Field */}
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Full Name"
                        className="text-sm font-medium"
                    />
                    <div className="mt-1.5 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="block w-full pl-10 pr-4 py-3 border-gray-300 dark:border-zinc-700 rounded-lg focus:border-[#E5201C] focus:ring-[#E5201C] dark:bg-zinc-800 dark:text-white"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            placeholder="John Doe"
                        />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

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
                            onChange={(e) => setData("email", e.target.value)}
                            required
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
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
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

                {/* Confirm Password Field */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-sm font-medium"
                    />
                    <div className="mt-1.5 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pl-10 pr-12 py-3 border-gray-300 dark:border-zinc-700 rounded-lg focus:border-[#E5201C] focus:ring-[#E5201C] dark:bg-zinc-800 dark:text-white"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            required
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            tabIndex="-1"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 px-4 rounded-lg text-base font-semibold bg-[#E5201C] hover:bg-red-700 focus:ring-[#E5201C] transition-colors shadow-md"
                        disabled={processing}
                    >
                        {processing ? "Creating account..." : "Create Account"}
                    </PrimaryButton>
                </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                        href={route("login")}
                        className="font-semibold text-[#E5201C] hover:text-red-700 dark:hover:text-red-400"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
