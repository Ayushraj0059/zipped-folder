import { create } from "zustand";

interface PauseState {
  // Whether the game is currently paused
  isPaused: boolean;
  
  // Whether the settings menu is open
  isSettingsOpen: boolean;
  
  // Pause the game
  pauseGame: () => void;
  
  // Resume the game
  resumeGame: () => void;
  
  // Toggle pause state
  togglePause: () => void;
  
  // Open settings menu
  openSettings: () => void;
  
  // Close settings menu
  closeSettings: () => void;
}

export const usePauseStore = create<PauseState>((set) => ({
  isPaused: false,
  isSettingsOpen: false,
  
  pauseGame: () => set({ isPaused: true }),
  
  resumeGame: () => set({ 
    isPaused: false,
    isSettingsOpen: false  // Always close settings when resuming
  }),
  
  togglePause: () => set((state) => ({ 
    isPaused: !state.isPaused,
    // If unpausing, also close settings
    isSettingsOpen: state.isPaused ? false : state.isSettingsOpen
  })),
  
  openSettings: () => set({ isSettingsOpen: true }),
  
  closeSettings: () => set({ isSettingsOpen: false })
}));