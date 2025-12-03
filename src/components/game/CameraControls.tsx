import { useEffect, useRef, useCallback, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useCameraStore } from "@/lib/stores/useCameraStore";
import { useCameraRotationState } from "@/lib/stores/useCameraRotationState";
import { useGame } from "@/lib/stores/useGame";
import { useControls } from "@/lib/stores/useControls";
import { usePointerLockStore } from "@/lib/stores/usePointerLockStore";
import { useRapidClickStore } from "@/lib/stores/useRapidClickStore";
import { useCameraSensitivityStore } from "@/lib/stores/useCameraSensitivityStore";

/**
 * Component to handle camera rotation with mouse on desktop
 * Implements pointer lock for immersive control
 */
const CameraControls = () => {
  
  // Get Three.js canvas element for capturing events
  const { gl } = useThree();
  
  // Get camera rotation functions from store
  const rotateCamera = useCameraStore((state) => state.rotateCamera);
  
  // Get sensitivity from our sensitivity store
  const mouseSensitivity = useCameraSensitivityStore((state) => state.mouseSensitivity);
  
  // Get camera rotation state
  const {
    isRotating,
    lastPosition,
    setRotating,
    setLastPosition,
    isPointerLocked,
    setPointerLocked
  } = useCameraRotationState();
  
  // Get game phase and input state
  const phase = useGame(state => state.phase);
  const isInputEnabled = useControls(state => state.isInputEnabled);
  
  // Check if we should process input
  const shouldProcessInput = phase === "playing" && isInputEnabled;
  
  // Get and set pointer lock state from the store
  const setPointerLock = usePointerLockStore((state) => state.setLocked);
  
  // Get rapid click tracking functions from store
  const registerClick = useRapidClickStore((state) => state.registerClick);
  
  // Track if we're currently in the process of requesting pointer lock
  const isRequestingLock = useRef(false);
  
  // Function to request pointer lock on the canvas with debounce protection
  const requestPointerLock = useCallback(() => {
    // If already requesting pointer lock or already locked, don't try again
    if (isRequestingLock.current || document.pointerLockElement === gl.domElement || !shouldProcessInput) {
      return;
    }
    
    try {
      // Set flag that we're requesting lock
      isRequestingLock.current = true;
      
      // Request pointer lock
      const promise = gl.domElement.requestPointerLock();
      
      // Handle promise if supported (modern browsers)
      if (promise) {
        promise
          .then(() => {
            // Lock successful
            console.log("Pointer lock request successful");
          })
          .catch((error) => {
            // Lock failed but no need to throw error to console
            console.log("Pointer lock request failed silently");
          })
          .finally(() => {
            // Clear the requesting flag after a short delay regardless of outcome
            setTimeout(() => {
              isRequestingLock.current = false;
            }, 300);
          });
      } else {
        // For browsers that don't return a promise for requestPointerLock
        // Clear the requesting flag after a short delay
        setTimeout(() => {
          isRequestingLock.current = false;
        }, 300);
      }
    } catch (error) {
      // Clear the flag in case of any other errors
      isRequestingLock.current = false;
    }
  }, [gl.domElement, shouldProcessInput]);
  
  // Handle click on canvas to request pointer lock
  const handleCanvasClick = useCallback(() => {
    // Check if pointer is already locked
    const isLocked = document.pointerLockElement === gl.domElement;
    
    if (isLocked) {
      // If already locked, register the click for rapid click detection
      registerClick();
    } else {
      // If not locked, request pointer lock
      requestPointerLock();
    }
  }, [requestPointerLock, gl.domElement, registerClick]);
  
  // Set up pointer lock event handlers
  useEffect(() => {
    if (false) return;
    
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === gl.domElement;
      setPointerLocked(isLocked);
      setPointerLock(isLocked);
      
      if (isLocked) {
        console.log("Pointer locked - Camera control enabled");
      } else {
        console.log("Pointer unlocked - Camera control disabled");
        setRotating(false);
      }
    };
    
    const handlePointerLockError = (event: Event) => {
      // Handle error silently, don't show error in console
      console.log("Pointer lock request failed - this is normal if user declines or clicks rapidly");
      
      // Update state to reflect unlocked state
      setPointerLocked(false);
      setPointerLock(false);
      
      // Clear the requesting flag in case it's still set
      isRequestingLock.current = false;
      
      // Prevent the event from propagating
      event.preventDefault();
    };
    
    // Add event listeners for pointer lock
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    gl.domElement.addEventListener('click', handleCanvasClick);
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      gl.domElement.removeEventListener('click', handleCanvasClick);
    };
  }, [
    false,
    shouldProcessInput,
    gl.domElement,
    setPointerLocked,
    setPointerLock,
    setRotating,
    handleCanvasClick
  ]);
  
  // Set up mouse event handlers for desktop with pointer lock
  useEffect(() => {
    if (false) return;
    
    // Handle mouse move event with pointer lock
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked) return;
      
      // When pointer is locked, movementX/Y give relative movement
      const deltaX = e.movementX;
      
      if (Math.abs(deltaX) > 0) {
        // Apply rotation based on mouse movement with user-configurable sensitivity
        rotateCamera(-deltaX * mouseSensitivity); // Negative for natural feeling
      }
    };
    
    // Handle ESC key to exit pointer lock
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPointerLocked) {
        // ESC is handled by the browser to exit pointer lock
        // We don't need to manually call document.exitPointerLock()
      }
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    
    console.log("Desktop camera controls initialized with pointer lock - Click to enable camera control");
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    false,
    shouldProcessInput,
    isPointerLocked,
    rotateCamera
  ]);
  
  // Add effect to automatically exit pointer lock when the game ends
  useEffect(() => {
    // Check if game has ended and pointer is locked
    if (phase === "ended" && document.pointerLockElement === gl.domElement) {
      console.log("Game ended - Automatically exiting pointer lock");
      document.exitPointerLock();
    }
  }, [phase, gl.domElement]);
  
  // No visible content needs to be rendered
  return null;
};

export default CameraControls;