import React from 'react';

// Tiebreaker screen - removed 3D elements
interface TiebreakerScreenProps {
  winnerId: number | null;
  winnerIsPlayer: boolean;
  winnerColor: string; // Keeping this prop to avoid changing interface, but it's not used anymore
  powerupsCount: number;
  onPlayAgain: () => void;
  onMainMenu?: () => void; // New prop for Main Menu button
}

// Tiebreaker screen component without 3D elements
const TiebreakerScreen: React.FC<TiebreakerScreenProps> = ({ 
  winnerId,
  winnerIsPlayer, 
  winnerColor, 
  powerupsCount,
  onPlayAgain,
  onMainMenu
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="relative text-center high-dpi-end-screen"
        style={{
          width: 'clamp(300px, 85vw, 1024px)',
          margin: '2vh'
        }}
      >
        {/* Tiebreaker background image */}
        <div 
          className="relative overflow-hidden rounded-lg shadow-2xl"
          style={{
            aspectRatio: '16/9'
          }}
        >
          {/* Using the new tiebreaker.jpg image */}
          <img 
            src="/images/tiebreaker.jpg" 
            alt="Tiebreaker"
            className="w-full h-full object-cover absolute inset-0 z-10"
          />
          
          {/* Display either player ball or AI ball based on winner */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {winnerIsPlayer ? (
              // Player ball image
              <img 
                src="/images/playersBallImage.png" 
                alt="Player Ball"
                className="object-contain z-20"
                style={{
                  width: 'clamp(80px, 15vw, 160px)',
                  height: 'clamp(80px, 15vw, 160px)'
                }}
              />
            ) : (
              // AI ball with its number
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
            )}
          </div>
          
          {/* Tiebreaker message below the image */}
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
              {winnerIsPlayer ? "YOU WON!" : `AI BALL #${winnerId} WON!`}
            </h2>
            
            <p 
              className="text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              style={{
                fontSize: 'clamp(12px, 2.5vw, 28px)',
                marginBottom: 'clamp(16px, 3vh, 24px)'
              }}
            >
              {winnerIsPlayer 
                ? `Congratulations! You were the first to collect ${powerupsCount} power-ups!`
                : `AI Ball #${winnerId} was the first to collect ${powerupsCount} power-ups.\nTry again to win!`
              }
            </p>
            
            <div 
              className="flex justify-center"
              style={{ gap: 'clamp(12px, 2vw, 16px)' }}
            >
              <button
                onClick={onPlayAgain}
                className="font-bold text-white bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full hover:from-amber-700 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  padding: 'clamp(8px, 2vh, 12px) clamp(16px, 4vw, 32px)',
                  fontSize: 'clamp(14px, 2.5vw, 18px)'
                }}
              >
                PLAY AGAIN
              </button>
              <button
                onClick={onMainMenu}
                className="font-bold text-white bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full hover:from-yellow-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
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

export default TiebreakerScreen;