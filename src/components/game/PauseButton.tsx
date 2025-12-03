import React from "react";
import { usePauseStore } from "@/lib/stores/usePauseStore";
import { useGame } from "@/lib/stores/useGame";
import { useDifficulty } from "@/lib/stores/useDifficulty";
import { GameManager } from "@/lib/GameManager";

/**
 * Pause button component that appears at the top-right corner
 * Only visible during gameplay
 */
const PauseButton = () => {
  // Check if we're in gameplay
  const gamePhase = useGame(state => state.phase);
  const hasSelectedLevel = useDifficulty(state => state.hasSelectedLevel);
  const shouldShow = gamePhase === "playing" && hasSelectedLevel;
  
  // Handle pause button click/mouse
  const handlePause = (e: React.MouseEvent | React.MouseEvent) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Pause the game
    GameManager.pauseGame();
  };
  
  // Don't render if not in gameplay
  if (!shouldShow) return null;
  
  // Button styles with improved mouseability
  // Our desktop-ui.css will modify these styles on desktop devices
  // Desktop button style
  const baseButtonStyle: React.CSSProperties = {
    position: 'absolute', // Changed back to absolute
    top: '20px',  
    right: '20px',
    width: '3.125rem',  // 50px → 3.125rem
    height: '3.125rem', // 50px → 3.125rem
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '0.125rem solid white', // 2px → 0.125rem
    borderRadius: '0.625rem', // 10px → 0.625rem
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Higher z-index to ensure it's above other elements
    boxShadow: '0 0.125rem 0.625rem rgba(0, 0, 0, 0.3)', // 2px 10px → 0.125rem 0.625rem
    userSelect: 'none', // Prevent text selection
  };
  
  // Check if we're on desktop to apply desktop-specific styles
  
  // desktop-specific button style (proper 2x sizing as requested)
  const desktopButtonStyle: React.CSSProperties = false ? {
    width: '40px',
    height: '40px',
    minWidth: '40px',
    minHeight: '40px',
    border: '2px solid white',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  } : {};
  
  // Combine styles
  const buttonStyle = {
    ...baseButtonStyle,
    ...desktopButtonStyle
  };
  
  // SVG pause icon style - base style
  const basePauseIconStyle: React.CSSProperties = {
    width: '1.5rem',  // 24px → 1.5rem
    height: '1.5rem', // 24px → 1.5rem
    fill: 'white',
    pointerEvents: 'none', // Let mousees pass through to the button
  };
  
  // desktop-specific icon style (proportionally sized for the button)
  const desktopPauseIconStyle: React.CSSProperties = false ? {
    width: '20px',
    height: '20px',
  } : {};
  
  // Combine icon styles
  const pauseIconStyle = {
    ...basePauseIconStyle,
    ...desktopPauseIconStyle
  };
  
  return (
    <button
      style={buttonStyle}
      onClick={handlePause}
      aria-label="Pause Game"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        style={pauseIconStyle}
      >
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
      </svg>
    </button>
  );
};

export default PauseButton;