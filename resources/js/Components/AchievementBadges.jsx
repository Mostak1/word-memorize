import { useState } from "react";

// ─── Badge Data ──────────────────────────────────────────────────────────────
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
    // Words Mastered
    {
        key: "words_seedling",
        name: "Seedling",
        category: "words",
        tier: 1,
        desc: "10 words mastered",
    },
    {
        key: "words_bloom",
        name: "Bloom",
        category: "words",
        tier: 2,
        desc: "50 words mastered",
    },
    {
        key: "words_scholar",
        name: "Word Scholar",
        category: "words",
        tier: 3,
        desc: "200 words mastered",
    },
    {
        key: "words_lexicon",
        name: "Lexicon",
        category: "words",
        tier: 4,
        desc: "500 words mastered",
    },
    {
        key: "words_polymath",
        name: "Polymath",
        category: "words",
        tier: 5,
        desc: "1,000 words mastered",
    },
    // Sessions
    {
        key: "sessions_rookie",
        name: "Rookie",
        category: "sessions",
        tier: 1,
        desc: "First session",
    },
    {
        key: "sessions_veteran",
        name: "Veteran",
        category: "sessions",
        tier: 2,
        desc: "50 sessions",
    },
    {
        key: "sessions_legend",
        name: "Legend",
        category: "sessions",
        tier: 3,
        desc: "200 sessions",
    },
    // Night
    {
        key: "night_owl",
        name: "Night Owl",
        category: "night",
        tier: 1,
        desc: "XP after 10 PM",
    },
    // Mastery Tests
    {
        key: "mastery_initiate",
        name: "Initiate",
        category: "mastery",
        tier: 1,
        desc: "1 mastery test passed",
    },
    {
        key: "mastery_veteran",
        name: "Mastery Veteran",
        category: "mastery",
        tier: 2,
        desc: "10 mastery tests",
    },
    {
        key: "mastery_champion",
        name: "Champion",
        category: "mastery",
        tier: 3,
        desc: "25 mastery tests",
    },
    {
        key: "mastery_flawless",
        name: "Flawless",
        category: "mastery",
        tier: 1,
        desc: "100% on mastery test",
    },
    // Dedication
    {
        key: "dedication_weekend_warrior",
        name: "Weekend Warrior",
        category: "dedication",
        tier: 1,
        desc: "Study both weekend days",
    },
    {
        key: "dedication_comeback_kid",
        name: "Comeback Kid",
        category: "dedication",
        tier: 1,
        desc: "Return after 7-day break",
    },
    {
        key: "dedication_30_days",
        name: "Monthly Devotee",
        category: "dedication",
        tier: 2,
        desc: "30 unique study days",
    },
    {
        key: "dedication_100_days",
        name: "Century Club",
        category: "dedication",
        tier: 3,
        desc: "100 unique study days",
    },
    {
        key: "dedication_list_finisher",
        name: "List Finisher",
        category: "dedication",
        tier: 2,
        desc: "Complete a word list",
    },
];

// ─── Tier Palettes (enhanced with gradient data) ─────────────────────────────
const TIERS = {
    1: {
        name: "Bronze",
        ring: "#CD7F32",
        // metallic sweep: bright highlight → mid-tone → deep shadow
        ringGrad: ["#F9DFA0", "#CD7F32", "#6B3308"],
        shine: "#FFE8AE", // top-left facet highlight color
        body: "#130600", // darkest inner body colour
        bodyShine: "#5A2800", // inner body top-glow colour
        accent: "#E8A456",
        dot: "#E8994D",
        halo: "#CD7F32",
    },
    2: {
        name: "Silver",
        ring: "#ADADAD",
        ringGrad: ["#FFFFFF", "#B0B0B0", "#484848"],
        shine: "#FFFFFF",
        body: "#0D0D0D",
        bodyShine: "#3A3A3A",
        accent: "#C4C4C4",
        dot: "#D8D8D8",
        halo: "#B0B0B0",
    },
    3: {
        name: "Gold",
        ring: "#DDB800",
        ringGrad: ["#FFF8B0", "#FFD700", "#7A5C00"],
        shine: "#FFFFF0",
        body: "#120D00",
        bodyShine: "#4A3800",
        accent: "#FFD700",
        dot: "#FFD700",
        halo: "#FFD700",
    },
    4: {
        name: "Platinum",
        ring: "#8B5CF6",
        ringGrad: ["#F3EEFF", "#9B6FE0", "#3E0FA0"],
        shine: "#FAF7FF",
        body: "#0A0320",
        bodyShine: "#2D1070",
        accent: "#C4B5FD",
        dot: "#C4B5FD",
        halo: "#7C3AED",
    },
    5: {
        name: "Diamond",
        ring: "#2563EB",
        ringGrad: ["#EEF6FF", "#60A5FA", "#0C2FA0"],
        shine: "#FFFFFF",
        body: "#000B1C",
        bodyShine: "#072355",
        accent: "#93C5FD",
        dot: "#93C5FD",
        halo: "#3B82F6",
    },
};

// ─── Category Accents ────────────────────────────────────────────────────────
const CATS = {
    streak: { color: "#FF7518", name: "Streak" },
    xp: { color: "#38BFFF", name: "XP" },
    morning: { color: "#FFC107", name: "Explorer" },
    perfect: { color: "#FF4757", name: "Perfect" },
    words: { color: "#4ADE80", name: "Words" },
    sessions: { color: "#38BDF8", name: "Sessions" },
    night: { color: "#818CF8", name: "Night" },
    mastery: { color: "#FBBF24", name: "Mastery" },
    dedication: { color: "#FB923C", name: "Dedication" },
};

// ─── Hex Geometry ────────────────────────────────────────────────────────────
// Pointy-top hexagon, center (40, 44), viewBox 0 0 80 92
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
// Slightly inflated outer hex for ambient glow halo
const HALO = OUTER.map(([x, y]) => [
    40 + (x - 40) * 1.12,
    44 + (y - 44) * 1.12,
]);

const pts = (arr) => arr.map((p) => p.join(",")).join(" ");
const OUTER_PTS = pts(OUTER);
const INNER_PTS = pts(INNER);
const HALO_PTS = pts(HALO);

// Ring top-left shine facet (trapezoid between outer & inner, upper vertices)
const SHINE_PTS = pts([
    OUTER[5],
    OUTER[0],
    OUTER[1],
    INNER[1],
    INNER[0],
    INNER[5],
]);
// Inner body: top-left specular edge
const BODY_SHINE_PTS = `${INNER[5].join(",")} ${INNER[0].join(",")} ${INNER[1].join(",")}`;
// Inner body: bottom-right shadow edge
const BODY_SHADOW_PTS = `${INNER[1].join(",")} ${INNER[2].join(",")} ${INNER[3].join(",")} ${INNER[4].join(",")}`;

// ─── Category Icons (enhanced) ───────────────────────────────────────────────

// Multi-layer flame with glowing inner core
const FlameIcon = ({ c }) => (
    <g>
        {/* Outer flame body */}
        <path
            d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
            fill={c}
        />
        {/* Bright inner tongue */}
        <path
            d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
            fill="rgba(255,240,160,0.80)"
        />
        {/* Tip highlight */}
        <ellipse cx="0" cy="-6" rx="1.5" ry="3" fill="rgba(255,255,220,0.5)" />
    </g>
);

// Bolt with shadow + edge specular
const LightningIcon = ({ c }) => (
    <g>
        {/* Drop shadow */}
        <path
            d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
            fill="rgba(0,0,0,0.35)"
            transform="translate(1.5,1.5)"
        />
        {/* Main bolt */}
        <path d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z" fill={c} />
        {/* Left-edge highlight */}
        <path
            d="M5-14 L-7 2 L-2 2"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.3"
            strokeLinecap="round"
        />
        {/* Small glint at top */}
        <circle cx="3" cy="-11" r="1.5" fill="rgba(255,255,255,0.45)" />
    </g>
);

// Layered sunrise with horizon, rays
const SunriseIcon = ({ c }) => {
    const rays = [0, 36, -36, 68, -68, 100, -100];
    return (
        <g>
            {/* Horizon line */}
            <line
                x1="-15"
                y1="4"
                x2="15"
                y2="4"
                stroke={c}
                strokeWidth="2.6"
                strokeLinecap="round"
            />
            {/* Sun arc */}
            <path d="M-11 4 A11 11 0 0 1 11 4 Z" fill={c} />
            {/* Inner bright core */}
            <path d="M-6 4 A6 6 0 0 1 6 4 Z" fill="rgba(255,255,200,0.7)" />
            {/* Centre glint */}
            <ellipse
                cx="0"
                cy="1"
                rx="2"
                ry="1.2"
                fill="rgba(255,255,230,0.5)"
            />
            {/* Rays */}
            {rays.map((deg, i) => {
                const a = ((deg - 90) * Math.PI) / 180;
                const r1 = 13.5;
                const r2 = i === 0 ? 19.5 : i <= 2 ? 17 : 15.5;
                const w = i === 0 ? 2.3 : i <= 2 ? 1.8 : 1.4;
                return (
                    <line
                        key={i}
                        x1={Math.cos(a) * r1}
                        y1={Math.sin(a) * r1}
                        x2={Math.cos(a) * r2}
                        y2={Math.sin(a) * r2}
                        stroke={c}
                        strokeWidth={w}
                        strokeLinecap="round"
                    />
                );
            })}
        </g>
    );
};

// Triple-ring target with crosshairs
const TargetIcon = ({ c }) => (
    <g>
        {/* Outer ring (faint) */}
        <circle
            r="15.5"
            fill="none"
            stroke={c}
            strokeWidth="1.2"
            opacity="0.38"
        />
        {/* Mid ring */}
        <circle r="11" fill="none" stroke={c} strokeWidth="1.8" />
        {/* Inner ring */}
        <circle r="6.5" fill="none" stroke={c} strokeWidth="1.5" />
        {/* Bull's-eye */}
        <circle r="2.8" fill={c} />
        <circle r="1.2" fill="rgba(255,255,255,0.55)" />
        {/* Crosshairs */}
        {[
            [0, -17.5, 0, -15.5],
            [0, 15.5, 0, 17.5],
            [-17.5, 0, -15.5, 0],
            [15.5, 0, 17.5, 0],
        ].map(([x1, y1, x2, y2], i) => (
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c}
                strokeWidth="2.2"
                strokeLinecap="round"
            />
        ))}
    </g>
);

// ── Streak: Two Flames (Silver) ──────────────────────────────────────────────
const TwoFlameIcon = ({ c }) => (
    <g>
        {[
            [-7, 1],
            [7, 1],
        ].map(([tx, ty], i) => (
            <g key={i} transform={`translate(${tx},${ty}) scale(0.63)`}>
                <path
                    d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                    fill={c}
                />
                <path
                    d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                    fill="rgba(255,240,160,0.80)"
                />
            </g>
        ))}
    </g>
);

// ── Streak: Three Flames (Gold) ───────────────────────────────────────────────
// Centre flame taller, flanking ones smaller & offset down
const ThreeFlameIcon = ({ c }) => (
    <g>
        {/* Left flame – smaller, slightly lower */}
        <g transform="translate(-9,3) scale(0.52)">
            <path
                d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                fill={c}
                opacity="0.85"
            />
            <path
                d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                fill="rgba(255,240,160,0.70)"
            />
        </g>
        {/* Centre flame – tallest */}
        <g transform="translate(0,-1) scale(0.65)">
            <path
                d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                fill={c}
            />
            <path
                d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                fill="rgba(255,240,160,0.80)"
            />
            <ellipse
                cx="0"
                cy="-6"
                rx="1.5"
                ry="3"
                fill="rgba(255,255,220,0.5)"
            />
        </g>
        {/* Right flame – smaller, slightly lower */}
        <g transform="translate(9,3) scale(0.52)">
            <path
                d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                fill={c}
                opacity="0.85"
            />
            <path
                d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                fill="rgba(255,240,160,0.70)"
            />
        </g>
    </g>
);

// ── Streak: Four Flames in 2×2 grid (Platinum) ───────────────────────────────
const FourFlameIcon = ({ c }) => (
    <g>
        {[
            [-7, -7],
            [7, -7],
            [-7, 7],
            [7, 7],
        ].map(([tx, ty], i) => (
            <g key={i} transform={`translate(${tx},${ty}) scale(0.49)`}>
                <path
                    d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                    fill={c}
                    opacity={i >= 2 ? 0.78 : 1}
                />
                <path
                    d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                    fill="rgba(255,240,160,0.75)"
                />
            </g>
        ))}
        {/* Central glint */}
        <circle cx="0" cy="0" r="2.5" fill="rgba(255,220,120,0.55)" />
    </g>
);

// ── Streak: Crown-of-Flames (Diamond) ────────────────────────────────────────
// Large central inferno + 4 satellite micro-flames arranged in an arc
const DiamondFlameIcon = ({ c }) => (
    <g>
        {/* Orbital micro-flames */}
        {[
            [-12, 4, -18],
            [12, 4, 18],
            [-7, -10, -10],
            [7, -10, 10],
        ].map(([tx, ty, rot], i) => (
            <g
                key={i}
                transform={`translate(${tx},${ty}) rotate(${rot}) scale(0.35)`}
                opacity="0.75"
            >
                <path
                    d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                    fill={c}
                />
                <path
                    d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                    fill="rgba(255,240,160,0.80)"
                />
            </g>
        ))}
        {/* Large central flame */}
        <g transform="translate(0,1) scale(0.78)">
            <path
                d="M0-14 C2-9 10-3 8 5 C12 1 11-6 9-11 C14-1 14 7 9 13 C12 11 11 7 9 8 C11 14 6 18 0 18 C-6 18-11 14-9 8 C-11 7-12 11-9 13 C-14 7-14-1-9-11 C-11-6-12 1-8 5 C-10-3 0-14 0-14Z"
                fill={c}
            />
            <path
                d="M0-3 C1.2 0 5.5 4 4.5 8.5 C6.5 6.5 6.5 2 4.5 0 C5.5 3.5 5.5 8.5 3.5 10.5 C1.5 11.5-1.5 11.5-3.5 10.5 C-5.5 8.5-5.5 3.5-4.5 0 C-6.5 2-6.5 6.5-4.5 8.5 C-3.5 4 0-3 0-3Z"
                fill="rgba(255,240,160,0.85)"
            />
            <ellipse
                cx="0"
                cy="-6"
                rx="1.8"
                ry="3.5"
                fill="rgba(255,255,220,0.6)"
            />
        </g>
    </g>
);

// ── XP: Two Bolts (Scholar) ───────────────────────────────────────────────────
const TwoLightningIcon = ({ c }) => (
    <g>
        {[
            [-7, 0],
            [7, 0],
        ].map(([tx, ty], i) => (
            <g key={i} transform={`translate(${tx},${ty}) scale(0.65)`}>
                <path
                    d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
                    fill="rgba(0,0,0,0.35)"
                    transform="translate(1.5,1.5)"
                />
                <path d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z" fill={c} />
                <path
                    d="M5-14 L-7 2 L-2 2"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
                <circle cx="3" cy="-11" r="1.5" fill="rgba(255,255,255,0.35)" />
            </g>
        ))}
    </g>
);

// ── XP: Three Bolts in fan (Wizard) ──────────────────────────────────────────
// Left & right bolts are slightly rotated outward; centre bolt is full-size
const ThreeLightningIcon = ({ c }) => (
    <g>
        {/* Left bolt – rotated outward */}
        <g transform="translate(-9,0) rotate(-14) scale(0.56)">
            <path
                d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
                fill="rgba(0,0,0,0.30)"
                transform="translate(1.5,1.5)"
            />
            <path
                d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
                fill={c}
                opacity="0.85"
            />
        </g>
        {/* Centre bolt – upright & largest */}
        <g transform="translate(0,0) scale(0.68)">
            <path
                d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
                fill="rgba(0,0,0,0.35)"
                transform="translate(1.5,1.5)"
            />
            <path d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z" fill={c} />
            <path
                d="M5-14 L-7 2 L-2 2"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.3"
                strokeLinecap="round"
            />
            <circle cx="3" cy="-11" r="1.5" fill="rgba(255,255,255,0.45)" />
        </g>
        {/* Right bolt – rotated outward */}
        <g transform="translate(9,0) rotate(14) scale(0.56)">
            <path
                d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
                fill="rgba(0,0,0,0.30)"
                transform="translate(1.5,1.5)"
            />
            <path
                d="M5-14 L-7 2 L2 2 L-5 14 L11 0 L2 0 Z"
                fill={c}
                opacity="0.85"
            />
        </g>
    </g>
);

// ── Perfect: Target + embedded arrow (Conqueror) ──────────────────────────────
const ConquerorTargetIcon = ({ c }) => (
    <g>
        <circle
            r="14"
            fill="none"
            stroke={c}
            strokeWidth="1.1"
            opacity="0.35"
        />
        <circle r="10" fill="none" stroke={c} strokeWidth="1.7" />
        <circle r="5.5" fill="none" stroke={c} strokeWidth="1.4" />
        <circle r="2.5" fill={c} />
        <circle r="1" fill="rgba(255,255,255,0.55)" />
        {/* Arrow shaft from upper-right toward centre */}
        <line
            x1="13"
            y1="-13"
            x2="3.5"
            y2="-3.5"
            stroke={c}
            strokeWidth="2.2"
            strokeLinecap="round"
        />
        {/* Arrowhead */}
        <polygon points="13,-13 7,-14 14,-7" fill={c} />
        {/* Arrow nock (tail feathers) */}
        <line
            x1="13"
            y1="-13"
            x2="16"
            y2="-16"
            stroke={c}
            strokeWidth="1.4"
            strokeLinecap="round"
        />
        <line
            x1="13"
            y1="-13"
            x2="16"
            y2="-10"
            stroke={c}
            strokeWidth="1.4"
            strokeLinecap="round"
        />
    </g>
);

// ── Perfect: Target + crown (Regal) ──────────────────────────────────────────
const RegalTargetIcon = ({ c }) => (
    <g>
        <circle
            r="12.5"
            fill="none"
            stroke={c}
            strokeWidth="1.1"
            opacity="0.35"
        />
        <circle r="8.5" fill="none" stroke={c} strokeWidth="1.7" />
        <circle r="4.5" fill="none" stroke={c} strokeWidth="1.4" />
        <circle r="2" fill={c} />
        <circle r="0.85" fill="rgba(255,255,255,0.55)" />
        {/* Crown base band */}
        <rect
            x="-7"
            y="-18.5"
            width="14"
            height="2.5"
            rx="0.8"
            fill={c}
            opacity="0.75"
        />
        {/* Crown points: left, centre, right */}
        <polyline
            points="-7,-16 -7,-23 -3.5,-19.5 0,-24 3.5,-19.5 7,-23 7,-16"
            fill={c}
            stroke={c}
            strokeWidth="0.5"
            strokeLinejoin="round"
        />
        {/* Crown gem highlights */}
        <circle cx="-3.5" cy="-20.5" r="1" fill="rgba(255,255,255,0.65)" />
        <circle cx="0" cy="-22" r="1.1" fill="rgba(255,255,255,0.75)" />
        <circle cx="3.5" cy="-20.5" r="1" fill="rgba(255,255,255,0.65)" />
    </g>
);

// ─── Category & per-badge Icons ───────────────────────────────────────────────

// ── Words: Seedling — stem + two offset leaves ────────────────────────────────
const SeedlingIcon = ({ c }) => (
    <g>
        <line
            x1="0"
            y1="15"
            x2="0"
            y2="-2"
            stroke={c}
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        {/* Left leaf */}
        <path d="M0 3 C-10-3 -13-13 -4-15 C3-11 0 3 0 3Z" fill={c} />
        {/* Right leaf */}
        <path
            d="M0-1 C10-7 13-17 4-19 C-3-15 0-1 0-1Z"
            fill={c}
            opacity="0.78"
        />
        <path
            d="M-2 1 C-6-3 -7-9 -4-12"
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="1"
            strokeLinecap="round"
        />
    </g>
);

// ── Words: Bloom — 5-petal flower ────────────────────────────────────────────
const BloomIcon = ({ c }) => (
    <g>
        {[0, 72, 144, 216, 288].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
                <ellipse cx="0" cy="-9" rx="4" ry="7" fill={c} opacity="0.82" />
            </g>
        ))}
        <circle r="5.5" fill={c} />
        <circle r="2.2" fill="rgba(255,255,200,0.72)" />
    </g>
);

// ── Words: Open Book (Word Scholar) ──────────────────────────────────────────
const OpenBookIcon = ({ c }) => (
    <g>
        <path d="M0-11 L-14-7 L-14 13 L0 11 Z" fill={c} opacity="0.68" />
        <path d="M0-11 L14-7 L14 13 L0 11 Z" fill={c} />
        <line
            x1="0"
            y1="-11"
            x2="0"
            y2="11"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="1.5"
        />
        {/* Text lines on right page */}
        {[-3, 1, 5, 9].map((y, i) => (
            <line
                key={i}
                x1="3"
                y1={y}
                x2={i === 3 ? 10 : 13}
                y2={y}
                stroke="rgba(0,0,0,0.28)"
                strokeWidth="1.3"
            />
        ))}
    </g>
);

// ── Words: Stacked Books (Lexicon) ────────────────────────────────────────────
const StackedBooksIcon = ({ c }) => (
    <g>
        <rect
            x="-13"
            y="5"
            width="26"
            height="9"
            rx="1.5"
            fill={c}
            opacity="0.55"
        />
        <rect
            x="-11"
            y="-5"
            width="22"
            height="9"
            rx="1.5"
            fill={c}
            opacity="0.75"
        />
        <rect x="-9" y="-14" width="18" height="9" rx="1.5" fill={c} />
        {/* Spine lines */}
        <line
            x1="-6"
            y1="-14"
            x2="-6"
            y2="-5"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="1.5"
        />
        <line
            x1="-7"
            y1="-5"
            x2="-7"
            y2="5"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="1.5"
        />
        <line
            x1="-9"
            y1="5"
            x2="-9"
            y2="14"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="1.5"
        />
        {/* Highlight on top book */}
        <rect
            x="-9"
            y="-14"
            width="18"
            height="3"
            rx="1.5"
            fill="rgba(255,255,255,0.18)"
        />
    </g>
);

// ── Words: Book + starburst (Polymath) ────────────────────────────────────────
const PolymathIcon = ({ c }) => (
    <g>
        {/* Radiating lines behind book */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
                <line
                    x1="0"
                    y1="-7"
                    x2="0"
                    y2={i % 2 === 0 ? -17 : -13}
                    stroke={c}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                />
            </g>
        ))}
        {/* Book */}
        <path d="M0-9 L-10-6 L-10 10 L0 9 Z" fill={c} opacity="0.7" />
        <path d="M0-9 L10-6 L10 10 L0 9 Z" fill={c} />
        <line
            x1="0"
            y1="-9"
            x2="0"
            y2="9"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.2"
        />
        <circle cx="0" cy="1" r="3" fill="rgba(255,255,200,0.5)" />
    </g>
);

// ── Sessions: Rookie — single bold checkmark in circle ───────────────────────
const CheckmarkIcon = ({ c }) => (
    <g>
        <circle r="14" fill="none" stroke={c} strokeWidth="2.2" opacity="0.5" />
        <path
            d="M-7 0 L-2 6.5 L8-7"
            fill="none"
            stroke={c}
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>
);

// ── Sessions: Veteran — shield with star ─────────────────────────────────────
const ShieldStarIcon = ({ c }) => (
    <g>
        <path
            d="M0-15 L13-8 L13 4 C13 12 7 18 0 20 C-7 18-13 12-13 4 L-13-8 Z"
            fill={c}
            opacity="0.88"
        />
        {/* 5-point star */}
        <path
            d="M0-8 L2-2 L8-2 L3 2 L5 8 L0 4 L-5 8 L-3 2 L-8-2 L-2-2 Z"
            fill="rgba(255,255,200,0.82)"
        />
        {/* Edge highlight */}
        <path d="M0-15 L13-8 L9-6" fill="rgba(255,255,255,0.2)" />
    </g>
);

// ── Sessions: Legend — trophy ─────────────────────────────────────────────────
const TrophyIcon = ({ c }) => (
    <g>
        {/* Cup body */}
        <path d="M-9-13 L-9 5 C-9 12 9 12 9 5 L9-13 Z" fill={c} />
        {/* Handles */}
        <path
            d="M-9-5 C-17-5 -17 5 -9 5"
            fill="none"
            stroke={c}
            strokeWidth="2.8"
            strokeLinecap="round"
        />
        <path
            d="M9-5 C17-5 17 5 9 5"
            fill="none"
            stroke={c}
            strokeWidth="2.8"
            strokeLinecap="round"
        />
        {/* Stem + base */}
        <rect x="-3" y="12" width="6" height="5" fill={c} />
        <rect x="-8" y="17" width="16" height="2.5" rx="1.2" fill={c} />
        {/* Star on cup */}
        <path
            d="M0-6 L1.5-1 L6.5-1 L2.5 2 L4 7.5 L0 4.5 L-4 7.5 L-2.5 2 L-6.5-1 L-1.5-1 Z"
            fill="rgba(255,255,200,0.72)"
        />
        {/* Cup highlight */}
        <path d="M-9-13 L9-13 L9-8" fill="rgba(255,255,255,0.18)" />
    </g>
);

// ── Night: Crescent moon + stars ─────────────────────────────────────────────
const MoonIcon = ({ c }) => (
    <g>
        {/* Crescent: big circle minus offset circle */}
        <path d="M6-14 A15 15 0 1 0 6 14 A11 11 0 1 1 6-14Z" fill={c} />
        {/* Stars */}
        {[
            [13, -10, 1.8],
            [15, 1, 1.2],
            [11, 11, 1.6],
        ].map(([x, y, r], i) => (
            <g key={i}>
                <circle cx={x} cy={y} r={r} fill={c} opacity="0.75" />
                <circle
                    cx={x}
                    cy={y}
                    r={r * 0.45}
                    fill="rgba(255,255,255,0.6)"
                />
            </g>
        ))}
        {/* Moon surface glint */}
        <ellipse
            cx="-3"
            cy="-8"
            rx="2.5"
            ry="1.2"
            fill="rgba(255,255,255,0.22)"
            transform="rotate(-30 -3 -8)"
        />
    </g>
);

// ── Mastery: Initiate — graduation cap ───────────────────────────────────────
const GradCapIcon = ({ c }) => (
    <g>
        <polygon points="0,-15 17,-5 0,5 -17,-5" fill={c} />
        <polygon points="0,-15 17,-5 8,-1" fill="rgba(255,255,255,0.18)" />
        <rect
            x="-8"
            y="5"
            width="16"
            height="10"
            rx="1.2"
            fill={c}
            opacity="0.82"
        />
        <line
            x1="17"
            y1="-5"
            x2="17"
            y2="7"
            stroke={c}
            strokeWidth="2.2"
            strokeLinecap="round"
        />
        <circle cx="17" cy="9" r="2.8" fill={c} />
    </g>
);

// ── Mastery: Veteran — cap + ribbon medal ─────────────────────────────────────
const GradCapRibbonIcon = ({ c }) => (
    <g>
        <polygon points="0,-14 15,-5 0,4 -15,-5" fill={c} />
        <rect
            x="-7"
            y="4"
            width="14"
            height="8"
            rx="1.2"
            fill={c}
            opacity="0.8"
        />
        <line
            x1="15"
            y1="-5"
            x2="15"
            y2="5"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="15" cy="7" r="2.5" fill={c} />
        {/* Ribbon below cap */}
        <path
            d="M-6 13 L0 10 L6 13 L3 18 L0 15 L-3 18 Z"
            fill={c}
            opacity="0.85"
        />
        <circle cx="0" cy="11" r="3.5" fill={c} />
        <circle cx="0" cy="11" r="1.8" fill="rgba(255,255,200,0.75)" />
    </g>
);

// ── Mastery: Champion — cap + starburst crown ─────────────────────────────────
const GradCapStarIcon = ({ c }) => (
    <g>
        {/* Star burst above cap */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
                <line
                    x1="0"
                    y1="-16"
                    x2="0"
                    y2={i % 2 === 0 ? -22 : -19}
                    stroke={c}
                    strokeWidth={i % 2 === 0 ? 2.2 : 1.4}
                    strokeLinecap="round"
                    opacity="0.8"
                />
            </g>
        ))}
        <circle cx="0" cy="0" r="3.5" fill={c} opacity="0.55" />
        <polygon points="0,-12 14,-4 0,4 -14,-4" fill={c} />
        <rect
            x="-7"
            y="4"
            width="14"
            height="9"
            rx="1.2"
            fill={c}
            opacity="0.8"
        />
        <line
            x1="14"
            y1="-4"
            x2="14"
            y2="6"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="14" cy="8" r="2.5" fill={c} />
    </g>
);

// ── Mastery: Flawless — 8-pointed radiant star ────────────────────────────────
const RadiantStarIcon = ({ c }) => (
    <g>
        {[0, 45, 90, 135].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
                <line
                    x1="0"
                    y1="-6.5"
                    x2="0"
                    y2="-17"
                    stroke={c}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                <line
                    x1="0"
                    y1="6.5"
                    x2="0"
                    y2="17"
                    stroke={c}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
            </g>
        ))}
        {[22.5, 67.5, 112.5, 157.5].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
                <line
                    x1="0"
                    y1="-6"
                    x2="0"
                    y2="-13"
                    stroke={c}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.7"
                />
                <line
                    x1="0"
                    y1="6"
                    x2="0"
                    y2="13"
                    stroke={c}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.7"
                />
            </g>
        ))}
        <circle r="6" fill={c} />
        <circle r="2.8" fill="rgba(255,255,220,0.82)" />
    </g>
);

// ── Dedication: Weekend Warrior — shield with sun+moon halves ─────────────────
const WeekendWarriorIcon = ({ c }) => (
    <g>
        <path
            d="M0-15 L13-8 L13 4 C13 12 7 18 0 20 C-7 18-13 12-13 4 L-13-8 Z"
            fill={c}
            opacity="0.85"
        />
        {/* Divider line */}
        <line
            x1="0"
            y1="-12"
            x2="0"
            y2="18"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.2"
        />
        {/* Sun (left half) */}
        <circle cx="-4.5" cy="3" r="4" fill="rgba(255,220,60,0.88)" />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <g key={i} transform={`rotate(${deg}) translate(-4.5,3)`}>
                <line
                    x1="0"
                    y1="5"
                    x2="0"
                    y2="7.5"
                    stroke="rgba(255,220,60,0.9)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
            </g>
        ))}
        {/* Moon (right half) */}
        <path
            d="M5.5-1 A5 5 0 1 0 5.5 8 A3.5 3.5 0 1 1 5.5-1Z"
            fill="rgba(180,200,255,0.9)"
        />
    </g>
);

// ── Dedication: Comeback Kid — circular return arrow ─────────────────────────
const ComebackIcon = ({ c }) => (
    <g>
        <path
            d="M10-12 A14 14 0 1 0 14 3"
            fill="none"
            stroke={c}
            strokeWidth="3.5"
            strokeLinecap="round"
        />
        {/* Arrowhead */}
        <polygon points="14,3 7,-4 21,0" fill={c} />
        {/* Central spark */}
        <circle cx="0" cy="1" r="4.5" fill={c} opacity="0.55" />
        <circle cx="0" cy="1" r="2" fill="rgba(255,255,200,0.75)" />
    </g>
);

// ── Dedication: Monthly Devotee — calendar with check ────────────────────────
const CalendarIcon = ({ c }) => (
    <g>
        <rect
            x="-13"
            y="-13"
            width="26"
            height="26"
            rx="2.5"
            fill={c}
            opacity="0.82"
        />
        {/* Header band */}
        <rect x="-13" y="-13" width="26" height="7.5" rx="2.5" fill={c} />
        {/* Binding rings */}
        <rect x="-6" y="-16" width="2.8" height="6.5" rx="1.4" fill={c} />
        <rect x="3.2" y="-16" width="2.8" height="6.5" rx="1.4" fill={c} />
        {/* Day dots grid */}
        {[
            [-7, -2],
            [0, -2],
            [7, -2],
            [-7, 4],
            [0, 4],
            [7, 4],
        ].map(([x, y], i) => (
            <circle
                key={i}
                cx={x}
                cy={y}
                r="2.2"
                fill="rgba(255,255,255,0.58)"
            />
        ))}
        {/* Checkmark across bottom row */}
        <path
            d="M-5 9 L-1 13 L6 6"
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>
);

// ── Dedication: Century Club — milestone flag ─────────────────────────────────
const MilestoneFlagIcon = ({ c }) => (
    <g>
        <line
            x1="-3"
            y1="15"
            x2="-3"
            y2="-14"
            stroke={c}
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <path d="M-3-14 L16-7 L-3 0 Z" fill={c} />
        {/* Stars on flag */}
        <circle cx="5" cy="-10" r="1.8" fill="rgba(255,255,255,0.72)" />
        <circle cx="11" cy="-7" r="1.2" fill="rgba(255,255,255,0.5)" />
        <circle cx="5" cy="-4" r="1.5" fill="rgba(255,255,255,0.58)" />
        {/* Base */}
        <rect
            x="-9"
            y="13"
            width="12"
            height="3"
            rx="1.5"
            fill={c}
            opacity="0.7"
        />
    </g>
);

// ── Dedication: List Finisher — checkered flag ────────────────────────────────
const CheckeredFlagIcon = ({ c }) => {
    const cols = 3,
        rows = 3,
        fw = 20,
        fh = 15;
    const cw = fw / cols,
        ch = fh / rows;
    return (
        <g>
            <line
                x1="-4"
                y1="15"
                x2="-4"
                y2="-14"
                stroke={c}
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <rect
                x="-4"
                y="-14"
                width={fw}
                height={fh}
                rx="1"
                fill="rgba(0,0,0,0.18)"
            />
            {Array.from({ length: rows }).flatMap((_, r) =>
                Array.from({ length: cols }).map((__, col) => (
                    <rect
                        key={`${r}-${col}`}
                        x={-4 + col * cw}
                        y={-14 + r * ch}
                        width={cw}
                        height={ch}
                        fill={(r + col) % 2 === 0 ? c : "rgba(0,0,0,0.38)"}
                    />
                )),
            )}
            <rect
                x="-9"
                y="13"
                width="12"
                height="3"
                rx="1.5"
                fill={c}
                opacity="0.7"
            />
        </g>
    );
};
const ICONS = {
    // Category fallbacks
    streak: FlameIcon,
    xp: LightningIcon,
    morning: SunriseIcon,
    perfect: TargetIcon,
    words: OpenBookIcon,
    sessions: CheckmarkIcon,
    night: MoonIcon,
    mastery: GradCapIcon,
    dedication: CalendarIcon,
    // Per-badge unique icons
    streak_bronze: FlameIcon,
    streak_silver: TwoFlameIcon,
    streak_gold: ThreeFlameIcon,
    streak_platinum: FourFlameIcon,
    streak_diamond: DiamondFlameIcon,
    xp_learner: LightningIcon,
    xp_scholar: TwoLightningIcon,
    xp_wizard: ThreeLightningIcon,
    explorer: SunriseIcon,
    perfect_sharpshooter: TargetIcon,
    perfect_conqueror: ConquerorTargetIcon,
    perfect_regal: RegalTargetIcon,
    words_seedling: SeedlingIcon,
    words_bloom: BloomIcon,
    words_scholar: OpenBookIcon,
    words_lexicon: StackedBooksIcon,
    words_polymath: PolymathIcon,
    sessions_rookie: CheckmarkIcon,
    sessions_veteran: ShieldStarIcon,
    sessions_legend: TrophyIcon,
    night_owl: MoonIcon,
    mastery_initiate: GradCapIcon,
    mastery_veteran: GradCapRibbonIcon,
    mastery_champion: GradCapStarIcon,
    mastery_flawless: RadiantStarIcon,
    dedication_weekend_warrior: WeekendWarriorIcon,
    dedication_comeback_kid: ComebackIcon,
    dedication_30_days: CalendarIcon,
    dedication_100_days: MilestoneFlagIcon,
    dedication_list_finisher: CheckeredFlagIcon,
};

// ─── Tier Indicators (escalating gem/star shapes) ────────────────────────────
function TierIndicator({ tier: n, earned, tierData }) {
    const spacing = 9.5;
    const startX = 40 - ((n - 1) * spacing) / 2;
    const y = 87.5;
    const col = earned ? tierData.dot : "#555";
    const op = earned ? 1 : 0.28;

    return (
        <g opacity={op}>
            {Array.from({ length: n }).map((_, i) => {
                const cx = startX + i * spacing;
                // Tier 1–2: filled circle
                if (n <= 2)
                    return <circle key={i} cx={cx} cy={y} r={3.2} fill={col} />;
                // Tier 3: 4-pointed star
                if (n === 3)
                    return (
                        <polygon
                            key={i}
                            points={`${cx},${y - 5} ${cx + 1.8},${y} ${cx},${y + 5} ${cx - 1.8},${y}`}
                            fill={col}
                        />
                    );
                // Tier 4: diamond with inner highlight
                if (n === 4)
                    return (
                        <g key={i} transform={`translate(${cx},${y})`}>
                            <polygon
                                points="0,-5 3.8,0 0,5 -3.8,0"
                                fill={col}
                            />
                            <polygon
                                points="0,-5 3.8,0 0,5 -3.8,0"
                                fill="none"
                                stroke="rgba(255,255,255,0.35)"
                                strokeWidth="0.9"
                            />
                            <circle
                                cx="0"
                                cy="-1.5"
                                r="1"
                                fill="rgba(255,255,255,0.4)"
                            />
                        </g>
                    );
                // Tier 5: 6-pointed star (two overlapping diamonds)
                return (
                    <g
                        key={i}
                        transform={`translate(${cx},${y})`}
                        opacity={0.95}
                    >
                        <polygon
                            points="0,-5.5 1.8,0 0,5.5 -1.8,0"
                            fill={col}
                        />
                        <polygon
                            points="-4.5,2 0,0 4.5,2 0,-3.5"
                            fill={col}
                            opacity="0.75"
                        />
                        <circle
                            cx="0"
                            cy="-2"
                            r="1"
                            fill="rgba(255,255,255,0.5)"
                        />
                    </g>
                );
            })}
        </g>
    );
}

// ─── Category Background Decoration (clipped to inner hex, earned only) ──────
function CategoryBg({ category, color }) {
    const op = 0.13;
    switch (category) {
        case "streak":
            // Three vertical heat-wave strokes
            return (
                <g opacity={op}>
                    {[-12, 0, 12].map((ox, i) => (
                        <path
                            key={i}
                            d={`M${40 + ox} 68 Q${41 + ox} 55 ${40 + ox} 44`}
                            stroke={color}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                        />
                    ))}
                </g>
            );
        case "xp":
            // Large X shape
            return (
                <g opacity={op}>
                    <line
                        x1="24"
                        y1="28"
                        x2="56"
                        y2="62"
                        stroke={color}
                        strokeWidth="13"
                        strokeLinecap="round"
                    />
                    <line
                        x1="56"
                        y1="28"
                        x2="24"
                        y2="62"
                        stroke={color}
                        strokeWidth="13"
                        strokeLinecap="round"
                    />
                </g>
            );
        case "morning":
            // Nested sunrise arcs
            return (
                <g opacity={op}>
                    {[22, 16, 10].map((r, i) => (
                        <path
                            key={i}
                            d={`M ${40 - r} 50 A${r} ${r} 0 0 1 ${40 + r} 50`}
                            stroke={color}
                            strokeWidth="5"
                            fill="none"
                        />
                    ))}
                </g>
            );
        case "perfect":
            // Concentric ring outlines
            return (
                <g opacity={op}>
                    <circle
                        cx="40"
                        cy="44"
                        r="22"
                        stroke={color}
                        strokeWidth="5"
                        fill="none"
                    />
                    <circle
                        cx="40"
                        cy="44"
                        r="14"
                        stroke={color}
                        strokeWidth="5"
                        fill="none"
                    />
                </g>
            );
        case "words":
            // Diagonal book-page lines
            return (
                <g opacity={op}>
                    {[-8, 0, 8].map((ox, i) => (
                        <line
                            key={i}
                            x1={40 + ox}
                            y1="22"
                            x2={40 + ox}
                            y2="66"
                            stroke={color}
                            strokeWidth="9"
                            strokeLinecap="round"
                        />
                    ))}
                </g>
            );
        case "sessions":
            // Large bold checkmark
            return (
                <g opacity={op}>
                    <path
                        d="M22 52 L34 64 L58 30"
                        stroke={color}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
            );
        case "night":
            // Crescent moon silhouette
            return (
                <g opacity={op}>
                    <circle cx="40" cy="44" r="18" fill={color} />
                    <circle cx="48" cy="38" r="14" fill="black" opacity="0.9" />
                </g>
            );
        case "mastery":
            // Graduation cap brim
            return (
                <g opacity={op}>
                    <polygon points="40,26 62,37 40,48 18,37" fill={color} />
                    <rect
                        x="30"
                        y="48"
                        width="20"
                        height="12"
                        fill={color}
                        opacity="0.65"
                    />
                </g>
            );
        case "dedication":
            // Calendar grid squares
            return (
                <g opacity={op}>
                    {[
                        [0, 0],
                        [1, 0],
                        [2, 0],
                        [0, 1],
                        [1, 1],
                        [2, 1],
                    ].map(([col, row], i) => (
                        <rect
                            key={i}
                            x={22 + col * 10}
                            y={34 + row * 10}
                            width="8"
                            height="8"
                            rx="1.5"
                            fill={color}
                        />
                    ))}
                </g>
            );
        default:
            return null;
    }
}

// ─── Platinum: radial spokes + rings ────────────────────────────────────────
function PlatinumPattern({ color }) {
    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    return (
        <g fill="none" stroke={color} strokeWidth="0.75" opacity="0.22">
            {angles.map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                return (
                    <line
                        key={i}
                        x1="40"
                        y1="44"
                        x2={40 + Math.cos(a) * 25}
                        y2={44 + Math.sin(a) * 25}
                    />
                );
            })}
            <circle cx="40" cy="44" r="17" opacity="0.6" />
            <circle cx="40" cy="44" r="9" opacity="0.6" />
        </g>
    );
}

// ─── Diamond: edge sparkles ──────────────────────────────────────────────────
function DiamondSparkles({ color }) {
    // 4-point star sparkles placed near inner hex corners
    const sparks = [
        [-23, -14, 6],
        [24, -15, 5.5],
        [-25, 8, 5],
        [23, 6, 5.5],
        [0, -26, 6.5],
    ];
    return (
        <g fill={color} opacity="0.6">
            {sparks.map(([x, y, r], i) => (
                <g key={i} transform={`translate(${40 + x},${44 + y})`}>
                    <polygon
                        points={`0,${-r} ${r * 0.35},0 0,${r} ${-r * 0.35},0`}
                    />
                    <polygon
                        points={`${-r},0 0,${r * 0.35} ${r},0 0,${-r * 0.35}`}
                        opacity="0.55"
                    />
                </g>
            ))}
        </g>
    );
}

// ─── Diamond: crystal facet lines inside inner hex ──────────────────────────
function DiamondFacets({ color }) {
    // Facet lines radiating from centre to edges of inner hex
    const edges = [
        [40, 14], // top
        [66, 29], // top-right
        [66, 59], // bottom-right
        [40, 74], // bottom
        [14, 59], // bottom-left
        [14, 29], // top-left
    ];
    return (
        <g stroke={color} strokeWidth="0.6" opacity="0.18" fill="none">
            {edges.map(([ex, ey], i) => (
                <line key={i} x1="40" y1="44" x2={ex} y2={ey} />
            ))}
            {/* Horizontal & vertical axis */}
            <line x1="14" y1="44" x2="66" y2="44" />
            <circle cx="40" cy="44" r="12" opacity="0.5" />
        </g>
    );
}

// ─── Single Badge SVG ────────────────────────────────────────────────────────
export function BadgeSVG({ badge, earned, size = 80 }) {
    const tier = TIERS[badge.tier];
    const cat = CATS[badge.category];
    const Icon = ICONS[badge.key] || ICONS[badge.category];
    const uid = badge.key; // unique prefix so gradient IDs don't clash

    const iconColor = earned ? cat.color : "#545454";

    return (
        <svg
            viewBox="0 0 80 92"
            width={size}
            height={size * 1.15}
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible", display: "block" }}
        >
            <defs>
                {/* ── Metallic ring: diagonal sweep highlight→mid→deep shadow ── */}
                <linearGradient
                    id={`rg-${uid}`}
                    x1="10%"
                    y1="0%"
                    x2="90%"
                    y2="100%"
                >
                    <stop
                        offset="0%"
                        stopColor={earned ? tier.ringGrad[0] : "#888"}
                    />
                    <stop
                        offset="42%"
                        stopColor={earned ? tier.ringGrad[1] : "#444"}
                    />
                    <stop
                        offset="100%"
                        stopColor={earned ? tier.ringGrad[2] : "#222"}
                    />
                </linearGradient>

                {/* ── Inner body: radial from top-centre (simulates overhead light) ── */}
                <radialGradient
                    id={`bg-${uid}`}
                    cx="40"
                    cy="24"
                    r="40"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        offset="0%"
                        stopColor={earned ? tier.bodyShine : "#2E2E2E"}
                    />
                    <stop
                        offset="100%"
                        stopColor={earned ? tier.body : "#0A0A0A"}
                    />
                </radialGradient>

                {/* ── Category icon glow pool ── */}
                <radialGradient
                    id={`cg-${uid}`}
                    cx="40"
                    cy="44"
                    r="22"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        offset="0%"
                        stopColor={cat.color}
                        stopOpacity={earned ? "0.32" : "0"}
                    />
                    <stop offset="100%" stopColor={cat.color} stopOpacity="0" />
                </radialGradient>

                {/* ── Clip path to keep inner decorations within inner hex ── */}
                <clipPath id={`cp-${uid}`}>
                    <polygon points={INNER_PTS} />
                </clipPath>
            </defs>

            {/* ── 1. Ambient halo (earned): expanded hex with tier colour ── */}
            {earned && (
                <polygon points={HALO_PTS} fill={tier.halo} opacity="0.14" />
            )}

            {/* ── 2. Outer metallic ring ── */}
            <polygon
                points={OUTER_PTS}
                fill={`url(#rg-${uid})`}
                opacity={earned ? 1 : 0.3}
            />

            {/* ── 3. Ring top-left shine facet ── */}
            {earned && (
                <polygon points={SHINE_PTS} fill={tier.shine} opacity="0.46" />
            )}

            {/* ── 4. Thin dark separator between ring & body (depth illusion) ── */}
            <polygon
                points={INNER_PTS}
                fill="none"
                stroke={earned ? tier.ringGrad[2] : "#111"}
                strokeWidth="1.2"
                opacity="0.5"
            />

            {/* ── 5. Inner body with radial gradient ── */}
            <polygon points={INNER_PTS} fill={`url(#bg-${uid})`} />

            {/* ── 6. Inner body: top-left specular edge (3-D lift) ── */}
            {earned && (
                <polyline
                    points={BODY_SHINE_PTS}
                    fill="none"
                    stroke={tier.shine}
                    strokeWidth="1.3"
                    opacity="0.55"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}

            {/* ── 7. Inner body: bottom-right shadow edge ── */}
            <polyline
                points={BODY_SHADOW_PTS}
                fill="none"
                stroke={earned ? tier.ringGrad[2] : "#0A0A0A"}
                strokeWidth="0.8"
                opacity="0.35"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* ── 8. Category background pattern (clipped, earned only) ── */}
            {earned && (
                <g clipPath={`url(#cp-${uid})`}>
                    <CategoryBg category={badge.category} color={cat.color} />
                </g>
            )}

            {/* ── 9. Tier-specific inner overlays ── */}
            {badge.tier === 4 && earned && (
                <g clipPath={`url(#cp-${uid})`}>
                    <PlatinumPattern color={tier.accent} />
                </g>
            )}
            {badge.tier === 5 && earned && (
                <g clipPath={`url(#cp-${uid})`}>
                    <DiamondFacets color={tier.accent} />
                </g>
            )}

            {/* ── 10. Icon glow pool ── */}
            <circle cx="40" cy="44" r="22" fill={`url(#cg-${uid})`} />

            {/* ── 11. Category icon ── */}
            <g transform="translate(40,44)">
                <Icon c={iconColor} />
            </g>

            {/* ── 12. Diamond sparkles (outside but overlapping the badge edge) ── */}
            {badge.tier === 5 && earned && (
                <DiamondSparkles color={tier.accent} />
            )}

            {/* ── 13. Tier indicator (gems/stars below hex) ── */}
            <TierIndicator tier={badge.tier} earned={earned} tierData={tier} />

            {/* ── 14. Earned: green checkmark badge ── */}
            {earned && (
                <g transform="translate(69,12)">
                    <circle r="9.5" fill="#14532D" />
                    <circle r="8" fill="#22C55E" />
                    <path
                        d="M-3.5 0 L-1 3.5 L4.5-3.5"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
            )}

            {/* ── 15. Locked: padlock overlay ── */}
            {!earned && (
                <g transform="translate(40,44)" opacity="0.68">
                    <rect
                        x="-8"
                        y="-1.5"
                        width="16"
                        height="13"
                        rx="2.5"
                        fill="#555"
                    />
                    <path
                        d="M-5-1.5 Q-5-10 0-10 Q5-10 5-1.5"
                        fill="none"
                        stroke="#555"
                        strokeWidth="2.3"
                    />
                    <circle cx="0" cy="5" r="2.2" fill="#282828" />
                    <line
                        x1="0"
                        y1="5"
                        x2="0"
                        y2="8.5"
                        stroke="#282828"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </g>
            )}
        </svg>
    );
}

// ─── Badge Card (name + desc below badge) ────────────────────────────────────
function BadgeCard({ badge, earned, onToggle }) {
    const [hovered, setHovered] = useState(false);
    const tier = TIERS[badge.tier];

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
                transform: hovered ? "translateY(-6px) scale(1.04)" : "none",
                transition: "transform 0.18s ease",
                userSelect: "none",
            }}
        >
            <BadgeSVG badge={badge} earned={earned} size={76} />
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        lineHeight: "1.3",
                        color: earned
                            ? tier.ring
                            : "var(--color-text-secondary, #888)",
                        transition: "color 0.2s",
                    }}
                >
                    {badge.name}
                </div>
                <div
                    style={{
                        fontSize: "9.5px",
                        color: "var(--color-text-secondary, #888)",
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

// ─── Category Sections ───────────────────────────────────────────────────────
const SECTIONS = [
    { key: "streak", label: "Streak", icon: "🔥" },
    { key: "xp", label: "XP", icon: "⚡" },
    { key: "morning", label: "Explorer", icon: "🌅" },
    { key: "perfect", label: "Perfect", icon: "🎯" },
    { key: "words", label: "Words", icon: "📖" },
    { key: "sessions", label: "Sessions", icon: "✅" },
    { key: "night", label: "Night", icon: "🌙" },
    { key: "mastery", label: "Mastery", icon: "🎓" },
    { key: "dedication", label: "Dedication", icon: "📅" },
];

const DEFAULT_EARNED = {
    xp_learner: true,
    xp_scholar: true,
    xp_wizard: true,
    explorer: true,
    words_seedling: true,
    sessions_rookie: true,
    mastery_initiate: true,
    mastery_flawless: true,
    dedication_comeback_kid: true,
};

// ─── Main Gallery ────────────────────────────────────────────────────────────
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
                background: "var(--color-background-tertiary, #1a1a2e)",
                minHeight: "100vh",
                padding: "24px 20px",
                fontFamily: "var(--font-sans, system-ui)",
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
                            fontWeight: "600",
                            margin: 0,
                            color: "var(--color-text-primary, #fff)",
                        }}
                    >
                        Achievement Badges
                    </h1>
                    <p
                        style={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary, #888)",
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
                    background: "var(--color-border-tertiary, #333)",
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

            {/* Badge sections */}
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
                                    "0.5px solid var(--color-border-tertiary, #333)",
                            }}
                        >
                            <span style={{ fontSize: "14px" }}>
                                {section.icon}
                            </span>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    color: "var(--color-text-secondary, #888)",
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
                    borderTop: "0.5px solid var(--color-border-tertiary, #333)",
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
                        color: "var(--color-text-secondary, #888)",
                        cursor: "pointer",
                    }}
                >
                    {allEarned ? "Reset all badges" : "Preview all earned"} ↗
                </button>
            </div>
        </div>
    );
}
