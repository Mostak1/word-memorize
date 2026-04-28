// Sound Effects Utility
// Safe for Laravel + Inertia + React

// 🔹 Global asset base (set from React)
let assetBaseUrl = "";

// 🔹 Audio cache
const audioCache = {};

// 🔹 Sound paths (initialized later)
let SOUND_PATHS = {};

// 🔹 Set asset base URL (call from component)
export const setAssetBaseUrl = (url) => {
    assetBaseUrl = url || "";
};

// 🔹 Helper to build full URL
const getAssetUrl = (path) => {
    return `${assetBaseUrl}${path}`;
};

// 🔹 Initialize and preload sounds
export const initSounds = () => {
    if (typeof window === "undefined") return;

    SOUND_PATHS = {
        sessionComplete: getAssetUrl(
            "/sounds/freesound_community-success-fanfare-trumpets-6185.mp3.mpeg",
        ),
        correct: getAssetUrl("/sounds/universfield-new-notification.mp3.mpeg"),
        incorrect: getAssetUrl(
            "/sounds/lesiakower-error-mistake-sound-effect-incorrect-answer.mp3.mpeg",
        ),
        xpPurchase: getAssetUrl(
            "/sounds/freesound_crunchpixstudio-purchase-success.mp3.mpeg",
        ),
        mastered: getAssetUrl(
            "/sounds/freesound_crunchpixstudio-great-success-384935.mp3.mpeg",
        ),
        xpCount: getAssetUrl(
            "/sounds/freesound_community-countdown-beeps-remixed-fast-101155.mp3.mpeg",
        ),
    };

    Object.entries(SOUND_PATHS).forEach(([key, path]) => {
        try {
            const audio = new Audio(path);
            audio.preload = "auto";
            audio.volume = 0.6;
            audio.load();

            audioCache[key] = audio;
        } catch (e) {
            console.warn(`Failed to load sound ${key}:`, e);
        }
    });
};

// 🔹 Play sound
const playSound = (key, userSettings, duration = null) => {
    if (
        typeof window === "undefined" ||
        userSettings?.sound_effects === false ||
        window.__SOUND_DISABLED === true
    ) {
        return;
    }

    const audio = audioCache[key];
    if (!audio) return;

    try {
        audio.currentTime = 0;

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    if (duration) {
                        setTimeout(() => {
                            audio.pause();
                            audio.currentTime = 0;
                        }, duration);
                    }
                })
                .catch((error) => {
                    if (error.name !== "NotAllowedError") {
                        console.warn(
                            `Sound playback failed for ${key}:`,
                            error,
                        );
                    }
                });
        }
    } catch (e) {
        console.warn(`Sound error ${key}:`, e);
    }
};

// 🔹 Public sound methods
export const playSessionComplete = (userSettings) =>
    playSound("sessionComplete", userSettings);

export const playCorrect = (userSettings) => playSound("correct", userSettings);

export const playIncorrect = (userSettings) =>
    playSound("incorrect", userSettings);

export const playXpPurchase = (userSettings) =>
    playSound("xpPurchase", userSettings);

export const playMastered = (userSettings) =>
    playSound("mastered", userSettings, 1900);

export const playXpCount = (userSettings) => playSound("xpCount", userSettings);

// 🔹 Global controls
export const disableSoundsGlobally = () => {
    window.__SOUND_DISABLED = true;
};

export const enableSoundsGlobally = () => {
    window.__SOUND_DISABLED = false;
};

// 🔹 Lazy init after user interaction (fix autoplay policy)
if (typeof window !== "undefined") {
    const initOnInteraction = () => {
        initSounds();

        document.removeEventListener("click", initOnInteraction);
        document.removeEventListener("keydown", initOnInteraction);
    };

    document.addEventListener("click", initOnInteraction, { once: true });
    document.addEventListener("keydown", initOnInteraction, { once: true });
}
