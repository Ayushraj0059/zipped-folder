import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import Ground from "./Ground";
import Ball from "./Ball";
import AIBall from "./AIBall";
import PowerUp from "./PowerUp";
import Controls from "./Controls";
import OrbitCamera from "./Camera";
import CameraControls from "./CameraControls";
import PhysicsWorld from "./PhysicsWorld";
import RankingSystem from "./RankingSystem";
import SpeedBoosterLogic from "./SpeedBoosterLogic";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useAIBallsStore } from "./AIBall";
import { useWinStore } from "./WinModal";
import { useDifficulty } from "@/lib/stores/useDifficulty";
import { useControls } from "@/lib/stores/useControls";

const GameScene = () => {
  const { start, phase } = useGame();
  const { gl } = useThree();
  const bgMusic = useAudio((state) => state.backgroundMusic);
  const playBackgroundMusic = useAudio((state) => state.playBackgroundMusic);
  const isMuted = useAudio((state) => state.isMuted);

  // Get difficulty settings
  const hasSelectedLevel = useDifficulty(state => state.hasSelectedLevel);
  
  // Get input control functions
  const { enableInput, disableInput } = useControls();
  
  // The game will now start after choosing a difficulty level from the modal
  // rather than auto-starting

  // Set canvas to be the size of the screen
  useEffect(() => {
    gl.setSize(window.innerWidth, window.innerHeight);
  }, [gl]);

  // Handle background music playback based on game state
  useEffect(() => {
    // Start playing background music if game is in playing state
    if (phase === "playing" && hasSelectedLevel) {
      console.log("Game phase changed to playing, checking if we should play background music");
      
      // Use the centralized audio function that respects mute state
      // This will only play if not muted, making this effect respect audio settings
      playBackgroundMusic();
    }
    
    // Clean up on unmount
    return () => {
      if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
      }
    };
  }, [bgMusic, phase, hasSelectedLevel, playBackgroundMusic, isMuted]);

  // Monitor game state changes to enable/disable input
  useEffect(() => {
    if (phase === "playing" && hasSelectedLevel) {
      console.log("Game state: PLAYING + LEVEL SELECTED - Enabling input");
      enableInput();
    } else {
      console.log(`Game state: ${phase} + LEVEL ${hasSelectedLevel ? 'SELECTED' : 'NOT SELECTED'} - Disabling input`);
      disableInput();
    }
  }, [phase, hasSelectedLevel, enableInput, disableInput]);

  // Get the win state to render the WinModal outside of the Three.js canvas
  const isWinner = useWinStore((state) => state.isWinner);

  return (
    <>
      {/* Physics world wrapper */}
      <PhysicsWorld>
        {/* Debug stats (only in dev) - with responsive styling */}
        {process.env.NODE_ENV === "development" && <Stats className="fps-panel" />}

        {/* Enhanced lighting for green platform with white fence */}
        <ambientLight intensity={0.6} /> {/* Brighter ambient for better visibility */}
        
        {/* Main directional light (sun) with ultra-realistic shadows */}
        <directionalLight 
          position={[15, 25, 15]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[4096, 4096]} // Very high resolution shadows
          shadow-bias={-0.0001} // Fix shadow acne
          shadow-camera-far={60}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          color="#fffaf0" // Warm sunlight color
        />
        
        {/* Secondary fill light from opposite direction */}
        <directionalLight 
          position={[-10, 10, -10]} 
          intensity={0.5} 
          castShadow={false}
          color="#e6f0ff" // Slight blue tint for fill light
        />
        
        {/* Hemisphere light for better green field illumination */}
        <hemisphereLight 
          args={["#b7f7ff", "#d6ffe0", 0.6]} // Sky blue to green ground
          position={[0, 1, 0]} 
        />
        
        {/* Soft edge lighting to make white fence pop */}
        <pointLight
          position={[0, 1, -30]} // Fixed position using direct value instead of radius reference
          intensity={0.3}
          color="#ffffff"
          distance={50}
          decay={2}
        />
        
        {/* Subtle point light below platform for depth */}
        <pointLight
          position={[0, -8, 0]}
          intensity={0.15}
          color="#7ab5ff"
          distance={40}
        />

        {/* Game elements */}
        <Ground />
        <Ball />
        
        {/* Create 9 AI-controlled balls distributed in a circle with fair starting positions */}
        {Array.from({ length: 9 }).map((_, index) => {
          // Calculate angle to distribute AI balls evenly in a circle
          // The player ball is at 90 degrees (Math.PI * 0.5)
          // so we'll distribute AI balls to avoid that position
          const baseAngle = (Math.PI * 2) / 9; // 9 AI balls
          const angle = baseAngle * index + (Math.PI / 9); // offset a bit
          
          // Use our fair position calculation function instead of purely random positions
          // This will place all AI balls at a similar distance from center as the player
          // Import is already available since we export it from AIBall.tsx
          
          // Define distinct colors for each AI ball with updated color codes
          const colors = [
            "#FF0000", // #1 - Red (was #e74c3c)
            "#0000FF", // #2 - Blue (was #3498db)
            "#00FF00", // #3 - Green (was #2ecc71)
            "#FFFF00", // #4 - Yellow (was #f1c40f)
            "#800080", // #5 - Purple (was #9b59b6)
            "#FFA500", // #6 - Orange (was #e67e22)
            "#00FFFF", // #7 - Cyan (was #1abc9c) - completely replaced
            "#000000", // #8 - Black (was #34495e) - completely replaced
            "#FF00FF"  // #9 - Magenta (was #95a5a6) - completely replaced
          ];
          
          return (
            <AIBall 
              key={index} 
              id={index + 1} 
              startAngle={angle} 
              color={colors[index]}
            />
          );
        })}
        
        <PowerUp />
        
        {/* Controls are always active for keyboard input */}
        <Controls />
        
        {/* Camera that orbits around the ball */}
        <OrbitCamera />
        
        {/* Camera controls for rotation */}
        <CameraControls />
        
        {/* Speed booster logic - handles the speed boost effect */}
        <SpeedBoosterLogic />
      </PhysicsWorld>
    </>
  );
};

export default GameScene;
