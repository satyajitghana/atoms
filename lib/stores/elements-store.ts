import { create } from "zustand";
import type { Element } from "@/lib/data/elements";

interface ElementsState {
  selectedElement: Element | null;
  selectedOrbitalIdx: number;
  particleCount: number;
  pointSize: number;

  // Actions
  setSelectedElement: (el: Element) => void;
  clearSelection: () => void;
  setSelectedOrbitalIdx: (idx: number) => void;
  setParticleCount: (count: number) => void;
  setPointSize: (size: number) => void;
}

export const useElementsStore = create<ElementsState>((set) => ({
  selectedElement: null,
  selectedOrbitalIdx: 0,
  particleCount: 100000,
  pointSize: 0.08,

  setSelectedElement: (el) => set({ selectedElement: el, selectedOrbitalIdx: 0 }),
  clearSelection: () => set({ selectedElement: null, selectedOrbitalIdx: 0 }),
  setSelectedOrbitalIdx: (selectedOrbitalIdx) => set({ selectedOrbitalIdx }),
  setParticleCount: (particleCount) => set({ particleCount }),
  setPointSize: (pointSize) => set({ pointSize }),
}));
