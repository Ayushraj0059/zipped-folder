import { create } from "zustand";

// Create a timer reference outside of the store
let escReminderTimer: NodeJS.Timeout | null = null;

interface RapidClickState {
  // Timestamp of the last click
  lastClickTime: number;
  
  // Flag to indicate if we should show the ESC key reminder
  showEscReminder: boolean;
  
  // Function to register a click
  registerClick: () => void;
  
  // Function to reset the ESC reminder state
  resetEscReminder: () => void;
}

// Create store for tracking rapid clicks and showing ESC key reminder
export const useRapidClickStore = create<RapidClickState>((set, get) => ({
  lastClickTime: 0,
  showEscReminder: false,
  
  // Register a click and check if it was rapid
  registerClick: () => {
    const now = Date.now();
    const { lastClickTime, showEscReminder } = get();
    
    // Consider it rapid if less than 500ms between clicks
    // This threshold can be adjusted as needed
    const isRapidClick = (now - lastClickTime) < 500;
    
    if (isRapidClick && !showEscReminder) {
      // If it was a rapid click and reminder is not already showing, show the ESC reminder
      set({ showEscReminder: true });
      
      console.log("ESC reminder triggered - will auto-hide in 2.5 seconds");
      
      // Clear any existing timers to avoid race conditions
      if (escReminderTimer) {
        clearTimeout(escReminderTimer);
        escReminderTimer = null;
      }
      
      // After 2.5 seconds, hide the reminder
      escReminderTimer = setTimeout(() => {
        console.log("ESC reminder auto-hiding now");
        set({ showEscReminder: false });
        escReminderTimer = null;
      }, 2500);
    }
    
    // Update the last click time
    set({ lastClickTime: now });
  },
  
  // Reset the ESC reminder state (e.g., when game phase changes)
  resetEscReminder: () => {
    // Clear any existing timer when manually resetting
    if (escReminderTimer) {
      clearTimeout(escReminderTimer);
      escReminderTimer = null;
    }
    
    set({ showEscReminder: false, lastClickTime: 0 });
  }
}));