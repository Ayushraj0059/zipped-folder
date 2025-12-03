import React, { useState, useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX } from "lucide-react";
import { useCameraSensitivityStore, DEFAULT_SENSITIVITIES } from "@/lib/stores/useCameraSensitivityStore";

interface SettingsMenuProps {
  onBackClick: () => void;
  backgroundStyle?: React.CSSProperties;
}

/**
 * Shared settings menu component for both main menu and pause menu
 * Currently includes audio toggle settings
 */
const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBackClick, backgroundStyle = {} }) => {
  
  // Get audio state and functions
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  const playHit = useAudio((state) => state.playHit);
  const backgroundMusic = useAudio((state) => state.backgroundMusic);
  
  // Get camera sensitivity values and functions
  const mouseSensitivity = useCameraSensitivityStore((state) => state.mouseSensitivity);
  const setSensitivity = useCameraSensitivityStore((state) => state.setSensitivity);
  
  // Local state for slider while dragging
  const [sensitivityValue, setSensitivityValue] = useState(mouseSensitivity);
  
  // Sync local state with store when the component mounts or sensitivity changes externally
  useEffect(() => {
    setSensitivityValue(mouseSensitivity);
  }, [mouseSensitivity]);

  // Handle audio toggle click with sound effects
  const handleAudioToggle = () => {
    if (isMuted) {
      // Unmuting - play a confirmation sound after toggle
      toggleMute();
      setTimeout(() => playHit(), 100);
    } else {
      // Muting - play sound before toggle
      playHit();
      setTimeout(() => toggleMute(), 100);
    }
  };
  
  // Handle back button click with sound
  const handleBackClick = () => {
    playHit();
    onBackClick();
  };
  
  // Handle sensitivity change during dragging
  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setSensitivityValue(newValue);
  };
  
  // Handle sensitivity change when slider is released
  const handleSensitivityMouseUp = () => {
    playHit();
    // Update the store with the new value
    setSensitivity(sensitivityValue);
  };

  // Desktop styles
  const menuStyle: React.CSSProperties = {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    ...backgroundStyle
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '32px',
    marginBottom: '30px',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    color: 'white',
  };
  
  const contentStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  };
  
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
  };

  const audioToggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 15px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const audioTextStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '16px',
  };

  const sliderContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '180px',
  };

  const rangeStyle: React.CSSProperties = {
    width: '140px',
    height: '8px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
    accentColor: '#4a90e2',
  };

  const valueStyle: React.CSSProperties = {
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  };

  const backButtonStyle: React.CSSProperties = {
    padding: '12px 20px',
    fontSize: '18px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    marginTop: '10px',
  };
  
  return (
    <div 
      className="pause-menu-container"
      style={{ 
        position: 'fixed',
        inset: '0',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }}
    >
      <div style={menuStyle}>
        <h2 style={headingStyle}>Settings</h2>
        
        <div style={contentStyle}>
          {/* Audio Toggle Setting */}
          <div style={itemStyle}>
            <span style={labelStyle}>Sound Effects</span>
            <button 
              onClick={handleAudioToggle}
              style={audioToggleStyle}
              aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <>
                  <VolumeX size={24} className="text-white" />
                  <span style={audioTextStyle}>OFF</span>
                </>
              ) : (
                <>
                  <Volume2 size={24} className="text-white" />
                  <span style={audioTextStyle}>ON</span>
                </>
              )}
            </button>
          </div>
          
          {/* Camera Sensitivity Slider */}
          <div style={itemStyle}>
            <span style={labelStyle}>Camera Sensitivity</span>
            <div style={sliderContainerStyle}>
              <input 
                type="range"
                min="0.001"
                max="0.02"
                step="0.001"
                value={sensitivityValue}
                onChange={handleSensitivityChange}
                onMouseUp={handleSensitivityMouseUp}
                style={rangeStyle}
                aria-label="Camera Sensitivity"
              />
              <span style={valueStyle}>{sensitivityValue.toFixed(3)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleBackClick}
          style={backButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;