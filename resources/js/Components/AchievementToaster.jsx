import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import AchievementOverlay from "@/Components/AchievementOverlay";
import axios from "axios";

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
            const res = await axios.get(route("api.achievements.unseen"));
            const data = res.data;

            if (data.unseen && data.unseen.length > 0) {
                // Add new achievements to queue
                setQueue((prev) => [...prev, ...data.unseen]);
            } else {
                window.dispatchEvent(new CustomEvent("achievements-dismissed"));
            }
        } catch (err) {
            console.error("Failed to fetch unseen achievements", err);
            window.dispatchEvent(new CustomEvent("achievements-dismissed"));
        }
    };

    const currentAchievement = queue[activeIdx] || null;

    // Auto-mark as seen the moment it is shown to the user
    useEffect(() => {
        if (currentAchievement) {
            axios.post(route("api.achievements.mark-seen"), {
                ids: [currentAchievement.id]
            }).catch(err => {
                console.error("Failed to mark achievement as seen", err);
            });
        }
    }, [currentAchievement?.id]);

    const handleDismiss = () => {
        if (activeIdx < queue.length - 1) {
            setActiveIdx((prev) => prev + 1);
        } else {
            // All cleared
            setQueue([]);
            setActiveIdx(0);
            window.dispatchEvent(new CustomEvent("achievements-dismissed"));
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

    if (!currentAchievement) return null;

    return (
        <AchievementOverlay
            key={currentAchievement.id}
            achievementData={currentAchievement}
            onDismiss={handleDismiss}
        />
    );
}
