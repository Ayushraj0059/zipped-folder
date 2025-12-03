import { create } from "zustand";

// Interface for the pointer lock state
interface PointerLockState {
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
}

// Create a store for pointer lock state
export const usePointerLockStore = create<PointerLockState>((set) => ({
  isLocked: false,
  setLocked: (locked: boolean) => set({ isLocked: locked }),
}));