import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { useKeyboardControls } from "@react-three/drei";
import { usePhysics } from "@/lib/stores/usePhysics";
import { useControls } from "@/lib/stores/useControls";
import { useBallStore } from "./Ball";
import { useCameraStore } from "@/lib/stores/useCameraStore";

// Movement force constants - increased for better speed
const MOVEMENT_FORCE = 13.0; // Player ball force increased to 13.0 × mass

// Optimized Controls component with camera-relative movement
const Controls = () => {
  // Refs for performance optimization
  const directionRef = useRef(new CANNON.Vec3(0, 0, 0));
  const forceVectorRef = useRef(new CANNON.Vec3(0, 0, 0));
  const pointRef = useRef(new CANNON.Vec3(0, 0, 0));
  
  // Get player body from physics store
  const playerBody = usePhysics((state) => state.playerBody);
  
  // Get control states from the store
  const { setMovementDirection, isInputEnabled, movementForce } = useControls();
  
  // Get camera direction helper function
  const getDirectionFromInput = useCameraStore((state) => state.getDirectionFromInput);
  
  // Get the ball scale to adjust force
  const ballScale = useBallStore((state) => state.scale);
  
  // Subscribe to keyboard controls
  const [, getKeyboardControls] = useKeyboardControls();
  
  // For tracking time between frames
  const lastTimeRef = useRef(0);
  
  // Process keyboard input and apply framerate-independent forces
  useFrame((state) => {
    if (!playerBody) return;
    
    // Don't process input if disabled
    if (!isInputEnabled) return;
    
    // Calculate actual delta time
    const time = state.clock.getElapsedTime();
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    // Get current keyboard state
    const { forward, backward, leftward, rightward } = getKeyboardControls();
    
    // Build initial input direction (before camera rotation)
    let inputX = 0;
    let inputZ = 0;
    
    // Build direction from inputs
    if (forward) inputZ -= 1;
    if (backward) inputZ += 1;
    if (leftward) inputX -= 1;
    if (rightward) inputX += 1;
    
    // Only process further if we have input
    if (inputX !== 0 || inputZ !== 0) {
      // Normalize input if magnitude > 1
      const inputMagnitude = Math.sqrt(inputX * inputX + inputZ * inputZ);
      if (inputMagnitude > 1.0) {
        inputX /= inputMagnitude;
        inputZ /= inputMagnitude;
      }
      
      // Get camera-relative direction - returns normalized THREE.Vector3
      const cameraRelativeDirection = getDirectionFromInput(inputX, inputZ);
      
      // Convert THREE.Vector3 to CANNON.Vec3
      const direction = directionRef.current;
      direction.set(
        cameraRelativeDirection.x,
        0,
        cameraRelativeDirection.z
      );
      
      // Calculate framerate compensation factor - use a default if deltaTime is 0
      // At 60fps, deltaTime is ~0.016667, so compensation would be ~1.0
      // At 30fps, deltaTime is ~0.03333, so compensation would be ~2.0
      const safeDeltatime = deltaTime > 0.001 ? deltaTime : 1/60;
      
      // Important: Cap the framerate compensation to prevent extreme values
      // This ensures we don't get super-fast movement on very low framerates
      const cappedDeltaTime = Math.min(safeDeltatime, 1/15); // Cap at 15 FPS equivalent
      const frameCompensation = cappedDeltaTime * 60;
      
      // Scale force with ball mass and frame compensation to maintain consistent
      // speed regardless of ball size and framerate
      // Use movementForce from store instead of hardcoded constant (for speed boost)
      const scaledForce = movementForce * playerBody.mass * frameCompensation;
      
      // Reuse existing vector for force
      forceVectorRef.current.set(
        direction.x * scaledForce,
        0,
        direction.z * scaledForce
      );
      
      // Apply force to the ball (reuse existing point vector)
      playerBody.applyForce(forceVectorRef.current, pointRef.current);
      
      // Log force scaling for debugging
      if (Math.random() < 0.01) { // Only log occasionally to avoid console spam
        console.log(`Ball force scaled: mass=${playerBody.mass.toFixed(2)}, force=${scaledForce.toFixed(2)}, frame compensation=${frameCompensation.toFixed(2)}`);
      }
      
      // Update control state - use original input for compatibility with other systems
      setMovementDirection(inputX, inputZ);
    } else if (directionRef.current.lengthSquared() !== 0) {
      // Reset direction vector only if necessary
      directionRef.current.set(0, 0, 0);
      
      // Only update control state if direction changed to zero
      setMovementDirection(0, 0);
    }
  });
  
  // Log keyboard controls when component mounts
  useEffect(() => {
    console.log("Camera-relative controls active - Use WASD or Arrow keys to move relative to camera view");
  }, []);
  
  return null;
};

export default Controls;
