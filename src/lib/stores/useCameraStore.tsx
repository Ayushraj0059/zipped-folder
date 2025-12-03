import { create } from "zustand";
import * as THREE from "three";

// Interface for camera state
interface CameraState {
  // Current rotation around the Y axis (horizontal rotation)
  rotation: number;
  
  // Target rotation for smooth interpolation
  targetRotation: number;
  
  // Rotation speed for smooth movements
  rotationSpeed: number;
  
  // Function to set the camera rotation directly
  setRotation: (rotation: number) => void;
  
  // Function to update the target rotation (for smooth rotation)
  setTargetRotation: (rotation: number) => void;
  
  // Function to get a direction vector relative to camera rotation
  getDirectionFromInput: (inputX: number, inputZ: number) => THREE.Vector3;
  
  // Function to rotate the camera
  rotateCamera: (amount: number) => void;
  
  // Reset camera rotation
  resetRotation: () => void;
}

// Create the camera state store
export const useCameraStore = create<CameraState>((set, get) => ({
  rotation: 0,
  targetRotation: 0,
  rotationSpeed: 0.1, // Adjust for faster/slower rotation
  
  setRotation: (rotation) => set({ rotation }),
  
  setTargetRotation: (targetRotation) => set({ targetRotation }),
  
  // Function to get world-space direction from input based on camera rotation
  getDirectionFromInput: (inputX, inputZ) => {
    const state = get();
    
    // Current camera rotation around Y axis
    const cameraAngle = state.rotation;
    
    // Create a direction vector
    const direction = new THREE.Vector3();
    
    // Calculate trigonometric components for rotation
    const cosAngle = Math.cos(cameraAngle);
    const sinAngle = Math.sin(cameraAngle);
    
    // Rotate the input direction correctly for camera angle
    // Forward should be in the direction the camera is looking
    // Using a positive sign for inputZ to fix the inverted forward/backward issue
    direction.x = inputZ * sinAngle + inputX * cosAngle;
    direction.z = inputZ * cosAngle - inputX * sinAngle;
    
    // Ensure the direction is normalized
    if (direction.lengthSq() > 0) {
      direction.normalize();
    }
    
    return direction;
  },
  
  // Rotate camera by a specific amount
  rotateCamera: (amount) => {
    const state = get();
    
    // Update target rotation
    const newTargetRotation = state.targetRotation + amount;
    
    // Set new target rotation
    set({ targetRotation: newTargetRotation });
  },
  
  // Reset camera rotation to initial state
  resetRotation: () => set({ rotation: 0, targetRotation: 0 }),
}));