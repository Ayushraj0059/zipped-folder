import React, { useState, useEffect } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useSpeedBooster } from "@/lib/stores/useSpeedBooster.tsx";
import SettingsMenu from "./SettingsMenu";
import SpeedBoosterPopup from "./SpeedBoosterPopup";
import HelpTutorialPopup from "./HelpTutorialPopup";

/**
 * Start Menu component for the game
 * Displays a full-screen menu with a background image and buttons
 * for starting the game, accessing settings, or exiting
 */
const StartMenu: React.FC = () => {
  const { startGame } = useGame();
  const playSuccess = useAudio(state => state.playSuccess);
  const playHit = useAudio(state => state.playHit);
  
  // State to track if settings menu is open
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // State to track if speed booster popup is open
  const [isSpeedBoosterOpen, setIsSpeedBoosterOpen] = useState(false);
  
  // State to track if help tutorial popup is open
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Get speed booster count
  const { boosterCount: speedBoosterCount } = useSpeedBooster();
  
  // Handle button clicks with sound effects
  const handleStartClick = () => {
    playSuccess();
    startGame();
  };
  
  const handleSettingsClick = () => {
    playHit();
    setIsSettingsOpen(true);
  };
  
  const handleSettingsClose = () => {
    playHit();
    setIsSettingsOpen(false);
  };
  
  const handleExitClick = () => {
    playHit();
    // Exit functionality is just a placeholder for now
    alert("Exit functionality is not available in the web version.");
  };
  
  const handleSpeedBoosterClick = () => {
    playHit();
    setIsSpeedBoosterOpen(true);
  };
  
  const handleSpeedBoosterClose = () => {
    playHit();
    setIsSpeedBoosterOpen(false);
  };
  
  const handleHelpClick = () => {
    playHit();
    setIsHelpOpen(true);
  };
  
  const handleHelpClose = () => {
    playHit();
    setIsHelpOpen(false);
  };
  
  // Show the settings menu if it's open
  if (isSettingsOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between items-center overflow-hidden" 
           style={{
             backgroundImage: "url('/images/start-menu-bg.jpg')",
             backgroundRepeat: "no-repeat",
             backgroundPosition: "center center",
             backgroundSize: "cover"
           }}>
        <div className="flex-grow"></div>
        <div className="flex items-center justify-center flex-grow">
          <SettingsMenu 
            onBackClick={handleSettingsClose}
            backgroundStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            }}
          />
        </div>
        <div className="flex-grow"></div>
      </div>
    );
  }
  
  // Show the speed booster popup if it's open
  if (isSpeedBoosterOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" 
           style={{
             backgroundImage: "url('/images/StartMenuBGnew1.jpg')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             backgroundRepeat: "no-repeat"
           }}>
        <SpeedBoosterPopup 
          onClose={handleSpeedBoosterClose}
          backgroundStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        />
      </div>
    );
  }
  
  // Show the help tutorial popup if it's open
  if (isHelpOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" 
           style={{
             backgroundImage: "url('/images/start-menu-bg.jpg')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             backgroundRepeat: "no-repeat"
           }}>
        <HelpTutorialPopup 
          onClose={handleHelpClose}
          backgroundStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          }}
        />
      </div>
    );
  }
  
  // Otherwise show the main menu
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center overflow-hidden" 
         style={{
           backgroundImage: "url('/images/start-menu-bg.jpg')",
           backgroundRepeat: "no-repeat",
           backgroundPosition: "center center",
           backgroundSize: "cover"
         }}>
      
      {/* No overlays or decorative elements - just the clean background image */}
      
      {/* Help Button - positioned in top-right corner */}
      <div className="absolute top-8 right-8 z-30">
        <button
          onClick={handleHelpClick}
          className="relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            width: '80px',
            height: '80px',
          }}
        >
          <img 
            src="/images/help-icon.png" 
            alt="Help & Tutorial"
            className="drop-shadow-lg w-full h-full object-contain"
          />
        </button>
      </div>
      
      {/* Title is already in the background image */}
      <div className="flex-grow relative z-10"></div>
      
      {/* Speed Booster Icon Button - positioned in bottom-left area */}
      <div className="absolute bottom-12 left-8 z-30">
        <button
          onClick={handleSpeedBoosterClick}
          className="relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            width: '280px',
            height: '200px',
            overflow: 'hidden',
          }}
        >
          <img 
            src="/images/speed-booster-icon.png" 
            alt="Speed Booster"
            className="drop-shadow-lg"
            style={{
              width: '280px',
              height: '280px',
            }}
          />
          {/* Count display */}
          <div 
            className="absolute bottom-6 left-10 bg-yellow-500 text-black font-bold rounded-full min-w-6 h-6 flex items-center justify-center text-xs border-2 border-white shadow-lg"
            style={{
              fontSize: '24px',
              minWidth: '48px',
              height: '48px',
            }}
          >
            {speedBoosterCount}
          </div>
        </button>
      </div>
      
      {/* Menu buttons at the bottom of the screen */}
      <div className="mb-16 flex flex-col gap-6 relative z-20 w-72" id="start-menu-buttons">
        <button
          onClick={handleStartClick}
          className="bg-gradient-to-r from-blue-700 to-blue-500 text-white text-xl font-bold tracking-wider py-4 px-8 
                   rounded-full border-2 border-blue-300 shadow-xl transition-all duration-300
                   hover:shadow-blue-400/50 hover:shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-400
                   focus:outline-none focus:ring-4 focus:ring-blue-300/50 active:scale-95
                   animate-fadeIn w-full"
          style={{ 
            animationDelay: "0.2s"
          }}
        >
          START
        </button>
        
        <button
          onClick={handleSettingsClick}
          className="bg-gradient-to-r from-purple-700 to-indigo-500 text-white text-xl font-bold tracking-wider py-4 px-8 
                   rounded-full border-2 border-purple-300 shadow-xl transition-all duration-300
                   hover:shadow-purple-400/50 hover:shadow-lg hover:scale-105 hover:from-purple-600 hover:to-indigo-400
                   focus:outline-none focus:ring-4 focus:ring-purple-300/50 active:scale-95
                   animate-fadeIn w-full"
          style={{ 
            animationDelay: "0.4s"
          }}
        >
          SETTINGS
        </button>
        
        <button
          onClick={handleExitClick}
          className="bg-gradient-to-r from-red-700 to-orange-500 text-white text-xl font-bold tracking-wider py-4 px-8 
                   rounded-full border-2 border-red-300 shadow-xl transition-all duration-300
                   hover:shadow-red-400/50 hover:shadow-lg hover:scale-105 hover:from-red-600 hover:to-orange-400
                   focus:outline-none focus:ring-4 focus:ring-red-300/50 active:scale-95
                   animate-fadeIn w-full"
          style={{ 
            animationDelay: "0.6s"
          }}
        >
          EXIT
        </button>
      </div>
      
      {/* Main Menu Banner Ad Placeholder */}
      <div 
        id="main-menu-banner-ad"
        className="ad-banner-placeholder"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          width: '70%',
          maxHeight: '90px',
          overflow: 'hidden',
          background: 'rgba(0, 0, 0, 0.1)',
          border: '1px dashed rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'Arial, sans-serif',
          minHeight: '60px'
        }}
      >
        <span>Ad Banner Placeholder</span>
      </div>
    </div>
  );
};

export default StartMenu;