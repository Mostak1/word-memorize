import React from "react";

/**
 * FlameVisual - A premium, highly animated dynamic flame component.
 *
 * Props:
 * - isBroken: boolean - If true, displays a cold, cracked, smoky ash flame.
 *                       If false, displays a bright, flickering, glowing active flame.
 * - size: number - Size in pixels (defaults to 48).
 * - className: string - Additional class names for wrapper.
 */
export default function FlameVisual({ isBroken = false, size = 48, className = "" }) {
    // Unique ID suffix to ensure safe gradient references even with multiple instances
    const instanceId = React.useId().replace(/:/g, "");

    // Particle settings for active embers
    const embers = [
        { left: "30%", size: "4px", delay: "0.0s", ex: "-18px", ey: "-40px", dur: "1.6s" },
        { left: "50%", size: "3px", delay: "0.4s", ex: "15px", ey: "-50px", dur: "1.8s" },
        { left: "70%", size: "5px", delay: "0.8s", ex: "-12px", ey: "-45px", dur: "1.5s" },
        { left: "45%", size: "3.5px", delay: "1.2s", ex: "8px", ey: "-55px", dur: "2.0s" },
    ];

    // Particle settings for cold smoke puffs
    const smokePuffs = [
        { left: "35%", size: "8px", delay: "0.0s", dur: "2.5s" },
        { left: "55%", size: "12px", delay: "0.6s", dur: "2.8s" },
        { left: "45%", size: "10px", delay: "1.2s", dur: "2.3s" },
        { left: "65%", size: "7px", delay: "1.8s", dur: "2.6s" },
    ];

    return (
        <div
            className={`relative flex items-center justify-center shrink-0 ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            {/* Inject self-contained keyframes and style tokens */}
            <style>{`
                @keyframes fv-flicker-${instanceId} {
                    0%, 100% { transform: scale(1) rotate(0deg) skewX(0deg); }
                    20% { transform: scale(1.06, 0.94) rotate(-1.5deg) skewX(-1.5deg); }
                    40% { transform: scale(0.94, 1.05) rotate(1deg) skewX(1deg); }
                    60% { transform: scale(1.03, 0.97) rotate(-0.5deg) skewX(-0.5deg); }
                    80% { transform: scale(0.97, 1.03) rotate(1.5deg) skewX(1deg); }
                }
                @keyframes fv-float-${instanceId} {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes fv-pulse-glow-${instanceId} {
                    0%, 100% { transform: scale(1); opacity: 0.35; filter: blur(8px); }
                    50% { transform: scale(1.3); opacity: 0.55; filter: blur(12px); }
                }
                @keyframes fv-smoke-${instanceId} {
                    0% { transform: translateX(-50%) translateY(0) scale(0.5); opacity: 0; }
                    25% { opacity: 0.45; }
                    100% { transform: translateX(-50%) translateY(-35px) scale(1.9); opacity: 0; }
                }
                @keyframes fv-ember-${instanceId} {
                    0% { transform: translate(0, 0) scale(1); opacity: 0; }
                    15% { opacity: 0.95; }
                    100% { transform: translate(var(--ex), var(--ey)) scale(0); opacity: 0; }
                }
            `}</style>

            {/* Background glowing aura */}
            {!isBroken ? (
                // Active warm glowing halo
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(239, 68, 68, 0.15) 50%, transparent 75%)",
                        animation: `fv-pulse-glow-${instanceId} 2.5s ease-in-out infinite`,
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                />
            ) : (
                // Extinguished cold grey glow
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(148, 163, 184, 0.15) 0%, transparent 70%)",
                        opacity: 0.6,
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                />
            )}

            {/* Spark Embers (Active State only) */}
            {!isBroken &&
                embers.map((ember, i) => (
                    <div
                        key={`ember-${i}`}
                        style={{
                            position: "absolute",
                            bottom: "22%",
                            left: ember.left,
                            width: ember.size,
                            height: ember.size,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #fef08a 0%, #f97316 100%)",
                            boxShadow: "0 0 6px rgba(253, 224, 71, 0.9), 0 0 12px rgba(249, 115, 22, 0.7)",
                            "--ex": ember.ex,
                            "--ey": ember.ey,
                            animation: `fv-ember-${instanceId} ${ember.dur} cubic-bezier(0.25, 1, 0.50, 1) infinite`,
                            animationDelay: ember.delay,
                            pointerEvents: "none",
                            zIndex: 3,
                        }}
                    />
                ))}

            {/* Smoke Puffs (Lost State only) */}
            {isBroken &&
                smokePuffs.map((puff, i) => (
                    <div
                        key={`smoke-${i}`}
                        style={{
                            position: "absolute",
                            bottom: "35%",
                            left: puff.left,
                            width: puff.size,
                            height: puff.size,
                            borderRadius: "50%",
                            background: "rgba(148, 163, 184, 0.18)",
                            filter: "blur(3px)",
                            animation: `fv-smoke-${instanceId} ${puff.dur} ease-out infinite`,
                            animationDelay: puff.delay,
                            pointerEvents: "none",
                            zIndex: 3,
                        }}
                    />
                ))}

            {/* SVG Flame container */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    animation: !isBroken
                        ? `fv-flicker-${instanceId} 1.8s ease-in-out infinite, fv-float-${instanceId} 3.5s ease-in-out infinite`
                        : "none",
                    transform: isBroken ? "scale(0.82)" : "scale(1)",
                    opacity: isBroken ? 0.55 : 1,
                    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        filter: !isBroken
                            ? "drop-shadow(0 4px 12px rgba(249, 115, 22, 0.55)) drop-shadow(0 0 4px rgba(239, 68, 68, 0.25))"
                            : "none",
                    }}
                >
                    <path
                        d="M50 10 C35 25,15 35,18 58 C20 75,30 90,50 100 C70 90,80 75,82 58 C85 35,65 25,50 10Z"
                        fill={`url(#fv-outer-grad-${instanceId})`}
                    />
                    <path
                        d="M50 38 C42 48,36 58,38 68 C40 78,45 86,50 90 C55 86,60 78,62 68 C64 58,58 48,50 38Z"
                        fill={`url(#fv-inner-grad-${instanceId})`}
                        opacity={!isBroken ? 0.95 : 0.88}
                    />

                    {/* Extinguished Signals (Lost State only) */}
                    {isBroken && (
                        <>
                            {/* X crack lines inside the flame to signal "out of order" / broken */}
                            <line
                                x1="36"
                                y1="46"
                                x2="64"
                                y2="74"
                                stroke="rgba(255, 255, 255, 0.22)"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                            />
                            <line
                                x1="64"
                                y1="46"
                                x2="36"
                                y2="74"
                                stroke="rgba(255, 255, 255, 0.22)"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                            />
                        </>
                    )}

                    <defs>
                        {/* Dynamic Gradients determined by active status */}
                        {!isBroken ? (
                            <>
                                {/* Active vibrant burning outer flame gradient */}
                                <linearGradient
                                    id={`fv-outer-grad-${instanceId}`}
                                    x1="50"
                                    y1="10"
                                    x2="50"
                                    y2="100"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0%" stopColor="#facc15" /> {/* Gold yellow */}
                                    <stop offset="50%" stopColor="#f97316" /> {/* Orange */}
                                    <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
                                </linearGradient>
                                {/* Active core gradient */}
                                <linearGradient
                                    id={`fv-inner-grad-${instanceId}`}
                                    x1="50"
                                    y1="38"
                                    x2="50"
                                    y2="90"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="45%" stopColor="#fef08a" /> {/* Golden light yellow */}
                                    <stop offset="100%" stopColor="#f97316" />
                                </linearGradient>
                            </>
                        ) : (
                            <>
                                {/* Extinguished cold ash outer flame gradient */}
                                <linearGradient
                                    id={`fv-outer-grad-${instanceId}`}
                                    x1="50"
                                    y1="10"
                                    x2="50"
                                    y2="100"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0%" stopColor="#64748b" /> {/* Slate gray */}
                                    <stop offset="60%" stopColor="#475569" />
                                    <stop offset="100%" stopColor="#334155" />
                                </linearGradient>
                                {/* Cold ash core gradient */}
                                <linearGradient
                                    id={`fv-inner-grad-${instanceId}`}
                                    x1="50"
                                    y1="38"
                                    x2="50"
                                    y2="90"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop offset="0%" stopColor="#cbd5e1" />
                                    <stop offset="100%" stopColor="#94a3b8" />
                                </linearGradient>
                            </>
                        )}
                    </defs>
                </svg>
            </div>
        </div>
    );
}
