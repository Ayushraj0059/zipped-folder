import React, { useEffect, useState } from "react";
import { useDifficulty } from "@/lib/stores/useDifficulty";

/**
 * LevelBanner component displays the current difficulty level with a visual banner
 * It appears in the top-left corner during gameplay, on pause menu, and game end screens
 */
const LevelBanner: React.FC = () => {
  // Get current difficulty level from store
  const level = useDifficulty(state => state.level);
  // Desktop-only component
  
  // Format the difficulty level for display (e.g., "super_hard" becomes "SUPER HARD")
  const formatDifficultyText = (difficultyLevel: string): string => {
    // Replace underscores with spaces and capitalize
    return difficultyLevel.replace('_', ' ').toUpperCase();
  };

  // Create the full level text string
  const fullLevelText = `LEVEL - ${formatDifficultyText(level)}`;
  
  // Direct banner container - no wrapper divs to prevent extra spacing
  const directBannerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    border: 0,
    outline: 0,
    zIndex: 998,
    display: 'block',
    width: '25vw', // Desktop width
    height: '13vh',
    backgroundImage: "url('/images/level banner wooden design.png')",
    backgroundPosition: 'top left',
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    lineHeight: 0,
  };
  
  // Text styles
  const textStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontFamily: "'Arial', sans-serif",
    fontWeight: 'bold',
    fontSize: 'clamp(12px, 1.6vw, 20px)',
    textAlign: 'center',
    textShadow: '0 0 4px #000, 0 0 4px #000, 0 0 4px #000, 0 0 4px #000',
    letterSpacing: '0.6px',
    whiteSpace: 'nowrap',
    width: 'auto',
    margin: 0,
    padding: 0,
  };
  
  return (
    <div style={directBannerStyle}>
      <div style={textStyle}>
        {fullLevelText}
      </div>
    </div>
  );
};

export default LevelBanner;