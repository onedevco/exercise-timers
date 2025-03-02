// Create and cache audio context
let audioContext: AudioContext | null = null;

// Initialize audio (call this early in the app lifecycle)
export const initAudio = (): void => {
  try {
    // Create audio context for better browser compatibility
    if (window.AudioContext) {
      const AudioContextClass = window.AudioContext;
      audioContext = new AudioContextClass();
      console.log('Audio context initialized successfully');
    } else {
      console.warn('Web Audio API not supported in this browser');
    }
  } catch (err) {
    console.error('Error initializing audio:', err);
  }
};

// Play ticking sound
export const playTickingSound = (): void => {
  if (!audioContext) {
    console.warn('Audio context not initialized');
    initAudio();
    if (!audioContext) return;
  }
  
  try {
    // Resume the audio context if it's suspended (needed for some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create oscillator for tick sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure sound
    oscillator.type = 'sine';
    oscillator.frequency.value = 800; // Higher pitch for tick sound
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
    
    console.log('Tick sound played');
  } catch (err) {
    console.error('Error playing ticking sound:', err);
  }
};

// Stop ticking sound (not needed with this implementation, but kept for API compatibility)
export const stopTickingSound = (): void => {
  // Nothing to do - our sounds are self-terminating
};

// Add a simple beep function for notifications
export const beep = (): void => {
  if (!audioContext) {
    console.warn('Audio context not initialized');
    initAudio();
    if (!audioContext) return;
  }
  
  try {
    // Resume the audio context if it's suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure sound
    oscillator.type = 'square'; // More attention-grabbing sound
    oscillator.frequency.value = 440; // A4 note
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log('Beep sound played');
  } catch (err) {
    console.error('Error creating beep:', err);
  }
}; 