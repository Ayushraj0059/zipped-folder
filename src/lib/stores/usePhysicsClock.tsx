import { create } from "zustand";

interface PhysicsClockState {
  // The last timestamp we used for physics calculation
  lastTimestamp: number;
  
  // Whether the physics clock is paused
  isPaused: boolean;
  
  // Accumulated time to handle resumed physics
  accumulatedTime: number;
  
  // The time we paused at (used to calculate proper deltas when resuming)
  pauseStartTime: number | null;
  
  // Flag to indicate first frame after resume (for special handling)
  isFirstFrameAfterResume: boolean;
  
  // Functions
  setPaused: (paused: boolean) => void;
  reset: () => void;
  tick: (currentTime: number) => number; // Returns delta time for physics
}

/**
 * This store manages a dedicated physics clock that correctly handles pausing
 * by not accumulating time while paused, preventing the acceleration issue
 * that occurs when the game resumes after being paused for a while.
 */
export const usePhysicsClock = create<PhysicsClockState>((set, get) => ({
  lastTimestamp: 0,
  isPaused: false,
  accumulatedTime: 0,
  pauseStartTime: null,
  isFirstFrameAfterResume: false,
  
  // Set the paused state
  setPaused: (paused) => {
    const currentState = get();
    const currentTime = performance.now() / 1000; // Convert to seconds
    
    // Only act if the pause state is changing
    if (paused !== currentState.isPaused) {
      if (paused) {
        // We're pausing - record when we paused
        set({
          isPaused: true,
          pauseStartTime: currentTime
        });
        console.log("Physics clock paused at time:", currentTime);
      } else {
        // We're resuming from pause
        set({
          isPaused: false,
          lastTimestamp: currentTime, // Reset timing to now
          isFirstFrameAfterResume: true, // Mark first frame after resume
          pauseStartTime: null
        });
        console.log("Physics clock resumed at time:", currentTime);
      }
    }
  },
  
  // Reset the clock (useful when restarting the game)
  reset: () => {
    const currentTime = performance.now() / 1000; // Convert to seconds
    set({
      lastTimestamp: currentTime,
      isPaused: false,
      accumulatedTime: 0,
      pauseStartTime: null,
      isFirstFrameAfterResume: false
    });
    console.log("Physics clock reset at time:", currentTime);
  },
  
  // Get delta time for physics, handling pause state
  tick: (currentTime) => {
    // Convert to seconds
    currentTime = currentTime / 1000;
    
    const state = get();
    
    // If paused, return 0 delta (no physics updates)
    if (state.isPaused) {
      return 0;
    }
    
    // Handle first frame after resume - return minimal delta
    if (state.isFirstFrameAfterResume) {
      // Use minimal time step for first frame after resume
      const safeMinimalDelta = 1/120; // Very small delta for first frame (120 fps equivalent)
      
      // Clear the flag and update timestamp
      set({
        isFirstFrameAfterResume: false,
        lastTimestamp: currentTime
      });
      
      console.log("First frame after resume - using minimal delta:", safeMinimalDelta);
      return safeMinimalDelta;
    }
    
    // Normal case - calculate delta
    let delta = currentTime - state.lastTimestamp;
    
    // Safety - cap maximum delta to prevent large jumps
    // This prevents "tunneling" and other physics issues after long frame drops
    const MAX_DELTA = 1/30; // Cap at 30fps equivalent
    if (delta > MAX_DELTA) {
      console.log("Capping large physics delta:", delta, "to", MAX_DELTA);
      delta = MAX_DELTA;
    }
    
    // Update last timestamp
    set({ lastTimestamp: currentTime });
    
    return delta;
  }
}));