// ── Constants ─────────────────────────────────────────────────────────────────
export const MASTERED_BOX = 4;

export const LEVEL_META = {
    1: {
        label: "New",
        color: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
        dot: "bg-gray-400 dark:bg-slate-600",
    },
    2: {
        label: "Learning",
        color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
        dot: "bg-cyan-400 dark:bg-cyan-500",
    },
    3: {
        label: "Reviewing",
        color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
        dot: "bg-orange-400 dark:bg-orange-500",
    },
    4: {
        label: "Mastered",
        color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
        dot: "bg-green-500 dark:bg-green-400",
    },
};

// Confetti pieces — generated once at module level so identity is stable
export const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${(i * 2.85) % 100}%`,
    delay: `${(i * 0.055) % 0.5}s`,
    duration: `${1.5 + (i % 5) * 0.18}s`,
    color: [
        "#E5201C",
        "#22c55e",
        "#3b82f6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
    ][i % 7],
    size: 6 + (i % 5) * 2,
    borderRadius: i % 3 === 0 ? "50%" : "2px",
}));

// Image preloader — preloads all word images in batches with progress callback
export const preloadImages = async (words, onProgress) => {
    const allImages = [];
    words.forEach((word) => {
        if (word.images?.length) {
            word.images.forEach((img) => {
                if (img.image_url_full) allImages.push(img.image_url_full);
            });
        }
    });

    if (allImages.length === 0) {
        onProgress?.(100);
        return;
    }

    let loaded = 0;
    const total = allImages.length;
    const batchSize = 8;

    for (let i = 0; i < allImages.length; i += batchSize) {
        const batch = allImages.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(
                (src) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.onload = img.onerror = () => {
                            loaded++;
                            onProgress?.(Math.round((loaded / total) * 100));
                            resolve(null);
                        };
                        img.src = src;
                    }),
            ),
        );
    }

    onProgress?.(100);
};
