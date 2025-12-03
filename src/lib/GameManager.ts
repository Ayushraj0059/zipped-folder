import { useGame } from "@/lib/stores/useGame";
import { useAIBallsStore, useAIBallScaleStore } from "@/components/game/AIBall";
import { useBallStore } from "@/components/game/Ball";
import { useWinStore } from "@/components/game/WinModal";
import { useControls } from "@/lib/stores/useControls";
import { usePhysics } from "@/lib/stores/usePhysics";
import { sharedResources } from "@/lib/sharedResources";
import { useDifficulty } from "@/lib/stores/useDifficulty";
import { usePointerLockStore } from "@/lib/stores/usePointerLockStore";
import { useCameraRotationState } from "@/lib/stores/useCameraRotationState";
import { useCameraStore } from "@/lib/stores/useCameraStore";
import { usePauseStore } from "@/lib/stores/usePauseStore";
import { useAudio } from "@/lib/stores/useAudio";
import { usePhysicsClock } from "@/lib/stores/usePhysicsClock";

/**
 * GameManager provides a centralized system for managing the game's state,
 * particularly for handling reset and restart functionality in a clean and modular way.
 */
export class GameManager {
  /**
   * Resets all physics-related state
   * Clears bodies and resets the world state
   */
  static resetPhysicsWorld(): void {
    console.log("GameManager: Resetting physics world");
    const physics = usePhysics.getState();
    
    // Clear reference to player body - world will be recreated by PhysicsWorld component
    physics.setPlayerBody(null);
    
    // Reset physics timing system via the global reset function
    // This prevents acceleration issues when restarting the game
    if (window.resetPhysicsTiming) {
      console.log("GameManager: Calling physics timing reset function");
      window.resetPhysicsTiming();
    } else {
      console.log("GameManager: Warning - physics timing reset function not available");
    }
  }

  /**
   * Resets the player ball state
   * Resets scale and growth state
   */
  static resetBallState(): void {
    console.log("GameManager: Resetting player ball state");
    const ballStore = useBallStore.getState();
    
    // Reset ball scale to initial value
    ballStore.setScale(1.0);
  }

  /**
   * Resets the AI balls state
   * Clears powerups collected, positions, and scales
   */
  static resetAIBallState(): void {
    console.log("GameManager: Resetting AI balls state");
    const aiBallsStore = useAIBallsStore.getState();
    const aiBallScaleStore = useAIBallScaleStore.getState();
    
    // Reset all AI balls
    aiBallsStore.resetBalls();
    
    // Reset all AI ball scales
    aiBallScaleStore.resetScales();
  }
  
  /**
   * Triggers recreation of all balls at their initial circular positions
   * This is needed to ensure balls are rearranged in a circle after game restart
   */
  static resetBallPositions(): void {
    console.log("GameManager: Triggering ball positions reset");
    
    // Create a custom event that Ball and AIBall components will listen for
    const resetPositionsEvent = new CustomEvent("reset-ball-positions", {
      detail: { 
        timestamp: Date.now(),
        // Generate a new session seed for position randomization
        newSessionSeed: Math.floor(Date.now() / 1000)
      }
    });
    
    // Dispatch the event to be caught by ball components
    window.dispatchEvent(resetPositionsEvent);
    console.log("GameManager: Ball position reset event dispatched");
  }

  /**
   * Resets power-up related state
   * We need to create a reset event that the PowerUp component can listen to
   */
  static resetPowerups(): void {
    console.log("GameManager: Resetting powerups state");
    // Create a custom event that PowerUp component will listen for
    const resetEvent = new CustomEvent("reset-powerups", {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(resetEvent);
    console.log("GameManager: Sent reset-powerups event to PowerUp component");
  }

  /**
   * Resets the controls state
   * Clears movement direction, resets player movement flag, and disables input
   */
  static resetControlsState(): void {
    console.log("GameManager: Resetting controls state");
    const controls = useControls.getState();
    
    // Reset direction to zero
    controls.setMovementDirection(0, 0);
    
    // CRITICAL FIX: Reset the hasPlayerStartedMoving flag
    // This ensures AI balls don't move until the player moves again after restart
    if (controls.hasPlayerStartedMoving) {
      console.log("GameManager: Resetting player movement flag to prevent AI movement");
      controls.resetPlayerMovementFlag();
    }
    
    // Explicitly disable input while in menu or end screens
    controls.disableInput();
    console.log("GameManager: Input disabled during game restart");
  }
  
  /**
   * Resets the pointer lock state
   * This ensures the cursor is visible when the game ends or restarts
   */
  static resetPointerLockState(): void {
    console.log("GameManager: Resetting pointer lock state");
    
    // Get pointer lock and camera rotation states
    const pointerLockStore = usePointerLockStore.getState();
    const cameraRotationState = useCameraRotationState.getState();
    
    // Reset pointer lock state in the stores
    pointerLockStore.setLocked(false);
    cameraRotationState.setPointerLocked(false);
    
    // If browser has pointer lock active, exit it
    if (document.pointerLockElement) {
      console.log("GameManager: Releasing pointer lock");
      document.exitPointerLock();
    }
  }
  
  /**
   * Resets the camera rotation to its original position
   * This ensures the camera view is reset when the game restarts
   */
  static resetCameraDirection(): void {
    console.log("GameManager: Resetting camera direction to original position");
    
    // Get camera store and reset the rotation
    const cameraStore = useCameraStore.getState();
    cameraStore.resetRotation();
  }

  /**
   * Resets the game state in the useGame store
   * Sets phase back to "ready"
   */
  static resetGameState(): void {
    console.log("GameManager: Resetting game state");
    const game = useGame.getState();
    const win = useWinStore.getState();
    
    // Reset win conditions
    win.resetWin();
    
    // Restart the game (sets phase to "ready")
    game.restart();
  }

  /**
   * Resets the difficulty selection state
   * This will take the player back to the difficulty selection screen
   */
  static resetDifficultySelection(): void {
    console.log("GameManager: Resetting difficulty selection");
    const difficulty = useDifficulty.getState();
    
    // Reset the difficulty selection flag to show the difficulty selection screen again
    difficulty.resetDifficultySelection();
  }
  
  /**
   * Resets the physics clock
   * This is critical to prevent physics acceleration when restarting or resuming the game
   */
  static resetPhysicsClock(): void {
    console.log("GameManager: Resetting physics clock");
    const physicsClock = usePhysicsClock.getState();
    
    // Reset the physics clock to prevent time accumulation during pause
    physicsClock.reset();
  }
  
  /**
   * Master function that restarts the entire game by calling all reset functions
   * in the appropriate order and returns to the difficulty selection screen
   */
  static restartGame(): void {
    console.log("GameManager: Performing full game restart and returning to difficulty selection");
    
    // Save current audio mute state
    const audioState = useAudio.getState();
    const wasMuted = audioState.isMuted;
    console.log(`GameManager: Preserving audio mute state: ${wasMuted ? 'muted' : 'unmuted'}`);
    
    // Ensure pointer lock is released first so cursor is visible for difficulty selection
    this.resetPointerLockState();
    
    // Reset camera direction to its original position
    this.resetCameraDirection();
    
    // Clear win condition first to prevent any callbacks from triggering
    this.resetGameState();
    
    // Reset all game elements in a logical order
    this.resetPhysicsWorld();
    this.resetBallState();
    this.resetAIBallState();
    
    // Critical: Reset ball positions to original circular arrangement
    this.resetBallPositions();
    
    // Critical: Reset total powerups collection counter to ensure we get a full 12 powerups in new game
    this.resetPowerups();
    
    this.resetControlsState();
    
    // Reset physics clock to prevent acceleration issues when resuming after a pause
    this.resetPhysicsClock();
    
    // NEW: Reset difficulty selection to go back to the difficulty selection screen
    this.resetDifficultySelection();
    
    // Make sure to resume game if it was paused
    this.resumeGame();
    
    // Ensure audio state consistency by restoring the previous mute state
    if (wasMuted !== audioState.isMuted) {
      console.log("GameManager: Audio mute state changed during restart, fixing...");
      if (wasMuted) {
        // If it was muted before restart, ensure it stays muted
        if (!audioState.isMuted) {
          audioState.toggleMute();
        }
      } else {
        // If it was not muted before restart, ensure it stays unmuted
        if (audioState.isMuted) {
          audioState.toggleMute();
        }
      }
    } else {
      console.log("GameManager: Audio mute state preserved correctly");
    }
    
    console.log("GameManager: Game restart completed, returning to difficulty selection");
  }
  
  /**
   * Pauses the game - disables physics updates and player input
   */
  static pauseGame(): void {
    console.log("GameManager: Pausing game");
    
    // Get necessary stores
    const pauseStore = usePauseStore.getState();
    const controls = useControls.getState();
    const audioState = useAudio.getState();
    const physicsClock = usePhysicsClock.getState();
    
    // If already paused, do nothing
    if (pauseStore.isPaused) return;
    
    // Set pause state in store
    pauseStore.pauseGame();
    
    // Disable player input
    controls.disableInput();
    
    // Pause the physics clock to prevent time accumulation during pause
    physicsClock.setPaused(true);
    
    // Release pointer lock if active
    this.resetPointerLockState();
    
    // Pause background music but don't change mute state
    if (audioState.backgroundMusic && !audioState.backgroundMusic.paused && !audioState.isMuted) {
      console.log("GameManager: Pausing background music while game is paused");
      audioState.backgroundMusic.pause();
    }
    
    console.log("GameManager: Game paused successfully");
  }
  
  /**
   * Resumes the game after it was paused - re-enables physics and player input
   */
  static resumeGame(): void {
    console.log("GameManager: Resuming game");
    
    // Get necessary stores
    const pauseStore = usePauseStore.getState();
    const controls = useControls.getState();
    const gameState = useGame.getState();
    const difficultyState = useDifficulty.getState();
    const audioState = useAudio.getState();
    const physicsClock = usePhysicsClock.getState();
    
    // If not paused, do nothing
    if (!pauseStore.isPaused) return;
    
    // Set resume state in store
    pauseStore.resumeGame();
    
    // Reset physics timing when resuming
    // This prevents acceleration by clearing any accumulated time
    if (window.resetPhysicsTiming) {
      console.log("GameManager: Explicitly resetting physics timing before resume");
      window.resetPhysicsTiming();
    }
    
    // Resume the physics clock to enable physics updates again
    physicsClock.setPaused(false);
    console.log("GameManager: Resumed physics clock");
    
    // Only re-enable input if in playing phase with a selected level
    if (gameState.phase === "playing" && difficultyState.hasSelectedLevel) {
      controls.enableInput();
      console.log("GameManager: Re-enabled input on resume");
      
      // Handle background music on resume - start playing if game is playing and audio is not muted
      if (!audioState.isMuted && audioState.backgroundMusic) {
        if (audioState.backgroundMusic.paused) {
          console.log("GameManager: Resuming background music");
          audioState.backgroundMusic.play().catch(error => {
            console.log("Background music play prevented on resume:", error);
          });
        }
      }
    }
    
    console.log("GameManager: Game resumed successfully");
  }
  
  /**
   * Restarts the current game with the same difficulty level
   */
  static restartCurrentGame(): void {
    console.log("GameManager: Restarting game with same difficulty level");
    
    // Save current audio mute state
    const audioState = useAudio.getState();
    const wasMuted = audioState.isMuted;
    console.log(`GameManager: Preserving audio mute state: ${wasMuted ? 'muted' : 'unmuted'}`);
    
    // Ensure pointer lock is released first
    this.resetPointerLockState();
    
    // Reset camera direction 
    this.resetCameraDirection();
    
    // Clear win condition
    const win = useWinStore.getState();
    win.resetWin();
    
    // Reset all game elements in a logical order
    this.resetPhysicsWorld();
    this.resetBallState();
    this.resetAIBallState();
    
    // Reset ball positions to original circular arrangement
    this.resetBallPositions();
    
    // Reset powerups collection counter
    this.resetPowerups();
    
    // Reset controls state but don't reset difficulty selection
    this.resetControlsState();
    
    // Reset physics clock to prevent acceleration issues
    this.resetPhysicsClock();
    
    // Set game phase to playing (not "ready" which would show difficulty selection)
    const game = useGame.getState();
    if (game.phase !== "playing") {
      game.start(); // This sets phase to "playing"
    }
    
    // Make sure to resume game if it was paused
    this.resumeGame();
    
    // Ensure audio state consistency by restoring the previous mute state
    // and properly managing the background music
    if (wasMuted !== audioState.isMuted) {
      console.log("GameManager: Audio mute state changed during restart, fixing...");
      if (wasMuted) {
        // If it was muted before restart, ensure it stays muted
        if (!audioState.isMuted) {
          audioState.toggleMute();
        }
      } else {
        // If it was not muted before restart, ensure it stays unmuted
        if (audioState.isMuted) {
          audioState.toggleMute();
        }
      }
    } else {
      console.log("GameManager: Audio mute state preserved correctly");
    }
    
    console.log("GameManager: Game restarted with same difficulty level");
  }
  
  /**
   * Returns to the main menu
   */
  static returnToMainMenu(): void {
    console.log("GameManager: Returning to main menu");
    
    // Save current audio mute state
    const audioState = useAudio.getState();
    const wasMuted = audioState.isMuted;
    console.log(`GameManager: Preserving audio mute state: ${wasMuted ? 'muted' : 'unmuted'}`);
    
    // Ensure pointer lock is released
    this.resetPointerLockState();
    
    // Get necessary stores
    const game = useGame.getState();
    const pauseStore = usePauseStore.getState();
    const difficultyState = useDifficulty.getState();
    
    // Reset all game state
    this.resetPhysicsWorld();
    this.resetBallState();
    this.resetAIBallState();
    this.resetBallPositions();
    this.resetPowerups();
    this.resetControlsState();
    this.resetCameraDirection();
    
    // Reset win conditions
    const win = useWinStore.getState();
    win.resetWin();
    
    // IMPORTANT: Reset difficulty selection so player must choose difficulty again
    difficultyState.resetDifficultySelection();
    console.log("GameManager: Reset difficulty selection - player will need to select level again");
    
    // Resume game if it was paused
    pauseStore.resumeGame();
    
    // Show the start menu
    game.showStartMenu();
    
    // Ensure audio state consistency by restoring the previous mute state
    if (wasMuted !== audioState.isMuted) {
      console.log("GameManager: Audio mute state changed during return to menu, fixing...");
      if (wasMuted) {
        // If it was muted before, ensure it stays muted
        if (!audioState.isMuted) {
          audioState.toggleMute();
        }
      } else {
        // If it was not muted before, ensure it stays unmuted
        if (audioState.isMuted) {
          audioState.toggleMute();
        }
      }
    } else {
      console.log("GameManager: Audio mute state preserved correctly");
    }
    
    console.log("GameManager: Returned to main menu");
  }
}