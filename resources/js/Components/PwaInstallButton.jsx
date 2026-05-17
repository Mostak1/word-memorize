import React, { useState } from "react";
import { Download, Loader2, Plus, Share, Smartphone } from "lucide-react";
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
    const installAvifUrl = `${assetBaseUrl}/img/install.avif`;

    if (isStandalone) return null;

    const handleInstall = async () => {
        onClick?.();
        setIsInstalling(true);
        try {
            const outcome = await promptInstall();

            if (outcome === "accepted") {
                toast.success("VocabPix is installing.");
                return;
            }

            if (outcome === "unavailable") {
                setShowInstallDialog(true);
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
                <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl border-0 bg-white p-0 text-gray-900 shadow-2xl dark:bg-slate-950 dark:text-gray-100">
                    <div className="px-5 pb-5 pt-8 sm:px-6">
                        <div className="mb-5 flex justify-center">
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
                        <div className="mt-5 flex justify-center">
                            <div className="relative w-44 overflow-hidden rounded-[24px] border-4 border-gray-900 bg-gray-50/50 shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
                                <span className="absolute top-2 left-2 z-10 rounded-full bg-black/75 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                                    Visual Guide
                                </span>
                                <img
                                    src={installAvifUrl}
                                    alt="How to install VocabPix PWA"
                                    className="w-full h-auto block"
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 text-[17px] leading-snug">
                            <div className="flex gap-3">
                                <StepNumber>1</StepNumber>
                                <p className="pt-0.5">
                                    Tap the{" "}
                                    <InlineIcon label="Share">
                                        <Share className="h-5 w-5 text-blue-500" />
                                    </InlineIcon>{" "}
                                    button in the toolbar.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <StepNumber>2</StepNumber>
                                <p className="pt-0.5">
                                    Select{" "}
                                    <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100">
                                        Add to Home Screen
                                        <Plus className="h-4 w-4" />
                                    </span>{" "}
                                    from the menu that pops up.{" "}
                                    <strong>
                                        You may need to scroll down to find this
                                        menu item.
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <p className="mt-7 text-sm leading-snug text-gray-600 dark:text-gray-400">
                            An icon will be added to your home screen so you can
                            quickly access this website.
                        </p>
                    </div>

                    <DialogFooter className="border-t border-gray-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5201C] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#c91b18] active:scale-[0.98]"
                            >
                                <Smartphone className="h-4 w-4" />
                                Got it
                            </button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function StepNumber({ children }) {
    return (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            {children}
        </span>
    );
}

function InlineIcon({ children, label }) {
    return (
        <span
            aria-label={label}
            className="inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-lg border border-gray-200 bg-white align-baseline shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
            {children}
        </span>
    );
}
