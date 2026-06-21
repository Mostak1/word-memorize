import React, { useState } from "react";
import { Download, Loader2, Plus, MoreVertical, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";
import { usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

export default function PwaInstallButton({
    compact = false,
    className = "",
    variant = "light",
    onClick,
}) {
    const { canPrompt, isStandalone, promptInstall } = usePwaInstallPrompt();
    const [isInstalling, setIsInstalling] = useState(false);
    const [showInstallDialog, setShowInstallDialog] = useState(false);

    const { assetUrl } = usePage().props;
    const assetBaseUrl = assetUrl?.replace(/\/$/, "") ?? "";
    const logoUrl = `${assetBaseUrl}/img/logo.png`;
    const installAvifUrl = `${assetBaseUrl}/img/install_2.avif`;

    if (isStandalone) return null;

    const handleInstall = () => {
        onClick?.();
        setShowInstallDialog(true);
    };

    const handleTriggerNativeInstall = async () => {
        setIsInstalling(true);
        try {
            const outcome = await promptInstall();

            if (outcome === "accepted") {
                toast.success("VocabPix is installing.");
                setShowInstallDialog(false);
                return;
            }

            if (outcome === "unavailable") {
                toast.error("Installation is not supported on this browser/device.");
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
        menu: "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-700",
    };

    return (
        <>
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

            <Dialog
                open={showInstallDialog}
                onOpenChange={setShowInstallDialog}
            >
                <DialogContent className="w-[calc(100vw-2rem)] max-w-sm max-h-[85vh] rounded-2xl border-0 bg-white p-0 text-gray-900 shadow-2xl dark:bg-slate-950 dark:text-gray-100 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6 sm:px-6">
                        {canPrompt ? (
                            <>
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-xl bg-red-50 px-3 py-2 dark:bg-red-950/40">
                                        <img
                                            src={logoUrl}
                                            alt="VocabPix logo"
                                            className="h-6"
                                        />
                                    </div>
                                </div>

                                <DialogHeader className="items-center space-y-1 text-center">
                                    <DialogTitle className="text-2xl font-black leading-tight tracking-normal">
                                        Install VocabPix
                                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                                            VocabPix Learning Academy
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Install VocabPix as an application on your home screen.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="mt-4 flex justify-center">
                                    <div className="relative w-32 overflow-hidden rounded-[20px] border-4 border-gray-900 bg-gray-50/50 shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
                                        <span className="absolute top-2 left-2 z-10 rounded-full bg-black/75 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                                            App Preview
                                        </span>
                                        <img
                                            src={installAvifUrl}
                                            alt="VocabPix App Preview"
                                            className="w-full h-auto block"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 px-2">
                                    <p className="text-center text-[14px] leading-snug text-gray-600 dark:text-gray-300">
                                        Add VocabPix to your home screen for fast, one-tap access, distraction-free learning, and offline support.
                                    </p>
                                </div>

                                <div className="mt-4 space-y-2.5 rounded-2xl bg-gray-50 p-4 dark:bg-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                            <div className="h-2 w-2 rounded-full bg-[#E5201C]" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            One-tap launch
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                            <div className="h-2 w-2 rounded-full bg-[#E5201C]" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Distraction-free mode
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                            <div className="h-2 w-2 rounded-full bg-[#E5201C]" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Very low data usage
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-xl bg-red-50 px-3 py-2 dark:bg-red-950/40">
                                        <img
                                            src={logoUrl}
                                            alt="VocabPix logo"
                                            className="h-6"
                                        />
                                    </div>
                                </div>

                                <DialogHeader className="items-center space-y-1 text-center">
                                    <DialogTitle className="text-2xl font-black leading-tight tracking-normal">
                                        Install app
                                        <span className="block">VocabPix</span>
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Instructions to add VocabPix to your home
                                        screen.
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Visual guide demonstrating installation */}
                                <div className="mt-4 flex justify-center">
                                    <div className="relative w-32 overflow-hidden rounded-[20px] border-4 border-gray-900 bg-gray-50/50 shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
                                        <span className="absolute top-2 left-2 z-10 rounded-full bg-black/75 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                                            Visual Guide
                                        </span>
                                        <img
                                            src={installAvifUrl}
                                            alt="How to install VocabPix PWA"
                                            className="w-full h-auto block"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3.5 text-[15px] leading-snug">
                                    <div className="rounded-md bg-blue-50 p-3 mb-2 dark:bg-blue-900/30">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <strong>Note:</strong> You must use the <strong>Google Chrome</strong> browser in order to do this.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <StepNumber>1</StepNumber>
                                        <p className="pt-0.5">
                                            Tap the{" "}
                                            <InlineIcon label="More options">
                                                <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                            </InlineIcon>{" "}
                                            button in the toolbar.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <StepNumber>2</StepNumber>
                                        <p className="pt-0.5 text-gray-800 dark:text-gray-200">
                                            Select{" "}
                                            <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100">
                                                Add to Home Screen
                                                <Plus className="h-3 w-3" />
                                            </span>{" "}
                                            from the menu.{" "}
                                            <strong className="font-bold text-gray-900 dark:text-white">
                                                Scroll down to find this option.
                                            </strong>
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs leading-snug text-gray-500 dark:text-gray-400">
                                    An icon will be added to your home screen so you can
                                    quickly access this website.
                                </p>
                            </>
                        )}
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-white dark:bg-slate-950 border-t border-gray-100 px-5 py-4 dark:border-slate-800 sm:px-6 z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
                        {canPrompt ? (
                            <div className="flex flex-col gap-2 w-full">
                                <button
                                    type="button"
                                    onClick={handleTriggerNativeInstall}
                                    disabled={isInstalling}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5201C] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#c91b18] active:scale-[0.98] disabled:opacity-70"
                                >
                                    {isInstalling ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Smartphone className="h-4 w-4" />
                                    )}
                                    Install Now
                                </button>
                                <DialogClose asChild>
                                    <button
                                        type="button"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 active:scale-[0.98]"
                                    >
                                        Not Now
                                    </button>
                                </DialogClose>
                            </div>
                        ) : (
                            <DialogClose asChild>
                                <button
                                    type="button"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5201C] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#c91b18] active:scale-[0.98]"
                                >
                                    <Smartphone className="h-4 w-4" />
                                    Got it
                                </button>
                            </DialogClose>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function StepNumber({ children }) {
    return (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-white dark:text-slate-950">
            {children}
        </span>
    );
}

function InlineIcon({ children, label }) {
    return (
        <span
            aria-label={label}
            className="inline-flex h-7 w-7 translate-y-1 items-center justify-center rounded-md border border-gray-200 bg-white align-baseline shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
            {children}
        </span>
    );
}
