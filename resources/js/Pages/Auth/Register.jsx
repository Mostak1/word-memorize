import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    // Independent state for password visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    // Raw SVG Icons for password toggles
    const EyeIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
        </svg>
    );

    const EyeSlashIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
            />
        </svg>
    );

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Heading and Subtitle */}
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign up to get started
                    </p>

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        {/* Name Field */}
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <div className="mt-1">
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    // Taller input with py-3, rounded corners, red focus
                                    className="block w-full border-gray-300 focus:border-[#e70013] focus:ring-[#e70013] rounded-md shadow-sm py-3"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <div className="mt-1">
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full border-gray-300 focus:border-[#e70013] focus:ring-[#e70013] rounded-md shadow-sm py-3"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Field with Toggle */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    // Added pr-10 for icon space
                                    className="block w-full pr-10 border-gray-300 focus:border-[#e70013] focus:ring-[#e70013] rounded-md shadow-sm py-3"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        tabIndex="-1" // Skip focusing the eye icon on tab
                                    >
                                        {showPassword ? EyeSlashIcon : EyeIcon}
                                    </button>
                                </div>
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Confirm Password Field with Toggle */}
                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                            />
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <TextInput
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full pr-10 border-gray-300 focus:border-[#e70013] focus:ring-[#e70013] rounded-md shadow-sm py-3"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        tabIndex="-1"
                                    >
                                        {showConfirmPassword
                                            ? EyeSlashIcon
                                            : EyeIcon}
                                    </button>
                                </div>
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        {/* Submit Button */}
                        <div>
                            <PrimaryButton
                                // Full-width, taller (py-4), fully rounded, red background
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-[#e70013] hover:bg-[#c40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e70013] transition-colors duration-200"
                                disabled={processing}
                            >
                                Register
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Bottom Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href={route("login")}
                                className="font-medium text-[#e70013] hover:text-[#c40010]"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
