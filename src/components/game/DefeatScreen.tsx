import React from 'react';

// Defeat screen - removed 3D elements, added colored ball
interface DefeatScreenProps {
  winnerId: number;
  winnerColor: string; // This is required to display the colored AI ball
  powerupsCount: number;
  winReason: 'primary' | 'most-powerups' | 'tiebreaker';
  onPlayAgain: () => void;
  onMainMenu?: () => void; // New prop for Main Menu button
}

// Defeat screen component without 3D elements
const DefeatScreen: React.FC<DefeatScreenProps> = ({ 
  winnerId,
  winnerColor,
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
        {/* Background image for defeat screen */}
        <div 
          className="relative overflow-hidden rounded-lg shadow-2xl"
          style={{
            aspectRatio: '16/9'
          }}
        >
          <img 
            src="/images/defeat.jpg" 
            alt="Defeat" 
            className="w-full h-full object-cover absolute inset-0 z-10"
          />
          
          {/* AI Ball with its number in the center of the screen */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="relative flex items-center justify-center rounded-full z-20"
              style={{ 
                backgroundColor: winnerColor,
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                width: 'clamp(80px, 15vw, 160px)',
                height: 'clamp(80px, 15vw, 160px)'
              }}
            >
              <div 
                className="bg-white rounded-full flex items-center justify-center"
                style={{
                  width: 'clamp(48px, 9vw, 96px)',
                  height: 'clamp(48px, 9vw, 96px)'
                }}
              >
                <span 
                  className="text-black font-bold"
                  style={{
                    fontSize: 'clamp(20px, 4vw, 40px)'
                  }}
                >
                  {winnerId}
                </span>
              </div>
            </div>
          </div>
          
          {/* Defeat message below the image */}
          <div 
            className="absolute bottom-0 left-0 right-0 text-center bg-gradient-to-t from-black/80 to-transparent z-20"
            style={{
              padding: 'clamp(16px, 3vh, 24px)'
            }}
          >
            <h2 
              className="font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{
                fontSize: 'clamp(18px, 3.8vw, 48px)',
                marginBottom: 'clamp(8px, 1.5vh, 16px)'
              }}
            >
              AI BALL #{winnerId} WON!
            </h2>
            
            <p 
              className="text-red-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              style={{
                fontSize: 'clamp(12px, 2.5vw, 28px)',
                marginBottom: 'clamp(16px, 3vh, 24px)'
              }}
            >
              {winReason === 'primary' && `AI Ball #${winnerId} collected 5 power-ups before anyone else.`}
              {winReason === 'most-powerups' && `AI Ball #${winnerId} collected the most power-ups (${powerupsCount}).`}
              {winReason === 'tiebreaker' && `AI Ball #${winnerId} was the first to collect ${powerupsCount} power-ups.`}
              <br />Try again to win!
            </p>
            
            <div 
              className="flex justify-center"
              style={{ gap: 'clamp(12px, 2vw, 16px)' }}
            >
              <button
                onClick={onPlayAgain}
                className="font-bold text-white bg-gradient-to-r from-red-600 to-orange-500 rounded-full hover:from-red-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  padding: 'clamp(8px, 2vh, 12px) clamp(16px, 4vw, 32px)',
                  fontSize: 'clamp(14px, 2.5vw, 18px)'
                }}
              >
                PLAY AGAIN
              </button>
              <button
                onClick={onMainMenu}
                className="font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-full hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  padding: 'clamp(8px, 2vh, 12px) clamp(16px, 4vw, 32px)',
                  fontSize: 'clamp(14px, 2.5vw, 18px)'
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

export default DefeatScreen;