// Create and cache audio elements
const createAudio = (src: string): HTMLAudioElement => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  return audio;
};

// Ticking sound for countdown
const tickingSound = createAudio('https://assets.mixkit.co/sfx/preview/mixkit-clock-countdown-bleeps-916.mp3');

// Play ticking sound
export const playTickingSound = (): void => {
  // Reset and play
  tickingSound.currentTime = 0;
  tickingSound.play().catch(err => console.error('Error playing sound:', err));
};

// Stop ticking sound
export const stopTickingSound = (): void => {
  tickingSound.pause();
  tickingSound.currentTime = 0;
}; 