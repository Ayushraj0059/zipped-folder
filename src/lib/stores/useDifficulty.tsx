import { create } from "zustand";

// Define the difficulty levels
export type DifficultyLevel = "easy" | "medium" | "hard" | "super_hard";

interface DifficultyState {
  // Current difficulty level
  level: DifficultyLevel;
  
  // Whether the game has started (user has selected a level)
  hasSelectedLevel: boolean;
  
  // Set the difficulty level
  setDifficulty: (level: DifficultyLevel) => void;
  
  // Reset the difficulty selection (for returning to level select screen)
  resetDifficultySelection: () => void;
  
  // Speed multiplier for AI balls based on difficulty
  getSpeedMultiplier: () => number;
  
  // Chance that an AI ball will target powerups vs move randomly
  getPowerupTargetChance: () => number;
}

export const useDifficulty = create<DifficultyState>((set, get) => ({
  level: "medium", // Default to medium
  hasSelectedLevel: false, // Start with no selection
  
  setDifficulty: (level) => set({ 
    level, 
    hasSelectedLevel: true 
  }),
  
  resetDifficultySelection: () => set({
    hasSelectedLevel: false
  }),
  
  // Get speed multiplier based on current difficulty
  getSpeedMultiplier: () => {
    const { level } = get();
    switch (level) {
      case "easy":
        return 0.3; // 30% speed (reduced by 70%)
      case "medium":
        return 0.5; // 50% speed (reduced by 50%)
      case "hard":
        return 0.75; // 75% speed (reduced by 25%)
      case "super_hard":
      default:
        return 1.0; // 100% speed (full speed)
    }
  },
  
  // Get chance that AI will target powerups vs move randomly
  getPowerupTargetChance: () => {
    const { level } = get();
    switch (level) {
      case "easy":
        return 0.4; // 40% chance to target powerups
      case "medium":
        return 0.7; // 70% chance to target powerups
      case "hard":
        return 0.9; // 90% chance to target powerups
      case "super_hard":
      default:
        return 1.0; // 100% chance to target powerups
    }
  }
}));