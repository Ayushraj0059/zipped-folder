/**
 * This file preserves the original implementation of the PlayAgain functionality
 * where pressing the PlayAgain button would restart the same level without
 * returning to the difficulty selection screen.
 */

import { useGame } from "./stores/useGame";
import { useAIBallsStore, useAIBallScaleStore } from "@/components/game/AIBall";
import { useBallStore } from "@/components/game/Ball";
import { useWinStore } from "@/components/game/WinModal";
import { useControls } from "./stores/useControls";
import { usePhysics } from "./stores/usePhysics";
import { usePointerLockStore } from "./stores/usePointerLockStore";
import { useCameraRotationState } from "./stores/useCameraRotationState";
import { useCameraStore } from "./stores/useCameraStore";

/**
 * GameManagerSameLevel provides the original implementation where
 * the PlayAgain button would restart the game with the same difficulty level
 * without going back to the level selection screen.
 */
export class GameManagerSameLevel {
  /**
   * Resets all physics-related state
   * Clears bodies and resets the world state
   */
  static resetPhysicsWorld(): void {
    console.log("GameManagerSameLevel: Resetting physics world");
    const physics = usePhysics.getState();
    
    // Clear reference to player body - world will be recreated by PhysicsWorld component
    physics.setPlayerBody(null);
  }

  /**
   * Resets the player ball state
   * Resets scale and growth state
   */
  static resetBallState(): void {
    console.log("GameManagerSameLevel: Resetting player ball state");
    const ballStore = useBallStore.getState();
    
    // Reset ball scale to initial value
    ballStore.setScale(1.0);
  }

  /**
   * Resets the AI balls state
   * Clears powerups collected, positions, and scales
   */
  static resetAIBallState(): void {
    console.log("GameManagerSameLevel: Resetting AI balls state");
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
    console.log("GameManagerSameLevel: Triggering ball positions reset");
    
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
    console.log("GameManagerSameLevel: Ball position reset event dispatched");
  }

  /**
   * Resets power-up related state
   * We need to create a reset event that the PowerUp component can listen to
   */
  static resetPowerups(): void {
    console.log("GameManagerSameLevel: Resetting powerups state");
    // Create a custom event that PowerUp component will listen for
    const resetEvent = new CustomEvent("reset-powerups", {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(resetEvent);
    console.log("GameManagerSameLevel: Sent reset-powerups event to PowerUp component");
  }

  /**
   * Resets the controls state
   * Clears movement direction and resets player movement flag
   */
  static resetControlsState(): void {
    console.log("GameManagerSameLevel: Resetting controls state");
    const controls = useControls.getState();
    
    // Reset direction to zero
    controls.setMovementDirection(0, 0);
    
    // CRITICAL FIX: Reset the hasPlayerStartedMoving flag
    // This ensures AI balls don't move until the player moves again after restart
    if (controls.hasPlayerStartedMoving) {
      console.log("GameManagerSameLevel: Resetting player movement flag to prevent AI movement");
      controls.resetPlayerMovementFlag();
    }
  }
  
  /**
   * Resets the pointer lock state
   * This ensures the cursor is visible when the game ends or restarts
   */
  static resetPointerLockState(): void {
    console.log("GameManagerSameLevel: Resetting pointer lock state");
    
    // Get pointer lock and camera rotation states
    const pointerLockStore = usePointerLockStore.getState();
    const cameraRotationState = useCameraRotationState.getState();
    
    // Reset pointer lock state in the stores
    pointerLockStore.setLocked(false);
    cameraRotationState.setPointerLocked(false);
    
    // If browser has pointer lock active, exit it
    if (document.pointerLockElement) {
      console.log("GameManagerSameLevel: Releasing pointer lock");
      document.exitPointerLock();
    }
  }
  
  /**
   * Resets the camera rotation to its original position
   * This ensures the camera view is reset when the game restarts
   */
  static resetCameraDirection(): void {
    console.log("GameManagerSameLevel: Resetting camera direction to original position");
    
    // Get camera store and reset the rotation
    const cameraStore = useCameraStore.getState();
    cameraStore.resetRotation();
  }

  /**
   * Resets the game state in the useGame store
   * Sets phase back to "ready"
   */
  static resetGameState(): void {
    console.log("GameManagerSameLevel: Resetting game state");
    const game = useGame.getState();
    const win = useWinStore.getState();
    
    // Reset win conditions
    win.resetWin();
    
    // Restart the game (sets phase to "ready")
    game.restart();
  }

  /**
   * Master function that restarts the entire game by calling all reset functions
   * in the appropriate order while keeping the same difficulty level
   */
  static restartGame(): void {
    console.log("GameManagerSameLevel: Performing full game restart with same difficulty");
    
    // Ensure pointer lock is released first so cursor is visible for game restart
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
    
    console.log("GameManagerSameLevel: Game restart with same difficulty completed");

    // Start the game again with the existing difficulty level
    const game = useGame.getState();
    game.start();
  }
}
