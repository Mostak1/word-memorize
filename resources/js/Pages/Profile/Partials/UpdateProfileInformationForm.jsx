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

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? "",
            email: user.email ?? "",
            phone_number: user.phone_number ?? "",
            location: user.location ?? "",
            gender: user.gender ?? "",
            profession: user.profession ?? "",
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"));
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
                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value={t("profile_edit.name")} />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
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
                        className="mt-1 block w-full dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
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
                        className="mt-1 block w-full dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
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
                        className="mt-1 block w-full dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
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
                                className="mt-1 w-full dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
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
                                className="mt-1 w-full dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
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

