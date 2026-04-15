// Sound Effects Utility
// Preload and manage all application sound effects

const SOUND_PATHS = {
  sessionComplete: '/sounds/freesound_community-success-fanfare-trumpets-6185.mp3.mpeg',
  correct: '/sounds/universfield-new-notification.mp3.mpeg',
  incorrect: '/sounds/lesiakower-error-mistake-sound-effect-incorrect-answer.mp3.mpeg',
  xpPurchase: '/sounds/freesound_crunchpixstudio-purchase-success.mp3.mpeg',
};

// Preload audio objects
const audioCache = {};

// Initialize and preload all sounds
export const initSounds = () => {
  Object.entries(SOUND_PATHS).forEach(([key, path]) => {
    audioCache[key] = new Audio(path);
    audioCache[key].preload = 'auto';
    audioCache[key].volume = 0.6;
  });
};

// Play sound helper
const playSound = (key, userSettings) => {
  // Skip if sound effects are disabled
  if (userSettings?.sound_effects === false) {
    return;
  }
  if (audioCache[key]) {
    // Reset playback position to allow rapid consecutive plays
    audioCache[key].currentTime = 0;
    audioCache[key].play().catch(() => {
      // Ignore autoplay policy errors - browser will block until first user interaction
      // This is normal expected behavior
    });
  }
};

// Export individual sound functions
export const playSessionComplete = (userSettings) => playSound('sessionComplete', userSettings);
export const playCorrect = (userSettings) => playSound('correct', userSettings);
export const playIncorrect = (userSettings) => playSound('incorrect', userSettings);
export const playXpPurchase = (userSettings) => playSound('xpPurchase', userSettings);

// Initialize on module import
initSounds();