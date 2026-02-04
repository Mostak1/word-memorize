import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    // State to manage password visibility
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

            <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Heading and Subtitle */}
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Log in
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your details to access your account
                    </p>

                    {/* Status Message */}
                    {status && (
                        <div className="mt-4 mb-4 text-sm font-medium text-green-600 text-center">
                            {status}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="mt-8 space-y-6">
                        {/* Email Field */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <div className="mt-1">
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    // Taller input with py-3, rounded corners
                                    className="block w-full border-gray-300 focus:border-[#e70013] focus:ring-[#e70013] rounded-md shadow-sm py-3"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Field with Eye Icon */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    // Added pr-10 for the icon space
                                    className="block w-full pr-10 border-gray-300 focus:border-[#e70013] focus:ring-[#e70013] rounded-md shadow-sm py-3"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <EyeIcon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Remember Me and Forgot Password Links */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="h-4 w-4 text-[#e70013] focus:ring-[#e70013] border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="font-medium text-[#e70013] hover:text-[#c40010]"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <PrimaryButton
                                // Full-width, taller (py-4), and fully rounded (rounded-full)
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-[#e70013] hover:bg-[#c40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e70013]"
                                disabled={processing}
                            >
                                Log in
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Create an account link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                href={route("register")} // Assumes you have a 'register' route
                                className="font-medium text-[#e70013] hover:text-[#c40010]"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
