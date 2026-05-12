import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";

export default function PwaInstallButton({
    compact = false,
    className = "",
    variant = "light",
}) {
    const { canPrompt, isStandalone, promptInstall } = usePwaInstallPrompt();
    const [isInstalling, setIsInstalling] = useState(false);

    if (isStandalone) return null;

    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            const outcome = await promptInstall();

            if (outcome === "accepted") {
                toast.success("VocabPix is installing.");
                return;
            }

            if (outcome === "unavailable") {
                const isAppleDevice = /iphone|ipad|ipod/i.test(
                    window.navigator.userAgent,
                );
                toast.info(
                    isAppleDevice
                        ? "Open the Share menu, then choose Add to Home Screen."
                        : "Open the browser menu, then choose Install app.",
                );
                return;
            }

            toast.info("Install was dismissed. You can try again anytime.");
        } finally {
            setIsInstalling(false);
        }
    };

    const variants = {
        light: "bg-red-50 text-[#E5201C] hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50",
        solid: "bg-white text-[#E5201C] hover:bg-red-50",
        ghost: "text-white/90 hover:text-white hover:bg-white/10",
    };

    return (
        <button
            type="button"
            onClick={handleInstall}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors active:scale-95 disabled:opacity-70 ${variants[variant]} ${className}`}
            aria-label="Install VocabPix app"
            title={canPrompt ? "Install VocabPix" : "Install instructions"}
            disabled={isInstalling}
        >
            {isInstalling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {!compact && <span>Install</span>}
        </button>
    );
}
