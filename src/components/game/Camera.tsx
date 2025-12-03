import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePhysics } from "@/lib/stores/usePhysics";
import { useCameraStore } from "@/lib/stores/useCameraStore";

// Camera follow settings optimized for close, immersive gameplay
const CAMERA_DISTANCE = 10; // Default distance from the ball
const CAMERA_HEIGHT = 5;    // Default height above the ground
const CAMERA_LAG = 0.03;    // Smooth movement lag factor (lower is more responsive)
const ROTATION_LAG = 0.15;  // Increased rotation lag factor for faster response and quicker stop

const OrbitCamera = () => {
  // Get Three.js camera
  const { camera } = useThree();
  
  // Get player body
  const playerBody = usePhysics((state) => state.playerBody);
  
  // Get camera rotation state
  const cameraRotation = useCameraStore((state) => state.rotation);
  const targetRotation = useCameraStore((state) => state.targetRotation);
  const setRotation = useCameraStore((state) => state.setRotation);
  
  // Create refs for camera targets (for smooth movement)
  const targetPosition = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  // Set initial camera position
  useEffect(() => {
    // Position camera behind the ball (z positive = behind)
    camera.position.set(0, CAMERA_HEIGHT + 2, CAMERA_DISTANCE + 2);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Orbit camera that follows the ball with 360° rotation
  useFrame(() => {
    if (!playerBody) return;
    
    // Get player position
    const { x, y, z } = playerBody.position;
    
    // Smoothly interpolate camera rotation
    const newRotation = THREE.MathUtils.lerp(
      cameraRotation,
      targetRotation,
      ROTATION_LAG
    );
    setRotation(newRotation);
    
    // Calculate camera position based on orbit angle
    const cosAngle = Math.cos(cameraRotation);
    const sinAngle = Math.sin(cameraRotation);
    
    // Calculate the orbit position around the ball (we use + instead of - to place camera behind)
    const orbitX = x + (CAMERA_DISTANCE * sinAngle);
    const orbitZ = z + (CAMERA_DISTANCE * cosAngle);
    
    // Set target camera position with orbit calculation
    targetPosition.current.set(
      orbitX,
      y + CAMERA_HEIGHT,
      orbitZ
    );
    
    // Smooth camera movement with lag
    camera.position.lerp(targetPosition.current, 1 - CAMERA_LAG);
    
    // Always look at the ball
    currentLookAt.current.lerp(new THREE.Vector3(x, y, z), 1 - CAMERA_LAG);
    camera.lookAt(currentLookAt.current);
  });
  
  return null;
};

export default OrbitCamera;
