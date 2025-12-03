import React from "react";
import { useSpeedBooster } from "@/lib/stores/useSpeedBooster.tsx";
import { useAudio } from "@/lib/stores/useAudio";

interface SpeedBoosterPopupProps {
  onClose: () => void;
  backgroundStyle?: React.CSSProperties;
}

/**
 * Speed Booster popup component that displays current count and watch ad option
 * Styled to match the Settings modal design
 */
const SpeedBoosterPopup: React.FC<SpeedBoosterPopupProps> = ({ onClose, backgroundStyle }) => {
  const { boosterCount } = useSpeedBooster();
  const playHit = useAudio(state => state.playHit);

  const handleWatchAdClick = () => {
    playHit();
    // Placeholder for future ad functionality
    alert("Watch Ad feature coming soon!");
  };

  const handleCloseClick = () => {
    playHit();
    onClose();
  };

  const popupStyle: React.CSSProperties = {
    width:  '400px',
    maxWidth: '500px',
    minHeight:  '350px',
    padding:  '30px',
    borderRadius: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    ...backgroundStyle,
  };

  const headingStyle: React.CSSProperties = {
    fontSize:  '32px',
    marginBottom:  '30px',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    color: 'white',
    fontWeight: 'bold',
  };

  const countDisplayStyle: React.CSSProperties = {
    fontSize:  '64px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFD700',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
    marginBottom:  '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding:  '15px 30px',
    fontSize:  '18px',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    color: '#FFD700',
    border: '2px solid #FFD700',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
    marginBottom: '15px',
    width: '100%',
    maxWidth: '250px',
  };

  const closeButtonStyle: React.CSSProperties = {
    padding:  '12px 24px',
    fontSize:  '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
  };

  return (
    <div style={popupStyle}>
      <h2 style={headingStyle}>🚀 Speed Boosters</h2>
      
      <div style={countDisplayStyle}>
        <span>{boosterCount}</span>
      </div>
      
      <button
        style={buttonStyle}
        onClick={handleWatchAdClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        📺 Watch Ad (coming soon)
      </button>
      
      <button
        style={closeButtonStyle}
        onClick={handleCloseClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Close
      </button>
    </div>
  );
};

export default SpeedBoosterPopup;