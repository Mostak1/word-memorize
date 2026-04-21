import React, { useEffect } from "react";
import Lottie from "lottie-react";
import fireAnim from "../../../public/lottie/FireStreakOrange.json";

/**
 * StreakPop - Reusable streak increase animation
 * Matches the premium design with a fire animation, large streak number,
 * and "YOU'RE ON FIRE!" badge.
 */
export default function StreakPop({ streakCount, onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2800); // Slightly longer for better effect
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none backdrop-blur-[2px] bg-black/40 animate-[fadeIn_0.3s_ease-out]">
            <div className="relative flex flex-col items-center">
                {/* Fire Animation */}
                <div className="relative scale-110">
                    {/* Background Glow */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="absolute w-[260px] h-[260px] bg-orange-600 rounded-full blur-[80px] opacity-60 animate-pulse" />
                        <div className="absolute w-[180px] h-[180px] bg-red-600 rounded-full blur-[60px] opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    <Lottie
                        animationData={fireAnim}
                        loop={false}
                        style={{ width: 340, height: 340 }}
                    />
                    
                    {/* Streak Count Container (Centered in Flame) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center mt-2">
                        <div
                            className="text-7xl font-black text-white tracking-tight animate-[streakPop_0.75s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
                            style={{ 
                                textShadow: "0 0 50px rgba(255, 149, 0, 0.9), 0 20px 60px rgba(255, 0, 0, 0.6), 0 0 100px rgba(255, 255, 255, 0.2)" 
                            }}
                        >
                            {streakCount}
                        </div>
                        <div className="text-white font-extrabold text-xl tracking-[4px] mt-1 drop-shadow-lg opacity-0 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards]">
                            DAY STREAK
                        </div>
                    </div>
                </div>

                {/* Bottom Badge */}
                <div className="mt-2 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]">
                    <div className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-500 text-white font-black text-sm tracking-wide shadow-[0_10px_20px_rgba(234,88,12,0.4)] border border-orange-400/30">
                        YOU'RE ON FIRE!
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes streakPop {
                    0% {
                        opacity: 0;
                        transform: scale(0.2) translateY(60px);
                    }
                    40% {
                        transform: scale(1.15) translateY(-10px);
                    }
                    70% {
                        transform: scale(0.98) translateY(5px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
