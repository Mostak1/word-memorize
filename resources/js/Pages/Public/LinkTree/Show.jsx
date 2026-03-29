import { useState } from "react";
import { Head } from "@inertiajs/react";

// ─── Social icon SVGs ─────────────────────────────────────────────────────────

const SOCIAL_ICONS = {
    facebook: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon
                fill="white"
                points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
            />
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z" />
        </svg>
    ),
    whatsapp: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
    ),
    instagram: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
    ),
    email: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
        >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    website: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
};

const SOCIAL_COLORS = {
    facebook: "#1877F2",
    youtube: "#FF0000",
    tiktok: "#010101",
    whatsapp: "#25D366",
    instagram: "#E4405F",
    twitter: "#000000",
    linkedin: "#0A66C2",
    github: "#24292e",
    email: "#EA4335",
    website: "#6366f1",
};

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES = {
    default: {
        pageBg: "#f3f4f6",
        coverFallback: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
        avatarBorder: "#ffffff",
        name: { color: "#111827", fontWeight: "800" },
        bio: { color: "#6b7280" },
        linkBg: "#ffffff",
        linkBorder: "1.5px solid #e5e7eb",
        linkColor: "#111827",
        linkHoverBg: "#f9fafb",
        linkHoverBorder: "1.5px solid #d1d5db",
        linkShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 0 transparent",
        linkHoverShadow: "0 6px 20px rgba(0,0,0,0.09)",
        linkSubColor: "#6b7280",
        socialBg: "rgba(0,0,0,0.06)",
        socialColor: "#374151",
        footer: "#9ca3af",
        arrowColor: "rgba(0,0,0,0.25)",
        iconWrapBg: "rgba(0,0,0,0.04)",
    },
    dark: {
        pageBg: "#0f172a",
        coverFallback: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        avatarBorder: "#1e293b",
        name: { color: "#f1f5f9", fontWeight: "800" },
        bio: { color: "#94a3b8" },
        linkBg: "#1e293b",
        linkBorder: "1.5px solid #334155",
        linkColor: "#f1f5f9",
        linkHoverBg: "#273549",
        linkHoverBorder: "1.5px solid #6366f1",
        linkShadow: "0 1px 4px rgba(0,0,0,0.3)",
        linkHoverShadow: "0 6px 20px rgba(99,102,241,0.2)",
        linkSubColor: "#64748b",
        socialBg: "rgba(255,255,255,0.08)",
        socialColor: "#cbd5e1",
        footer: "#475569",
        arrowColor: "rgba(255,255,255,0.25)",
        iconWrapBg: "rgba(255,255,255,0.06)",
    },
    minimal: {
        pageBg: "#ffffff",
        coverFallback: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
        avatarBorder: "#ffffff",
        name: { color: "#111827", fontWeight: "600" },
        bio: { color: "#6b7280" },
        linkBg: "transparent",
        linkBorder: "1.5px solid #e5e7eb",
        linkColor: "#111827",
        linkHoverBg: "#f9fafb",
        linkHoverBorder: "1.5px solid #d1d5db",
        linkShadow: "none",
        linkHoverShadow: "none",
        linkSubColor: "#9ca3af",
        socialBg: "transparent",
        socialColor: "#374151",
        footer: "#9ca3af",
        arrowColor: "rgba(0,0,0,0.2)",
        iconWrapBg: "rgba(0,0,0,0.04)",
    },
    gradient: {
        pageBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%)",
        coverFallback: "linear-gradient(135deg, #f093fb, #f5576c)",
        avatarBorder: "rgba(255,255,255,0.8)",
        name: {
            color: "#ffffff",
            fontWeight: "800",
            textShadow: "0 1px 4px rgba(0,0,0,0.15)",
        },
        bio: { color: "rgba(255,255,255,0.88)" },
        linkBg: "rgba(255,255,255,0.18)",
        linkBorder: "1.5px solid rgba(255,255,255,0.35)",
        linkColor: "#ffffff",
        linkHoverBg: "rgba(255,255,255,0.28)",
        linkHoverBorder: "1.5px solid rgba(255,255,255,0.65)",
        linkShadow: "0 2px 8px rgba(0,0,0,0.1)",
        linkHoverShadow: "0 6px 20px rgba(0,0,0,0.18)",
        linkSubColor: "rgba(255,255,255,0.65)",
        socialBg: "rgba(255,255,255,0.2)",
        socialColor: "#ffffff",
        footer: "rgba(255,255,255,0.6)",
        arrowColor: "rgba(255,255,255,0.45)",
        iconWrapBg: "rgba(255,255,255,0.15)",
    },
    forest: {
        pageBg: "#1a2e1a",
        coverFallback: "linear-gradient(135deg, #2e4d2e 0%, #1a2e1a 100%)",
        avatarBorder: "#2e4d2e",
        name: { color: "#d4edda", fontWeight: "800" },
        bio: { color: "#81c784" },
        linkBg: "#2e4d2e",
        linkBorder: "1.5px solid #3d6b38",
        linkColor: "#d4edda",
        linkHoverBg: "#3d6b38",
        linkHoverBorder: "1.5px solid #66bb6a",
        linkShadow: "0 1px 4px rgba(0,0,0,0.3)",
        linkHoverShadow: "0 6px 20px rgba(76,175,80,0.22)",
        linkSubColor: "#4a7c59",
        socialBg: "rgba(255,255,255,0.07)",
        socialColor: "#81c784",
        footer: "#4a7c59",
        arrowColor: "rgba(255,255,255,0.22)",
        iconWrapBg: "rgba(255,255,255,0.06)",
    },
    ocean: {
        pageBg: "#0a1628",
        coverFallback: "linear-gradient(135deg, #0f2d52 0%, #0a1628 100%)",
        avatarBorder: "#0f2d52",
        name: { color: "#e0f2fe", fontWeight: "800" },
        bio: { color: "#7dd3fc" },
        linkBg: "#0f2d52",
        linkBorder: "1.5px solid #1a4a7a",
        linkColor: "#e0f2fe",
        linkHoverBg: "#1a4a7a",
        linkHoverBorder: "1.5px solid #38bdf8",
        linkShadow: "0 1px 4px rgba(0,0,0,0.4)",
        linkHoverShadow: "0 6px 20px rgba(56,189,248,0.2)",
        linkSubColor: "#1e4d78",
        socialBg: "rgba(255,255,255,0.06)",
        socialColor: "#7dd3fc",
        footer: "#1e4d78",
        arrowColor: "rgba(255,255,255,0.22)",
        iconWrapBg: "rgba(255,255,255,0.05)",
    },
    fluento: {
        pageBg: "#f3eee4",
        coverFallback: "linear-gradient(135deg, #e70013 0%, #ff4d5e 100%)",
        avatarBorder: "#ffffff",
        name: { color: "#e70013", fontWeight: "800", letterSpacing: "-0.5px" },
        bio: { color: "#c0000f" },
        linkBg: "#ffffff",
        linkBorder: "1.5px solid #e8d8cd",
        linkColor: "#e70013",
        linkHoverBg: "#fff5f5",
        linkHoverBorder: "1.5px solid #e70013",
        linkShadow: "0 1px 6px rgba(231,0,19,0.07)",
        linkHoverShadow: "0 6px 20px rgba(231,0,19,0.13)",
        linkSubColor: "#c9b8ac",
        socialBg: "#e70013",
        socialColor: "#ffffff",
        footer: "#c9b8ac",
        arrowColor: "rgba(231,0,19,0.3)",
        iconWrapBg: "rgba(231,0,19,0.06)",
    },
};

// ─── Social Button ────────────────────────────────────────────────────────────

function SocialButton({ platform, url, theme }) {
    const [hovered, setHovered] = useState(false);
    const brandColor = SOCIAL_COLORS[platform] ?? "#6366f1";
    const href =
        platform === "email" && !url.startsWith("mailto:")
            ? `mailto:${url}`
            : url;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={platform}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: hovered ? brandColor : theme.socialBg,
                color: hovered ? "#ffffff" : theme.socialColor,
                transition: "all 0.2s ease",
                transform: hovered ? "scale(1.12)" : "scale(1)",
                textDecoration: "none",
                flexShrink: 0,
            }}
        >
            {SOCIAL_ICONS[platform] ?? SOCIAL_ICONS.website}
        </a>
    );
}

// ─── Link Card ────────────────────────────────────────────────────────────────

function LinkCard({ link, theme }) {
    const [hovered, setHovered] = useState(false);
    const hasThumbnail = !!link.thumbnail_full;
    const hasIcon = !!link.icon;

    return (
        <a
            href={route("link-tree.redirect", link.id)}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0",
                background: hovered ? theme.linkHoverBg : theme.linkBg,
                border: hovered ? theme.linkHoverBorder : theme.linkBorder,
                borderRadius: "18px",
                color: theme.linkColor,
                textDecoration: "none",
                boxShadow: hovered ? theme.linkHoverShadow : theme.linkShadow,
                transition: "all 0.2s ease",
                transform: hovered
                    ? "translateY(-2px) scale(1.005)"
                    : "translateY(0) scale(1)",
                width: "100%",
                position: "relative",
                overflow: "hidden",
                minHeight: "68px",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
        >
            {/* Left slot — thumbnail or icon placeholder */}
            <div
                style={{
                    width: hasThumbnail ? "72px" : hasIcon ? "60px" : "56px",
                    flexShrink: 0,
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: hasThumbnail ? "8px" : "0",
                    background: hasThumbnail ? "transparent" : theme.iconWrapBg,
                }}
            >
                {hasThumbnail ? (
                    <img
                        src={link.thumbnail_full}
                        alt={link.title}
                        style={{
                            width: "52px",
                            height: "52px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            flexShrink: 0,
                            display: "block",
                        }}
                    />
                ) : hasIcon ? (
                    <span style={{ fontSize: "24px", lineHeight: 1 }}>
                        {link.icon}
                    </span>
                ) : (
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        width="20"
                        height="20"
                        style={{ opacity: 0.3 }}
                    >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                )}
            </div>

            {/* Title — centered */}
            <span
                style={{
                    flex: 1,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "15px",
                    letterSpacing: "-0.1px",
                    lineHeight: 1.35,
                    padding: "14px 8px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                }}
            >
                {link.title}
            </span>

            {/* Right: arrow icon */}
            <div
                style={{
                    width: "48px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.arrowColor,
                    transition: "transform 0.2s ease, color 0.2s ease",
                    transform: hovered ? "translateX(2px)" : "translateX(0)",
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="16"
                    height="16"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </a>
    );
}

// ─── Avatar placeholder ───────────────────────────────────────────────────────

function AvatarPlaceholder() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(128,128,128,0.12)",
            }}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(128,128,128,0.5)"
                strokeWidth="1.5"
                width="42"
                height="42"
            >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinkTreeShow({ profile, links, socialLinks }) {
    const theme = THEMES[profile.theme] ?? THEMES.default;
    const activeSocial = (socialLinks ?? []).filter(
        (s) => s.is_active && s.url,
    );
    const hasCover = !!profile.cover_image_full;

    return (
        <>
            <Head title={profile.title ?? "Link Tree"} />

            {/* Responsive + animation styles */}
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                html, body { -webkit-font-smoothing: antialiased; }

                .lt-page {
                    background: ${theme.pageBg};
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    padding-bottom: 72px;
                }

                .lt-cover {
                    width: 100%;
                    height: 100px;
                    position: relative;
                    background: ${hasCover ? "transparent" : theme.coverFallback};
                    overflow: hidden;
                }
                @media (min-width: 480px) {
                    .lt-cover { height: 100px; }
                }

                .lt-container {
                    max-width: 640px;
                    margin: 0 auto;
                    padding: 0 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                @media (min-width: 640px) {
                    .lt-container { padding: 0 24px; }
                }

                .lt-avatar-wrap {
                    margin-top: -48px;
                    margin-bottom: 14px;
                    width: 96px;
                    height: 96px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 4px solid ${theme.avatarBorder};
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    flex-shrink: 0;
                    background: ${theme.pageBg};
                    position: relative;
                    z-index: 1;
                }
                @media (min-width: 480px) {
                    .lt-avatar-wrap {
                        width: 108px;
                        height: 108px;
                        margin-top: -54px;
                    }
                }

                /* No-cover layout: add top padding instead */
                .lt-avatar-no-cover {
                    margin-top: 52px;
                    margin-bottom: 14px;
                    width: 96px;
                    height: 96px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                    flex-shrink: 0;
                    background: rgba(128,128,128,0.1);
                }
                @media (min-width: 480px) {
                    .lt-avatar-no-cover { width: 108px; height: 108px; }
                }

                .lt-name {
                    font-size: 22px;
                    letter-spacing: -0.5px;
                    text-align: center;
                    margin-bottom: 6px;
                }
                @media (min-width: 480px) {
                    .lt-name { font-size: 26px; }
                }

                .lt-bio {
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: center;
                    max-width: 400px;
                    margin-bottom: 20px;
                }
                @media (min-width: 480px) {
                    .lt-bio { font-size: 15px; }
                }

                .lt-social-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                    margin-bottom: 28px;
                }

                .lt-links {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                @media (min-width: 480px) {
                    .lt-links { gap: 12px; }
                }

                .lt-footer {
                    margin-top: 48px;
                    font-size: 12px;
                    opacity: 0.7;
                    letter-spacing: 0.3px;
                }

                /* Staggered link entrance */
                .lt-link-item {
                    opacity: 0;
                    transform: translateY(16px);
                    animation: ltFadeUp 0.38s ease forwards;
                }
                @keyframes ltFadeUp {
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Cover shimmer for no-image state */
                .lt-cover-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        105deg,
                        transparent 40%,
                        rgba(255,255,255,0.08) 50%,
                        transparent 60%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* Hover touch fix for mobile (no hover state) */
                @media (hover: none) {
                    a:active { transform: scale(0.98) !important; }
                }
            `}</style>

            {profile.custom_css && <style>{profile.custom_css}</style>}

            <div className="lt-page">
                {/* ── Cover banner ── */}
                {hasCover ? (
                    <div className="lt-cover">
                        <img
                            src={profile.cover_image_full}
                            alt="Cover"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center",
                                display: "block",
                            }}
                        />
                        {/* Gradient overlay for readability */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "60%",
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.18), transparent)",
                                pointerEvents: "none",
                            }}
                        />
                    </div>
                ) : (
                    /* Decorative banner when no cover image */
                    <div
                        className="lt-cover"
                        style={{ background: theme.coverFallback }}
                    >
                        <div className="lt-cover-shimmer" />
                    </div>
                )}

                <div className="lt-container">
                    {/* ── Avatar ── */}
                    <div className="lt-avatar-wrap">
                        {profile.profile_image_full ? (
                            <img
                                src={profile.profile_image_full}
                                alt={profile.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        ) : (
                            <AvatarPlaceholder />
                        )}
                    </div>

                    {/* ── Name ── */}
                    <h1 className="lt-name" style={theme.name}>
                        {profile.title}
                    </h1>

                    {/* ── Bio ── */}
                    {profile.description && (
                        <p className="lt-bio" style={theme.bio}>
                            {profile.description}
                        </p>
                    )}

                    {/* ── Social icons ── */}
                    {activeSocial.length > 0 && (
                        <div className="lt-social-row">
                            {activeSocial.map((s, i) => (
                                <SocialButton
                                    key={i}
                                    platform={s.platform}
                                    url={s.url}
                                    theme={theme}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Link cards ── */}
                    {links.length > 0 && (
                        <div className="lt-links">
                            {links.map((link, i) => (
                                <div
                                    key={link.id}
                                    className="lt-link-item"
                                    style={{
                                        animationDelay: `${0.08 + i * 0.06}s`,
                                    }}
                                >
                                    <LinkCard link={link} theme={theme} />
                                </div>
                            ))}
                        </div>
                    )}

                    {links.length === 0 && (
                        <p
                            style={{
                                padding: "40px 0",
                                textAlign: "center",
                                ...theme.bio,
                            }}
                        >
                            No links yet.
                        </p>
                    )}

                    {/* ── Footer ── */}
                    <p className="lt-footer" style={{ color: theme.footer }}>
                        Copyright © {new Date().getFullYear()} All Rights
                        Reserved by Fluento English Academy
                    </p>
                </div>
            </div>
        </>
    );
}
