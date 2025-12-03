import React, { useEffect } from "react";
import { create } from "zustand";
import VictoryScreen from "./VictoryScreen";
import DefeatScreen from "./DefeatScreen";
import TiebreakerScreen from "./TiebreakerScreen";
import { GameManager } from "@/lib/GameManager";
import { useAudio } from "@/lib/stores/useAudio";

// Enhanced store for win state with new win condition details
interface WinState {
  isWinner: boolean;
  winnerId: number | null;
  winnerIsPlayer: boolean;
  winnerColor: string;
  powerupsCount: number;
  winReason: 'primary' | 'most-powerups' | 'tiebreaker' | null;
  playerWasInTie: boolean; // New flag to track if player was in tie
  
  // Methods
  setWinner: (
    id: number | null, 
    isPlayer: boolean, 
    color: string, 
    powerupsCount: number,
    reason: 'primary' | 'most-powerups' | 'tiebreaker',
    playerWasInTie?: boolean
  ) => void;
  resetWin: () => void;
}

export const useWinStore = create<WinState>((set) => ({
  isWinner: false,
  winnerId: null,
  winnerIsPlayer: false,
  winnerColor: "",
  powerupsCount: 0,
  winReason: null,
  playerWasInTie: false,
  
  setWinner: (id, isPlayer, color, powerupsCount, reason, playerWasInTie = false) => set({ 
    isWinner: true, 
    winnerId: id, 
    winnerIsPlayer: isPlayer,
    winnerColor: color,
    powerupsCount,
    winReason: reason,
    playerWasInTie
  }),
  
  resetWin: () => set({ 
    isWinner: false, 
    winnerId: null, 
    winnerIsPlayer: false,
    winnerColor: "",
    powerupsCount: 0,
    winReason: null,
    playerWasInTie: false
  })
}));

/**
 * Enhanced WinModal component that shows different screens based on the win condition
 * - VictoryScreen: When the player wins
 * - DefeatScreen: When an AI ball wins
 * - TiebreakerScreen: For tiebreaker outcomes
 */
function WinModal() {
  const { 
    isWinner, 
    winnerId, 
    winnerIsPlayer, 
    winnerColor, 
    powerupsCount, 
    winReason,
    playerWasInTie
  } = useWinStore();
  
  // Get audio for victory/defeat sounds
  const playVictorySound = useAudio(state => state.playVictory);
  const playDefeatSound = useAudio(state => state.playDefeat);
  
  // Play the appropriate sound effect when a winner is determined
  useEffect(() => {
    if (isWinner && winReason) {
      // Force user interaction event to bypass autoplay restrictions
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log("AudioContext resumed in WinModal!");
            
            // Play the appropriate sound after ensuring AudioContext is active
            if (winnerIsPlayer) {
              console.log("Playing victory sound");
              playVictorySound();
            } else {
              console.log("Playing defeat sound");
              playDefeatSound();
            }
          });
        } else {
          // AudioContext is already running, play sounds directly
          if (winnerIsPlayer) {
            console.log("Playing victory sound (AudioContext already active)");
            playVictorySound();
          } else {
            console.log("Playing defeat sound (AudioContext already active)");
            playDefeatSound();
          }
        }
      } catch (error) {
        console.error("Error playing win/defeat sound:", error);
        
        // Fallback direct play attempt
        if (winnerIsPlayer) {
          console.log("Fallback: Playing victory sound");
          playVictorySound();
        } else {
          console.log("Fallback: Playing defeat sound");
          playDefeatSound();
        }
      }
    }
  }, [isWinner, winReason, winnerIsPlayer, playVictorySound, playDefeatSound]);
  
  // Only show when there's a winner
  if (!isWinner || !winReason) return null;
  
  const handleRestart = () => {
    // Use the new GameManager to handle the restart process in a clean, modular way
    GameManager.restartGame();
  };
  
  const handleMainMenu = () => {
    // Use the GameManager to return to the main menu
    GameManager.returnToMainMenu();
  };
  
  // Show different screens based on winner and reason
  if (winnerIsPlayer) {
    return (
      <VictoryScreen 
        color={winnerColor}
        powerupsCount={powerupsCount}
        winReason={winReason}
        onPlayAgain={handleRestart}
        onMainMenu={handleMainMenu}
      />
    );
  } else if (winReason === 'tiebreaker' && playerWasInTie) {
    // Only show TiebreakerScreen when player is involved in the tie
    console.log("Showing tiebreaker screen because player was involved in the tie");
    return (
      <TiebreakerScreen
        winnerId={winnerId}
        winnerIsPlayer={winnerIsPlayer}
        winnerColor={winnerColor}
        powerupsCount={powerupsCount}
        onPlayAgain={handleRestart}
        onMainMenu={handleMainMenu}
      />
    );
  } else {
    // Show DefeatScreen for all other cases including AI ball tiebreakers
    return (
      <DefeatScreen 
        winnerId={winnerId || 0}
        winnerColor={winnerColor}
        powerupsCount={powerupsCount}
        winReason={winReason}
        onPlayAgain={handleRestart}
        onMainMenu={handleMainMenu}
      />
    );
  }
};

export default WinModal;