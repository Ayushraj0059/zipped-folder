import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "start_menu" | "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  
  // Actions
  showStartMenu: () => void;
  startGame: () => void;  // Navigate from start menu to level selection
  start: () => void;      // Start gameplay after level selection
  restart: () => void;
  end: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    // Default to start_menu when the game first loads
    phase: "start_menu",
    
    showStartMenu: () => {
      set(() => ({ phase: "start_menu" }));
    },
    
    startGame: () => {
      set((state) => {
        // Only transition from start_menu to ready (for level selection)
        if (state.phase === "start_menu") {
          return { phase: "ready" };
        }
        return {};
      });
    },
    
    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ phase: "ready" }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    }
  }))
);
