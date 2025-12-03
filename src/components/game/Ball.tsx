import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { usePhysics } from "@/lib/stores/usePhysics";
import { useAudio } from "@/lib/stores/useAudio";
import { create } from "zustand";
import { sharedResources } from "@/lib/sharedResources";

// Create a store for the ball's scale
interface BallState {
  scale: number;
  isGrowing: boolean; // Flag to prevent duplicate growth events
  setScale: (scale: number) => void;
  growBall: () => void;
}

export const useBallStore = create<BallState>((set, get) => ({
  scale: 1.0, // Initial scale (1.0 = 100%)
  isGrowing: false, // Initially not growing
  setScale: (scale: number) => set({ scale }),
  growBall: () => {
    // First check if growth is already in progress
    if (get().isGrowing) {
      console.log(`Player ball growth already in progress, skipping duplicate growth`);
      return;
    }
    
    // Mark as growing to prevent duplicate growth
    set({ isGrowing: true });
    
    // Perform the actual growth
    set((state) => {
      // Add logging to debug growth
      const currentScale = state.scale;
      const newScale = currentScale * 1.25; // Grow by exactly 25%
      console.log(`Player ball growth: ${currentScale.toFixed(2)} -> ${newScale.toFixed(2)} (25% increase)`);
      
      // Reset the growing flag after a small delay
      setTimeout(() => {
        set({ isGrowing: false });
      }, 500);
      
      return { scale: newScale };
    });
  },
}));

/**
 * Enhanced Ball component with improved physics for ultra-realistic game mechanics
 * Now with shared geometries and materials for better performance
 */
const Ball = () => {
  // References
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<CANNON.Body | null>(null);
  
  // Get the physics world
  const world = usePhysics(state => state.world);
  const setPlayerBody = usePhysics(state => state.setPlayerBody);
  
  // Get audio functions
  const playHitSound = useAudio((state) => state.playHit);
  
  // Get scale from ball store
  const ballScale = useBallStore(state => state.scale);
  
  // Ball properties
  const baseRadius = 0.5; // Base radius before scaling
  const baseMass = 5; // Base mass before scaling
  
  // Calculate current radius and mass based on scale
  const radius = baseRadius * ballScale;
  const mass = baseMass * Math.pow(ballScale, 3); // Mass scales with volume
  
  // Get shared texture from resource manager
  const texture = sharedResources.getPlayerBallTexture();
  
  // Get shared material from resource manager
  const material = sharedResources.getBaseMaterial().clone();
  // Set the texture on the material
  material.map = texture;
  
  // Function to create the player ball at the initial position
  const createPlayerBall = () => {
    if (!world || !meshRef.current) return;
    
    console.log("Creating ball with perfect physics...");
      
    // Calculate inertia for proper rolling physics (solid sphere formula)
    const I = 2 * mass * radius * radius / 5;
    const sphereInertia = new CANNON.Vec3(I, I, I);
      
    // Calculate starting position at 3/4 of field radius with random variation
    const groundRadius = 33; // Same as in Ground.tsx
    const baseRadius = groundRadius * 0.75; // 3/4 of the field radius (24.75 units)
      
    // Add slight random variation to make position more natural
    // Random value between -1 and +1
    const randomVariation = (Math.random() * 2 - 1);
    const startRadius = baseRadius + randomVariation; // Range: 23.75 to 25.75
      
    const startAngle = Math.PI * 0.5; // Start at 90 degrees (top of the field)
    const startX = Math.cos(startAngle) * startRadius; 
    const startZ = Math.sin(startAngle) * startRadius;
      
    console.log(`Starting player ball at radius: ${startRadius.toFixed(2)} units (position: ${startX.toFixed(2)}, ${startZ.toFixed(2)})`);
      
    // Create body with precise starting position at 3/4 of the radius from center
    const body = new CANNON.Body({
      mass,
      position: new CANNON.Vec3(startX, radius, startZ), // Start at 3/4 radius position
      shape: new CANNON.Sphere(radius),
      material: new CANNON.Material("ball"),
      linearDamping: 0.4, // Good damping for realistic movement
      angularDamping: 0.4, // Good angular damping for realistic rotation
      allowSleep: true, // Allow the ball to sleep when not moving for performance
      sleepSpeedLimit: 0.1, // Low sleep speed threshold
      sleepTimeLimit: 1 // Short sleep time for quick response
    });
      
    // Set precise inertia
    body.inertia.copy(sphereInertia);
    body.updateMassProperties();
      
    // Enhanced collision handler
    body.addEventListener("collide", (e: any) => {
      const impactVelocity = e.contact.getImpactVelocityAlongNormal();
      // Plays sound based on impact velocity for more realistic effects
      if (impactVelocity > 1.5) {
        playHitSound();
      }
    });
      
    // If there was a previous body, remove it first
    if (bodyRef.current) {
      world.removeBody(bodyRef.current);
    }
    
    // Add body to world
    world.addBody(body);
    bodyRef.current = body;
      
    // Register body with global store
    setPlayerBody(body);
      
    console.log("Ultra-realistic ball physics created");
  };
  
  // Create physics body with useEffect for proper sequencing
  useEffect(() => {
    // Skip if we already have a body or no world
    if (bodyRef.current || !world || !meshRef.current) return;
    
    // Insert a small delay to ensure ground is created first
    setTimeout(createPlayerBall, 200); // Slightly longer delay to ensure ground and fence are fully created
  }, [world]);
  
  // Listen for reset positions event to recreate the ball at its starting position
  useEffect(() => {
    if (!world) return;
    
    const handleResetPositions = (event: CustomEvent) => {
      console.log("Ball received reset-ball-positions event");
      
      // Create a new ball at the starting position
      createPlayerBall();
    };
    
    // Add event listener for reset-ball-positions
    window.addEventListener("reset-ball-positions", handleResetPositions as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener("reset-ball-positions", handleResetPositions as EventListener);
    };
  }, [world, mass, radius]);
  
  // Update physics body when scale changes
  useEffect(() => {
    if (!bodyRef.current || !world) return;
    
    // Get the current body and world
    const body = bodyRef.current;
    
    // Store the current position and velocity
    const currentPosition = new CANNON.Vec3().copy(body.position);
    const currentVelocity = new CANNON.Vec3().copy(body.velocity);
    const currentAngularVelocity = new CANNON.Vec3().copy(body.angularVelocity);
    
    // Remove the old body from the world
    world.removeBody(body);
    
    // Create a new sphere shape with the updated radius
    const newSphereShape = new CANNON.Sphere(radius);
    
    // Update mass and inertia to match new size
    const newMass = mass;
    const I = 2 * newMass * radius * radius / 5;
    
    // Create a new body with the same properties but updated shape
    const newBody = new CANNON.Body({
      mass: newMass,
      position: currentPosition,
      shape: newSphereShape,
      material: new CANNON.Material("ball"),
      linearDamping: 0.4,
      angularDamping: 0.4,
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      sleepTimeLimit: 1
    });
    
    // Set inertia
    newBody.inertia.set(I, I, I);
    newBody.updateMassProperties();
    
    // Ensure the body is at least radius height from ground
    if (newBody.position.y < radius) {
      newBody.position.y = radius;
    }
    
    // Restore velocity
    newBody.velocity.copy(currentVelocity);
    newBody.angularVelocity.copy(currentAngularVelocity);
    
    // Add collision handler
    newBody.addEventListener("collide", (e: any) => {
      const impactVelocity = e.contact.getImpactVelocityAlongNormal();
      if (impactVelocity > 1.5) {
        playHitSound();
      }
    });
    
    // Add the new body to the world
    world.addBody(newBody);
    
    // Update references
    bodyRef.current = newBody;
    setPlayerBody(newBody);
    
    console.log(`Ball scale updated: ${ballScale.toFixed(2)}x (radius: ${radius.toFixed(2)}, mass: ${mass.toFixed(2)})`);
  }, [ballScale, radius, mass, world, setPlayerBody, playHitSound]);
  
  // Update mesh from physics body with smooth interpolation
  useFrame(() => {
    if (!bodyRef.current || !meshRef.current) return;
    
    // Get body
    const body = bodyRef.current;
    
    // Update position with precise tracking
    meshRef.current.position.set(
      body.position.x, 
      body.position.y, 
      body.position.z
    );
    
    // Update rotation with precise tracking
    meshRef.current.quaternion.set(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
    
    // Geometry update is now handled by the shared resource system
    
    // Boundary check - prevent ball from falling off the edge or going outside fence
    if (body.position.y < -10) {
      // If ball fell through the ground, reset it to a safe position
      const groundRadius = 33; // Same as in Ground.tsx
      const startRadius = groundRadius * 0.5; // Half of the field radius
      const startX = 0;
      const startZ = 0;
      body.position.set(startX, radius * 2, startZ);
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);
    }
  });
  
  // Update mesh geometry in useFrame when radius changes
  useFrame(() => {
    if (meshRef.current) {
      // When radius changes, update the shared geometry reference
      const currentGeometry = meshRef.current.geometry;
      const newGeometry = sharedResources.getSphereGeometry(radius, 32, 32);
      
      if (currentGeometry !== newGeometry) {
        meshRef.current.geometry = newGeometry;
      }
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow name="player-ball">
      <primitive object={sharedResources.getSphereGeometry(radius, 32, 32)} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default Ball;
