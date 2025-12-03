import { create } from "zustand";
import * as CANNON from "cannon-es";

interface PhysicsState {
  world: CANNON.World | null;
  playerBody: CANNON.Body | null;
  
  // Setter functions
  setWorld: (world: CANNON.World | null) => void;
  setPlayerBody: (body: CANNON.Body | null) => void;
}

export const usePhysics = create<PhysicsState>((set) => ({
  world: null,
  playerBody: null,
  
  setWorld: (world) => set({ world }),
  setPlayerBody: (body) => set({ playerBody: body }),
}));
