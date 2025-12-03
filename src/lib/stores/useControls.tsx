import { create } from "zustand";

interface ControlsState {
  // Movement direction normalized between -1 and 1
  directionX: number;
  directionZ: number;
  
  // Track if player has started moving
  hasPlayerStartedMoving: boolean;
  
  // Flag to enable/disable input processing
  isInputEnabled: boolean;
  
  // Base movement force - can be modified by powerups
  movementForce: number;
  
  // Setter functions
  setMovementDirection: (x: number, z: number) => void;
  
  // Enable/disable input
  enableInput: () => void;
  disableInput: () => void;
  
  // Reset player movement flag - needed for proper game restart
  resetPlayerMovementFlag: () => void;
  
  // Set movement force - for speed boost powerup
  setMovementForce: (force: number) => void;
}

export const useControls = create<ControlsState>((set) => ({
  directionX: 0,
  directionZ: 0,
  hasPlayerStartedMoving: false,
  isInputEnabled: false, // Start with input disabled until game starts
  movementForce: 13.0, // Default movement force (matches MOVEMENT_FORCE constant)
  
  setMovementDirection: (x, z) => set(state => {
    // Only process input if it's enabled
    if (!state.isInputEnabled) {
      // Still update direction to zero if input is disabled (to stop any active movement)
      if (state.directionX !== 0 || state.directionZ !== 0) {
        return { directionX: 0, directionZ: 0 };
      }
      return {}; // No change if input is disabled and already at zero
    }
    
    // If player is making a move and hasn't started yet, set the flag
    const isMoving = x !== 0 || z !== 0;
    const hasStarted = state.hasPlayerStartedMoving || isMoving;
    
    return { 
      directionX: x,
      directionZ: z,
      hasPlayerStartedMoving: hasStarted
    };
  }),
  
  // Add functions to enable/disable input
  enableInput: () => set(() => {
    console.log("Controls: Input ENABLED");
    return { isInputEnabled: true };
  }),
  
  disableInput: () => set(() => {
    console.log("Controls: Input DISABLED");
    return { isInputEnabled: false, directionX: 0, directionZ: 0 };
  }),
  
  // Add a dedicated function to reset the player movement flag
  // This is needed for properly restarting the game
  resetPlayerMovementFlag: () => set(() => {
    console.log("Controls: Reset player movement flag to prevent AI movement after restart");
    return { hasPlayerStartedMoving: false, directionX: 0, directionZ: 0 };
  }),
  
  // Set movement force - for speed boost powerup
  setMovementForce: (force: number) => set(() => {
    console.log(`Controls: Setting movement force to ${force.toFixed(2)}`);
    return { movementForce: force };
  }),
}));
