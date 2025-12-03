import React, { useEffect, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import GameScene from "./components/game/GameScene";
import WinModal from "./components/game/WinModal";
import LevelSelect from "./components/game/LevelSelect";
import RankingSystem from "./components/game/RankingSystem";
import CameraLockMessage from "./components/game/CameraLockMessage";
import EscKeyReminder from "./components/game/EscKeyReminder";
// Audio toggle is now handled in settings menu
import StartMenu from "./components/game/StartMenu";
import PauseButton from "./components/game/PauseButton";
import PauseMenu from "./components/game/PauseMenu";
import LevelBanner from "./components/game/LevelBanner";
import SpeedBoosterButton from "./components/game/SpeedBoosterButton";
import SpeedBoosterLogic from "./components/game/SpeedBoosterLogic";
import SpeedBoostCountdown from "./components/game/SpeedBoostCountdown";
import MobileBlocker from "./components/ui/MobileBlocker";
import { detectDevice } from "./hooks/useDeviceDetection";
import { usePointerLockStore } from "./lib/stores/usePointerLockStore";
import { useRapidClickStore } from "./lib/stores/useRapidClickStore";
import { useGame } from "./lib/stores/useGame";
import { useDifficulty } from "./lib/stores/useDifficulty";
import { usePauseStore } from "./lib/stores/usePauseStore";
import { setupContentProtection } from "./lib/preventContentCopy";
import "@fontsource/inter";
// Import content protection styles
import "./styles/content-protection.css";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
];

// Main App component
function App() {
  // State for audio initialization - initialized by default now
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Device detection - block mobile and tablet users
  // Check early to prevent any React hooks issues on mobile devices
  const deviceInfo = detectDevice();
  if (!deviceInfo.isDesktop || deviceInfo.isMobile || deviceInfo.isTablet) {
    return <MobileBlocker />;
  }
  
  // Get game state to determine when to show the camera control message
  const gamePhase = useGame(state => state.phase);
  const hasSelectedLevel = useDifficulty(state => state.hasSelectedLevel);
  
  // Get pointer lock state
  const isPointerLocked = usePointerLockStore((state) => state.isLocked);
  
  // Get rapid click state to show ESC key reminder
  const showEscReminder = useRapidClickStore(state => state.showEscReminder);
  
  // Get pause state and functions
  const isPaused = usePauseStore(state => state.isPaused);
  const togglePause = usePauseStore(state => state.togglePause);
  
  // Determine if we should show the camera message (only during active gameplay)
  const showCameraMessage = !isPointerLocked && 
                           gamePhase === "playing" &&
                           hasSelectedLevel &&
                           !isPaused; // Don't show during pause
                           
  // Add keyboard shortcut for pause menu with the Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle pause key in playing phase
      if (gamePhase !== "playing" || !hasSelectedLevel) return;
      
      // P key or Escape key to toggle pause
      if (e.code === 'KeyP' || e.code === 'Escape') {
        // If pointer is locked, don't pause on first Escape press
        // as that's used to exit pointer lock
        if (e.code === 'Escape' && isPointerLocked) return;
        
        // Toggle pause state
        if (e.code === 'KeyP' || !isPointerLocked) {
          e.preventDefault();
          togglePause();
        }
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gamePhase, hasSelectedLevel, isPointerLocked, togglePause]);
                           
  // Function to initialize audio context and enable sounds
  const initializeAudio = () => {
    try {
      // Create and resume audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Create a silent oscillator to kick-start audio system
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.001; // Almost silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(0);
      oscillator.stop(0.1);
      
      // Load sounds directly here
      const hit = new Audio("/sounds/hit.mp3");
      const success = new Audio("/sounds/success.mp3");
      const background = new Audio("/sounds/background.mp3");
      const playerPowerup = new Audio("/sounds/powerups_collection audio_tone.mp3");
      const speedBooster = new Audio("/sounds/speed_booster.mp3");
      const victory = new Audio("/sounds/Victory_Sound_effect.mp3");
      const defeat = new Audio("/sounds/Defeat_sound_effect.mp3");
      
      // Test play and immediately pause each sound to ensure it's loaded
      const testAndPause = async (audio: HTMLAudioElement, name: string) => {
        try {
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
          console.log(`${name} loaded and tested successfully`);
        } catch (e) {
          console.error(`Error testing ${name}:`, e);
        }
      };
      
      // Set up all sounds
      background.loop = true;
      background.volume = 0.4;
      hit.volume = 0.3;
      success.volume = 0.5;
      playerPowerup.volume = 0.5;
      speedBooster.volume = 0.5;
      victory.volume = 0.6;
      defeat.volume = 0.6;
      
      // Register all sound elements with the audio store
      setHitSound(hit);
      setSuccessSound(success);
      setBackgroundMusic(background);
      setPlayerPowerupSound(playerPowerup);
      setSpeedBoosterSound(speedBooster);
      setVictorySound(victory);
      setDefeatSound(defeat);
      
      // Test each sound
      Promise.all([
        testAndPause(hit, "Hit sound"),
        testAndPause(success, "Success sound"),
        testAndPause(background, "Background music"),
        testAndPause(playerPowerup, "Player powerup sound"),
        testAndPause(speedBooster, "Speed booster sound"),
        testAndPause(victory, "Victory sound"),
        testAndPause(defeat, "Defeat sound")
      ]).then(() => {
        console.log('All sounds tested and ready');
        setAudioInitialized(true);
      }).catch(error => {
        console.error('Error testing sounds:', error);
        // Continue anyway
        setAudioInitialized(true);
      });
      
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Error initializing audio system:', error);
    }
  };
  
  // Initialize audio
  const setHitSound = useAudio((state) => state.setHitSound);
  const setSuccessSound = useAudio((state) => state.setSuccessSound);
  const setBackgroundMusic = useAudio((state) => state.setBackgroundMusic);
  const setPlayerPowerupSound = useAudio((state) => state.setPlayerPowerupSound);
  const setSpeedBoosterSound = useAudio((state) => state.setSpeedBoosterSound);
  const setVictorySound = useAudio((state) => state.setVictorySound);
  const setDefeatSound = useAudio((state) => state.setDefeatSound);
  const playBackgroundMusic = useAudio((state) => state.playBackgroundMusic);

  // Clean up audio when component unmounts
  useEffect(() => {    
    // Clean up function for when component unmounts
    return () => {
      const audio = useAudio.getState();
      if (audio.backgroundMusic) {
        audio.backgroundMusic.pause();
      }
    };
  }, []);

  // Auto-initialize audio when component mounts
  useEffect(() => {
    initializeAudio();
    
    // Setup content protection
    setupContentProtection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="protected-content" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Start Menu - show only when in start_menu phase */}
        {gamePhase === "start_menu" && (
          <StartMenu />
        )}
        
        {/* Only render the game canvas and related UI when not in start menu */}
        {gamePhase !== "start_menu" && (
          <>
            <KeyboardControls map={controls}>
              <Canvas
                shadows
                camera={{
                  position: [0, 5, 10],
                  fov: 60,
                  near: 0.1,
                  far: 1000
                }}
                gl={{
                  antialias: true,
                  powerPreference: "default"
                }}
              >
                <color attach="background" args={["#87CEEB"]} />
                <Suspense fallback={null}>
                  <GameScene />
                </Suspense>
              </Canvas>
            </KeyboardControls>
            
            {/* Modals and UI need to be outside the Canvas to avoid THREE namespace errors */}
            <WinModal />
            <LevelSelect />
            <RankingSystem />
            
            {/* Level difficulty banner - show only when a level has been selected */}
            {hasSelectedLevel && <LevelBanner />}
            
            {/* In-Game HUD Banner Ad Placeholder - show only during gameplay */}
            {hasSelectedLevel && (
              <div 
                id="hud-banner-ad"
                className="ad-banner-placeholder"
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 999,
                  width: '50%',
                  maxHeight: '70px',
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
                  minHeight: '50px'
                }}
              >
                <span>HUD Ad Banner Placeholder</span>
              </div>
            )}
            
            {/* Camera control message - show only during active gameplay */}
            <CameraLockMessage isVisible={showCameraMessage} />
            
            {/* ESC key reminder - show when multiple rapid clicks are detected */}
            {isPointerLocked && (
              <EscKeyReminder isVisible={showEscReminder} />
            )}
            
            {/* Desktop layout - buttons positioned individually */}
            <PauseButton />
            <SpeedBoosterButton />
            
            <PauseMenu />
            <SpeedBoostCountdown />
          </>
        )}
        
        {/* Audio toggle has been moved to the Settings menu */}
      </div>
    </QueryClientProvider>
  );
}

export default App;
