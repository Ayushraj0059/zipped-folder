/**
 * Global type definitions for the game
 */

// Declare global functions that are exposed via window object
interface Window {
  // Function to reset physics timing when needed
  resetPhysicsTiming?: () => void;
}