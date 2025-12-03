import { create } from "zustand";

// Interface for camera rotation input state
interface CameraRotationState {
  // Flag indicating active dragging for camera rotation
  isRotating: boolean;
  
  // Last pointer position for calculating delta
  lastPosition: { x: number, y: number };
  
  // Flag to track if pointer is locked (desktop mode)
  isPointerLocked: boolean;
  
  // Functions to update state
  setRotating: (isRotating: boolean) => void;
  setLastPosition: (x: number, y: number) => void;
  setPointerLocked: (locked: boolean) => void;
  
  // Reset function
  reset: () => void;
}

// Create the camera rotation state store
export const useCameraRotationState = create<CameraRotationState>((set) => ({
  isRotating: false,
  lastPosition: { x: 0, y: 0 },
  isPointerLocked: false,
  
  setRotating: (isRotating) => set({ isRotating }),
  
  setLastPosition: (x, y) => set({ lastPosition: { x, y } }),
  
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),
  
  reset: () => set({ 
    isRotating: false, 
    lastPosition: { x: 0, y: 0 },
    isPointerLocked: false
  }),
}));