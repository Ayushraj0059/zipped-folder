import { ReactNode, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as CANNON from "cannon-es";
import { usePhysics } from "@/lib/stores/usePhysics";
import { usePauseStore } from "@/lib/stores/usePauseStore";

interface PhysicsWorldProps {
  children: ReactNode;
}

// Completely rewritten physics system with accumulator pattern
const PhysicsWorld = ({ children }: PhysicsWorldProps) => {
  const world = useRef<CANNON.World | null>(null);
  const setWorld = usePhysics((state) => state.setWorld);
  
  // Refs for physics timing and pause handling
  const accumulatorRef = useRef<number>(0);
  const prevTimeRef = useRef<number | null>(null);
  const justResumedRef = useRef<boolean>(false);
  
  // Get the pause state directly
  const isPaused = usePauseStore(state => state.isPaused);
  
  // Track pause state changes
  const wasPausedRef = useRef<boolean>(false);
  
  // Initialize physics world with optimized settings
  useEffect(() => {
    // Create a new physics world with optimized settings
    const newWorld = new CANNON.World();
    
    // Set gravity - use slightly reduced gravity for better control
    newWorld.gravity.set(0, -9.0, 0);
    
    // Better collision detection
    newWorld.broadphase = new CANNON.SAPBroadphase(newWorld);
    
    // Sleep settings for performance
    newWorld.allowSleep = true;
    
    // Default contact material for better ball physics
    newWorld.defaultContactMaterial.friction = 0.5;
    newWorld.defaultContactMaterial.restitution = 0.1;
    newWorld.defaultContactMaterial.contactEquationStiffness = 1e7;
    newWorld.defaultContactMaterial.contactEquationRelaxation = 3;
    
    // Save our world in the ref and the store
    world.current = newWorld;
    setWorld(newWorld);
    
    console.log("Optimized physics world initialized");
    
    // Cleanup on unmount
    return () => {
      world.current = null;
      setWorld(null);
    };
  }, [setWorld]);
  
  // Reset physics timing when pause state changes
  useEffect(() => {
    // When game is paused
    if (isPaused) {
      console.log("PhysicsWorld: Game paused - freezing physics");
      wasPausedRef.current = true;
    } 
    // When game is resumed
    else if (wasPausedRef.current) {
      console.log("PhysicsWorld: Game resumed - resetting physics timing");
      // Reset timing to prevent catching up with accumulated time
      prevTimeRef.current = null;
      accumulatorRef.current = 0;
      justResumedRef.current = true;
      wasPausedRef.current = false;
    }
  }, [isPaused]);
  
  // Reset function that can be called from GameManager
  const resetPhysicsTiming = () => {
    console.log("PhysicsWorld: Explicitly resetting physics timing");
    prevTimeRef.current = null;
    accumulatorRef.current = 0;
  };
  
  // Expose reset function to global scope (for GameManager to call)
  useEffect(() => {
    // @ts-ignore - Add to window for global access
    window.resetPhysicsTiming = resetPhysicsTiming;
    
    return () => {
      // @ts-ignore - Clean up
      delete window.resetPhysicsTiming;
    };
  }, []);
  
  // Physics update with accumulator pattern for stability
  useFrame((state) => {
    if (!world.current || isPaused) return;
    
    // Get current time in seconds
    const time = state.clock.elapsedTime;
    
    // If this is the first frame or we just resumed, initialize the time
    if (prevTimeRef.current === null) {
      prevTimeRef.current = time;
      return; // Skip this frame to initialize properly
    }
    
    // If we just resumed from pause, use a minimal delta to prevent jumps
    let deltaTime;
    if (justResumedRef.current) {
      deltaTime = 1/120; // Very small fixed delta for first frame after resume
      justResumedRef.current = false;
      console.log("PhysicsWorld: First frame after resume - using minimal delta time");
    } else {
      // Calculate actual delta time
      deltaTime = time - prevTimeRef.current;
    }
    
    // Safety cap - never simulate more than 100ms in one frame (10fps)
    // This prevents spiral of death in case of very long frame times
    deltaTime = Math.min(deltaTime, 0.1);
    
    // Update previous time for next frame
    prevTimeRef.current = time;
    
    // Fixed timestep for stable physics (1/60 second)
    const fixedTimeStep = 1/60;
    
    // Add delta time to the accumulator
    accumulatorRef.current += deltaTime;
    
    // Run fixed timestep updates based on accumulated time
    let stepsTaken = 0;
    while (accumulatorRef.current >= fixedTimeStep) {
      // Execute physics step
      world.current.step(fixedTimeStep);
      
      // Subtract fixed timestep from accumulator
      accumulatorRef.current -= fixedTimeStep;
      
      // Count steps for safety
      stepsTaken++;
      
      // Safety: never take more than 4 steps at once to prevent spiral
      if (stepsTaken >= 4) {
        // Discard any remaining time if we hit the step limit
        accumulatorRef.current = 0;
        break;
      }
    }
    
    // Debug logging (occasional)
    if (Math.random() < 0.005) {
      console.log(`Physics: delta=${deltaTime.toFixed(4)}s, steps=${stepsTaken}, remaining=${accumulatorRef.current.toFixed(4)}s`);
    }
  });
  
  return <>{children}</>;
};

export default PhysicsWorld;
