import { useState } from "react";

// ─── Badge Data ────────────────────────────────────────────────────────────────
const BADGES = [
    {
        key: "streak_bronze",
        name: "Streak Bronze",
        category: "streak",
        tier: 1,
        desc: "7-day streak",
    },
    {
        key: "streak_silver",
        name: "Streak Silver",
        category: "streak",
        tier: 2,
        desc: "14-day streak",
    },
    {
        key: "streak_gold",
        name: "Streak Gold",
        category: "streak",
        tier: 3,
        desc: "30-day streak",
    },
    {
        key: "streak_platinum",
        name: "Streak Platinum",
        category: "streak",
        tier: 4,
        desc: "60-day streak",
    },
    {
        key: "streak_diamond",
        name: "Streak Diamond",
        category: "streak",
        tier: 5,
        desc: "100-day streak",
    },
    {
        key: "xp_learner",
        name: "Learner",
        category: "xp",
        tier: 1,
        desc: "100 XP total",
    },
    {
        key: "xp_scholar",
        name: "Scholar",
        category: "xp",
        tier: 2,
        desc: "1,000 XP total",
    },
    {
        key: "xp_wizard",
        name: "Wizard",
        category: "xp",
        tier: 3,
        desc: "5,000 XP total",
    },
    {
        key: "explorer",
        name: "Explorer",
        category: "morning",
        tier: 1,
        desc: "XP before 9 AM",
    },
    {
        key: "perfect_sharpshooter",
        name: "Sharpshooter",
        category: "perfect",
        tier: 1,
        desc: "1 perfect lesson",
    },
    {
        key: "perfect_conqueror",
        name: "Conqueror",
        category: "perfect",
        tier: 2,
        desc: "10 perfect lessons",
    },
    {
        key: "perfect_regal",
        name: "Regal",
        category: "perfect",
        tier: 3,
        desc: "50 perfect lessons",
    },
];

// Tier metallic palettes
const TIERS = {
    1: {
        ring: "#E8A456",
        shine: "#F5D08A",
        body: "#2D1500",
        accent: "#CD7F32",
        dot: "#E8A456",
        name: "Bronze",
    },
    2: {
        ring: "#C4C4C4",
        shine: "#EFEFEF",
        body: "#1C1C1C",
        accent: "#A0A0A0",
        dot: "#C4C4C4",
        name: "Silver",
    },
    3: {
        ring: "#FFD700",
        shine: "#FFF59D",
        body: "#251800",
        accent: "#E6BE00",
        dot: "#FFD700",
        name: "Gold",
    },
    4: {
        ring: "#C4B5FD",
        shine: "#EDE9FE",
        body: "#180D40",
        accent: "#9B6FE0",
        dot: "#C4B5FD",
        name: "Platinum",
    },
    5: {
        ring: "#93C5FD",
        shine: "#DBEAFE",
        body: "#001530",
        accent: "#38BDF8",
        dot: "#93C5FD",
        name: "Diamond",
    },
};

// Category accent colors
const CATS = {
    streak: { color: "#FF7518", bg: "#FF751815", name: "Streak" },
    xp: { color: "#3B9EFF", bg: "#3B9EFF15", name: "XP" },
    morning: { color: "#FFC107", bg: "#FFC10715", name: "Explorer" },
    perfect: { color: "#FF4757", bg: "#FF475715", name: "Perfect" },
};

// ─── Hex geometry (pointy-top, R=38, center 40,44) ───────────────────────────
const OUTER = [
    [40, 6],
    [72.9, 25],
    [72.9, 63],
    [40, 82],
    [7.1, 63],
    [7.1, 25],
];
const INNER = [
    [40, 14],
    [66, 29],
    [66, 59],
    [40, 74],
    [14, 59],
    [14, 29],
];
const pts = (arr) => arr.map((p) => p.join(",")).join(" ");
const OUTER_PTS = pts(OUTER);
const INNER_PTS = pts(INNER);
// Top-edge highlight cap (metallic shine on ring bevel)
const SHINE_PTS = pts([
    OUTER[5],
    OUTER[0],
    OUTER[1],
    INNER[1],
    INNER[0],
    INNER[5],
]);

// ─── Category Icons ───────────────────────────────────────────────────────────

const FlameIcon = ({ c }) => (
    <path
        d="M0-11 C1-7 7-3 6 3 C9 0 9-5 7-9 C11-2 11 5 7 10 C9 8 8 5 7 6 C9 11 5 15 0 15 C-5 15-9 11-7 6 C-8 5-9 8-7 10 C-11 5-11-2-7-9 C-9-5-9 0-6 3 C-7-3 0-11 0-11Z"
        fill={c}
    />
);

const LightningIcon = ({ c }) => (
    <path d="M4-13 L-6 2 L1 2 L-4 13 L9 0 L2 0 Z" fill={c} />
);

const SunriseIcon = ({ c }) => {
    const rays = [0, 40, -40, 72, -72];
    return (
        <g>
            <path d="M-9 2 A9 9 0 0 1 9 2 Z" fill={c} />
            <line x1="-13" y1="2" x2="13" y2="2" stroke={c} strokeWidth="2.5" />
            {rays.map((deg, i) => {
                const a = ((deg - 90) * Math.PI) / 180;
                return (
                    <line
                        key={i}
                        x1={Math.cos(a) * 12}
                        y1={Math.sin(a) * 12}
                        x2={Math.cos(a) * 16}
                        y2={Math.sin(a) * 16}
                        stroke={c}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                );
            })}
        </g>
    );
};

const TargetIcon = ({ c }) => (
    <g>
        <circle r="13" fill="none" stroke={c} strokeWidth="2" />
        <circle r="8" fill="none" stroke={c} strokeWidth="2" />
        <circle r="3.5" fill={c} />
        {[
            [0, -16, 0, -13],
            [0, 13, 0, 16],
            [-16, 0, -13, 0],
            [13, 0, 16, 0],
        ].map(([x1, y1, x2, y2], i) => (
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c}
                strokeWidth="2"
                strokeLinecap="round"
            />
        ))}
    </g>
);

const ICONS = {
    streak: FlameIcon,
    xp: LightningIcon,
    morning: SunriseIcon,
    perfect: TargetIcon,
};

// Diamond sparkles (only for tier 5)
const Sparkles = ({ color }) => (
    <g fill={color} opacity="0.7">
        {[
            [-24, -14],
            [25, -16],
            [-26, 8],
            [24, 6],
            [-2, -26],
        ].map(([x, y], i) => (
            <polygon
                key={i}
                points={`${x},${y - 4} ${x - 1.5},${y} ${x},${y + 4} ${x + 1.5},${y}`}
            />
        ))}
    </g>
);

// ─── Single Badge SVG ─────────────────────────────────────────────────────────
export function BadgeSVG({ badge, earned, size = 80 }) {
    const t = TIERS[badge.tier];
    const cat = CATS[badge.category];
    const Icon = ICONS[badge.category];

    const iconColor = earned ? cat.color : "#666";
    const ringFill = earned ? t.ring : "#555";
    const bodyFill = earned ? t.body : "#282828";
    const dotColor = earned ? t.dot : "#555";
    const dotOpacity = earned ? 0.9 : 0.35;

    const n = badge.tier;
    const dotStartX = 40 - ((n - 1) * 8) / 2;

    return (
        <svg
            viewBox="0 0 80 92"
            width={size}
            height={size * 1.15}
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible", display: "block" }}
        >
            {/* ── Outer ring ── */}
            <polygon
                points={OUTER_PTS}
                fill={ringFill}
                opacity={earned ? 1 : 0.4}
            />

            {/* ── Ring bevel shine (top half only) ── */}
            {earned && (
                <polygon points={SHINE_PTS} fill={t.shine} opacity="0.4" />
            )}

            {/* ── Inner badge body ── */}
            <polygon points={INNER_PTS} fill={bodyFill} />

            {/* ── Icon glow pool ── */}
            {earned && (
                <circle
                    cx="40"
                    cy="43"
                    r="19"
                    fill={cat.color}
                    opacity="0.13"
                />
            )}

            {/* ── Category icon ── */}
            <g transform="translate(40,43)">
                <Icon c={iconColor} />
            </g>

            {/* ── Diamond sparkles ── */}
            {badge.tier === 5 && earned && (
                <g transform="translate(40,43)">
                    <Sparkles color={t.accent} />
                </g>
            )}

            {/* ── Tier indicator dots ── */}
            {Array.from({ length: n }).map((_, i) => (
                <circle
                    key={i}
                    cx={dotStartX + i * 8}
                    cy={88}
                    r={2.5}
                    fill={dotColor}
                    opacity={dotOpacity}
                />
            ))}

            {/* ── Earned: green checkmark badge ── */}
            {earned && (
                <g transform="translate(70,11)">
                    <circle r="8" fill="#22C55E" />
                    <path
                        d="M-4 0 L-1 3.5 L4.5-3"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
            )}

            {/* ── Locked: padlock overlay ── */}
            {!earned && (
                <g transform="translate(40,43)" opacity="0.75">
                    <rect
                        x="-7"
                        y="-1"
                        width="14"
                        height="11"
                        rx="2"
                        fill="#666"
                    />
                    <path
                        d="M-4.5-1 Q-4.5-9 0-9 Q4.5-9 4.5-1"
                        fill="none"
                        stroke="#666"
                        strokeWidth="2"
                    />
                    <circle cx="0" cy="4.5" r="1.8" fill="#333" />
                </g>
            )}
        </svg>
    );
}

// ─── Badge Card (name + description below badge) ──────────────────────────────
function BadgeCard({ badge, earned, onToggle }) {
    const [hovered, setHovered] = useState(false);
    const t = TIERS[badge.tier];

    return (
        <div
            onClick={() => onToggle(badge.key)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                width: "90px",
                transform: hovered ? "translateY(-5px)" : "none",
                transition: "transform 0.18s ease",
                userSelect: "none",
            }}
        >
            <BadgeSVG badge={badge} earned={earned} size={76} />
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        lineHeight: "1.3",
                        color: earned ? t.ring : "var(--color-text-secondary)",
                        transition: "color 0.2s",
                    }}
                >
                    {badge.name}
                </div>
                <div
                    style={{
                        fontSize: "9.5px",
                        color: "var(--color-text-secondary)",
                        marginTop: "2px",
                        lineHeight: "1.3",
                        opacity: 0.65,
                    }}
                >
                    {badge.desc}
                </div>
            </div>
        </div>
    );
}

// ─── Category sections ────────────────────────────────────────────────────────
const SECTIONS = [
    { key: "streak", label: "Streak", icon: "🔥" },
    { key: "xp", label: "XP", icon: "⚡" },
    { key: "morning", label: "Explorer", icon: "🌅" },
    { key: "perfect", label: "Perfect", icon: "🎯" },
];

const DEFAULT_EARNED = {
    xp_learner: true,
    xp_scholar: true,
    xp_wizard: true,
    explorer: true,
};

// ─── Main Gallery ─────────────────────────────────────────────────────────────
export default function AchievementBadges() {
    const [earned, setEarned] = useState(DEFAULT_EARNED);

    const toggle = (key) =>
        setEarned((prev) => ({ ...prev, [key]: !prev[key] }));

    const earnedCount = Object.values(earned).filter(Boolean).length;
    const total = BADGES.length;
    const pct = (earnedCount / total) * 100;

    const allEarned = earnedCount === total;

    return (
        <div
            style={{
                background: "var(--color-background-tertiary)",
                minHeight: "100vh",
                padding: "24px 20px",
                fontFamily: "var(--font-sans)",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                }}
            >
                <svg width="36" height="36" viewBox="0 0 32 32">
                    <path
                        d="M16 2 L20 12 L31 12 L22 19 L25 30 L16 23 L7 30 L10 19 L1 12 L12 12 Z"
                        fill="#FFD700"
                    />
                </svg>
                <div>
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: "500",
                            margin: 0,
                            color: "var(--color-text-primary)",
                        }}
                    >
                        Achievement Badges
                    </h1>
                    <p
                        style={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary)",
                            margin: "2px 0 0",
                        }}
                    >
                        {earnedCount} of {total} earned · click any badge to
                        toggle
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div
                style={{
                    height: "4px",
                    background: "var(--color-border-tertiary)",
                    borderRadius: "2px",
                    margin: "0 0 28px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "#22C55E",
                        borderRadius: "2px",
                        transition: "width 0.35s ease",
                    }}
                />
            </div>

            {/* Sections */}
            {SECTIONS.map((section) => {
                const sectionBadges = BADGES.filter(
                    (b) => b.category === section.key,
                );
                return (
                    <div key={section.key} style={{ marginBottom: "32px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "16px",
                                paddingBottom: "8px",
                                borderBottom:
                                    "0.5px solid var(--color-border-tertiary)",
                            }}
                        >
                            <span style={{ fontSize: "14px" }}>
                                {section.icon}
                            </span>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontWeight: "500",
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {section.label}
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "20px 16px",
                            }}
                        >
                            {sectionBadges.map((badge) => (
                                <BadgeCard
                                    key={badge.key}
                                    badge={badge}
                                    earned={!!earned[badge.key]}
                                    onToggle={toggle}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Toggle all */}
            <div
                style={{
                    textAlign: "center",
                    paddingTop: "16px",
                    borderTop: "0.5px solid var(--color-border-tertiary)",
                }}
            >
                <button
                    onClick={() => {
                        const next = {};
                        BADGES.forEach((b) => {
                            next[b.key] = !allEarned;
                        });
                        setEarned(next);
                    }}
                    style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                    }}
                >
                    {allEarned ? "Reset all badges" : "Preview all earned"} ↗
                </button>
            </div>
        </div>
    );
}
