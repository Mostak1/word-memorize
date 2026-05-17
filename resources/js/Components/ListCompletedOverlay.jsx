import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Share2,
    Facebook,
    MessageCircle,
    Send,
    CheckCircle2,
    Star,
} from "lucide-react";
import { usePage } from "@inertiajs/react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function ListCompletedOverlay({
    listName,
    starProgress = null,
    starAwarded = false,
    bonusReward = null,
    onDismiss,
}) {
    const { t } = useTranslation();
    const { assetUrl } = usePage().props;
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setHasAnimated(true), 50);
        return () => clearTimeout(t);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onDismiss(), 500);
    };

    const shareUrl = window.location.origin;
    const shareText = t("achievements.overlay.list_share_text", {
        name: listName,
    });
    const stars = starProgress?.stars ?? 0;
    const maxStars = starProgress?.max_stars ?? 3;

    const shareActions = [
        {
            name: t("achievements.overlay.facebook"),
            icon: Facebook,
            color: "linear-gradient(135deg,#1877F2,#0d5fd4)",
            action: () => handleShareImage("facebook"),
        },
        {
            name: t("achievements.overlay.whatsapp"),
            icon: MessageCircle,
            color: "linear-gradient(135deg,#25D366,#128C7E)",
            action: () =>
                window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
                    "_blank",
                ),
        },
        {
            name: t("achievements.overlay.telegram"),
            icon: Send,
            color: "linear-gradient(135deg,#0088cc,#006aaa)",
            action: () =>
                window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                    "_blank",
                ),
        },
        {
            name: copied ? "Copied!" : t("achievements.overlay.copy_link"),
            icon: Send,
            color: "linear-gradient(135deg,#475569,#334155)",
            action: () => {
                navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            },
        },
    ];

    const handleShareImage = async (platform = null) => {
        if (!cardRef.current) return;
        setIsCapturing(true);
        const toastId = toast.loading(t("achievements.overlay.generating"));
        try {
            await new Promise((r) => setTimeout(r, 150));
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: document.documentElement.classList.contains(
                    "dark",
                )
                    ? "#030f07"
                    : "#ffffff",
                style: { borderRadius: "32px" },
                fontEmbedCSS: "",
            });
            const blob = await (await fetch(dataUrl)).blob();
            const fileName = `mastery-${listName.toLowerCase().replace(/\s+/g, "-")}.png`;
            const file = new File([blob], fileName, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: t("achievements.overlay.list_completed_title"),
                    text: shareText,
                });
                toast.success(t("achievements.overlay.shared"), {
                    id: toastId,
                });
            } else {
                const link = document.createElement("a");
                link.download = fileName;
                link.href = dataUrl;
                link.click();
                if (platform === "facebook") {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob }),
                        ]);
                        window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
                            "_blank",
                        );
                        toast.success(
                            t("achievements.overlay.downloaded") +
                                " & Image copied!",
                            { id: toastId, duration: 6000 },
                        );
                    } catch {
                        window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
                            "_blank",
                        );
                        toast.success(t("achievements.overlay.downloaded"), {
                            id: toastId,
                        });
                    }
                } else {
                    toast.success(t("achievements.overlay.downloaded"), {
                        id: toastId,
                    });
                }
            }
        } catch {
            toast.error(t("achievements.overlay.failed"), { id: toastId });
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes lc-backdropIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes lc-backdropOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes lc-cardIn {
                    0%   { opacity: 0; transform: scale(0.78) translateY(40px); filter: blur(8px); }
                    60%  { transform: scale(1.03) translateY(-6px); filter: blur(0); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes lc-cardOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(0.88) translateY(28px); filter: blur(6px); }
                }
                @keyframes lc-trophyIn {
                    0%   { opacity: 0; transform: scale(0.3) rotate(20deg); filter: blur(12px); }
                    55%  { transform: scale(1.15) rotate(-4deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0); filter: blur(0); }
                }
                @keyframes lc-checkmark {
                    0%   { stroke-dashoffset: 100; opacity: 0; }
                    40%  { opacity: 1; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes lc-ringExpand {
                    0%   { transform: scale(0.4); opacity: 0.8; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes lc-pulse {
                    0%, 100% { transform: scale(1);    opacity: 0.45; }
                    50%      { transform: scale(1.16); opacity: 0.15; }
                }
                @keyframes lc-float {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-7px); }
                }
                @keyframes lc-shimmer {
                    0%   { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(280%) skewX(-20deg); }
                }
                @keyframes lc-slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes lc-labelIn {
                    from { opacity: 0; letter-spacing: 0.45em; }
                    to   { opacity: 1; letter-spacing: 0.22em; }
                }
                @keyframes lc-titleIn {
                    from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
                    to   { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes lc-btnPulse {
                    0%, 100% { box-shadow: 0 8px 28px var(--lc-btn-glow), 0 0 0 1px rgba(255,255,255,0.15) inset; }
                    50%      { box-shadow: 0 8px 28px var(--lc-btn-glow), 0 0 0 8px rgba(22,163,74,0.18), 0 0 0 1px rgba(255,255,255,0.15) inset; }
                }
                @keyframes lc-fadeInRow {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes lc-orbita {
                    from { transform: rotate(0deg) translateX(58px) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(58px) rotate(-360deg); }
                }
                @keyframes lc-orbitb {
                    from { transform: rotate(130deg) translateX(44px) rotate(-130deg); }
                    to   { transform: rotate(490deg) translateX(44px) rotate(-490deg); }
                }
                @keyframes lc-star {
                    0%,100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
                    50%     { transform: scale(1.4) rotate(20deg); opacity: 1; }
                }

                /* ── Light tokens ── */
                .lc-root {
                    --lc-backdrop:        rgba(203,213,225,0.78);
                    --lc-card-bg:         #ffffff;
                    --lc-card-border:     rgba(22,163,74,0.15);
                    --lc-card-shadow:     0 28px 80px rgba(22,163,74,0.16), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(22,163,74,0.05) inset;
                    --lc-top-wash:        linear-gradient(180deg, rgba(22,163,74,0.08) 0%, transparent 70%);
                    --lc-ring:            rgba(22,163,74,0.22);
                    --lc-aura:            rgba(22,163,74,0.18);
                    --lc-icon-bg:         rgba(220,252,231,0.9);
                    --lc-icon-color:      #16a34a;
                    --lc-orbit-a:         rgba(22,163,74,0.6);
                    --lc-orbit-b:         rgba(74,222,128,0.45);
                    --lc-label-color:     #15803d;
                    --lc-title-color:     #052e16;
                    --lc-body-color:      #64748b;
                    --lc-footer-bg:       rgba(240,253,244,0.9);
                    --lc-footer-border:   rgba(22,163,74,0.12);
                    --lc-close-bg:        rgba(241,245,249,0.9);
                    --lc-close-hover:     rgba(220,252,231,1);
                    --lc-close-color:     #94a3b8;
                    --lc-btn-bg:          linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
                    --lc-btn-glow:        rgba(22,163,74,0.45);
                    --lc-btn-text:        #ffffff;
                }
                /* ── Dark tokens ── */
                .dark .lc-root {
                    --lc-backdrop:        rgba(2,10,4,0.88);
                    --lc-card-bg:         linear-gradient(160deg, rgba(5,20,10,0.99) 0%, rgba(3,12,7,0.99) 100%);
                    --lc-card-border:     rgba(34,197,94,0.22);
                    --lc-card-shadow:     0 32px 100px rgba(0,0,0,0.82), 0 0 0 1px rgba(255,255,255,0.04) inset;
                    --lc-top-wash:        linear-gradient(180deg, rgba(22,163,74,0.12) 0%, transparent 70%);
                    --lc-ring:            rgba(34,197,94,0.28);
                    --lc-aura:            rgba(22,163,74,0.25);
                    --lc-icon-bg:         rgba(22,163,74,0.15);
                    --lc-icon-color:      #4ade80;
                    --lc-orbit-a:         rgba(74,222,128,0.7);
                    --lc-orbit-b:         rgba(134,239,172,0.5);
                    --lc-label-color:     #4ade80;
                    --lc-title-color:     #ffffff;
                    --lc-body-color:      rgba(148,163,184,0.8);
                    --lc-footer-bg:       rgba(255,255,255,0.03);
                    --lc-footer-border:   rgba(255,255,255,0.07);
                    --lc-close-bg:        rgba(255,255,255,0.07);
                    --lc-close-hover:     rgba(255,255,255,0.12);
                    --lc-close-color:     rgba(148,163,184,0.8);
                    --lc-btn-bg:          linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%);
                    --lc-btn-glow:        rgba(22,163,74,0.55);
                    --lc-btn-text:        #ffffff;
                }
            `}</style>

            <div
                className="lc-root fixed inset-0 z-[200] flex items-center justify-center p-4"
                style={{
                    background: "var(--lc-backdrop)",
                    backdropFilter: "blur(18px) saturate(1.1)",
                    animation: isClosing
                        ? "lc-backdropOut 0.5s ease forwards"
                        : "lc-backdropIn 0.35s ease forwards",
                }}
                onClick={handleClose}
            >
                <div
                    ref={cardRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "360px",
                        background: "var(--lc-card-bg)",
                        border: "1px solid var(--lc-card-border)",
                        borderRadius: "32px",
                        boxShadow: "var(--lc-card-shadow)",
                        overflow: "hidden",
                        animation: isClosing
                            ? "lc-cardOut 0.5s cubic-bezier(0.4,0,1,1) forwards"
                            : hasAnimated
                              ? "lc-cardIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards"
                              : "none",
                        opacity: hasAnimated ? undefined : 0,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                >
                    {/* Top wash */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "var(--lc-top-wash)",
                            pointerEvents: "none",
                            zIndex: 0,
                        }}
                    />

                    {/* Branding (capture) */}
                    <div
                        style={{
                            position: "absolute",
                            top: 22,
                            left: 28,
                            zIndex: 20,
                            opacity: isCapturing ? 1 : 0,
                            pointerEvents: "none",
                            transition: "opacity 0.3s",
                        }}
                    >
                        <img
                            src={`${assetUrl}/img/logo.png`}
                            alt="Logo"
                            style={{ height: 30, width: "auto" }}
                        />
                    </div>

                    {/* Close */}
                    {!isCapturing && (
                        <button
                            onClick={handleClose}
                            style={{
                                position: "absolute",
                                top: 20,
                                right: 20,
                                zIndex: 20,
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "var(--lc-close-bg)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s, transform 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                    "var(--lc-close-hover)";
                                e.currentTarget.style.transform = "scale(1.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                    "var(--lc-close-bg)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <X
                                size={15}
                                style={{ color: "var(--lc-close-color)" }}
                            />
                        </button>
                    )}

                    {/* ── Header ── */}
                    <div
                        style={{
                            padding: "44px 32px 0",
                            textAlign: "center",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        <div
                            style={{
                                animation: "lc-labelIn 0.5s 0.2s ease both",
                                color: "var(--lc-label-color)",
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                marginBottom: 10,
                            }}
                        >
                            {t("achievements.overlay.list_mastery")}
                        </div>
                        <h2
                            style={{
                                animation: "lc-titleIn 0.5s 0.35s ease both",
                                color: "var(--lc-title-color)",
                                fontSize: 30,
                                fontWeight: 900,
                                lineHeight: 1.15,
                                margin: 0,
                            }}
                        >
                            {listName}
                        </h2>
                        <p
                            style={{
                                animation: "lc-slideUp 0.5s 0.5s ease both",
                                color: "var(--lc-body-color)",
                                fontSize: 13,
                                marginTop: 8,
                                fontWeight: 500,
                            }}
                        >
                            {starAwarded
                                ? `New star earned. ${stars}/${maxStars} stars unlocked.`
                                : t("achievements.overlay.mastered_all")}
                        </p>
                        {starProgress && (
                            <div
                                style={{
                                    animation: "lc-slideUp 0.5s 0.62s ease both",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 5,
                                    marginTop: 12,
                                }}
                            >
                                {Array.from({ length: maxStars }).map((_, i) => {
                                    const filled = i < stars;
                                    return (
                                        <Star
                                            key={i}
                                            size={22}
                                            fill={filled ? "#fbbf24" : "transparent"}
                                            color={filled ? "#f59e0b" : "var(--lc-body-color)"}
                                            strokeWidth={filled ? 2.4 : 1.8}
                                            style={{ opacity: filled ? 1 : 0.35 }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                        {bonusReward?.extra_xp > 0 && (
                            <div
                                style={{
                                    animation: "lc-slideUp 0.5s 0.7s ease both",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 12,
                                    padding: "7px 12px",
                                    borderRadius: 999,
                                    background: "rgba(124,58,237,0.10)",
                                    color: "#7c3aed",
                                    fontSize: 12,
                                    fontWeight: 800,
                                }}
                            >
                                Bonus {bonusReward.label || "2x XP"}: +{bonusReward.extra_xp} XP
                            </div>
                        )}
                    </div>

                    {/* ── Trophy Visual ── */}
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "28px 0 24px",
                            zIndex: 2,
                        }}
                    >
                        {/* Expanding rings */}
                        <div
                            style={{
                                position: "absolute",
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                border: "2px solid var(--lc-ring)",
                                animation:
                                    "lc-ringExpand 2.5s 0.8s ease-out infinite",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                border: "2px solid var(--lc-ring)",
                                animation:
                                    "lc-ringExpand 2.5s 1.4s ease-out infinite",
                            }}
                        />

                        {/* Pulse rings */}
                        <div
                            style={{
                                position: "absolute",
                                width: 160,
                                height: 160,
                                borderRadius: "50%",
                                border: "1.5px solid var(--lc-ring)",
                                animation: "lc-pulse 3s ease-in-out infinite",
                            }}
                        />

                        {/* Aura */}
                        <div
                            style={{
                                position: "absolute",
                                width: 140,
                                height: 140,
                                borderRadius: "50%",
                                background: "var(--lc-aura)",
                                filter: "blur(36px)",
                            }}
                        />

                        {/* Orbiting particles */}
                        <div
                            style={{
                                position: "absolute",
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "var(--lc-orbit-a)",
                                boxShadow: "0 0 7px 2px var(--lc-orbit-a)",
                                animation: "lc-orbita 5.5s linear infinite",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                width: 4.5,
                                height: 4.5,
                                borderRadius: "50%",
                                background: "var(--lc-orbit-b)",
                                animation: "lc-orbitb 8s linear infinite",
                            }}
                        />

                        {/* Star sparkles */}
                        {[
                            { top: "8%", left: "18%", size: 14, delay: "0s" },
                            {
                                top: "12%",
                                right: "14%",
                                size: 10,
                                delay: "0.5s",
                            },
                            {
                                bottom: "14%",
                                left: "22%",
                                size: 10,
                                delay: "0.8s",
                            },
                            {
                                bottom: "10%",
                                right: "18%",
                                size: 12,
                                delay: "0.3s",
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    ...s,
                                    fontSize: s.size,
                                    animation: `lc-star 2.5s ${s.delay} ease-in-out infinite`,
                                    zIndex: 3,
                                }}
                            >
                                ✦
                            </div>
                        ))}

                        {/* Icon */}
                        <div
                            style={{
                                position: "relative",
                                zIndex: 10,
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                background: "var(--lc-icon-bg)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                animation:
                                    "lc-trophyIn 0.8s 0.5s cubic-bezier(0.34,1.56,0.64,1) both, lc-float 4s 1.5s ease-in-out infinite",
                                boxShadow: "0 12px 40px var(--lc-aura)",
                            }}
                        >
                            <CheckCircle2
                                size={52}
                                style={{ color: "var(--lc-icon-color)" }}
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    {!isCapturing && (
                        <div
                            style={{
                                padding: "14px 16px 16px",
                                background: "var(--lc-footer-bg)",
                                borderTop: "1px solid var(--lc-footer-border)",
                                animation: "lc-slideUp 0.5s 0.95s ease both",
                            }}
                        >
                            {!showShareMenu ? (
                                <button
                                    onClick={() => setShowShareMenu(true)}
                                    style={{
                                        width: "100%",
                                        padding: "15px 24px",
                                        background: "var(--lc-btn-bg)",
                                        border: "none",
                                        borderRadius: "20px",
                                        color: "var(--lc-btn-text)",
                                        fontSize: 13,
                                        fontWeight: 800,
                                        letterSpacing: "0.04em",
                                        cursor: "pointer",
                                        position: "relative",
                                        overflow: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        boxShadow:
                                            "0 8px 28px var(--lc-btn-glow), 0 0 0 1px rgba(255,255,255,0.15) inset",
                                        animation:
                                            "lc-btnPulse 2.8s 1.5s ease-in-out infinite",
                                        transition: "transform 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            "scale(1.025)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "scale(1)";
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform =
                                            "scale(0.975)";
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform =
                                            "scale(1.025)";
                                    }}
                                >
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "38%",
                                            height: "100%",
                                            background:
                                                "rgba(255,255,255,0.18)",
                                            animation:
                                                "lc-shimmer 2.8s 1.2s ease-in-out infinite",
                                            pointerEvents: "none",
                                        }}
                                    />
                                    <Share2 size={16} />
                                    {t("achievements.overlay.share_milestone")}
                                </button>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4,1fr)",
                                        gap: 8,
                                        animation:
                                            "lc-fadeInRow 0.3s ease both",
                                    }}
                                >
                                    {shareActions.map((s, i) => (
                                        <button
                                            key={s.name}
                                            onClick={s.action}
                                            title={s.name}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "10px 4px",
                                                borderRadius: "16px",
                                                background: s.color,
                                                border: "none",
                                                cursor: "pointer",
                                                boxShadow:
                                                    "0 4px 14px rgba(0,0,0,0.2)",
                                                transition: "transform 0.15s",
                                                animation: `lc-fadeInRow 0.3s ${i * 0.06}s ease both`,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform =
                                                    "scale(1.06) translateY(-2px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform =
                                                    "scale(1)";
                                            }}
                                        >
                                            <s.icon size={16} color="#fff" />
                                            <span
                                                style={{
                                                    color: "#fff",
                                                    fontSize: 7.5,
                                                    fontWeight: 800,
                                                    marginTop: 5,
                                                    letterSpacing: "0.06em",
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {s.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
