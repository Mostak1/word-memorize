import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

export default function FlashMessages() {
    const { flash } = usePage().props;

    useEffect(() => {
        // Handle flash.toast (from your controller)
        if (flash?.toast) {
            const { type, message } = flash.toast;
            
            switch (type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                    toast.error(message);
                    break;
                case 'warning':
                    toast.warning(message);
                    break;
                case 'info':
                    toast.info(message);
                    break;
                default:
                    toast(message);
            }
        }

        // Handle individual flash messages (alternative approach)
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
        if (flash?.message) {
            toast(flash.message);
        }
    }, [flash]);

    return null;
}