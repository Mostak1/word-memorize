import React, { useState, useRef } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useTranslation } from "@/Contexts/LanguageContext";
import { Camera, X } from "lucide-react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? "",
            email: user.email ?? "",
            phone_number: user.phone_number ?? "",
            location: user.location ?? "",
            gender: user.gender ?? "",
            profession: user.profession ?? "",
            avatar: null,
        });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("avatar", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCancelPreview = () => {
        setData("avatar", null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        post(route("profile.update"), {
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t("profile_edit.profile_info_title")}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    {t("profile_edit.profile_info_desc")}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center justify-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="relative group">
                        {/* Avatar Image Container */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-gray-50 dark:bg-slate-800 relative cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center animate-in fade-in duration-200"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-200"
                                />
                            ) : user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-3xl font-black text-[#E5201C] dark:text-red-400">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white gap-1.5 duration-200">
                                <Camera className="h-5 w-5" />
                                <span className="text-[10px] font-bold tracking-wide uppercase">
                                    {t("profile_edit.change_photo") || "Change"}
                                </span>
                            </div>
                        </div>

                        {/* Floating Edit Icon Badge */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-[-6px] right-[-6px] bg-[#E5201C] hover:bg-[#d01a17] text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-800 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center z-10"
                        >
                            <Camera className="h-4 w-4" />
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs font-bold px-4 py-2 bg-[#E5201C] hover:bg-[#d01a17] text-white rounded-xl transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 duration-200 flex items-center gap-1.5"
                            >
                                <Camera className="h-3.5 w-3.5" />
                                {t("profile_edit.select_photo") || "Choose Photo"}
                            </button>
                            
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleCancelPreview}
                                    className="text-xs font-semibold px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl transition-all flex items-center gap-1 shadow-sm active:scale-95 duration-150"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    {t("profile_edit.cancel") || "Cancel"}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500">
                            {t("profile_edit.avatar_requirements") || "JPG, PNG, WebP up to 2MB"}
                        </p>
                        <InputError className="mt-1" message={errors.avatar} />
                    </div>
                </div>
                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value={t("profile_edit.name")} />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-slate-700 focus:border-[#E5201C] focus:ring-[#E5201C] focus:ring-1 dark:bg-slate-900 dark:text-gray-100 transition-all duration-200"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value={t("profile_edit.email")} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-slate-700 focus:border-[#E5201C] focus:ring-[#E5201C] focus:ring-1 dark:bg-slate-900 dark:text-gray-100 transition-all duration-200"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Phone Number */}
                <div>
                    <InputLabel htmlFor="phone_number" value={t("profile_edit.phone_number")} />
                    <TextInput
                        id="phone_number"
                        type="tel"
                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-slate-700 focus:border-[#E5201C] focus:ring-[#E5201C] focus:ring-1 dark:bg-slate-900 dark:text-gray-100 transition-all duration-200"
                        value={data.phone_number}
                        onChange={(e) =>
                            setData("phone_number", e.target.value)
                        }
                        autoComplete="tel"
                        placeholder={t("profile_edit.phone_placeholder")}
                    />
                    <InputError
                        className="mt-2"
                        message={errors.phone_number}
                    />
                </div>

                {/* Location */}
                <div>
                    <InputLabel htmlFor="location" value={t("profile_edit.location")} />
                    <TextInput
                        id="location"
                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-slate-700 focus:border-[#E5201C] focus:ring-[#E5201C] focus:ring-1 dark:bg-slate-900 dark:text-gray-100 transition-all duration-200"
                        value={data.location}
                        onChange={(e) => setData("location", e.target.value)}
                        placeholder={t("profile_edit.location_placeholder")}
                    />
                    <InputError className="mt-2" message={errors.location} />
                </div>

                {/* Gender & Profession — side by side on wider screens */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Gender */}
                    <div>
                        <InputLabel htmlFor="gender" value={t("profile_edit.gender")} />
                        <Select
                            value={data.gender}
                            onValueChange={(val) => setData("gender", val)}
                        >
                            <SelectTrigger
                                id="gender"
                                className="mt-1 w-full rounded-xl border-gray-200 dark:border-slate-700 focus:border-[#E5201C] focus:ring-[#E5201C] focus:ring-1 dark:bg-slate-900 dark:text-gray-100 transition-all duration-200"
                            >
                                <SelectValue placeholder={t("profile_edit.gender_placeholder")} />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                <SelectItem value="prefer_not_to_say">
                                    {t("profile_edit.gender_options.prefer_not_to_say")}
                                </SelectItem>
                                <SelectItem value="male">
                                    {t("profile_edit.gender_options.male")}
                                </SelectItem>
                                <SelectItem value="female">
                                    {t("profile_edit.gender_options.female")}
                                </SelectItem>
                                <SelectItem value="other">
                                    {t("profile_edit.gender_options.other")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError className="mt-2" message={errors.gender} />
                    </div>

                    {/* Profession */}
                    <div>
                        <InputLabel htmlFor="profession" value={t("profile_edit.profession")} />
                        <Select
                            value={data.profession}
                            onValueChange={(val) => setData("profession", val)}
                        >
                            <SelectTrigger
                                id="profession"
                                className="mt-1 w-full rounded-xl border-gray-200 dark:border-slate-700 focus:border-[#E5201C] focus:ring-[#E5201C] focus:ring-1 dark:bg-slate-900 dark:text-gray-100 transition-all duration-200"
                            >
                                <SelectValue placeholder={t("profile_edit.profession_placeholder")} />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                <SelectItem value="Student">
                                    {t("profile_edit.profession_options.student")}
                                </SelectItem>
                                <SelectItem value="Job Holder">
                                    {t("profile_edit.profession_options.job_holder")}
                                </SelectItem>
                                <SelectItem value="Housewife">
                                    {t("profile_edit.profession_options.housewife")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError
                            className="mt-2"
                            message={errors.profession}
                        />
                    </div>
                </div>

                {/* Email verification notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            {t("profile_edit.unverified_email")}{" "}
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                {t("profile_edit.resend_verification")}
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                {t("profile_edit.verification_link_sent")}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{t("profile_edit.save")}</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("profile_edit.saved")}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

