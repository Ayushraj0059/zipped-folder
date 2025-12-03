import React, { useEffect } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useDifficulty } from "@/lib/stores/useDifficulty";
import { useSpeedBooster } from "@/lib/stores/useSpeedBooster";
import { useAudio } from "@/lib/stores/useAudio";

/**
 * Speed Booster button component that appears below the pause button
 * Only visible during gameplay
 */
const SpeedBoosterButton = () => {
  // Check if we're in gameplay
  const gamePhase = useGame(state => state.phase);
  const hasSelectedLevel = useDifficulty(state => state.hasSelectedLevel);
  const shouldShow = gamePhase === "playing" && hasSelectedLevel;
  
  // Get speed booster state
  const { boosterCount, isActive, hasBeenUsed, activateBooster } = useSpeedBooster();
  
  // Get speed booster sound effect (specific for speed booster activation)
  const playSpeedBoosterSound = useAudio(state => state.playSpeedBooster);
  
  // Handle speed booster button click/mouse with improved multi-mouse support
  const handleActivateBooster = (e: React.MouseEvent | React.MouseEvent) => {
    // Critical for mouse support - we must not disrupt existing mouse tracking
    
    // For mouse clicks, standard handling
    if (e.type === 'click') {
      e.preventDefault();
      e.stopPropagation();
    } else if (e.type === 'mousestart' || e.type === 'mouseend') {
      // For mouse events, we need special handling for multi-mouse support
      // ONLY prevent default (to avoid scrolling) but don't stop propagation
      // This is critical to maintain joystick operation
      e.preventDefault();
      
      // IMPORTANT: Do not call any functions that might reset or affect the mouse state
      // like stopPropagation() or any DOM manipulation on mouse elements
    }
    
    // Activate booster independently of mouse handling
    activateBooster();
    
    // Play speed booster sound when activated
    if (!hasBeenUsed && boosterCount > 0) {
      playSpeedBoosterSound();
    }
  };
  
  // Add keyboard shortcut for speed booster (Spacebar key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle spacebar in playing phase
      if (gamePhase !== "playing" || !hasSelectedLevel) return;
      
      // Spacebar to activate booster
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        
        // Activate booster
        activateBooster();
        
        // Play speed booster sound when activated
        if (!hasBeenUsed && boosterCount > 0) {
          playSpeedBoosterSound();
        }
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gamePhase, hasSelectedLevel, hasBeenUsed, boosterCount, activateBooster, playSpeedBoosterSound]);
  
  // Don't render if not in gameplay
  if (!shouldShow) return null;
  
  // Base button styles
  const baseButtonStyle: React.CSSProperties = {
    position: 'absolute', // Changed back to absolute
    top: '80px', // Below pause button
    right: '20px',
    width: '3.125rem',  // 50px → 3.125rem
    height: '3.125rem', // 50px → 3.125rem
    backgroundColor: isActive ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    border: '0.125rem solid white', // 2px → 0.125rem
    borderRadius: '0.625rem', // 10px → 0.625rem
    cursor: hasBeenUsed ? 'not-allowed' : 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    boxShadow: '0 0.125rem 0.625rem rgba(0, 0, 0, 0.3)', // 2px 10px → 0.125rem 0.625rem
    userSelect: 'none',
    opacity: hasBeenUsed ? 0.5 : 1,
    transition: 'all 0.2s ease',
  };
  
  // Check if we're on desktop using direct UA detection
  
  // desktop-specific overrides - sized to match pause button (2x original)
  const desktopButtonStyle: React.CSSProperties = false ? {
    width: '40px',
    height: '40px',
    minWidth: '40px',
    minHeight: '40px',
    border: '2px solid white',
    borderRadius: '8px',
    backgroundColor: isActive ? 'rgba(0, 255, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  } : {};
  
  // Merged button style
  const buttonStyle = {
    ...baseButtonStyle,
    ...desktopButtonStyle
  };

  // Base counter badge style
  const baseCounterStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-0.5rem',   // -8px → -0.5rem
    right: '-0.5rem', // -8px → -0.5rem
    backgroundColor: '#ff9800',
    color: 'white',
    borderRadius: '50%',
    width: '1.5rem',  // 24px → 1.5rem
    height: '1.5rem', // 24px → 1.5rem
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.75rem', // 12px → 0.75rem
    fontWeight: 'bold',
    border: '0.0625rem solid white', // 1px → 0.0625rem
  };
  
  // desktop-specific counter style (proportionally sized for the button)
  const desktopCounterStyle: React.CSSProperties = false ? {
    width: '16px',
    height: '16px',
    top: '-5px',
    right: '-5px',
    fontSize: '10px',
    border: '1px solid white',
  } : {};
  
  // Merged counter style
  const counterStyle = {
    ...baseCounterStyle,
    ...desktopCounterStyle
  };
  
  // Base image style
  const baseImageStyle: React.CSSProperties = {
    width: '2.5rem',  // Increased from 2.25rem (36px) to 2.5rem (40px)
    height: '2.5rem', // Increased from 2.25rem (36px) to 2.5rem (40px)
    objectFit: 'contain',
    pointerEvents: 'none',
    filter: isActive ? 'drop-shadow(0 0 0.3125rem rgba(255, 255, 255, 0.8))' : 'none', // 5px → 0.3125rem
  };
  
  // desktop-specific image sizes (proportional to button size)
  const desktopImageStyle: React.CSSProperties = false ? {
    width: '28px',  // Increased from 20px to 28px (40% bigger)
    height: '28px', // Increased from 20px to 28px (40% bigger)
  } : {};
  
  // Merged image style
  const imageStyle = {
    ...baseImageStyle,
    ...desktopImageStyle
  };
  
  return (
    <button
      style={buttonStyle}
      onClick={handleActivateBooster}
      aria-label="Speed Boost"
      disabled={hasBeenUsed}
    >
      <img 
        src="/images/speed-booster-button.png"
        alt="Speed Booster"
        style={imageStyle}
      />
      {!hasBeenUsed && (
        <div style={counterStyle}>{boosterCount}</div>
      )}
    </button>
  );
};

export default SpeedBoosterButton;