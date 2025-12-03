import { create } from "zustand";

interface SpeedBoosterState {
  // Number of boosters available to the player (total inventory)
  boosterCount: number;
  
  // Whether the booster is currently active
  isActive: boolean;
  
  // Whether the booster has been used in the current game session
  hasBeenUsed: boolean;
  
  // Time when the booster activation ends
  activationEndTime: number | null;
  
  // Countdown display value (1-3 seconds remaining)
  countdownDisplay: number;
  
  // Flag to indicate if the initial dash impulse has been applied
  dashApplied: boolean;
  
  // Activate the booster if available
  activateBooster: () => void;
  
  // Reset the booster state (for new game)
  resetBooster: () => void;
  
  // Set the booster count
  setBoosterCount: (count: number) => void;
  
  // Track whether the initial dash force has been applied
  setDashApplied: (applied: boolean) => void;
  
  // Update booster state (called in game loop)
  updateBoosterState: (currentTime: number) => void;
}

// Duration of the speed boost in milliseconds (1.5 seconds)
export const BOOST_DURATION_MS = 1500;

// Forward dash speed value (not a multiplier anymore)
export const DASH_SPEED = 25;

// Collision elasticity during boost (30% as requested)
export const BOOST_ELASTICITY = 0.3;

export const useSpeedBooster = create<SpeedBoosterState>((set, get) => ({
  boosterCount: 10, // Total inventory - player owns 10 boosters but can only use 1 per game
  isActive: false,
  hasBeenUsed: false,
  activationEndTime: null,
  countdownDisplay: 2,
  dashApplied: false,
  
  activateBooster: () => {
    const { boosterCount, isActive, hasBeenUsed } = get();
    
    // Only activate if we have boosters available, not already active, and not used in this game session
    if (boosterCount > 0 && !isActive && !hasBeenUsed) {
      console.log("Speed booster activated! Forward dash initiated");
      
      // Calculate end time
      const endTime = Date.now() + BOOST_DURATION_MS;
      
      set({
        isActive: true,
        hasBeenUsed: true, // Mark as used for this game session
        boosterCount: boosterCount - 1, // Decrease inventory count
        activationEndTime: endTime,
        countdownDisplay: 2,
        dashApplied: false // Reset dash applied flag so the impulse will be applied
      });
    } else if (hasBeenUsed) {
      console.log("Speed booster already used in this game session");
    } else if (boosterCount <= 0) {
      console.log("No speed boosters remaining in inventory");
    } else if (isActive) {
      console.log("Speed booster already active");
    }
  },
  
  resetBooster: () => {
    set({
      isActive: false,
      hasBeenUsed: false, // Reset for new game session
      activationEndTime: null,
      countdownDisplay: 2,
      dashApplied: false
    });
  },
  
  setBoosterCount: (count: number) => {
    set({ boosterCount: count });
  },
  
  setDashApplied: (applied: boolean) => {
    set({ dashApplied: applied });
  },
  
  updateBoosterState: (currentTime: number) => {
    const { isActive, activationEndTime } = get();
    
    if (isActive && activationEndTime) {
      const timeRemaining = activationEndTime - currentTime;
      
      // Update countdown display (rounded up to nearest second)
      const secondsRemaining = Math.ceil(timeRemaining / 1000);
      
      if (timeRemaining <= 0) {
        // Boost has ended
        console.log("Forward dash has ended");
        set({
          isActive: false,
          activationEndTime: null,
          countdownDisplay: 2,
          dashApplied: false
        });
      } else if (secondsRemaining !== get().countdownDisplay) {
        // Update countdown display if it changed
        set({ countdownDisplay: secondsRemaining });
      }
    }
  }
}));