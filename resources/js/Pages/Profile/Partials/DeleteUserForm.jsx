import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function DeleteUserForm({ className = "" }) {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t("profile_edit.delete_account_title")}
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    {t("profile_edit.delete_account_warning")}
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                {t("profile_edit.delete_account_title")}
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 dark:bg-slate-900">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t("profile_edit.delete_account_confirm")}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        {t("profile_edit.delete_account_confirm_desc")}
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value={t("profile_edit.password_placeholder")}
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-3/4 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                            isFocused
                            placeholder={t("profile_edit.password_placeholder")}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            {t("profile_edit.cancel")}
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            {t("profile_edit.delete_account_title")}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
