import { useRef, useMemo, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { BackSide } from "three";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { usePhysics } from "@/lib/stores/usePhysics";

// Updated circular platform with continuous railing boundary
const Ground = () => {
  // References
  const platformRef = useRef<THREE.Mesh>(null);
  const railingRef = useRef<THREE.Group>(null);
  const platformBodyRef = useRef<CANNON.Body | null>(null);
  const railingBodyRef = useRef<CANNON.Body | null>(null);
  
  // Get physics world
  const world = usePhysics(state => state.world);
  
  // Load textures - platform top
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure textures once
  const configuredGrassTexture = useMemo(() => {
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10); // More repeats for detailed grass
    grassTexture.minFilter = THREE.LinearMipmapLinearFilter; // Better filtering
    grassTexture.magFilter = THREE.LinearFilter; // Better close-up appearance
    grassTexture.generateMipmaps = true; // Enable mipmaps for better appearance at distance
    return grassTexture;
  }, [grassTexture]);

  // Platform dimensions
  const radius = 33; // Keep the same radius
  const platformHeight = 0.2; // Very thin platform to prevent z-fighting
  const railingHeight = 1.2; // Taller railing to prevent ball falling off
  const railingWidth = 0.15; // Width of the continuous railing
  const railingSegments = 64; // More segments for smoother railing
  
  // Set up physics with a ground plane and hollow cylinder boundary
  useEffect(() => {
    // Skip if we already have bodies or no world
    if (platformBodyRef.current || !world) return;
    
    console.log("Creating pillar fence colliders and ground plane");
    
    // Create materials
    const groundMaterial = new CANNON.Material("ground");
    const railingMaterial = new CANNON.Material("railing");
    const ballMaterial = new CANNON.Material("ball");
    
    // Create contact materials
    const ballGroundContactMaterial = new CANNON.ContactMaterial(
      ballMaterial,
      groundMaterial,
      {
        friction: 0.4,     // Good friction for rolling
        restitution: 0.1,  // Low bounce
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      }
    );
    
    const ballRailingContactMaterial = new CANNON.ContactMaterial(
      ballMaterial,
      railingMaterial,
      {
        friction: 0.1,     // Lower friction for wall
        restitution: 0.5,  // More bounce for wall hits
        contactEquationStiffness: 1e7,
        contactEquationRelaxation: 3
      }
    );
    
    // Add contact materials to world
    world.addContactMaterial(ballGroundContactMaterial);
    world.addContactMaterial(ballRailingContactMaterial);
    
    // -----------------
    // 1. GROUND COLLIDER
    // -----------------
    // Ground body - perfectly flat at y=0
    const groundBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      material: groundMaterial,
      type: CANNON.BODY_TYPES.STATIC
    });
    
    // Use a cylinder shape for perfectly circular floor
    const groundShape = new CANNON.Cylinder(
      radius,      // Top radius 
      radius,      // Bottom radius
      0.01,        // Very thin height
      32           // Segments
    );
    
    // Add to ground body
    groundBody.addShape(groundShape);
    
    // -----------------
    // 2. PILLAR COLLIDERS AROUND THE BOUNDARY
    // -----------------
    // Create evenly spaced pillar colliders around the boundary
    
    // Ball radius from Ball.tsx
    const ballRadius = 0.5;
    
    // Pillar properties
    const pillarRadius = 0.3;
    const pillarColliderHeight = 3.6; // Taller invisible collider (3x the visual height) as requested
    const pillarVisualHeight = railingHeight; // Original visual height for pillars
    const spacing = ballRadius * 2.5; // Space between pillars (slightly larger than ball diameter)
    
    // Calculate circumference and number of pillars needed
    const circumference = 2 * Math.PI * radius;
    const totalPillars = Math.floor(circumference / spacing);
    const angleStep = (Math.PI * 2) / totalPillars;
    
    console.log(`Creating ${totalPillars} pillar colliders around the boundary`);
    
    // Create pillars around the perimeter
    const pillarBodies = [];
    for (let i = 0; i < totalPillars; i++) {
      const angle = i * angleStep;
      
      // Calculate position on the circumference
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Create a pillar body
      // Position is set higher since the collider is taller
      const pillarBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x, pillarColliderHeight / 2, z),
        material: railingMaterial,
        type: CANNON.BODY_TYPES.STATIC
      });
      
      // Create a cylinder shape for the pillar with increased height
      const pillarShape = new CANNON.Cylinder(
        pillarRadius,        // Top radius
        pillarRadius,        // Bottom radius
        pillarColliderHeight, // Taller height for better containment
        8                    // Segments
      );
      
      // Add shape to body
      pillarBody.addShape(pillarShape);
      
      // Add body to world
      world.addBody(pillarBody);
      
      // Store for reference
      pillarBodies.push(pillarBody);
    }
    
    // Store reference to first pillar for debugging
    if (pillarBodies.length > 0) {
      railingBodyRef.current = pillarBodies[0];
    }
    
    console.log("Pillar colliders and ground plane created as requested");
    
    // Add ground body to world
    world.addBody(groundBody);
    
    // Store reference to ground
    platformBodyRef.current = groundBody;
    
    console.log("New collider system created with pillar boundary fence");
  }, [world, radius]);
  
  // Define pillar materials
  const pillarMaterials = useMemo(() => {
    return {
      base: new THREE.MeshStandardMaterial({ 
        color: "#4488ff", // Blue base
        roughness: 0.6,
        metalness: 0.1
      }),
      middle: new THREE.MeshStandardMaterial({ 
        color: "#ffffff", // White middle
        roughness: 0.7,
        metalness: 0.1
      }),
      top: new THREE.MeshStandardMaterial({ 
        color: "#ff5555", // Red top
        roughness: 0.6,
        metalness: 0.1
      })
    };
  }, []);
  
  // Create pillars around the boundary
  const pillarElements = useMemo(() => {
    const elements = [];
    
    // Ball radius from Ball.tsx
    const ballRadius = 0.5;
    
    // Pillar properties
    const pillarRadius = 0.3;
    const pillarHeight = railingHeight;
    const spacing = ballRadius * 2.5; // Space between pillars (slightly larger than ball diameter)
    
    // Calculate circumference and number of pillars needed
    const circumference = 2 * Math.PI * radius;
    const totalPillars = Math.floor(circumference / spacing);
    const angleStep = (Math.PI * 2) / totalPillars;
    
    // Create pillars around the perimeter
    for (let i = 0; i < totalPillars; i++) {
      const angle = i * angleStep;
      
      // Calculate position on the circumference
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Base section (blue)
      elements.push(
        <mesh
          key={`pillar-base-${i}`}
          position={[x, pillarHeight * 0.16, z]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry 
            args={[
              pillarRadius,
              pillarRadius * 1.2,
              pillarHeight * 0.32,
              12,
              1
            ]}
          />
          <primitive object={pillarMaterials.base} attach="material" />
        </mesh>
      );
      
      // Middle section (white)
      elements.push(
        <mesh
          key={`pillar-middle-${i}`}
          position={[x, pillarHeight * 0.5, z]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry 
            args={[
              pillarRadius * 0.9,
              pillarRadius * 0.9,
              pillarHeight * 0.36,
              12,
              1
            ]}
          />
          <primitive object={pillarMaterials.middle} attach="material" />
        </mesh>
      );
      
      // Top section (red)
      elements.push(
        <mesh
          key={`pillar-top-${i}`}
          position={[x, pillarHeight * 0.84, z]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry 
            args={[
              pillarRadius * 1.2,
              pillarRadius * 0.9,
              pillarHeight * 0.32,
              12,
              1
            ]}
          />
          <primitive object={pillarMaterials.top} attach="material" />
        </mesh>
      );
    }
    
    return elements;
  }, [radius, railingHeight, pillarMaterials]);
  
  // Create a custom sky sphere with the cloudy texture
  const cloudySkyTexture = useTexture("/skyboxes/cloudy_sky.png");
  
  // Configure texture once loaded
  useMemo(() => {
    if (cloudySkyTexture) {
      cloudySkyTexture.mapping = THREE.EquirectangularReflectionMapping;
      // Modern Three.js uses colorSpace instead of encoding
      cloudySkyTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [cloudySkyTexture]);

  return (
    <>
      {/* Custom Skybox using a sphere with equirectangular texture */}
      <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI/2, 0]}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial map={cloudySkyTexture} side={BackSide} />
      </mesh>
      
      {/* Add directional light to simulate sun from skybox image */}
      <directionalLight 
        position={[1, 2, 0.5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Platform group */}
      <group position={[0, 0, 0]}>
        {/* Main circular platform */}
        <mesh 
          ref={platformRef} 
          receiveShadow 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
        >
          <circleGeometry args={[radius, 64]} />
          <meshStandardMaterial 
            map={configuredGrassTexture} 
            color="#78b855" // Brighter green that matches the image
            roughness={0.9}
          />
        </mesh>
        
        {/* Simple platform edge */}
        <mesh position={[0, -platformHeight/2, 0]}>
          <cylinderGeometry 
            args={[radius, radius, platformHeight, 64, 1, true]}
          />
          <meshStandardMaterial 
            color="#658f4a" 
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Pillar group */}
        <group ref={railingRef}>
          {pillarElements}
        </group>
      </group>
    </>
  );
};

export default Ground;
