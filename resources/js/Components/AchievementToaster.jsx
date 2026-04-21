import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import AchievementOverlay from "@/Components/AchievementOverlay";

/**
 * Component that listens for achievement checks and shows them in an overlay.
 */
export default function AchievementToaster() {
    const { auth } = usePage().props;
    const [queue, setQueue] = useState([]);
    const [activeIdx, setActiveIdx] = useState(0);

    const fetchAchievements = async () => {
        if (!auth.user) return;

        try {
            const res = await fetch(route("api.achievements.unseen"), {
                headers: {
                    "Accept": "application/json",
                },
            });
            if (!res.ok) return;
            const data = await res.json();

            if (data.unseen && data.unseen.length > 0) {
                // Add new achievements to queue
                setQueue((prev) => [...prev, ...data.unseen]);
                // If nothing was showing, start showing from the first new one added
                // (activeIdx will be handled by the relative index in the queue)
            }
        } catch (err) {
            console.error("Failed to fetch unseen achievements", err);
        }
    };

    const handleDismiss = () => {
        if (activeIdx < queue.length - 1) {
            setActiveIdx((prev) => prev + 1);
        } else {
            // All cleared
            setQueue([]);
            setActiveIdx(0);
        }
    };

    useEffect(() => {
        // Listen for manual triggers from other components
        const handleCheck = () => fetchAchievements();
        window.addEventListener("check-achievements", handleCheck);

        // Optional: Also listen to 'Event' type for legacy compatibility
        window.addEventListener("check-achievements", handleCheck);

        return () => window.removeEventListener("check-achievements", handleCheck);
    }, [auth.user]);

    useEffect(() => {
        if (queue.length > 0) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [queue.length]);

    const currentAchievement = queue[activeIdx] || null;

    if (!currentAchievement) return null;

    return (
        <AchievementOverlay
            key={currentAchievement.id}
            achievementData={currentAchievement}
            onDismiss={handleDismiss}
        />
    );
}
