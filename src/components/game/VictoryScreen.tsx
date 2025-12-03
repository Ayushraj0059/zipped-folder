import React from 'react';

// Simple victory screen without 3D elements
interface VictoryScreenProps {
  color: string;
  powerupsCount: number;
  winReason: 'primary' | 'most-powerups' | 'tiebreaker';
  onPlayAgain: () => void;
  onMainMenu?: () => void; // New prop for Main Menu button
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ 
  powerupsCount, 
  winReason,
  onPlayAgain,
  onMainMenu
}) => {
  // Desktop container dimensions
  const containerStyle = {
    width: 'clamp(300px, 85vw, 1024px)',
    margin: '2vh'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="relative text-center"
        style={containerStyle}
      >
        {/* Background image from user */}
        <div 
          className="relative overflow-hidden rounded-lg shadow-2xl"
          style={{
            aspectRatio: '16/9'
          }}
        >
          <img 
            src="/images/victory.jpg" 
            alt="Victory" 
            className="w-full h-full object-cover"
          />
          
          {/* Player ball image in the center of the screen */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <img 
              src="/images/playersBallImage.png" 
              alt="Player Ball"
              className="object-contain"
              style={{
                width: 'clamp(70px, 13vw, 160px)',
                height: 'clamp(70px, 13vw, 160px)',
                zIndex: 25
              }}
            />
          </div>
          
          {/* Victory message below the image */}
          <div 
            className="absolute bottom-0 left-0 right-0 text-center bg-gradient-to-t from-black/80 to-transparent z-30"
            style={{
              padding: 'clamp(16px, 3vh, 24px)',
              zIndex: 30
            }}
          >
            <h2 
              className="font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{
                fontSize: 'clamp(18px, 3.8vw, 48px)',
                marginBottom: 'clamp(8px, 1.5vh, 16px)'
              }}
            >
              YOU WON!
            </h2>
            
            <p 
              className="text-blue-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              style={{
                fontSize: 'clamp(12px, 2.5vw, 28px)',
                marginBottom: 'clamp(16px, 3vh, 24px)'
              }}
            >
              {winReason === 'primary' && `Congratulations! You've collected 5 power-ups!`}
              {winReason === 'most-powerups' && `Congratulations! You've collected the most power-ups (${powerupsCount})!`}
              {winReason === 'tiebreaker' && `Congratulations! You were the first to collect ${powerupsCount} power-ups!`}
            </p>
            
            <div 
              className="flex justify-center"
              style={{ gap: 'clamp(12px, 2vw, 16px)' }}
            >
              <button
                onClick={onPlayAgain}
                className="font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  padding: 'clamp(6px, 1.8vh, 12px) clamp(12px, 3.5vw, 32px)',
                  fontSize: 'clamp(12px, 2.2vw, 18px)'
                }}
              >
                PLAY AGAIN
              </button>
              <button
                onClick={onMainMenu}
                className="font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  padding: 'clamp(6px, 1.8vh, 12px) clamp(12px, 3.5vw, 32px)',
                  fontSize: 'clamp(12px, 2.2vw, 18px)'
                }}
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;