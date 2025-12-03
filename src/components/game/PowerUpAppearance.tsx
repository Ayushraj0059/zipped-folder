import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PowerUpAppearanceProps {
  radius: number;
  position: THREE.Vector3;
}

/**
 * Enhanced PowerUp appearance component
 * Creates a blue orb with animated orbital rings around it
 */
const PowerUpAppearance: React.FC<PowerUpAppearanceProps> = ({ radius, position }) => {
  // References for the orbital rings
  const outerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Create materials for different parts
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0088ff), // Bright blue
    emissive: new THREE.Color(0x0066cc), // Slightly darker blue for glow
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.95,
  });

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xaaf5ff), // Light cyan/blue
    emissive: new THREE.Color(0x88eeff), // Similar lighter color for glow
    emissiveIntensity: 0.9,
    metalness: 0.6,
    roughness: 0.3,
    transparent: true,
    opacity: 0.7,
  });

  // Animate the rings
  useFrame((state, delta) => {
    if (outerRingRef.current && middleRingRef.current && innerRingRef.current && coreRef.current) {
      // Rotate rings at different speeds
      outerRingRef.current.rotation.x += delta * 0.7;
      outerRingRef.current.rotation.y += delta * 0.5;
      
      middleRingRef.current.rotation.x += delta * 0.4;
      middleRingRef.current.rotation.z += delta * 0.6;
      
      innerRingRef.current.rotation.y += delta * 0.5;
      innerRingRef.current.rotation.z += delta * 0.3;
      
      // Pulse the core slightly
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      coreRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Core (central sphere) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius * 0.6, 24, 24]} />
        <primitive object={coreMaterial} attach="material" />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.9, radius * 0.05, 16, 48]} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>

      {/* Middle ring */}
      <mesh ref={middleRingRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[radius * 1.1, radius * 0.05, 16, 48]} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>

      {/* Outer ring */}
      <mesh ref={outerRingRef} rotation={[0, Math.PI / 3, Math.PI / 3]}>
        <torusGeometry args={[radius * 1.3, radius * 0.05, 16, 48]} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={1.5} 
        distance={5} 
        color="#66ccff" 
      />
    </group>
  );
};

export default PowerUpAppearance;