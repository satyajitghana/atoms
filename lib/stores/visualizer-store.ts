import { create } from "zustand";
import { constrainQuantumNumbers } from "@/lib/chemistry/electron-config";
import type { EngineType } from "@/lib/wasm/orbital-engine";

interface VisualizerState {
  // Quantum numbers
  n: number;
  l: number;
  m: number;
  // Rendering
  particleCount: number;
  pointSize: number;
  // Engine
  engineType: EngineType;
  // View
  autoRotate: boolean;

  // Actions
  setN: (n: number) => void;
  setL: (l: number) => void;
  setM: (m: number) => void;
  setQuantumNumbers: (n: number, l: number, m: number) => void;
  setParticleCount: (count: number) => void;
  setPointSize: (size: number) => void;
  setEngineType: (type: EngineType) => void;
  toggleAutoRotate: () => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  n: 2,
  l: 1,
  m: 0,
  particleCount: 100000,
  pointSize: 0.08,
  engineType: "js",
  autoRotate: true,

  setN: (newN) => {
    const { l, m } = get();
    const constrained = constrainQuantumNumbers(newN, l, m);
    set({ n: constrained.n, l: constrained.l, m: constrained.m });
  },

  setL: (newL) => {
    const { n, m } = get();
    const constrained = constrainQuantumNumbers(n, newL, m);
    set({ l: constrained.l, m: constrained.m });
  },

  setM: (newM) => set({ m: newM }),

  setQuantumNumbers: (n, l, m) => {
    const constrained = constrainQuantumNumbers(n, l, m);
    set({ n: constrained.n, l: constrained.l, m: constrained.m });
  },

  setParticleCount: (particleCount) => set({ particleCount }),
  setPointSize: (pointSize) => set({ pointSize }),
  setEngineType: (engineType) => set({ engineType }),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
}));
