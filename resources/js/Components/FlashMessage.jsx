// resources/js/Components/FlashMessage.jsx
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

export default function FlashMessages() {
    const { flash, errors } = usePage().props;

    useEffect(() => {
        // 1. Handle success / custom flash messages
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.message) {
            toast(flash.message);
        }

        // 2. Handle Laravel Validation Errors as Sonner toasts
        if (errors && Object.keys(errors).length > 0) {
            // Show first error (most common UX)
            const firstError = Object.values(errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
                toast.error(firstError[0]);
            } else if (typeof firstError === "string") {
                toast.error(firstError);
            }

            // Optional: Show all errors as separate toasts (uncomment if you want)
            // Object.values(errors).forEach((errorArray) => {
            //     if (Array.isArray(errorArray)) {
            //         errorArray.forEach((msg) => toast.error(msg));
            //     }
            // });
        }
    }, [flash, errors]); // Important: depend on `errors` too

    return null;
}
