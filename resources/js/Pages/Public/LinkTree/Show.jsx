import { useState } from "react";
import { Head } from "@inertiajs/react";

// ─── Social icon SVGs ─────────────────────────────────────────────────────────

const SOCIAL_ICONS = {
    facebook: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon
                fill="white"
                points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
            />
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z" />
        </svg>
    ),
    whatsapp: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
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
            width="20"
            height="20"
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
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
            width="20"
            height="20"
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
            width="20"
            height="20"
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
        name: { color: "#111827", fontWeight: "800" },
        bio: { color: "#6b7280" },
        linkBg: "#ffffff",
        linkBorder: "1.5px solid #e5e7eb",
        linkColor: "#111827",
        linkHoverBg: "#f9fafb",
        linkHoverBorder: "1.5px solid #d1d5db",
        linkShadow: "0 1px 4px rgba(0,0,0,0.06)",
        linkHoverShadow: "0 4px 14px rgba(0,0,0,0.09)",
        socialBg: "rgba(0,0,0,0.06)",
        socialColor: "#374151",
        footer: "#9ca3af",
    },
    dark: {
        pageBg: "#0f172a",
        name: { color: "#f1f5f9", fontWeight: "800" },
        bio: { color: "#94a3b8" },
        linkBg: "#1e293b",
        linkBorder: "1.5px solid #334155",
        linkColor: "#f1f5f9",
        linkHoverBg: "#273549",
        linkHoverBorder: "1.5px solid #6366f1",
        linkShadow: "0 1px 4px rgba(0,0,0,0.3)",
        linkHoverShadow: "0 4px 14px rgba(99,102,241,0.2)",
        socialBg: "rgba(255,255,255,0.08)",
        socialColor: "#cbd5e1",
        footer: "#475569",
    },
    minimal: {
        pageBg: "#ffffff",
        name: { color: "#111827", fontWeight: "600" },
        bio: { color: "#6b7280" },
        linkBg: "transparent",
        linkBorder: "1.5px solid #e5e7eb",
        linkColor: "#111827",
        linkHoverBg: "#f9fafb",
        linkHoverBorder: "1.5px solid #d1d5db",
        linkShadow: "none",
        linkHoverShadow: "none",
        socialBg: "transparent",
        socialColor: "#374151",
        footer: "#9ca3af",
    },
    gradient: {
        pageBg: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%)",
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
        linkHoverShadow: "0 4px 16px rgba(0,0,0,0.2)",
        socialBg: "rgba(255,255,255,0.2)",
        socialColor: "#ffffff",
        footer: "rgba(255,255,255,0.6)",
    },
    forest: {
        pageBg: "#1a2e1a",
        name: { color: "#d4edda", fontWeight: "800" },
        bio: { color: "#81c784" },
        linkBg: "#2e4d2e",
        linkBorder: "1.5px solid #3d6b38",
        linkColor: "#d4edda",
        linkHoverBg: "#3d6b38",
        linkHoverBorder: "1.5px solid #66bb6a",
        linkShadow: "0 1px 4px rgba(0,0,0,0.3)",
        linkHoverShadow: "0 4px 16px rgba(76,175,80,0.25)",
        socialBg: "rgba(255,255,255,0.07)",
        socialColor: "#81c784",
        footer: "#4a7c59",
    },
    ocean: {
        pageBg: "#0a1628",
        name: { color: "#e0f2fe", fontWeight: "800" },
        bio: { color: "#7dd3fc" },
        linkBg: "#0f2d52",
        linkBorder: "1.5px solid #1a4a7a",
        linkColor: "#e0f2fe",
        linkHoverBg: "#1a4a7a",
        linkHoverBorder: "1.5px solid #38bdf8",
        linkShadow: "0 1px 4px rgba(0,0,0,0.4)",
        linkHoverShadow: "0 4px 16px rgba(56,189,248,0.25)",
        socialBg: "rgba(255,255,255,0.06)",
        socialColor: "#7dd3fc",
        footer: "#1e4d78",
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
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: hovered ? brandColor : theme.socialBg,
                color: hovered ? "#ffffff" : theme.socialColor,
                transition: "all 0.18s ease",
                transform: hovered ? "scale(1.14)" : "scale(1)",
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
                gap: "12px",
                padding: hasThumbnail ? "10px 16px 10px 10px" : "18px 20px",
                background: hovered ? theme.linkHoverBg : theme.linkBg,
                border: hovered ? theme.linkHoverBorder : theme.linkBorder,
                borderRadius: "16px",
                color: theme.linkColor,
                textDecoration: "none",
                boxShadow: hovered ? theme.linkHoverShadow : theme.linkShadow,
                transition: "all 0.18s ease",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                width: "100%",
                position: "relative",
            }}
        >
            {/* Left: thumbnail OR emoji icon */}
            {hasThumbnail ? (
                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "rgba(0,0,0,0.06)",
                    }}
                >
                    <img
                        src={link.thumbnail_full}
                        alt={link.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </div>
            ) : link.icon ? (
                <span
                    style={{
                        fontSize: "22px",
                        flexShrink: 0,
                        width: "32px",
                        textAlign: "center",
                    }}
                >
                    {link.icon}
                </span>
            ) : null}

            {/* Title — always centered across full width */}
            <span
                style={{
                    flex: 1,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "15px",
                    letterSpacing: "-0.1px",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                }}
            >
                {link.title}
            </span>

            {/* Right: external icon */}
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="14"
                height="14"
                style={{ flexShrink: 0, opacity: 0.4 }}
            >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        </a>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinkTreeShow({ profile, links, socialLinks }) {
    const theme = THEMES[profile.theme] ?? THEMES.default;
    const activeSocial = (socialLinks ?? []).filter(
        (s) => s.is_active && s.url,
    );

    return (
        <>
            <Head title={profile.title ?? "Link Tree"} />

            {profile.custom_css && <style>{profile.custom_css}</style>}

            <div
                style={{
                    background: theme.pageBg,
                    minHeight: "100vh",
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    padding: "0 0 64px",
                }}
            >
                <div
                    style={{
                        maxWidth: "680px",
                        margin: "0 auto",
                        padding: "0 16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            marginTop: "52px",
                            marginBottom: "18px",
                            width: "96px",
                            height: "96px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "rgba(128,128,128,0.15)",
                            boxShadow: "0 2px 16px rgba(0,0,0,0.14)",
                            flexShrink: 0,
                        }}
                    >
                        {profile.profile_image_full ? (
                            <img
                                src={profile.profile_image_full}
                                alt={profile.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(255,255,255,0.12)",
                                }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth="1.5"
                                    width="46"
                                    height="46"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h1
                        style={{
                            margin: "0 0 8px",
                            fontSize: "24px",
                            letterSpacing: "-0.4px",
                            textAlign: "center",
                            ...theme.name,
                        }}
                    >
                        {profile.title}
                    </h1>

                    {/* Bio */}
                    {profile.description && (
                        <p
                            style={{
                                margin: "0 0 20px",
                                fontSize: "15px",
                                lineHeight: 1.55,
                                textAlign: "center",
                                maxWidth: "420px",
                                ...theme.bio,
                            }}
                        >
                            {profile.description}
                        </p>
                    )}

                    {/* Social icons */}
                    {activeSocial.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                justifyContent: "center",
                                marginBottom: "28px",
                            }}
                        >
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

                    {/* Link cards */}
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            marginTop: activeSocial.length > 0 ? 0 : "12px",
                        }}
                    >
                        {links.length === 0 ? (
                            <p
                                style={{
                                    textAlign: "center",
                                    padding: "40px 0",
                                    ...theme.bio,
                                }}
                            >
                                No links yet.
                            </p>
                        ) : (
                            links.map((link) => (
                                <LinkCard
                                    key={link.id}
                                    link={link}
                                    theme={theme}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <p
                        style={{
                            marginTop: "44px",
                            fontSize: "12px",
                            color: theme.footer,
                        }}
                    >
                        Made with VocaPix
                    </p>
                </div>
            </div>
        </>
    );
}
