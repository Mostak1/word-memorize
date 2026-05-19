import React, { useEffect, useState, useRef } from "react";
import { X, Trophy, Flame, Sparkles } from "lucide-react";
import axios from "axios";
import { usePage } from "@inertiajs/react";

export default function FollowedProgressNotification() {
    const { props } = usePage();
    const assetUrl = props?.assetUrl;
    const assetBaseUrl = assetUrl?.replace(/\/$/, "") ?? "";
    const defaultAvatarUrl = `${assetBaseUrl}/img/default_pic.jpeg`;

    const [notifications, setNotifications] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);
    const [particles, setParticles] = useState([]);
    const [imgError, setImgError] = useState(false);
    const animationFrameId = useRef(null);

    // Reset image error state when cycling notifications
    useEffect(() => {
        setImgError(false);
    }, [currentIndex]);

    // Fetch followed notifications
    useEffect(() => {
        axios
            .get(route("api.followed-notifications.index"))
            .then((res) => {
                if (
                    res.data.notifications &&
                    res.data.notifications.length > 0
                ) {
                    setNotifications(res.data.notifications);
                    // Trigger entry animation after mount
                    setTimeout(() => setIsVisible(true), 100);
                }
            })
            .catch((err) =>
                console.error("Failed to load followed notifications:", err),
            );
    }, []);

    // Particles loop for congratulations effect
    useEffect(() => {
        if (particles.length === 0) return;

        const updateParticles = () => {
            setParticles((prev) =>
                prev
                    .map((p) => ({
                        ...p,
                        x: p.x + Math.cos(p.angle) * p.speed,
                        y: p.y + Math.sin(p.angle) * p.speed - 0.8, // subtle upwards float
                        opacity: p.opacity - 0.015,
                        scale: p.scale * 0.985,
                    }))
                    .filter((p) => p.opacity > 0),
            );
            animationFrameId.current = requestAnimationFrame(updateParticles);
        };

        animationFrameId.current = requestAnimationFrame(updateParticles);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [particles]);

    if (notifications.length === 0 || currentIndex >= notifications.length)
        return null;

    const currentNotif = notifications[currentIndex];
    const { id, type, data, notifier } = currentNotif;

    // Build notifier image URL
    const notifierImage = notifier?.image?.trim();
    const isMissingLegacyUpload = notifierImage
        ?.replace(/^\//, "")
        .startsWith("uploads/");
    const hasUsableImage =
        notifierImage &&
        !notifierImage.includes("default-files/avatar.png") &&
        !isMissingLegacyUpload;
    const notifierAvatar = hasUsableImage
        ? notifierImage.startsWith("http")
            ? notifierImage
            : `${assetBaseUrl}/${notifierImage.replace(/^\//, "")}`
        : defaultAvatarUrl;

    const dismissCurrent = (isCongratulate = false) => {
        setIsDismissing(true);
        // Wait for slide-up/fade-out animation to complete
        setTimeout(async () => {
            try {
                await axios.post(
                    route("api.followed-notifications.mark-read"),
                    { ids: [id] },
                );
            } catch (err) {
                console.error("Failed to mark notification as read:", err);
            }

            // Move to next notification
            setCurrentIndex((prev) => prev + 1);
            setIsDismissing(false);
        }, 400);
    };

    const handleCongratulate = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Spawn 25 particles in a circle
        const newParticles = Array.from({ length: 25 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            const chars = ["🎉", "❤️", "🔥", "👏", "🙌", "✨", "🌟"];
            const char = chars[Math.floor(Math.random() * chars.length)];
            return {
                id: Math.random(),
                x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 20,
                y: rect.top + rect.height / 2 + (Math.random() - 0.5) * 20,
                char,
                angle,
                speed,
                opacity: 1,
                scale: 1 + Math.random() * 0.8,
            };
        });

        setParticles((prev) => [...prev, ...newParticles]);

        // Auto dismiss after a small delay so they see the particles pop!
        setTimeout(() => {
            dismissCurrent(true);
        }, 1000);
    };

    return (
        <>
            {/* Particles Layer */}
            <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                {particles.map((p) => (
                    <span
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: p.x,
                            top: p.y,
                            opacity: p.opacity,
                            transform: `scale(${p.scale})`,
                            fontSize: "24px",
                            transition: "opacity 0.05s ease-out",
                        }}
                    >
                        {p.char}
                    </span>
                ))}
            </div>

            {/* In-App Premium Alert */}
            <div
                className={`transition-all duration-500 ease-in-out transform ${
                    isVisible && !isDismissing
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                } bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-4 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.05)] mb-6 border ${
                    type === "streak"
                        ? "border-orange-100/80 dark:border-orange-950/30 hover:border-orange-200 dark:hover:border-orange-900/40"
                        : "border-yellow-100/80 dark:border-yellow-950/30 hover:border-yellow-200 dark:hover:border-yellow-900/40"
                } hover:scale-[1.01] relative z-40`}
            >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Avatar Container or Fallback Badge Icon */}
                    {hasUsableImage && !imgError ? (
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md overflow-hidden bg-gray-100 dark:bg-slate-800">
                                <img
                                    src={notifierAvatar}
                                    alt={notifier?.name || "User"}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            </div>
                            <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm ${
                                    type === "streak"
                                        ? "bg-orange-500"
                                        : "bg-yellow-500"
                                }`}
                            >
                                {type === "streak" ? (
                                    <Flame className="h-3 w-3 text-white fill-white" />
                                ) : (
                                    <Trophy className="h-3 w-3 text-white fill-white" />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 border ${
                                type === "streak"
                                    ? "bg-orange-50 dark:bg-orange-950/30 text-orange-500 border-orange-100 dark:border-orange-900/30"
                                    : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-500 border-yellow-100 dark:border-yellow-900/30"
                            }`}
                        >
                            {type === "streak" ? (
                                <Flame className="h-6 w-6 fill-current text-orange-500" />
                            ) : (
                                <Trophy className="h-6 w-6 fill-current text-yellow-500" />
                            )}
                        </div>
                    )}

                    {/* Notification Details */}
                    <div className="text-left flex-1 min-w-0 pr-2">
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 mb-0.5">
                            {type === "streak"
                                ? "Streak Achievement"
                                : "New Badge Earned"}
                        </h4>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">
                            <span className="font-extrabold text-gray-900 dark:text-white">
                                {notifier?.name || "Followed User"}
                            </span>{" "}
                            {type === "streak" ? (
                                <>
                                    reached a{" "}
                                    <span className="font-black text-orange-600 dark:text-orange-400">
                                        {data.current_streak}-day learning
                                        streak
                                    </span>
                                    !
                                </>
                            ) : (
                                <>
                                    earned the{" "}
                                    <span className="font-black text-yellow-600 dark:text-yellow-400">
                                        {data.achievement_name}
                                    </span>{" "}
                                    badge!
                                </>
                            )}
                        </p>
                        {type === "achievement" &&
                            data.achievement_description && (
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 italic">
                                    "{data.achievement_description}"
                                </p>
                            )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleCongratulate}
                        className={`inline-flex items-center gap-1 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 text-white ${
                            type === "streak"
                                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/20"
                                : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-yellow-500/20"
                        } shadow-md hover:shadow-lg`}
                    >
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>Congratulate</span>
                    </button>
                    <button
                        onClick={() => dismissCurrent()}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-90"
                        title="Dismiss"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </>
    );
}
