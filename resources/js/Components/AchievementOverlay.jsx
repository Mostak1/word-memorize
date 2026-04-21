import React, { useState, useEffect } from "react";
import { X, Share2, Facebook, MessageCircle, Send, Instagram, Check, Copy } from "lucide-react";
import { BadgeSVG } from "@/Components/AchievementBadges";

export default function AchievementOverlay({ achievementData, onDismiss }) {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isClosing, setIsClosing] = useState(false);


    if (!achievementData) return null;

    const handleClose = () => {
        setIsClosing(true);
        // Wait for animation to finish before dismissing
        setTimeout(() => {
            onDismiss();
        }, 300);
    };

    const { achievement } = achievementData;
    const shareUrl = window.location.origin;
    const shareText = `I just unlocked the "${achievement.name}" achievement on VocabPix! 🏆 Join me in mastering new words!`;

    const shareActions = [
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-[#1877F2]",
            action: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank");
            }
        },
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-[#25D366]",
            action: () => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
            }
        },
        {
            name: "Telegram",
            icon: Send,
            color: "bg-[#0088cc]",
            action: () => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
            }
        },
        {
            name: "Instagram",
            icon: Instagram,
            color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
            action: () => {
                copyToClipboard();
            }
        }
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"} animate-in fade-in`}>
            <div 
                className={`relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"} animate-in zoom-in-95 ease-out`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* ── Close Button ── */}
                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* ── Header ── */}
                <div className="pt-12 pb-6 px-8 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-2 block">
                        Badge Trophy
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Trophy<br />Unlocked
                    </h2>
                </div>

                {/* ── Badge Visual ── */}
                <div className="relative flex justify-center items-center py-4">
                    {/* Decorative Blob Background */}
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <div className="w-56 h-56 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
                        <svg viewBox="0 0 200 200" className="w-64 h-64 text-purple-600/10 dark:text-purple-500/10 fill-current overflow-visible">
                            <path d="M44.7,-76.4C58.3,-69.2,70.1,-59.1,79.5,-46.5C88.8,-33.9,95.7,-18.8,95.1,-3.8C94.5,11.2,86.3,26.1,75.9,39.1C65.5,52.1,52.9,63.1,38.8,71.1C24.7,79.1,9.1,84.1,-5.9,82.4C-20.9,80.7,-35.3,72.4,-48.3,62.8C-61.3,53.2,-72.9,42.4,-80.7,29.3C-88.5,16.2,-92.5,0.7,-88.9,-13.1C-85.3,-26.9,-74.1,-39,-61.8,-47.5C-49.5,-56,-36.1,-60.9,-23.7,-68.8C-11.3,-76.7,0.1,-87.6,13.6,-88.1C27.1,-88.6,31.1,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>

                    <div className="relative z-10 transition-transform duration-700 hover:scale-110 cursor-default drop-shadow-xl">
                        <BadgeSVG badge={achievement} earned={true} size={160} />
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="px-10 pb-8 pt-4 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                        You've won a trophy for your achievement. Keep shining and reach even higher!
                    </p>
                </div>

                {/* ── Footer Button ── */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                    {!showShareMenu ? (
                        <button 
                            onClick={() => setShowShareMenu(true)}
                            className="w-full py-5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-bold rounded-3xl shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                        >
                            <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Share It
                        </button>
                    ) : (
                        <div className="grid grid-cols-4 gap-3 animate-in slide-in-from-bottom-4 duration-300">
                            {shareActions.map((s) => (
                                <button
                                    key={s.name}
                                    onClick={s.action}
                                    title={s.name}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl ${s.color} hover:opacity-90 transition-all shadow-md group`}
                                >
                                    <s.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] text-white font-bold mt-1.5 uppercase tracking-wider">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Copy Toast ── */}
                {copied && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-2">
                        Link Copied!
                    </div>
                )}
            </div>
        </div>
    );
}
