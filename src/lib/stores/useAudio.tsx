import { create } from "zustand";

// Local storage key for audio settings
const AUDIO_MUTE_KEY = "game_audio_muted";

// Helper function to get initial mute state from localStorage
const getInitialMuteState = (): boolean => {
  try {
    const storedValue = localStorage.getItem(AUDIO_MUTE_KEY);
    // Only return true if explicitly set to "true"
    return storedValue === "true";
  } catch (error) {
    // In case of any localStorage access issues, default to unmuted
    console.error("Error accessing localStorage for audio settings:", error);
    return false;
  }
};

// Helper function to save mute state to localStorage
const saveMuteState = (isMuted: boolean): void => {
  try {
    localStorage.setItem(AUDIO_MUTE_KEY, String(isMuted));
    console.log(`Audio mute state saved to localStorage: ${isMuted ? 'muted' : 'unmuted'}`);
  } catch (error) {
    console.error("Error saving audio settings to localStorage:", error);
  }
};

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  playerPowerupSound: HTMLAudioElement | null;
  speedBoosterSound: HTMLAudioElement | null;
  victorySound: HTMLAudioElement | null;
  defeatSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setPlayerPowerupSound: (sound: HTMLAudioElement) => void;
  setSpeedBoosterSound: (sound: HTMLAudioElement) => void;
  setVictorySound: (sound: HTMLAudioElement) => void;
  setDefeatSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  setMuteState: (muted: boolean) => void; // New direct setter function
  playHit: () => void;
  playSuccess: () => void;
  playPlayerPowerup: () => void;
  playSpeedBooster: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  playerPowerupSound: null,
  speedBoosterSound: null,
  victorySound: null,
  defeatSound: null,
  isMuted: getInitialMuteState(), // Initialize from localStorage
  
  setBackgroundMusic: (music) => {
    // Configure music before setting it
    music.loop = true;
    music.volume = 0.4; // Lower volume for background music
    
    // Immediately set the music to match current mute state
    const { isMuted } = get();
    if (isMuted) {
      music.pause();
    }
    
    set({ backgroundMusic: music });
  },
  
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setPlayerPowerupSound: (sound) => set({ playerPowerupSound: sound }),
  setSpeedBoosterSound: (sound) => set({ speedBoosterSound: sound }),
  setVictorySound: (sound) => set({ victorySound: sound }),
  setDefeatSound: (sound) => set({ defeatSound: sound }),
  
  // Direct setter for mute state (useful for game state management)
  setMuteState: (muted) => {
    const { isMuted, backgroundMusic } = get();
    
    // Only update if different from current state
    if (muted !== isMuted) {
      // Update state
      set({ isMuted: muted });
      
      // Update localStorage
      saveMuteState(muted);
      
      // Handle background music
      if (backgroundMusic) {
        if (muted) {
          backgroundMusic.pause();
        } else {
          backgroundMusic.play().catch(error => {
            console.log("Background music play prevented:", error);
          });
        }
      }
      
      console.log(`Sound explicitly set to ${muted ? 'muted' : 'unmuted'}`);
    }
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Save to localStorage
    saveMuteState(newMutedState);
    
    // Handle background music playback
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        // When unmuting, play all sounds to enable the audio context
        // This addresses the issue of audio not playing until unmuted
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
    }
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    } else {
      console.log("Hit sound not loaded yet");
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    } else {
      console.log("Success sound not loaded yet");
    }
  },
  
  playPlayerPowerup: () => {
    const { playerPowerupSound, isMuted } = get();
    if (playerPowerupSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Player powerup sound skipped (muted)");
        return;
      }
      
      playerPowerupSound.currentTime = 0;
      playerPowerupSound.play().catch(error => {
        console.log("Player powerup sound play prevented:", error);
      });
    } else {
      console.log("Player powerup sound not loaded yet");
    }
  },
  
  playSpeedBooster: () => {
    const { speedBoosterSound, isMuted } = get();
    if (speedBoosterSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Speed booster sound skipped (muted)");
        return;
      }
      
      speedBoosterSound.currentTime = 0;
      speedBoosterSound.play().catch(error => {
        console.log("Speed booster sound play prevented:", error);
      });
    } else {
      console.log("Speed booster sound not loaded yet");
    }
  },
  
  playVictory: () => {
    const { victorySound, isMuted } = get();
    if (victorySound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Victory sound skipped (muted)");
        return;
      }
      
      // Reset sound position
      victorySound.currentTime = 0;
      
      // Create a user gesture triggered context for desktop
      const playSound = () => {
        // Clone the audio to avoid potential conflicts
        const soundClone = victorySound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.6; // Match original volume
        
        // Play with retry logic for desktop
        const attemptPlay = () => {
          soundClone.play().catch(error => {
            console.log("Victory sound play attempt failed:", error);
            // On desktop, we'll retry a few times with delay
            setTimeout(attemptPlay, 100);
          });
        };
        
        attemptPlay();
      };
      
      // Try to get an audio context and resume it if needed
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
              console.log("AudioContext resumed for victory sound");
              playSound();
            });
          } else {
            playSound();
          }
        } else {
          // Fallback to direct play if AudioContext is not available
          playSound();
        }
      } catch (e) {
        console.log("Error with AudioContext for victory sound:", e);
        // Fallback to direct play
        playSound();
      }
    } else {
      console.log("Victory sound not loaded yet");
    }
  },
  
  playDefeat: () => {
    const { defeatSound, isMuted } = get();
    if (defeatSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Defeat sound skipped (muted)");
        return;
      }
      
      // Reset sound position
      defeatSound.currentTime = 0;
      
      // Create a user gesture triggered context for desktop
      const playSound = () => {
        // Clone the audio to avoid potential conflicts
        const soundClone = defeatSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.6; // Match original volume
        
        // Play with retry logic for desktop
        const attemptPlay = () => {
          soundClone.play().catch(error => {
            console.log("Defeat sound play attempt failed:", error);
            // On desktop, we'll retry a few times with delay
            setTimeout(attemptPlay, 100);
          });
        };
        
        attemptPlay();
      };
      
      // Try to get an audio context and resume it if needed
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
              console.log("AudioContext resumed for defeat sound");
              playSound();
            });
          } else {
            playSound();
          }
        } else {
          // Fallback to direct play if AudioContext is not available
          playSound();
        }
      } catch (e) {
        console.log("Error with AudioContext for defeat sound:", e);
        // Fallback to direct play
        playSound();
      }
    } else {
      console.log("Defeat sound not loaded yet");
    }
  },
  
  playBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    if (backgroundMusic) {
      if (isMuted) {
        console.log("Background music skipped (muted)");
        return;
      }
      
      // Start the background music if it's not already playing
      if (backgroundMusic.paused) {
        console.log("Starting background music");
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
    } else {
      console.log("Background music not loaded yet");
    }
  }
}));
