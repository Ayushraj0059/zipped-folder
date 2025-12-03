import { useFrame } from "@react-three/fiber";
import { useSpeedBooster, DASH_SPEED, BOOST_ELASTICITY } from "@/lib/stores/useSpeedBooster";
import { usePhysics } from "@/lib/stores/usePhysics";
import { useControls } from "@/lib/stores/useControls";
import { useGame } from "@/lib/stores/useGame";
import { useEffect, useRef } from "react";
import { GameManager } from "@/lib/GameManager";
import * as CANNON from "cannon-es";
import { useCameraStore } from "@/lib/stores/useCameraStore";

/**
 * Component that handles the logic for the speed booster feature
 * Implements a forward dash in the camera direction
 */
const SpeedBoosterLogic = () => {
  // Reference to store the original movement force
  const originalForceRef = useRef<number | null>(null);
  // Reference to track active state to detect changes
  const isActiveRef = useRef(false);
  // Reference for the forward dash impulse vector
  const impulseVectorRef = useRef(new CANNON.Vec3(0, 0, 0));
  // Reference to check if we've already altered the properties
  const propertiesChangedRef = useRef(false);
  // Reference to the player's original linear damping
  const originalDampingRef = useRef<number | null>(null);
  
  // Get game state
  const gamePhase = useGame(state => state.phase);
  
  // Get player body
  const playerBody = usePhysics(state => state.playerBody);
  const world = usePhysics(state => state.world);
  
  // Get speed booster state
  const { 
    isActive, 
    updateBoosterState, 
    resetBooster, 
    dashApplied, 
    setDashApplied 
  } = useSpeedBooster();
  
  // Get camera direction helper
  const getDirectionFromInput = useCameraStore(state => state.getDirectionFromInput);
  
  // Track booster state changes
  useEffect(() => {
    if (isActive !== isActiveRef.current) {
      console.log(`Speed booster active state changed: ${isActive}`);
      isActiveRef.current = isActive;
      
      // If booster was just activated, set up physics
      if (isActive && playerBody) {
        adjustPlayerPhysicsForDash();
      }
      
      // If booster was just deactivated, restore properties
      if (!isActive && propertiesChangedRef.current) {
        restorePlayerPhysics();
      }
    }
  }, [isActive, playerBody]);
  
  // Reset booster when game state changes
  useEffect(() => {
    // Reset when game is not in playing state
    if (gamePhase === "start_menu" || gamePhase === "ready" || gamePhase === "ended") {
      resetBooster();
      // Reset references
      originalForceRef.current = null;
      propertiesChangedRef.current = false;
      originalDampingRef.current = null;
      
      // Restore player physics if needed
      restorePlayerPhysics();
    }
  }, [gamePhase, resetBooster]);
  
  // Register with GameManager for reset
  useEffect(() => {
    // Define a function to reset speed booster
    const resetSpeedBooster = () => {
      resetBooster();
      // Reset references
      originalForceRef.current = null;
      propertiesChangedRef.current = false;
      originalDampingRef.current = null;
      
      // Restore player physics if needed
      restorePlayerPhysics();
    };
    
    // Add event listener to window for reset event
    window.addEventListener('resetSpeedBooster', resetSpeedBooster);
    
    // Store the original reset method
    const originalResetPhysicsWorld = GameManager.resetPhysicsWorld;
    
    // Override the reset method to include speed booster reset
    GameManager.resetPhysicsWorld = function() {
      // Call the original method
      originalResetPhysicsWorld.call(GameManager);
      
      // Reset speed booster
      resetSpeedBooster();
    };
    
    // Clean up
    return () => {
      // Remove event listener
      window.removeEventListener('resetSpeedBooster', resetSpeedBooster);
      
      // Restore original method if component unmounts
      GameManager.resetPhysicsWorld = originalResetPhysicsWorld;
    };
  }, [resetBooster]);
  
  // Function to adjust player physics during boost
  const adjustPlayerPhysicsForDash = () => {
    if (!playerBody || propertiesChangedRef.current) return;
    
    // Store original damping for later restoration
    if (typeof playerBody.linearDamping === 'number') {
      originalDampingRef.current = playerBody.linearDamping;
      
      // Reduce damping during boost to maintain momentum
      playerBody.linearDamping *= 0.5;
    }
    
    // Directly adjust the player body's material restitution
    if (playerBody && playerBody.material) {
      // Explicitly set the restitution property using type assertion
      // This ensures bounce when hitting walls during boost
      const material = playerBody.material as CANNON.Material;
      
      // Set to 30% elasticity as requested
      material.restitution = BOOST_ELASTICITY;
      
      // Also make the player body slightly lighter during boost
      // This helps maintain momentum after bouncing
      playerBody.mass *= 0.9;
    }
    
    propertiesChangedRef.current = true;
    console.log("Adjusted player physics for speed boost dash");
  };
  
  // Function to restore original player physics
  const restorePlayerPhysics = () => {
    if (!playerBody || !propertiesChangedRef.current) return;
    
    // Restore original damping
    if (originalDampingRef.current !== null) {
      playerBody.linearDamping = originalDampingRef.current;
    }
    
    // Restore original mass by dividing by 0.9 
    // (since we multiplied by 0.9 during boost)
    if (playerBody) {
      playerBody.mass /= 0.9;
    }
    
    propertiesChangedRef.current = false;
    console.log("Restored original player physics");
  };
  
  // Apply forward dash impulse when booster is activated
  const applyDashImpulse = () => {
    if (!playerBody || dashApplied) return;
    
    // Get camera's forward direction vector (based on camera rotation)
    // Using (0,-1) as input to get the forward direction relative to camera
    const forwardDir = getDirectionFromInput(0, -1);
    
    // Apply to impulse vector - scale by mass for consistent speed
    impulseVectorRef.current.set(
      forwardDir.x * DASH_SPEED * playerBody.mass,
      0,  // No vertical component
      forwardDir.z * DASH_SPEED * playerBody.mass
    );
    
    // Log the dash impulse for debugging
    console.log(`Applying dash impulse: (${impulseVectorRef.current.x.toFixed(2)}, 0, ${impulseVectorRef.current.z.toFixed(2)})`);
    
    // Apply impulse to the ball (apply once, then let physics take over)
    playerBody.applyImpulse(impulseVectorRef.current, new CANNON.Vec3(0, 0, 0));
    
    // CRITICAL FIX: Set hasPlayerStartedMoving flag to trigger AI ball movement
    // Even if the player hasn't moved the joystick yet
    const controlsState = useControls.getState();
    if (!controlsState.hasPlayerStartedMoving) {
      console.log("Speed booster activated before player movement - triggering AI ball movement");
      controlsState.setMovementDirection(forwardDir.x, forwardDir.z);
    }
    
    // Mark dash as applied to prevent reapplying
    setDashApplied(true);
    
    // Try to play a sound effect if the audio element exists
    try {
      const powerupSound = document.getElementById('playerPowerupSound') as HTMLAudioElement;
      if (powerupSound) {
        powerupSound.currentTime = 0;
        powerupSound.volume = 0.5;
        powerupSound.play().catch(e => console.error("Error playing sound:", e));
      }
    } catch (error) {
      console.error("Error playing power-up sound:", error);
    }
  };
  
  // Update booster state in game loop
  useFrame(() => {
    // Skip if not in playing phase
    if (gamePhase !== "playing") return;
    
    // Get current time in milliseconds
    const currentTime = Date.now();
    
    // Update booster state (handles countdown and deactivation)
    updateBoosterState(currentTime);
    
    // Store original force if we haven't already
    const controlsState = useControls.getState();
    if (originalForceRef.current === null && controlsState.movementForce) {
      originalForceRef.current = controlsState.movementForce;
      console.log(`Stored original movement force: ${originalForceRef.current}`);
    }
    
    // If booster is active, check if we need to apply the dash impulse
    if (isActive && playerBody && !dashApplied) {
      applyDashImpulse();
    }
    
    // When boost ends, restore original physics
    if (!isActive && propertiesChangedRef.current) {
      restorePlayerPhysics();
    }
  });
  
  // This component doesn't render anything
  return null;
};

export default SpeedBoosterLogic;