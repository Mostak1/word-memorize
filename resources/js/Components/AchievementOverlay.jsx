import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Share2,
    Facebook,
    MessageCircle,
    Send,
    ArrowRight,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { BadgeSVG } from "@/Components/AchievementBadges";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function AchievementOverlay({ achievementData, onDismiss }) {
    const { t } = useTranslation();
    const { assetUrl } = usePage().props;
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setHasAnimated(true), 50);
        return () => clearTimeout(timer);
    }, []);

    if (!achievementData) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onDismiss(), 500);
    };

    const { achievement } = achievementData;
    const shareUrl = window.location.origin;
    const shareText = t("achievements.overlay.achievement_share_text", {
        name: achievement.name,
    });

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
                    ? "#0a0b18"
                    : "#ffffff",
                style: { borderRadius: "32px" },
                fontEmbedCSS: "",
            });
            const blob = await (await fetch(dataUrl)).blob();
            const fileName = `achievement-${achievement.name.toLowerCase().replace(/\s+/g, "-")}.png`;
            const file = new File([blob], fileName, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: achievement.name,
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
                                " & Image copied! Paste into Facebook.",
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
        } catch (error) {
            toast.error(t("achievements.overlay.failed"), { id: toastId });
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes ao-backdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes ao-backdropOut {
                    from { opacity: 1; }
                    to   { opacity: 0; }
                }
                @keyframes ao-cardIn {
                    0%   { opacity: 0; transform: scale(0.78) translateY(40px); filter: blur(8px); }
                    60%  { transform: scale(1.03) translateY(-6px); filter: blur(0px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes ao-cardOut {
                    from { opacity: 1; transform: scale(1) translateY(0); }
                    to   { opacity: 0; transform: scale(0.88) translateY(30px); filter: blur(6px); }
                }
                @keyframes ao-badgeIn {
                    0%   { opacity: 0; transform: scale(0.4) rotate(-18deg); filter: blur(10px); }
                    60%  { transform: scale(1.12) rotate(4deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0px); }
                }
                @keyframes ao-shimmer {
                    0%   { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(280%) skewX(-20deg); }
                }
                @keyframes ao-pulse-ring {
                    0%, 100% { transform: scale(1);    opacity: 0.5; }
                    50%      { transform: scale(1.18); opacity: 0.15; }
                }
                @keyframes ao-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%      { transform: translateY(-8px) rotate(1deg); }
                }
                @keyframes ao-orbita {
                    from { transform: rotate(0deg) translateX(54px) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(54px) rotate(-360deg); }
                }
                @keyframes ao-orbitb {
                    from { transform: rotate(180deg) translateX(42px) rotate(-180deg); }
                    to   { transform: rotate(540deg) translateX(42px) rotate(-540deg); }
                }
                @keyframes ao-slideUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes ao-fadeInRow {
                    from { opacity: 0; transform: translateY(12px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes ao-btnPulse {
                    0%, 100% { box-shadow: 0 8px 28px var(--ao-btn-glow), 0 0 0 1px rgba(255,255,255,0.15) inset; }
                    50%      { box-shadow: 0 8px 28px var(--ao-btn-glow), 0 0 0 8px rgba(139,92,246,0.18), 0 0 0 1px rgba(255,255,255,0.15) inset; }
                }
                @keyframes ao-labelIn {
                    from { opacity: 0; letter-spacing: 0.4em; }
                    to   { opacity: 1; letter-spacing: 0.22em; }
                }
                @keyframes ao-titleIn {
                    0%   { opacity: 0; transform: translateY(14px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
                }

                /* ── Light mode tokens ── */
                .ao-root {
                    --ao-backdrop:       rgba(203, 213, 225, 0.75);
                    --ao-card-bg:        #ffffff;
                    --ao-card-border:    rgba(139, 92, 246, 0.15);
                    --ao-card-shadow:    0 28px 80px rgba(139,92,246,0.18), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(139,92,246,0.06) inset;
                    --ao-top-wash:       linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 70%);
                    --ao-ring-color:     rgba(139, 92, 246, 0.22);
                    --ao-aura:           rgba(139, 92, 246, 0.18);
                    --ao-orbit-a:        rgba(139, 92, 246, 0.55);
                    --ao-orbit-b:        rgba(167, 139, 250, 0.40);
                    --ao-label-color:    #7c3aed;
                    --ao-title-color:    #1e1b4b;
                    --ao-body-color:     #64748b;
                    --ao-link-color:     #7c3aed;
                    --ao-footer-bg:      rgba(248, 247, 255, 0.9);
                    --ao-footer-border:  rgba(139, 92, 246, 0.1);
                    --ao-close-bg:       rgba(241, 245, 249, 0.9);
                    --ao-close-hover:    rgba(226, 232, 240, 1);
                    --ao-close-color:    #94a3b8;
                    --ao-btn-bg:         linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%);
                    --ao-btn-glow:       rgba(139, 92, 246, 0.45);
                    --ao-btn-text:       #ffffff;
                    --ao-share-btn-bg:   rgba(248, 247, 255, 0.8);
                    --ao-share-btn-border: rgba(139, 92, 246, 0.18);
                }
                /* ── Dark mode token overrides ── */
                .dark .ao-root {
                    --ao-backdrop:       rgba(3, 4, 15, 0.85);
                    --ao-card-bg:        linear-gradient(160deg, rgba(18,14,40,0.99) 0%, rgba(12,10,30,0.99) 100%);
                    --ao-card-border:    rgba(139, 92, 246, 0.25);
                    --ao-card-shadow:    0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset;
                    --ao-top-wash:       linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 70%);
                    --ao-ring-color:     rgba(139, 92, 246, 0.30);
                    --ao-aura:           rgba(139, 92, 246, 0.25);
                    --ao-orbit-a:        rgba(167, 139, 250, 0.70);
                    --ao-orbit-b:        rgba(196, 181, 253, 0.50);
                    --ao-label-color:    #a78bfa;
                    --ao-title-color:    #ffffff;
                    --ao-body-color:     rgba(148,163,184,0.8);
                    --ao-link-color:     #a78bfa;
                    --ao-footer-bg:      rgba(255,255,255,0.03);
                    --ao-footer-border:  rgba(255,255,255,0.07);
                    --ao-close-bg:       rgba(255,255,255,0.07);
                    --ao-close-hover:    rgba(255,255,255,0.12);
                    --ao-close-color:    rgba(148,163,184,0.8);
                    --ao-btn-bg:         linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
                    --ao-btn-glow:       rgba(139, 92, 246, 0.55);
                    --ao-btn-text:       #ffffff;
                    --ao-share-btn-bg:   rgba(255,255,255,0.05);
                    --ao-share-btn-border: rgba(255,255,255,0.1);
                }
            `}</style>

            <div
                className="ao-root fixed inset-0 z-[200] flex items-center justify-center p-4"
                style={{
                    background: "var(--ao-backdrop)",
                    backdropFilter: "blur(16px) saturate(1.1)",
                    animation: isClosing
                        ? "ao-backdropOut 0.5s ease forwards"
                        : "ao-backdropIn 0.35s ease forwards",
                }}
                onClick={handleClose}
            >
                {/* ── Card ── */}
                <div
                    ref={cardRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "360px",
                        background: "var(--ao-card-bg)",
                        border: "1px solid var(--ao-card-border)",
                        borderRadius: "32px",
                        boxShadow: "var(--ao-card-shadow)",
                        overflow: "hidden",
                        animation: isClosing
                            ? "ao-cardOut 0.5s cubic-bezier(0.4,0,1,1) forwards"
                            : hasAnimated
                              ? "ao-cardIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards"
                              : "none",
                        opacity: hasAnimated ? undefined : 0,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                >
                    {/* Top gradient wash */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "var(--ao-top-wash)",
                            pointerEvents: "none",
                            zIndex: 0,
                        }}
                    />

                    {/* Branding (capture only) */}
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

                    {/* Close button */}
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
                                background: "var(--ao-close-bg)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s, transform 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                    "var(--ao-close-hover)";
                                e.currentTarget.style.transform = "scale(1.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                    "var(--ao-close-bg)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <X
                                size={15}
                                style={{ color: "var(--ao-close-color)" }}
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
                                animation: "ao-labelIn 0.5s 0.2s ease both",
                                color: "var(--ao-label-color)",
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                marginBottom: 10,
                            }}
                        >
                            {t("achievements.overlay.badge_trophy")}
                        </div>
                        <h2
                            style={{
                                animation: "ao-titleIn 0.5s 0.35s ease both",
                                color: "var(--ao-title-color)",
                                fontSize: 32,
                                fontWeight: 900,
                                lineHeight: 1.1,
                                margin: 0,
                            }}
                        >
                            {achievement.name}
                        </h2>
                    </div>

                    {/* ── Badge visual ── */}
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "32px 0 24px",
                            zIndex: 2,
                        }}
                    >
                        {/* Pulse rings */}
                        <div
                            style={{
                                position: "absolute",
                                width: 180,
                                height: 180,
                                borderRadius: "50%",
                                border: "2px solid var(--ao-ring-color)",
                                animation:
                                    "ao-pulse-ring 2.8s ease-in-out infinite",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                width: 220,
                                height: 220,
                                borderRadius: "50%",
                                border: "1px solid var(--ao-ring-color)",
                                animation:
                                    "ao-pulse-ring 2.8s 0.4s ease-in-out infinite",
                            }}
                        />

                        {/* Aura glow */}
                        <div
                            style={{
                                position: "absolute",
                                width: 160,
                                height: 160,
                                borderRadius: "50%",
                                background: "var(--ao-aura)",
                                filter: "blur(40px)",
                            }}
                        />

                        {/* Orbiting dots */}
                        <div
                            style={{
                                position: "absolute",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "var(--ao-orbit-a)",
                                boxShadow: "0 0 8px 2px var(--ao-orbit-a)",
                                animation: "ao-orbita 5s linear infinite",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "var(--ao-orbit-b)",
                                animation: "ao-orbitb 7s linear infinite",
                            }}
                        />

                        {/* Badge */}
                        <div
                            style={{
                                position: "relative",
                                zIndex: 10,
                                animation:
                                    "ao-badgeIn 0.8s 0.5s cubic-bezier(0.34,1.56,0.64,1) both, ao-float 4s 1.5s ease-in-out infinite",
                                filter: "drop-shadow(0 12px 28px var(--ao-aura))",
                            }}
                        >
                            <BadgeSVG
                                badge={achievement}
                                earned={true}
                                size={148}
                            />
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div
                        style={{
                            padding: "0 36px 20px",
                            textAlign: "center",
                            zIndex: 2,
                            position: "relative",
                            animation: "ao-slideUp 0.5s 0.8s ease both",
                        }}
                    >
                        <p
                            style={{
                                color: "var(--ao-body-color)",
                                fontSize: 13,
                                lineHeight: 1.7,
                                margin: "0 0 14px",
                                fontWeight: 500,
                            }}
                        >
                            {achievement.description ||
                                achievement.desc ||
                                t(
                                    "achievements.overlay.achievement_desc_fallback",
                                )}
                        </p>
                        <Link
                            href={route("achievements")}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                color: "var(--ao-link-color)",
                                fontSize: 11,
                                fontWeight: 800,
                                textDecoration: "none",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {t("achievements.overlay.view_all")}
                            <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* ── Footer ── */}
                    {!isCapturing && (
                        <div
                            style={{
                                padding: "14px 16px 16px",
                                background: "var(--ao-footer-bg)",
                                borderTop: "1px solid var(--ao-footer-border)",
                                animation: "ao-slideUp 0.5s 0.95s ease both",
                            }}
                        >
                            {!showShareMenu ? (
                                <button
                                    onClick={() => setShowShareMenu(true)}
                                    style={{
                                        width: "100%",
                                        padding: "15px 24px",
                                        background: "var(--ao-btn-bg)",
                                        border: "none",
                                        borderRadius: "20px",
                                        color: "var(--ao-btn-text)",
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
                                            "0 8px 28px var(--ao-btn-glow), 0 0 0 1px rgba(255,255,255,0.15) inset",
                                        animation:
                                            "ao-btnPulse 2.8s 1.5s ease-in-out infinite",
                                        transition:
                                            "transform 0.15s, box-shadow 0.15s",
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
                                                "ao-shimmer 2.8s 1.2s ease-in-out infinite",
                                            pointerEvents: "none",
                                        }}
                                    />
                                    <Share2 size={16} />
                                    {t("achievements.overlay.share_it")}
                                </button>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4,1fr)",
                                        gap: 8,
                                        animation:
                                            "ao-fadeInRow 0.3s ease both",
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
                                                transition:
                                                    "transform 0.15s, opacity 0.15s",
                                                animation: `ao-fadeInRow 0.3s ${i * 0.06}s ease both`,
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
