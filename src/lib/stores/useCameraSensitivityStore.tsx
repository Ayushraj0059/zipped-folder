import { create } from "zustand";

// Local storage key for camera sensitivity settings
const CAMERA_SENSITIVITY_KEY = "game_camera_sensitivity";
const MOUSE_SENSITIVITY_DEFAULT = 0.005;
const TOUCH_SENSITIVITY_DEFAULT = 0.008;

// Helper function to get initial sensitivity from localStorage
const getInitialSensitivity = (): { mouse: number; touch: number } => {
  try {
    const storedValue = localStorage.getItem(CAMERA_SENSITIVITY_KEY);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (error) {
    // In case of any localStorage access issues, use defaults
    console.error("Error accessing localStorage for camera sensitivity settings:", error);
  }
  
  // Default values if nothing stored or error
  return {
    mouse: MOUSE_SENSITIVITY_DEFAULT,
    touch: TOUCH_SENSITIVITY_DEFAULT
  };
};

// Helper function to save sensitivity to localStorage
const saveSensitivity = (sensitivity: { mouse: number; touch: number }): void => {
  try {
    localStorage.setItem(CAMERA_SENSITIVITY_KEY, JSON.stringify(sensitivity));
    console.log(`Camera sensitivity saved to localStorage: mouse=${sensitivity.mouse}, touch=${sensitivity.touch}`);
  } catch (error) {
    console.error("Error saving camera sensitivity to localStorage:", error);
  }
};

// Interface for camera sensitivity state
interface CameraSensitivityState {
  // Sensitivity values for mouse and touch
  mouseSensitivity: number;
  touchSensitivity: number;
  
  // Function to update sensitivity
  setSensitivity: (value: number) => void;
  
  // Reset to defaults
  resetToDefaults: () => void;
}

// Get initial values
const initialValues = getInitialSensitivity();

// Create the camera sensitivity state store
export const useCameraSensitivityStore = create<CameraSensitivityState>((set) => ({
  mouseSensitivity: initialValues.mouse,
  touchSensitivity: initialValues.touch,
  
  // Update both sensitivities with appropriate scaling
  setSensitivity: (value: number) => {
    // Update the sensitivity values
    // We keep the same ratio between mouse and touch sensitivity
    const touchToMouseRatio = TOUCH_SENSITIVITY_DEFAULT / MOUSE_SENSITIVITY_DEFAULT;
    const newMouseSensitivity = value;
    const newTouchSensitivity = value * touchToMouseRatio;
    
    // Save to localStorage
    saveSensitivity({
      mouse: newMouseSensitivity,
      touch: newTouchSensitivity
    });
    
    // Update the store
    set({
      mouseSensitivity: newMouseSensitivity,
      touchSensitivity: newTouchSensitivity
    });
  },
  
  // Reset to default values
  resetToDefaults: () => {
    // Reset to defaults
    const defaults = {
      mouse: MOUSE_SENSITIVITY_DEFAULT,
      touch: TOUCH_SENSITIVITY_DEFAULT
    };
    
    // Save to localStorage
    saveSensitivity(defaults);
    
    // Update the store
    set({
      mouseSensitivity: defaults.mouse,
      touchSensitivity: defaults.touch
    });
  }
}));

// Export default sensitivity values for reference
export const DEFAULT_SENSITIVITIES = {
  MOUSE: MOUSE_SENSITIVITY_DEFAULT,
  TOUCH: TOUCH_SENSITIVITY_DEFAULT
};