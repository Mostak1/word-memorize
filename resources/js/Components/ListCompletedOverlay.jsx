import React, { useState, useEffect, useRef } from "react";
import { X, Share2, Facebook, MessageCircle, Send, Instagram, ArrowRight, CheckCircle2, Trophy, Image as ImageIcon } from "lucide-react";
import { Link } from "@inertiajs/react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function ListCompletedOverlay({ listName, onDismiss }) {
    const { t } = useTranslation();
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const cardRef = useRef(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onDismiss();
        }, 300);
    };

    const shareUrl = window.location.origin;
    const shareText = t("achievements.overlay.list_share_text", { name: listName });

    const shareActions = [
        {
            name: t("achievements.overlay.facebook"),
            icon: Facebook,
            color: "bg-[#1877F2]",
            action: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank");
            }
        },
        {
            name: t("achievements.overlay.whatsapp"),
            icon: MessageCircle,
            color: "bg-[#25D366]",
            action: () => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
            }
        },
        {
            name: t("achievements.overlay.telegram"),
            icon: Send,
            color: "bg-[#0088cc]",
            action: () => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
            }
        },
        {
            name: t("achievements.overlay.copy_link"),
            icon: Send,
            color: "bg-slate-600",
            action: () => {
                navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        },
        {
            name: t("achievements.overlay.image"),
            icon: ImageIcon,
            color: "bg-emerald-600",
            action: () => {
                handleShareImage();
            }
        }
    ];

    const handleShareImage = async () => {
        if (!cardRef.current) return;
        setIsCapturing(true);
        const toastId = toast.loading(t("achievements.overlay.generating"));

        try {
            await new Promise(r => setTimeout(r, 100));
            
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                style: {
                    borderRadius: '40px',
                },
                fontEmbedCSS: '',
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `mastery-${listName.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: t("achievements.overlay.list_completed_title"),
                    text: shareText,
                });
                toast.success(t("achievements.overlay.shared"), { id: toastId });
            } else {
                const link = document.createElement('a');
                link.download = `mastery-${listName.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = dataUrl;
                link.click();
                toast.success(t("achievements.overlay.downloaded"), { id: toastId });
            }
        } catch (error) {
            console.error("Failed to share image:", error);
            toast.error(t("achievements.overlay.failed"), { id: toastId });
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"} animate-in fade-in`}>
            <div 
                ref={cardRef}
                className={`relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"} animate-in zoom-in-95 ease-out`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* ── Close Button ── */}
                <button 
                    onClick={handleClose}
                    className={`absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors z-10 ${isCapturing ? 'hidden' : ''}`}
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* ── Header ── */}
                <div className="pt-10 pb-6 px-8 text-center">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-500 uppercase mb-2 block">
                        {t("achievements.overlay.list_mastery")}
                    </span>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                        {listName}
                    </h2>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                        {t("achievements.overlay.mastered_all")}
                    </p>
                </div>

                {/* ── Badge Visual ── */}
                <div className="relative flex justify-center items-center py-4">
                    {/* Decorative Blob Background */}
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <div className="w-56 h-56 bg-green-600/10 rounded-full blur-3xl animate-pulse" />
                    </div>

                    <div className="relative z-10 p-6 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Trophy className="w-20 h-20 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                {/* ── Footer Button ── */}
                <div className={`p-4 bg-slate-50 dark:bg-slate-800/50 ${isCapturing ? 'hidden' : ''}`}>
                    {!showShareMenu ? (
                        <button 
                            onClick={() => setShowShareMenu(true)}
                            className="w-full py-5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-bold rounded-3xl shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                        >
                            <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {t("achievements.overlay.share_milestone")}
                        </button>
                    ) : (
                        <div className="grid grid-cols-5 gap-2 animate-in slide-in-from-bottom-4 duration-300">
                            {shareActions.map((s) => (
                                <button
                                    key={s.name}
                                    onClick={s.action}
                                    title={s.name}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl ${s.color} hover:opacity-90 transition-all shadow-md group`}
                                >
                                    <s.icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                    <span className="text-[8px] text-white font-bold mt-1.5 uppercase tracking-wider">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
