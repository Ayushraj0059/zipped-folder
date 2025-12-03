import React from "react";
import { usePauseStore } from "@/lib/stores/usePauseStore";
import { GameManager } from "@/lib/GameManager";
import { useAudio } from "@/lib/stores/useAudio";
import SettingsMenu from "./SettingsMenu";

/**
 * Pause menu component that appears when the game is paused
 * Displays a menu with options to resume, restart, settings, or return to main menu
 */
const PauseMenu = () => {
  // Get pause and settings state
  const { isPaused, isSettingsOpen, resumeGame, openSettings, closeSettings } = usePauseStore();
  

  
  // Get sound effects
  const playSuccess = useAudio(state => state.playSuccess);
  const playHit = useAudio(state => state.playHit);
  
  // Define desktop styles
  const menuStyle = {
    width: '400px',
    minHeight: '450px',
    maxHeight: 'auto',
    padding: '30px',
    borderRadius: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backgroundImage: "url('/images/pause-menu-bg.png')",
  } as React.CSSProperties;
  
  const headingStyle = {
    fontSize: '32px',
    marginBottom: '30px',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    color: 'white',
  } as React.CSSProperties;
  
  const buttonGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '80%',
  } as React.CSSProperties;
  
  const buttonStyle = {
    padding: '14px 20px',
    fontSize: '18px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    userSelect: 'none',
    minHeight: '50px',
  } as React.CSSProperties;
  
  // Handle various button clicks with sound effects
  const handleResumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    playSuccess();
    GameManager.resumeGame();
  };
  
  const handleRestartClick = (e: React.MouseEvent) => {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();
    
    playHit();
    GameManager.restartCurrentGame();
  };
  
  const handleSettingsClick = (e: React.MouseEvent | React.MouseEvent) => {
    // Prevent default behavior for both click and mouse
    e.preventDefault();
    e.stopPropagation();
    
    playHit();
    openSettings();
  };
  
  const handleMainMenuClick = (e: React.MouseEvent | React.MouseEvent) => {
    // Prevent default behavior for both click and mouse
    e.preventDefault();
    e.stopPropagation();
    
    playHit();
    GameManager.returnToMainMenu();
  };
  
  // Don't render if not paused
  if (!isPaused) return null;
  
  // Show settings screen if settings are open
  if (isSettingsOpen) {
    return (
      <div style={overlayStyle}>
        <SettingsMenu 
          onBackClick={closeSettings}
          backgroundStyle={{
            backgroundImage: "url('/images/pause-menu-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        />
      </div>
    );
  }
  
  // Otherwise show the main pause menu
  return (
    <div style={overlayStyle}>
      <div className="pause-menu-container" style={menuStyle}>
        <h2 style={headingStyle}>Game Paused</h2>
        
        <div style={buttonGroupStyle}>
          <button 
            style={buttonStyle} 
            onClick={handleResumeClick}
          >
            RESUME
          </button>
          
          <button 
            style={buttonStyle} 
            onClick={handleRestartClick}
          >
            RESTART
          </button>
          
          <button 
            style={buttonStyle} 
            onClick={handleSettingsClick}
          >
            SETTINGS
          </button>
          
          <button 
            style={buttonStyle} 
            onClick={handleMainMenuClick}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles for the pause menu overlay
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000, // Higher z-index to ensure it's above all other UI elements
  userSelect: 'none',
  pointerEvents: 'auto', // Ensure it catches all pointer events
};

export default PauseMenu;