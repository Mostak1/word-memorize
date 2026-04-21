import { useState, useEffect } from "react";
import { CONFETTI } from "./constants";
import { useTranslation } from "@/Contexts/LanguageContext";

// Defined at MODULE scope so its identity is stable across parent re-renders.
// Receiving a new `key` prop causes React to fully unmount/remount → fresh
// state + independent timers for rapid mastery events.
export default function MasteryOverlay() {
    const { t } = useTranslation();
    const [flash, setFlash] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t1 = setTimeout(() => setFlash(false), 900);
        const t2 = setTimeout(() => setVisible(false), 2800);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    if (!visible) return null;

    return (
        <>
            {/* Green flash */}
            {flash && (
                <div className="fixed inset-0 pointer-events-none z-40 bg-green-400/20" />
            )}
            {/* Confetti + badge */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {CONFETTI.map((p) => (
                    <div
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: p.left,
                            top: "-12px",
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            borderRadius: p.borderRadius,
                            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
                        }}
                    />
                ))}
                <div className="absolute inset-x-0 top-24 flex justify-center pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-slate-900 px-8 py-4 text-center animate-bounce-in border border-green-100 dark:border-green-900">
                        <p className="text-3xl mb-1">🌟</p>
                        <p className="text-lg font-extrabold text-green-600 dark:text-green-400">
                            {t("exercise.mastery.title")}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {t("exercise.mastery.desc")}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
