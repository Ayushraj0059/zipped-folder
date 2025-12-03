import { useRef, useEffect } from "react";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { usePhysics } from "@/lib/stores/usePhysics";

// Types for body creation function
type BodyCreationFunction = () => {
  mass: number;
  position: [number, number, number];
  shape: CANNON.Shape;
  material?: string;
  linearDamping?: number;
  angularDamping?: number;
  inertia?: CANNON.Vec3;
  type?: "Dynamic" | "Static" | "Kinematic";
};

// Types for body event handlers
type BodyEvents = {
  onCollide?: (event: { type: string; body: CANNON.Body; contact: CANNON.ContactEquation }) => void;
};

/**
 * A hook that creates and manages a CANNON.js physics body
 */
export const useCannonBody = (
  bodyCreator: BodyCreationFunction,
  events: BodyEvents = {}
) => {
  // Use a mutable ref for the body
  const bodyRef = useRef<CANNON.Body | null>(null);
  
  // Create a ref callback function instead of a direct ref
  const meshRef = useRef<(node: THREE.Object3D | null) => void>();
  meshRef.current = (node) => {
    // Update our mesh reference on node change
  };
  
  // Get the physics world from the store
  const world = usePhysics((state) => state.world);
  
  // Create and add body to the world
  useEffect(() => {
    if (!world) return;
    
    // Get body parameters
    const {
      mass,
      position,
      shape,
      material = "default",
      linearDamping = 0.1,
      angularDamping = 0.1,
      inertia,
      type = "Dynamic"
    } = bodyCreator();
    
    // Create material based on name
    let bodyMaterial;
    if (material === "ground") {
      bodyMaterial = new CANNON.Material("ground");
    } else if (material === "ball") {
      bodyMaterial = new CANNON.Material("ball");
    }
    
    // Create body with optimized params
    const body = new CANNON.Body({
      mass: type === "Static" ? 0 : mass,
      position: new CANNON.Vec3(...position),
      shape,
      material: bodyMaterial,
      type: 
        type === "Static" 
          ? CANNON.BODY_TYPES.STATIC 
          : type === "Kinematic" 
            ? CANNON.BODY_TYPES.KINEMATIC 
            : CANNON.BODY_TYPES.DYNAMIC,
      linearDamping,
      angularDamping,
    });
    
    // Set custom inertia if provided
    if (inertia) {
      body.inertia.copy(inertia);
      body.updateMassProperties();
    }
    
    // Add body to the world
    world.addBody(body);
    bodyRef.current = body;
    
    // Set up collision event listener if provided
    if (events.onCollide) {
      body.addEventListener("collide", events.onCollide);
    }
    
    console.log(`Created ${type} physics body`);
    
    // Clean up
    return () => {
      if (events.onCollide) {
        body.removeEventListener("collide", events.onCollide);
      }
      
      if (world && body) {
        world.removeBody(body);
      }
      
      bodyRef.current = null;
    };
  }, [world, bodyCreator, events]);
  
  return [meshRef, bodyRef.current] as const;
};
