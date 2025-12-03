import React, { useEffect, useState } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useSpeedBooster } from "@/lib/stores/useSpeedBooster";

/**
 * Speed Boost indicator that appears during active speed boost
 * Shows a glowing "SPEED BOOST" text at the top center of screen
 */
const SpeedBoostCountdown = () => {
  // Get speed booster state
  const { isActive } = useSpeedBooster();
  
  // Get game phase to ensure we only show during gameplay
  const gamePhase = useGame(state => state.phase);
  
  // State for opacity animation
  const [opacity, setOpacity] = useState(0);
  
  // Create fading effect when boost activates and deactivates
  useEffect(() => {
    if (isActive) {
      // Fade in
      setOpacity(1);
    } else {
      // Fade out
      setOpacity(0);
    }
  }, [isActive]);
  
  // Don't render if not in playing phase
  if (gamePhase !== "playing") return null;
  
  // Container style with fade-in/fade-out animation
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2.5rem',   // 40px → 2.5rem
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none', // Let mousees pass through
    opacity: opacity,
    transition: 'opacity 0.4s ease-in-out',
  };
  
  // Enhanced speed boost text style with fiery glowing effect
  const boostTextStyle: React.CSSProperties = {
    fontSize: 'clamp(1.125rem, 5vw, 2.25rem)', // 18px-36px → 1.125rem-2.25rem
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow:
      '0 0 0.5rem #FF4500, 0 0 1rem #FF6347, 0 0 1.5rem #FF8C00, 0 0 2rem #FFA500, 0 0 2.5rem #FFD700',
    letterSpacing: '0.125rem',  // 2px → 0.125rem
    textTransform: 'uppercase',
    fontFamily: "'Orbitron', 'Arial Black', sans-serif",
    animation: 'pulseFire 1.2s infinite ease-in-out',
    whiteSpace: 'nowrap', // Prevent text wrapping
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  return (
    <div style={containerStyle}>
      <div 
        style={boostTextStyle}
        className="speed-boost-text"
      >
        SPEED BOOST
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseFire {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.07);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
};

export default SpeedBoostCountdown;