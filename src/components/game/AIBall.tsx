import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { usePhysics } from "@/lib/stores/usePhysics";
import { useAudio } from "@/lib/stores/useAudio";
import { useControls } from "@/lib/stores/useControls";
import { useDifficulty } from "@/lib/stores/useDifficulty";
import { usePauseStore } from "@/lib/stores/usePauseStore";
import { create } from "zustand";
import { sharedResources } from "@/lib/sharedResources";

// Store for managing all AI balls
interface AIBallsState {
  aiBalls: {
    id: number;
    position: THREE.Vector3;
    powerUpsCollected: number;
    collectionTimestamps: number[]; // New field to track when each powerup was collected
    color: string;
  }[];
  registerBall: (id: number, position: THREE.Vector3, color: string) => void;
  incrementPowerUps: (id: number) => boolean; // returns true if this was the 5th powerup
  resetBalls: () => void;
  
  // New functions for secondary win conditions
  getTotalPowerupsCollected: () => number;
  getMaxPowerupsCollected: () => number;
  getWinnerBySecondaryCondition: () => { 
    id: number | null; 
    isPlayer: boolean; 
    color: string;
    reason: 'primary' | 'most-powerups' | 'tiebreaker';
    powerupsCount: number;
    playerWasInTie?: boolean; // Flag to indicate if player was involved in a tie
  } | null;
  
  // Track player powerups collected (moved from PowerUp.tsx component)
  playerPowerUpsCollected: number;
  playerCollectionTimestamps: number[];
  incrementPlayerPowerUps: () => boolean; // returns true if player reached 5 powerups
}

export const useAIBallsStore = create<AIBallsState>((set, get) => ({
  aiBalls: [],
  playerPowerUpsCollected: 0,
  playerCollectionTimestamps: [],
  
  resetBalls: () => {
    console.log("Resetting all AI balls and player power-up counts");
    set({
      // Clear the player's power-up count
      playerPowerUpsCollected: 0,
      playerCollectionTimestamps: [],
      
      // Keep the AI balls but reset their power-up counts and timestamps
      aiBalls: get().aiBalls.map(ball => ({
        ...ball,
        powerUpsCollected: 0,
        collectionTimestamps: [],
        // Keep position and color but ensure we have new object references
        position: ball.position.clone()
      }))
    });
    console.log("AI balls and player power-up counts reset complete");
  },
  
  registerBall: (id, position, color) => {
    set((state) => {
      // Find the existing ball to preserve its properties
      const existingBall = state.aiBalls.find(ball => ball.id === id);
      const powerUpsCollected = existingBall ? existingBall.powerUpsCollected : 0;
      const collectionTimestamps = existingBall ? existingBall.collectionTimestamps : [];
      
      // Create updated aiBalls array with the new position
      const updatedBalls = state.aiBalls.filter(ball => ball.id !== id);
      updatedBalls.push({
        id,
        position: position.clone(), // Create a new Vector3 to ensure no reference issues
        powerUpsCollected,
        collectionTimestamps,
        color
      });
      
      return { aiBalls: updatedBalls };
    });
  },
  
  incrementPowerUps: (id) => {
    let isWinner = false;
    set((state) => {
      const updatedBalls = state.aiBalls.map(ball => {
        if (ball.id === id) {
          const newCount = ball.powerUpsCollected + 1;
          isWinner = newCount >= 5; // At least 5 powerups to win
          
          // Add current timestamp to the collection timestamps
          const newTimestamps = [...ball.collectionTimestamps, Date.now()];
          
          // Explicitly clone the position to avoid reference issues
          return { 
            ...ball, 
            powerUpsCollected: newCount,
            collectionTimestamps: newTimestamps,
            position: ball.position.clone() 
          };
        }
        // Also clone positions for other balls to avoid potential reference issues
        return { 
          ...ball, 
          position: ball.position.clone() 
        };
      });
      return { aiBalls: updatedBalls };
    });
    return isWinner;
  },
  
  incrementPlayerPowerUps: () => {
    let isWinner = false;
    set((state) => {
      const newCount = state.playerPowerUpsCollected + 1;
      // Ensure we need exactly 5 powerups to win (not 4)
      isWinner = newCount >= 5; // At least 5 powerups to win
      
      // Add current timestamp to the player's collection timestamps
      const newTimestamps = [...state.playerCollectionTimestamps, Date.now()];
      
      // Debug log to trace powerup count
      console.log(`Player powerups incremented from ${state.playerPowerUpsCollected} to ${newCount}`);
      
      return { 
        playerPowerUpsCollected: newCount,
        playerCollectionTimestamps: newTimestamps
      };
    });
    
    // Log the winner state for debugging
    if (isWinner) {
      console.log(`Player has reached winning condition with ${get().playerPowerUpsCollected} powerups`);
    }
    
    return isWinner;
  },
  
  getTotalPowerupsCollected: () => {
    const state = get();
    let total = state.playerPowerUpsCollected;
    
    // Add all AI ball powerups
    state.aiBalls.forEach(ball => {
      total += ball.powerUpsCollected;
    });
    
    return total;
  },
  
  getMaxPowerupsCollected: () => {
    const state = get();
    let max = state.playerPowerUpsCollected;
    
    // Find the maximum among AI balls
    state.aiBalls.forEach(ball => {
      if (ball.powerUpsCollected > max) {
        max = ball.powerUpsCollected;
      }
    });
    
    return max;
  },
  
  getWinnerBySecondaryCondition: () => {
    const state = get();
    
    // Check primary win condition first (at least 5 powerups)
    if (state.playerPowerUpsCollected >= 5) {
      return {
        id: 0,
        isPlayer: true,
        color: "#1e88e5", // blue color for player
        reason: 'primary',
        powerupsCount: state.playerPowerUpsCollected
      };
    }
    
    // Check if any AI ball has at least 5 powerups
    for (const ball of state.aiBalls) {
      if (ball.powerUpsCollected >= 5) {
        return {
          id: ball.id,
          isPlayer: false,
          color: ball.color,
          reason: 'primary',
          powerupsCount: ball.powerUpsCollected
        };
      }
    }
    
    // Apply secondary win condition: most powerups
    const maxPowerups = state.getMaxPowerupsCollected();
    if (maxPowerups === 0) return null; // No winner yet
    
    // Create list of top collectors (player and AI balls)
    let topCollectors: {
      id: number | null;
      isPlayer: boolean;
      color: string;
      count: number;
      lastTimestamp: number;
    }[] = [];
    
    // Check if player is a top collector
    if (state.playerPowerUpsCollected === maxPowerups) {
      topCollectors.push({
        id: 0,
        isPlayer: true,
        color: "#1e88e5", // blue color for player
        count: maxPowerups,
        lastTimestamp: state.playerCollectionTimestamps[state.playerPowerUpsCollected - 1] || 0
      });
    }
    
    // Check which AI balls are top collectors
    state.aiBalls.forEach(ball => {
      if (ball.powerUpsCollected === maxPowerups) {
        topCollectors.push({
          id: ball.id,
          isPlayer: false,
          color: ball.color,
          count: maxPowerups,
          lastTimestamp: ball.collectionTimestamps[ball.powerUpsCollected - 1] || 0
        });
      }
    });
    
    if (topCollectors.length === 0) return null; // No winner yet
    
    // If only one top collector, they win
    if (topCollectors.length === 1) {
      return {
        id: topCollectors[0].id,
        isPlayer: topCollectors[0].isPlayer,
        color: topCollectors[0].color,
        reason: 'most-powerups',
        powerupsCount: maxPowerups
      };
    }
    
    // Apply tiebreaker: earliest to reach the max count
    topCollectors.sort((a, b) => a.lastTimestamp - b.lastTimestamp);
    
    // Check if player is part of the tie (but not necessarily the winner)
    const playerWasInTie = topCollectors.some(collector => collector.isPlayer);
    
    console.log(`Tiebreaker result: ${topCollectors[0].isPlayer ? 'Player' : 'AI Ball #' + topCollectors[0].id} wins. Player was ${playerWasInTie ? '' : 'NOT '}involved in tie.`);
    
    return {
      id: topCollectors[0].id,
      isPlayer: topCollectors[0].isPlayer,
      color: topCollectors[0].color,
      reason: 'tiebreaker',
      powerupsCount: maxPowerups,
      playerWasInTie: playerWasInTie
    };
  },
  
  // The enhanced resetBalls implementation is defined above
}));

// Create a store to track individual AI ball scales
interface AIBallScaleState {
  scales: Record<number, number>;
  isGrowing: Record<number, boolean>; // Track growing state to prevent double growth
  getScale: (id: number) => number;
  growBall: (id: number) => void;
  resetScales: () => void;
}

export const useAIBallScaleStore = create<AIBallScaleState>((set, get) => ({
  scales: {},
  isGrowing: {},
  getScale: (id) => {
    const { scales } = get();
    return scales[id] || 1.0;
  },
  growBall: (id) => {
    const state = get();
    
    // Check if this ball is already in the process of growing
    if (state.isGrowing[id]) {
      console.log(`AI Ball #${id} growth already in progress, skipping duplicate growth`);
      return;
    }
    
    // Mark ball as growing to prevent duplicate growth
    set((state) => ({
      isGrowing: { ...state.isGrowing, [id]: true }
    }));
    
    // Perform the actual growth
    set((state) => {
      const currentScale = state.scales[id] || 1.0;
      const newScale = currentScale * 1.25; // Grow by exactly 25%
      
      // Add logging to debug growth
      console.log(`AI Ball #${id} growth: ${currentScale.toFixed(2)} -> ${newScale.toFixed(2)} (25% increase)`);
      
      // Reset growing flag after 500ms to prevent rapid consecutive growth events
      setTimeout(() => {
        set((state) => ({
          isGrowing: { ...state.isGrowing, [id]: false }
        }));
      }, 500);
      
      return { 
        scales: { 
          ...state.scales, 
          [id]: newScale 
        } 
      };
    });
  },
  resetScales: () => set({ scales: {}, isGrowing: {} })
}));

// Create a consistent time-based random number generator
const timeBasedRandom = (seed: number, time: number) => {
  // Combine seed and time to create a deterministic but varying value
  const x = Math.sin(seed * 12.9898 + time * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Function to calculate a fair starting position
// This doesn't replace any existing functionality, just adds a new function
// Create a static random seed that changes each game session but stays consistent during a game
// Initialize with current time, but this will be updated via reset events
let sessionRandomSeed = Math.floor(Date.now() / 1000);

export const calculateFairStartPosition = (id: number, startAngle: number, groundRadius: number = 25): [number, number] => {
  // List of fair distances as requested
  const fairDistances = [
    23.75, 23.85, 23.95, 24.05, 24.15, 24.25, 24.35, 24.45, 
    24.55, 24.65, 24.75, 24.85, 24.95, 25.05, 25.15, 25.25, 
    25.35, 25.45, 25.55, 25.65, 25.75
  ];
  
  // Create truly random index based on both session seed and ball ID
  // This ensures different distances for each ball, and different patterns each game session
  const randomIndex = Math.floor(
    (Math.sin(id * 12.9898 + sessionRandomSeed * 78.233) * 0.5 + 0.5) * fairDistances.length
  );
  
  // Get a randomized distance from our list
  const finalDistance = fairDistances[randomIndex];
  
  // Add a small random variation on top (+/- 0.2 units)
  // This ensures every game session has unique positioning
  const variationMultiplier = Math.sin(id * 43.758 + sessionRandomSeed * 36.2364) * 0.5 + 0.5;
  const variation = (variationMultiplier * 0.4) - 0.2; // Range: -0.2 to +0.2
  const adjustedDistance = finalDistance + variation;
  
  console.log(`AI Ball #${id} assigned distance: ${adjustedDistance.toFixed(2)} units`);
  
  // Calculate X and Z positions using the angle and distance
  const startX = Math.cos(startAngle) * adjustedDistance;
  const startZ = Math.sin(startAngle) * adjustedDistance;
  
  return [startX, startZ];
};

interface AIBallProps {
  id: number;
  startAngle: number;
  color: string;
}

/**
 * AI-controlled ball that moves with random motion and seeks power-ups
 * Using a complete rewrite to match Ball.tsx functionality exactly
 */
const AIBall = ({ id, startAngle, color }: AIBallProps) => {
  // References
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<CANNON.Body | null>(null);
  const lastDirectionChangeRef = useRef(0);
  const targetPositionRef = useRef<THREE.Vector3 | null>(null);
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  // Use isInitialized to ensure we don't use initial position more than once
  const isInitialized = useRef<boolean>(false);
  
  // Get physics world
  const world = usePhysics(state => state.world);
  
  // Get audio functions
  const playHitSound = useAudio((state) => state.playHit);
  
  // Get register function from AI balls store
  const registerBall = useAIBallsStore(state => state.registerBall);
  
  // Get difficulty settings
  const speedMultiplier = useDifficulty(state => state.getSpeedMultiplier());
  const powerupTargetChance = useDifficulty(state => state.getPowerupTargetChance());
  
  // Get AI ball scale
  const ballScale = useAIBallScaleStore(state => state.getScale(id));
  
  // Player movement state
  const hasPlayerStartedMoving = useControls(state => state.hasPlayerStartedMoving);
  
  // Get pause state
  const isPaused = usePauseStore(state => state.isPaused);
  
  // Ball properties
  const sphereBaseRadius = 0.5; // Same base size as player ball
  const baseMass = 5;     // Same mass as player ball
  
  // Calculate current radius and mass based on scale (same formula as player ball)
  const radius = sphereBaseRadius * ballScale;
  const mass = baseMass * Math.pow(ballScale, 3); // Mass scales with volume
  
  // Calculate initial position
  const groundRadius = 33; // Same as in Ground.tsx
  
  // Get AI ball texture from shared resources
  const texture = sharedResources.getAIBallTexture(id, color);
  
  // Function to create a physics body - extracted for reuse
  const createPhysicsBody = (
    position: CANNON.Vec3, 
    velocity?: CANNON.Vec3, 
    angularVelocity?: CANNON.Vec3
  ) => {
    if (!world) return null;
    
    // Clone the position to ensure we don't modify the original
    const safePosition = new CANNON.Vec3().copy(position);
    
    // Create a new body
    const body = new CANNON.Body({
      mass,
      position: safePosition,
      shape: new CANNON.Sphere(radius),
      material: new CANNON.Material("aiball"),
      linearDamping: 0.4,
      angularDamping: 0.4,
      allowSleep: false // AI balls should never sleep
    });
    
    // Set proper inertia for a sphere
    const I = 2 * mass * radius * radius / 5;
    body.inertia.set(I, I, I);
    body.updateMassProperties();
    
    // Add collision handler
    body.addEventListener("collide", (e: any) => {
      const impactVelocity = e.contact.getImpactVelocityAlongNormal();
      // Only play sound on significant impacts
      if (impactVelocity > 1.5) {
        playHitSound();
      }
    });
    
    // Double-check that position is set correctly
    body.position.copy(safePosition);
    
    // Restore velocities if provided
    if (velocity) body.velocity.copy(velocity);
    if (angularVelocity) body.angularVelocity.copy(angularVelocity);
    
    // Add body to world
    world.addBody(body);
    
    return body;
  };
  
  // Function to create or recreate the AI ball at a fair starting position
  const createAIBall = () => {
    if (!world) return;
    
    // Get a fair starting position using our function
    // This places all AI balls at a similar distance from center as the player
    const [startX, startZ] = calculateFairStartPosition(id, startAngle, groundRadius);
    
    // Create position for the ball
    const initialPosition = new THREE.Vector3(startX, radius, startZ);
    
    // Update position ref 
    positionRef.current.copy(initialPosition);
    
    console.log(`AI Ball #${id} created/reset at position: (${startX.toFixed(2)}, ${startZ.toFixed(2)})`);
    
    // Register with the store
    registerBall(id, initialPosition.clone(), color);
    
    // Remove any existing body from the world
    if (bodyRef.current) {
      world.removeBody(bodyRef.current);
      bodyRef.current = null;
    }
    
    // Create a new physics body at the start position with zero velocity
    const body = createPhysicsBody(
      new CANNON.Vec3(startX, radius, startZ)
    );
    
    if (body) {
      // Ensure ball starts with zero velocity
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);
      
      bodyRef.current = body;
      console.log(`AI Ball #${id} physics created with color ${color}`);
      
      // Reset AI targeting variables
      targetPositionRef.current = null;
      lastDirectionChangeRef.current = 0;
    }
  };
  
  // Initial body creation - COMPLETELY isolated from future updates
  useEffect(() => {
    // CRITICAL FIX: Only create a ball if we don't already have one AND we haven't been initialized before
    if (bodyRef.current || !world || isInitialized.current) return;
    
    // Mark as initialized immediately to prevent any chance of double creation
    isInitialized.current = true;
    
    // Insert a small delay to ensure ground is created first
    setTimeout(createAIBall, 100); // Small delay to ensure ground is created first
    
    // Cleanup function
    return () => {
      if (world && bodyRef.current) {
        world.removeBody(bodyRef.current);
        bodyRef.current = null;
      }
    };
  // Include startAngle in dependencies to use our fair position calculation
  }, [world, id, color, startAngle]);
  
  // Listen for reset positions event
  useEffect(() => {
    if (!world) return;
    
    const handleResetPositions = (event: CustomEvent) => {
      console.log(`AI Ball #${id} received reset-ball-positions event`);
      
      // Update the global session seed if provided in the event
      if (event.detail && event.detail.newSessionSeed) {
        sessionRandomSeed = event.detail.newSessionSeed;
        console.log(`Updated session random seed to: ${sessionRandomSeed}`);
      }
      
      // Recreate the AI ball at a fresh position
      createAIBall();
    };
    
    // Add event listener for reset-ball-positions
    window.addEventListener("reset-ball-positions", handleResetPositions as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener("reset-ball-positions", handleResetPositions as EventListener);
    };
  }, [world, id, color, startAngle]);
  
  // IMPROVED APPROACH FOR UPDATING SHAPE: Keep exact position & momentum
  useEffect(() => {
    // Don't proceed if no body or world
    if (!bodyRef.current || !world) return;
    
    // Log scaling event
    console.log(`AI Ball #${id} updating scale: ${ballScale.toFixed(2)}x (radius: ${radius.toFixed(2)})`);
    
    // Store current state
    const body = bodyRef.current;
    const currentPosition = new CANNON.Vec3().copy(body.position);
    const currentVelocity = new CANNON.Vec3().copy(body.velocity);
    const currentAngularVelocity = new CANNON.Vec3().copy(body.angularVelocity);
    
    // Log the current position before update
    console.log(`AI Ball #${id} position before update: (${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}, ${currentPosition.z.toFixed(2)})`);
    
    // Remove old body from world
    world.removeBody(body);
    bodyRef.current = null;
    
    // Create a completely new body at EXACTLY the same position with updated size
    const newBody = createPhysicsBody(currentPosition, currentVelocity, currentAngularVelocity);
    
    if (newBody) {
      // Double-check position to make sure it's correct
      newBody.position.copy(currentPosition);
      
      // Store the new body reference
      bodyRef.current = newBody;
      
      // Log the new position after update
      console.log(`AI Ball #${id} position after update: (${newBody.position.x.toFixed(2)}, ${newBody.position.y.toFixed(2)}, ${newBody.position.z.toFixed(2)})`);
      
      // Add a "kick" to ensure it keeps moving
      const randomAngle = Math.random() * Math.PI * 2;
      const randomStrength = 2 + Math.random();
      newBody.applyImpulse(
        new CANNON.Vec3(
          Math.cos(randomAngle) * randomStrength,
          0,
          Math.sin(randomAngle) * randomStrength
        ),
        new CANNON.Vec3(0, 0, 0)
      );
      
      // Reset target to force new target acquisition
      targetPositionRef.current = null;
      lastDirectionChangeRef.current = 0;
      
      console.log(`AI Ball #${id} successfully recreated with new size`);
    }
  }, [ballScale, radius, mass, id, color, world]);
  
  // ADD A BACKUP CHECK to ensure ball keeps moving
  useEffect(() => {
    if (!world) return;
    
    // Create an interval to periodically check if ball is moving
    const checkInterval = setInterval(() => {
      if (bodyRef.current && hasPlayerStartedMoving) {
        const body = bodyRef.current;
        
        // Check if body is nearly static (not moving)
        const isStatic = body.velocity.lengthSquared() < 0.05;
        
        // If static, add a random impulse to get it moving again
        if (isStatic) {
          const randomAngle = Math.random() * Math.PI * 2;
          const randomStrength = 2 + Math.random() * 2;
          
          body.velocity.x = Math.cos(randomAngle) * randomStrength;
          body.velocity.z = Math.sin(randomAngle) * randomStrength;
          
          // Force a new target
          targetPositionRef.current = null;
          lastDirectionChangeRef.current = 0;
          
          console.log(`AI Ball #${id} was static - applying backup impulse`);
        }
      }
    }, 3000); // Check every 3 seconds
    
    // Cleanup on unmount
    return () => clearInterval(checkInterval);
  }, [id, world, hasPlayerStartedMoving]);
  
  // Function to find the nearest power-up
  const findNearestPowerUp = (): THREE.Vector3 | null => {
    if (!meshRef.current || !meshRef.current.parent) {
      return null;
    }
    
    let closestDistance = Infinity;
    let closestPosition: THREE.Vector3 | null = null;
    
    // Get the scene
    const scene = meshRef.current.parent;
    
    // Traverse scene to find power-ups
    scene.traverse((object) => {
      if (object.userData && object.userData.isPowerup) {
        const powerUp = object as THREE.Mesh;
        const distance = powerUp.position.distanceTo(meshRef.current!.position);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPosition = powerUp.position.clone();
        }
      }
    });
    
    return closestPosition;
  };
  
  // Additional refs for time tracking
  const frameTimeRef = useRef<number>(0);
  
  // AI movement logic and mesh update - uses useFrame for smooth animation
  useFrame((state) => {
    // Safety check
    if (!bodyRef.current || !meshRef.current) return;
    
    // Get current body and time
    const body = bodyRef.current;
    const time = state.clock.getElapsedTime();
    
    // Update mesh position and rotation
    meshRef.current.position.set(
      body.position.x, 
      body.position.y, 
      body.position.z
    );
    
    meshRef.current.quaternion.set(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
    
    // Register position with store
    positionRef.current.copy(meshRef.current.position);
    registerBall(id, positionRef.current.clone(), color);
    
    // Geometry update is now handled by the shared resource system
    
    // Check if ball is static and wake it up if needed
    const isStatic = body.velocity.lengthSquared() < 0.01;
    if (isStatic && hasPlayerStartedMoving) {
      // Wake up the body GENTLY - use a tiny force instead of an impulse
      // This prevents the initial "burst" of speed when AI balls start moving
      const randomAngle = Math.random() * Math.PI * 2;
      
      // Get current time for deltaTime calculation
      const timeNow = state.clock.getElapsedTime();
      const deltaTime = timeNow - frameTimeRef.current;
      const safeDeltatime = deltaTime > 0.001 ? deltaTime : 1/60;
      
      // Calculate time-independent wake-up force
      const baseWakeForce = 0.05; // Base gentle wake force
      const timeScaledForce = baseWakeForce * safeDeltatime * 60; // Scale by time for consistent effect
      
      const forceX = Math.cos(randomAngle) * timeScaledForce;
      const forceZ = Math.sin(randomAngle) * timeScaledForce;
      
      // Use applyForce instead of applyImpulse for gentler acceleration
      body.applyForce(
        new CANNON.Vec3(forceX, 0, forceZ),
        new CANNON.Vec3(0, 0, 0)
      );
      
      // Reset target finding to reactivate AI movement
      targetPositionRef.current = null;
      lastDirectionChangeRef.current = time - 3.0; // Force immediate new target
      
      console.log(`AI Ball #${id} was static - waking up gently`);
    }
    
    // Only move AI balls if player has started moving
    if (hasPlayerStartedMoving) {
      // AI decision logic - change direction randomly or target powerup
      const timeSinceLastChange = time - lastDirectionChangeRef.current;
      const powerUpPosition = findNearestPowerUp();
      
      // Force new target if we don't have one (e.g., after powerup collection)
      if (!targetPositionRef.current || timeSinceLastChange > 2.0) {
        // Either target a powerup or move randomly
        const shouldTargetPowerups = timeBasedRandom(id + 100, time) <= powerupTargetChance;
        
        if (powerUpPosition && shouldTargetPowerups) {
          // Target powerup
          targetPositionRef.current = powerUpPosition;
        } else {
          // Generate random position within the field
          const randomAngle = timeBasedRandom(id, time) * Math.PI * 2;
          const randomDistance = timeBasedRandom(id + 1, time) * groundRadius * 0.7;
          const randomX = Math.cos(randomAngle) * randomDistance;
          const randomZ = Math.sin(randomAngle) * randomDistance;
          
          targetPositionRef.current = new THREE.Vector3(randomX, radius, randomZ);
        }
        
        lastDirectionChangeRef.current = time;
      } else if (powerUpPosition && timeBasedRandom(id + 100, time) <= powerupTargetChance) {
        // Occasionally check if there's a powerup to target, even if we have a current target
        targetPositionRef.current = powerUpPosition;
      }
      
      // Move toward target
      if (targetPositionRef.current) {
        // Calculate direction to target
        const direction = new THREE.Vector3()
          .subVectors(targetPositionRef.current, meshRef.current.position)
          .normalize();
        
        // Using elapsed time from component ref for reliable frame rate calculation
        const timeNow = state.clock.getElapsedTime();
        // Skip time accumulation if the game is paused
        if (isPaused) {
          // Just update the reference time without calculating delta
          frameTimeRef.current = timeNow;
          return; // Skip the entire AI movement logic while paused
        }
        
        // Calculate delta time with safeguards for pause/resume
        let deltaTime = timeNow - frameTimeRef.current;
        
        // If deltaTime is unusually large (e.g. after pause/resume or first frame),
        // use a reasonable default value instead to prevent acceleration
        if (deltaTime > 0.1 || frameTimeRef.current === 0) {
          console.log(`AI Ball #${id} detected large deltaTime (${deltaTime.toFixed(4)}s), using default value`);
          deltaTime = 1/60; // Use 60fps equivalent
        }
        
        // Update frame time for next calculation
        frameTimeRef.current = timeNow;
        
        // Calculate framerate compensation factor with safety
        // At 60fps, deltaTime is ~0.016667, so compensation would be ~1.0
        // At 30fps, deltaTime is ~0.03333, so compensation would be ~2.0
        const safeDeltatime = deltaTime > 0.001 ? deltaTime : 1/60;
        
        // Don't cap the deltaTime anymore - this ensures proper compensation on very low FPS devices
        // The frameCompensation factor is how many 60fps frames would have passed in this deltaTime
        const frameCompensation = safeDeltatime * 60;
        
        // Use the original force calculation that was working before
        // Convert the speedMultiplier to the correct AI ball force:
        // Easy: speedMultiplier = 0.3, force = 3.9 (30% of 13.0)
        // Medium: speedMultiplier = 0.5, force = 6.5 (50% of 13.0)
        // Hard: speedMultiplier = 0.75, force = 9.75 (75% of 13.0)
        // Super Hard: speedMultiplier = 1.0, force = 13.0 (100% of 13.0)
        const baseForce = 13.0; // Increased to 13.0 to match player ball force
        
        // Scale with ball mass, apply speed multiplier, and frame compensation
        const forceMagnitude = baseForce * mass * speedMultiplier * frameCompensation;
        
        // Log AI movement occasionally for debugging
        if (Math.random() < 0.001) {
          console.log(`AI Ball #${id} moving with frame compensation: ${frameCompensation.toFixed(2)}, force: ${forceMagnitude.toFixed(2)}, deltaTime: ${safeDeltatime.toFixed(4)}`);
        }
        
        // Add small jitter for more natural movement
        const jitter = 0.3;
        const jitterX = 1.0 + (timeBasedRandom(id, time + 0.1) * jitter * 2 - jitter);
        const jitterZ = 1.0 + (timeBasedRandom(id, time + 0.2) * jitter * 2 - jitter);
        body.applyForce(
          new CANNON.Vec3(
            direction.x * forceMagnitude * jitterX,
            0,
            direction.z * forceMagnitude * jitterZ
          ),
          new CANNON.Vec3(0, 0, 0)
        );
        
        // Log when AI balls start moving (after direction change)
        if (time - lastDirectionChangeRef.current < 0.1) {
          console.log(`AI Ball #${id} started moving!`);
        }
      }
    }
    
    // Boundary check - reset if ball falls through the ground
    if (body.position.y < -10) {
      const safeRadius = 10;
      const randomAngle = Math.random() * Math.PI * 2;
      const safeX = Math.cos(randomAngle) * safeRadius;
      const safeZ = Math.sin(randomAngle) * safeRadius;
      
      body.position.set(safeX, radius * 2, safeZ);
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);
    }
  });
  
  // Use useFrame to update the shared geometry when radius changes
  useFrame(() => {
    if (meshRef.current) {
      // Update geometry reference when radius changes
      const currentGeometry = meshRef.current.geometry;
      const newGeometry = sharedResources.getSphereGeometry(radius, 32, 32);
      
      if (currentGeometry !== newGeometry) {
        meshRef.current.geometry = newGeometry;
      }
    }
  });

  // Get the base material and clone it for this specific ball
  const material = useMemo(() => {
    const baseMat = sharedResources.getBaseMaterial().clone();
    baseMat.map = texture;
    baseMat.color.set("#ffffff"); // White base to allow textures to show
    baseMat.roughness = 1.0;
    baseMat.metalness = 0.0;
    return baseMat;
  }, [texture]);

  return (
    <mesh 
      ref={meshRef} 
      castShadow 
      receiveShadow
      userData={{ isAIBall: true, id, color }}
    >
      <primitive object={sharedResources.getSphereGeometry(radius, 32, 32)} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default AIBall;