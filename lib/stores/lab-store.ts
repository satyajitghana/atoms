import { create } from "zustand";
import type { Element } from "@/lib/data/elements";
import type { Compound } from "@/lib/data/compounds";
import { COMPOUNDS } from "@/lib/data/compounds";
import { tryReaction, type ReactionResult } from "@/lib/chemistry/bond-engine";

interface LabState {
  workspace: Element[];
  discoveredCompounds: string[];
  selectedCompound: Compound | null;
  lastResult: ReactionResult | null;

  addElement: (el: Element) => void;
  removeElement: (idx: number) => void;
  clearWorkspace: () => void;
  react: () => ReactionResult;
  selectCompound: (compound: Compound | null) => void;
  clearResult: () => void;
}

function loadDiscovered(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("atoms-discovered-compounds");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveDiscovered(formulas: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("atoms-discovered-compounds", JSON.stringify(formulas));
  } catch {
    // Ignore storage errors
  }
}

export const useLabStore = create<LabState>((set, get) => ({
  workspace: [],
  discoveredCompounds: loadDiscovered(),
  selectedCompound: null,
  lastResult: null,

  addElement: (el) =>
    set((s) => ({
      workspace: s.workspace.length < 8 ? [...s.workspace, el] : s.workspace,
      lastResult: null,
    })),

  removeElement: (idx) =>
    set((s) => ({
      workspace: s.workspace.filter((_, i) => i !== idx),
      lastResult: null,
    })),

  clearWorkspace: () => set({ workspace: [], lastResult: null }),

  react: () => {
    const { workspace, discoveredCompounds } = get();
    const result = tryReaction(workspace);

    if (result.success && result.compound) {
      const formula = result.compound.formula;
      if (!discoveredCompounds.includes(formula)) {
        const updated = [...discoveredCompounds, formula];
        saveDiscovered(updated);
        set({
          lastResult: result,
          selectedCompound: result.compound,
          discoveredCompounds: updated,
        });
      } else {
        set({ lastResult: result, selectedCompound: result.compound });
      }
    } else {
      set({ lastResult: result });
    }

    return result;
  },

  selectCompound: (compound) => set({ selectedCompound: compound }),
  clearResult: () => set({ lastResult: null }),
}));

export const TOTAL_COMPOUNDS = COMPOUNDS.length;
