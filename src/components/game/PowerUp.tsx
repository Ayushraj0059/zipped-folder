import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { usePhysics } from "@/lib/stores/usePhysics";
import { useAudio } from "@/lib/stores/useAudio";
import { useBallStore } from "./Ball";
import { useAIBallsStore, useAIBallScaleStore } from "./AIBall";
import { useWinStore } from "./WinModal";
import { useGame } from "@/lib/stores/useGame";
import PowerUpAppearance from "./PowerUpAppearance";

// Define the radius of the power-up for both visual and physics
const POWER_UP_RADIUS = 0.5;
// Maximum number of power-ups to spawn (total of 12)
const MAX_POWER_UPS = 12; // The actual maximum count
// Collection distance - how close a ball needs to be to collect a power-up
const COLLECTION_DISTANCE = 2.0;

// Create a basic store for power-up management
interface PowerUpState {
  active: boolean;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
}

/**
 * PowerUp component that spawns and manages power-ups in the game
 * This version uses direct distance checking instead of physics collisions
 * and implements the new winning conditions
 */
const PowerUp = () => {
  // References
  const meshRef = useRef<THREE.Group>(null);
  
  // Get physics world and player body
  const world = usePhysics(state => state.world);
  const playerBody = usePhysics(state => state.playerBody);
  
  // Get audio for sound effects
  const playSuccessSound = useAudio((state) => state.playSuccess);
  const playPlayerPowerupSound = useAudio((state) => state.playPlayerPowerup);
  
  // Get ball growth function
  const growBall = useBallStore((state) => state.growBall);
  
  // Get AI ball functions
  const aiBalls = useAIBallsStore((state) => state.aiBalls);
  const incrementPowerUps = useAIBallsStore((state) => state.incrementPowerUps);
  const incrementPlayerPowerUps = useAIBallsStore((state) => state.incrementPlayerPowerUps);
  const growAIBall = useAIBallScaleStore((state) => state.growBall);
  
  // Get functions for win condition checks
  const getWinnerBySecondaryCondition = useAIBallsStore((state) => state.getWinnerBySecondaryCondition);
  const getTotalPowerupsCollected = useAIBallsStore((state) => state.getTotalPowerupsCollected);
  
  // Get game end function
  const end = useGame((state) => state.end);
  
  // Get winner setter
  const setWinner = useWinStore((state) => state.setWinner);
  
  // Power-up state
  const [powerUpState, setPowerUpState] = useState<PowerUpState>({
    active: true,
    position: new THREE.Vector3(0, POWER_UP_RADIUS, 0), // Start at center of ground
    rotation: new THREE.Quaternion(),
  });
  
  // Track number of power-ups collected
  // We need to make sure this resets between games, so we'll use an additional ref to track resets
  const [powerUpsCollected, setPowerUpsCollected] = useState<number>(0);
  const totalPowerUpsRef = useRef<number>(0);
  
  // Flag to track if this powerup is being collected (prevent double collection)
  const [isCollecting, setIsCollecting] = useState(false);
  
  // Use a ref to maintain a more reliable lock for collection state
  // This helps prevent race conditions where multiple collections might be processed
  const isCollectingRef = useRef(false);
  
  // Create a material with improved properties
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x9900ff),
      transparent: true,
      emissive: new THREE.Color(0x6600aa),
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2
    }), []
  );
  
  // Keep track of previous power-up positions to ensure good spacing
  const prevPositionsRef = useRef<{x: number, z: number}[]>([]);
  
  // Record initial position to prevent spawning near it later
  useEffect(() => {
    prevPositionsRef.current.push({x: 0, z: 0});

    // Set up listener for reset event from GameManager
    const handleReset = () => {
      console.log("PowerUp received reset event from GameManager");
      // Reset the total powerups collected
      setPowerUpsCollected(0);
      // Reset the collection flags
      setIsCollecting(false);
      isCollectingRef.current = false;
      // Clear previous positions except for initial center position
      prevPositionsRef.current = [{x: 0, z: 0}];
      // Reset to initial state with active powerup at center
      setPowerUpState({
        active: true,
        position: new THREE.Vector3(0, POWER_UP_RADIUS, 0),
        rotation: new THREE.Quaternion()
      });
      console.log("PowerUp component fully reset");
    };

    // Listen for reset events
    window.addEventListener("reset-powerups", handleReset);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("reset-powerups", handleReset);
    };
  }, []);
  
  // Check for end-of-game (all 12 powerups collected) and apply secondary win conditions
  useEffect(() => {
    // Check if all powerups are collected
    if (powerUpsCollected >= MAX_POWER_UPS) {
      console.log("All powerups collected! Checking secondary win conditions...");
      
      // Get winner based on secondary conditions
      const winner = getWinnerBySecondaryCondition();
      
      if (winner) {
        if (winner.isPlayer) {
          console.log(`PLAYER WINS by ${winner.reason} condition with ${winner.powerupsCount} powerups!`);
        } else {
          console.log(`AI BALL #${winner.id} WINS by ${winner.reason} condition with ${winner.powerupsCount} powerups!`);
        }
        
        // Set the winner with all details
        setWinner(
          winner.id, 
          winner.isPlayer, 
          winner.color, 
          winner.powerupsCount, 
          winner.reason,
          winner.playerWasInTie // Pass the flag indicating if player was in the tie
        );
        
        // End the game
        end();
      }
    }
  }, [powerUpsCollected, getWinnerBySecondaryCondition, setWinner, end]);
  
  // Function to handle player ball collecting a powerup
  const handlePlayerCollection = () => {
    // Check both React state and ref to prevent race conditions
    if (isCollecting || isCollectingRef.current) return;
    
    // Set both state and ref lock immediately
    setIsCollecting(true);
    isCollectingRef.current = true;
    
    console.log("Player starting power-up collection...");
    
    // Play player powerup sound
    playPlayerPowerupSound();
    
    // Make power-up inactive immediately
    setPowerUpState(prev => ({ ...prev, active: false }));
    
    // Increment collected counter
    setPowerUpsCollected(prev => prev + 1);
    
    // Grow the player ball by 25%
    growBall();
    
    // Increment player's powerups in the store
    const isWinner = incrementPlayerPowerUps();
    
    console.log(`Player collected a power-up! Ball grew by 25%`);
    
    // Check primary win condition (5 power-ups)
    if (isWinner) {
      // Get current count from store to ensure accuracy
      const currentCount = useAIBallsStore.getState().playerPowerUpsCollected;
      console.log(`PLAYER WINS with ${currentCount} powerups!`);
      setWinner(0, true, "#1e88e5", currentCount, 'primary', false); // blue color for player
      end();
    }
  };
  
  // Function to handle AI ball collecting a powerup - COMPLETELY REWRITTEN for reliability
  const handleAICollection = (ballId: number, ballColor: string) => {
    // Check both React state and ref to prevent race conditions
    if (isCollecting || isCollectingRef.current) return;
    
    // Set both state and ref lock immediately
    setIsCollecting(true);
    isCollectingRef.current = true;
    
    // Play success sound
    playSuccessSound();
    
    // Make power-up inactive immediately
    setPowerUpState(prev => ({ ...prev, active: false }));
    
    // Increment collected counter
    setPowerUpsCollected(prev => prev + 1);
    
    // Get the AI ball's current position for debugging
    const aiBall = aiBalls.find(ball => ball.id === ballId);
    const posBeforeStr = aiBall ? 
      `at (${aiBall.position.x.toFixed(2)}, ${aiBall.position.y.toFixed(2)}, ${aiBall.position.z.toFixed(2)})` : 
      'unknown position';
    
    console.log(`AI ball #${ballId} collecting a power-up! ${posBeforeStr}`);
    
    // Execute all operations immediately without delays
    // First update the powerups counter in the store
    const isWinner = incrementPowerUps(ballId);
    console.log(`AI ball #${ballId} powerup count incremented`);
    
    // Immediately grow the ball
    growAIBall(ballId);
    console.log(`AI ball #${ballId} scale growth triggered`);
    
    // Log completion
    console.log(`AI ball #${ballId} power-up collection fully completed`);
    
    // Check primary win condition
    if (isWinner) {
      // Get current count from store to ensure accuracy
      const currentBall = useAIBallsStore.getState().aiBalls.find(ball => ball.id === ballId);
      const currentCount = currentBall ? currentBall.powerUpsCollected : 5;
      console.log(`AI BALL #${ballId} WINS with ${currentCount} powerups!`);
      setWinner(ballId, false, ballColor, currentCount, 'primary', false);
      end();
    }
  };
  
  // Respawn power-up at a random position after collection
  useEffect(() => {
    if (!powerUpState.active && powerUpsCollected <= MAX_POWER_UPS) {
      // Calculate a random position within the ground radius
      const groundRadius = 33; // Same as in Ground.tsx
      const safeRadius = groundRadius * 0.8; // Stay away from the edges
      const minDistance = 10; // Minimum distance from previous positions
      
      // Function to generate a random position
      const generateRandomPosition = () => {
        const angle = Math.random() * Math.PI * 2;
        const randomValue = Math.random();
        const distance = safeRadius * 0.3 + (safeRadius * 0.7 * Math.sqrt(randomValue));
        
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        return {x, z};
      };
      
      // Generate position and check distance from previous power-ups
      let position = {x: 0, z: 0};
      let attempts = 0;
      const maxAttempts = 20;
      
      do {
        position = generateRandomPosition();
        attempts++;
        
        // Check if it's far enough from all previous positions
        const isFarEnough = prevPositionsRef.current.every(prev => {
          const dx = prev.x - position.x;
          const dz = prev.z - position.z;
          const distSquared = dx * dx + dz * dz;
          return distSquared > minDistance * minDistance;
        });
        
        if (isFarEnough || attempts >= maxAttempts) break;
      } while (true);
      
      // Store this position
      prevPositionsRef.current.push(position);
      
      // Set a timeout to respawn the power-up
      const respawnTimeout = setTimeout(() => {
        console.log(`Spawning power-up #${powerUpsCollected + 1} at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
        
        // Reset both state and ref lock
        setIsCollecting(false);
        isCollectingRef.current = false;
        
        // Update state with new position
        setPowerUpState({
          active: true,
          position: new THREE.Vector3(position.x, POWER_UP_RADIUS, position.z),
          rotation: new THREE.Quaternion(),
        });
      }, 2000); // 2 second delay before respawning
      
      return () => clearTimeout(respawnTimeout);
    }
  }, [powerUpState.active, powerUpsCollected]);
  
  // Check for proximity to balls every frame
  useFrame((state, delta) => {
    // Check both state and ref for the collection lock
    if (!meshRef.current || !powerUpState.active || isCollecting || isCollectingRef.current) return;
    
    // Update position and rotation effect
    meshRef.current.position.copy(powerUpState.position);
    meshRef.current.quaternion.copy(powerUpState.rotation);
    
    // Rotate the power-up continuously for visual effect
    meshRef.current.rotation.y += delta * 2;
    
    // Float up and down effect
    const floatOffset = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    meshRef.current.position.y = POWER_UP_RADIUS + floatOffset;
    
    const powerUpPosition = powerUpState.position;
    
    // Check player ball distance
    if (playerBody) {
      const playerPosition = playerBody.position;
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - powerUpPosition.x, 2) +
        Math.pow(playerPosition.z - powerUpPosition.z, 2)
      );
      
      // If player is close enough, collect the power-up
      if (distance < COLLECTION_DISTANCE) {
        handlePlayerCollection();
        return;
      }
    }
    
    // Check AI ball distances
    for (const aiBall of aiBalls) {
      const distance = Math.sqrt(
        Math.pow(aiBall.position.x - powerUpPosition.x, 2) +
        Math.pow(aiBall.position.z - powerUpPosition.z, 2)
      );
      
      // If an AI ball is close enough, collect the power-up
      if (distance < COLLECTION_DISTANCE) {
        handleAICollection(aiBall.id, aiBall.color);
        return;
      }
    }
  });
  
  // Don't render if not active or if all power-ups have been collected
  if (!powerUpState.active || powerUpsCollected >= MAX_POWER_UPS) {
    return null;
  }
  
  return (
    <group 
      ref={meshRef} 
      position={[powerUpState.position.x, powerUpState.position.y, powerUpState.position.z]}
      rotation={[0, 0, 0]}
      userData={{ isPowerup: true }}
    >
      {/* Use the new PowerUpAppearance component */}
      <PowerUpAppearance 
        radius={POWER_UP_RADIUS} 
        position={new THREE.Vector3(0, 0, 0)} 
      />
      
      {/* Debug visualization of collection radius - keep this for game mechanics */}
      <mesh visible={false}>
        <sphereGeometry args={[COLLECTION_DISTANCE, 16, 16]} />
        <meshBasicMaterial color="#ff0000" wireframe opacity={0.2} transparent />
      </mesh>
    </group>
  );
};

export default PowerUp;