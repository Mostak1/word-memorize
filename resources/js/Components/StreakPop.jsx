import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import fireAnim from "../../../public/lottie/FireStreakOrange.json";

/**
 * StreakPop - Reusable streak increase animation
 * Matches the premium design with a fire animation, large streak number,
 * and "YOU'RE ON FIRE!" badge.
 */
export default function StreakPop({ streakCount, onComplete }) {
    const [lastTap, setLastTap] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 3000); // Extended slightly for the full drama
        return () => clearTimeout(timer);
    }, [onComplete]);

    const handleTap = () => {
        const now = Date.now();
        if (now - lastTap < 300) {
            onComplete?.();
        } else {
            setLastTap(now);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
            onClick={handleTap}
        >
            <style>{`
                @keyframes shimmerPill {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                @keyframes scaleInPop {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) translateY(40px);
                        filter: blur(10px);
                    }
                    50% {
                        transform: scale(1.1) translateY(-10px);
                        filter: blur(0px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            <div className="relative flex flex-col items-center animate-[scaleInPop_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
                {/* Glowing background aura */}
                <div className="absolute inset-0 bg-orange-500/40 blur-[80px] rounded-full scale-[1.5] z-0" />

                {/* Fire Streak Lottie */}
                <div
                    className="relative z-10"
                    style={{ transform: "scale(1.2)" }}
                >
                    <Lottie
                        animationData={fireAnim}
                        loop={true}
                        style={{ width: 340, height: 340 }}
                    />
                </div>

                {/* Dynamic Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-[60px]">
                    <div
                        className="text-8xl font-black text-white tracking-tighter"
                        style={{
                            textShadow:
                                "0 8px 30px rgba(255, 69, 0, 0.9), 0 0 60px rgba(255, 165, 0, 0.8)",
                            WebkitTextStroke:
                                "3px rgba(255, 255, 255, 0.9)",
                        }}
                    >
                        {streakCount}
                    </div>
                    <div
                        className="text-white text-2xl font-bold uppercase tracking-[0.2em] mt-3"
                        style={{
                            textShadow: "0 4px 15px rgba(255, 69, 0, 0.9)",
                        }}
                    >
                        Day Streak
                    </div>

                    {/* Encouraging subtext pill */}
                    <div className="mt-8 px-6 py-2.5 bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-md rounded-full border border-white/30 shadow-[0_10px_30px_rgba(255,69,0,0.5)] overflow-hidden relative">
                        <div className="absolute inset-0 bg-white/30 w-1/2 animate-[shimmerPill_2s_infinite]" />
                        <span className="text-white font-bold tracking-wide text-sm relative z-10 drop-shadow-md">
                            {streakCount === 1
                                ? "GREAT START!"
                                : "YOU'RE ON FIRE!"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
