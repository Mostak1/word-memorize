import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

/**
 * Headless component that listens for achievement checks.
 */
export default function AchievementToaster() {
    const { auth } = usePage().props;

    // We bind to a global event so any component can trigger a check
    useEffect(() => {
        const fetchAchievements = async () => {
            if (!auth.user) return;

            try {
                const res = await fetch(route("api.achievements.unseen"), {
                    headers: {
                        "Accept": "application/json",
                    }
                });
                if (!res.ok) return;
                const data = await res.json();

                if (data.unseen && data.unseen.length > 0) {
                    data.unseen.forEach((ua, index) => {
                        const { achievement } = ua;
                        // Delay multiple toasts so they pop up nicely
                        setTimeout(() => {
                            toast.custom((t) => (
                                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-bottom-5 w-full relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                    <div className="bg-yellow-500/10 dark:bg-yellow-500/20 p-2.5 rounded-full shrink-0">
                                        <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-gray-400 mb-0.5">
                                            Achievement Unlocked
                                        </p>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {achievement.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </div>
                            ), {
                                duration: 5000,
                                position: "top-center"
                            });
                        }, index * 800);
                    });
                }
            } catch (err) {
                console.error("Failed to fetch unseen achievements", err);
            }
        };

        // Check on mount
        fetchAchievements();

        // Listen for manual triggers from other components
        const handleCheck = () => fetchAchievements();
        window.addEventListener("check-achievements", handleCheck);

        return () => window.removeEventListener("check-achievements", handleCheck);
    }, []);

    return null;
}
