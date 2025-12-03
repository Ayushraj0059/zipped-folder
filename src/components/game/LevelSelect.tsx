import React from "react";
import { useDifficulty, DifficultyLevel } from "@/lib/stores/useDifficulty";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";

const LevelSelect: React.FC = () => {
  const { hasSelectedLevel, setDifficulty } = useDifficulty();
  const { start } = useGame();
  const playBackgroundMusic = useAudio(state => state.playBackgroundMusic);
  
  // Don't show if level has been selected
  if (hasSelectedLevel) {
    return null;
  }
  
  // Handle level selection
  const handleSelectLevel = (level: DifficultyLevel) => {
    setDifficulty(level);
    
    // Log the difficulty level
    console.log(`Game started with ${level.toUpperCase()} difficulty`);
    
    // Add specific difficulty logging
    switch (level) {
      case "easy":
        console.log("AI balls speed reduced by 70%, some move randomly");
        break;
      case "medium":
        console.log("AI balls speed reduced by 50%, fewer move randomly");
        break;
      case "hard":
        console.log("AI balls speed reduced by 25%, most target powerups");
        break;
      case "super_hard":
        console.log("AI balls at full speed, all target powerups precisely");
        break;
    }
    
    // Start the background music when level is selected
    console.log("Level selected, starting background music");
    
    // Create a silent sound to unlock the audio context
    const unlockAudio = new Audio();
    unlockAudio.play().catch(e => console.log("Audio unlock attempted"));
    
    // Force play the background music with a slight delay
    // This ensures the audio context is unlocked by user interaction
    setTimeout(() => {
      playBackgroundMusic();
      console.log("Background music play triggered after level selection");
    }, 100);
    
    // Start the game after selecting level
    start();
  };
  
  // Desktop responsive design
  const containerStyle = {
    width: 'clamp(280px, 70vw, 800px)',
    maxWidth: '800px',
    maxHeight: '90vh',
    padding: 'clamp(14px, 2.5vw, 32px)',
    margin: '2vh',
    boxSizing: 'border-box' as const
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div 
        className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-xl shadow-2xl border border-indigo-500"
        style={containerStyle}
      >
        <h1 
          className="font-bold text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{
            fontSize: 'clamp(20px, 4.5vw, 48px)',
            marginBottom: 'clamp(16px, 3.5vh, 32px)'
          }}
        >
          Select Difficulty
        </h1>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            gap: 'clamp(12px, 2vw, 16px)',
            marginBottom: 'clamp(20px, 3vh, 32px)'
          }}
        >
          {/* Easy difficulty */}
          <button
            onClick={() => handleSelectLevel("easy")}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            style={{
              padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 1.8vw, 16px)',
            }}
          >
            <div style={{ fontSize: 'clamp(16px, 2.8vw, 24px)', marginBottom: 'clamp(6px, 1vh, 8px)' }}>Easy</div>
            <div style={{ fontSize: 'clamp(11px, 1.8vw, 14px)' }}>
              • AI balls move 70% slower<br />
              • Some AI balls move randomly<br />
              • Perfect for beginners
            </div>
          </button>
          
          {/* Medium difficulty */}
          <button
            onClick={() => handleSelectLevel("medium")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            style={{
              padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 1.8vw, 16px)',
            }}
          >
            <div style={{ fontSize: 'clamp(16px, 2.8vw, 24px)', marginBottom: 'clamp(6px, 1vh, 8px)' }}>Medium</div>
            <div style={{ fontSize: 'clamp(11px, 1.8vw, 14px)' }}>
              • AI balls move 50% slower<br />
              • Most AI balls target powerups<br />
              • Balanced challenge
            </div>
          </button>
          
          {/* Hard difficulty */}
          <button
            onClick={() => handleSelectLevel("hard")}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            style={{
              padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 1.8vw, 16px)',
            }}
          >
            <div style={{ fontSize: 'clamp(16px, 2.8vw, 24px)', marginBottom: 'clamp(6px, 1vh, 8px)' }}>Hard</div>
            <div style={{ fontSize: 'clamp(11px, 1.8vw, 14px)' }}>
              • AI balls move 25% slower<br />
              • Nearly all AI balls target powerups<br />
              • For skilled players
            </div>
          </button>
          
          {/* Super Hard difficulty */}
          <button
            onClick={() => handleSelectLevel("super_hard")}
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 border border-red-400"
            style={{
              padding: 'clamp(12px, 2.5vh, 24px) clamp(10px, 1.8vw, 16px)',
            }}
          >
            <div style={{ fontSize: 'clamp(16px, 2.8vw, 24px)', marginBottom: 'clamp(6px, 1vh, 8px)' }}>🔥 Super Hard</div>
            <div style={{ fontSize: 'clamp(11px, 1.8vw, 14px)' }}>
              • AI balls at full speed<br />
              • All AI balls precisely target powerups<br />
              • For expert players only
            </div>
          </button>
        </div>
        
        <div 
          className="text-center text-white"
          style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}
        >
          Select a difficulty level to begin the game. The difficulty affects how the AI opponents behave.
        </div>
      </div>
    </div>
  );
};

export default LevelSelect;