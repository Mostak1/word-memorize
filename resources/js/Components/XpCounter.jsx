import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

/**
 * XpCounter - A game-like XP counter that counts up to a target value
 * and performs a bounce animation when finished.
 */
export default function XpCounter({ targetXp, duration = 1500, onComplete }) {
    const [displayXp, setDisplayXp] = useState(0);
    const [isBouncing, setIsBouncing] = useState(false);

    useEffect(() => {
        if (targetXp <= 0) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * targetXp);
            
            setDisplayXp(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayXp(targetXp);
                setIsBouncing(true);
                if (onComplete) onComplete();
                
                // Reset bounce state after animation finishes
                setTimeout(() => setIsBouncing(false), 600);
            }
        };

        window.requestAnimationFrame(step);
    }, [targetXp, duration]);

    return (
        <div className={`flex items-center justify-center gap-2 transition-transform duration-300 ${isBouncing ? "animate-xp-bounce scale-110" : ""}`}>
            <Zap className={`h-8 w-8 ${isBouncing ? "text-yellow-400 fill-yellow-400" : "text-yellow-500"}`} />
            <p className="text-4xl font-extrabold text-yellow-600 dark:text-yellow-400 tabular-nums">
                +{displayXp}
            </p>
            <Zap className={`h-8 w-8 ${isBouncing ? "text-yellow-400 fill-yellow-400" : "text-yellow-500"}`} />
            
            <style>{`
                @keyframes xp-bounce {
                    0% { transform: scale(1); }
                    30% { transform: scale(1.25); }
                    50% { transform: scale(0.95); }
                    70% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-xp-bounce {
                    animation: xp-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </div>
    );
}
