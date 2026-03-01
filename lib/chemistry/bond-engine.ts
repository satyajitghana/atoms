import { getChemistryData, determineBondType } from "@/lib/data/chemistry-data";
import { findCompound, type Compound } from "@/lib/data/compounds";
import type { Element } from "@/lib/data/elements";

export interface ReactionResult {
  success: boolean;
  compound: Compound | null;
  message: string;
  energy: {
    exothermic: boolean;
    value: number; // absolute kJ/mol
    description: string;
  } | null;
}

/**
 * Attempt to react a set of elements and find a matching compound.
 */
export function tryReaction(elements: Element[]): ReactionResult {
  if (elements.length === 0) {
    return {
      success: false,
      compound: null,
      message: "Add some elements to the workspace first!",
      energy: null,
    };
  }

  if (elements.length === 1) {
    // Check for diatomic molecules (H2, O2, N2, F2, Cl2)
    const el = elements[0];
    const diatomic = findCompound([{ symbol: el.symbol, count: 2 }]);
    if (diatomic) {
      return {
        success: true,
        compound: diatomic,
        message: `${el.name} forms a diatomic molecule!`,
        energy: getEnergyFeedback(diatomic),
      };
    }
    return {
      success: false,
      compound: null,
      message: `${el.name} alone doesn't form a compound. Try adding another element!`,
      energy: null,
    };
  }

  // Count elements
  const counts = new Map<string, number>();
  for (const el of elements) {
    counts.set(el.symbol, (counts.get(el.symbol) || 0) + 1);
  }

  const elementCounts = Array.from(counts.entries()).map(([symbol, count]) => ({
    symbol,
    count,
  }));

  // Direct lookup
  const compound = findCompound(elementCounts);
  if (compound) {
    return {
      success: true,
      compound,
      message: `You discovered ${compound.name}!`,
      energy: getEnergyFeedback(compound),
    };
  }

  // Provide helpful hints
  const symbols = elements.map((e) => e.symbol);
  const hint = getHint(symbols);

  return {
    success: false,
    compound: null,
    message: hint,
    energy: null,
  };
}

function getEnergyFeedback(compound: Compound) {
  const value = Math.abs(compound.deltaHf);
  const exothermic = compound.deltaHf < 0;

  let description: string;
  if (compound.deltaHf === 0) {
    description = "No energy change — this is an elemental form";
  } else if (exothermic) {
    if (value > 500) description = "Extremely exothermic — releases massive energy!";
    else if (value > 200) description = "Strongly exothermic — significant heat released";
    else if (value > 50) description = "Moderately exothermic — noticeable heat release";
    else description = "Slightly exothermic — small amount of heat released";
  } else {
    if (value > 100) description = "Strongly endothermic — absorbs significant energy";
    else if (value > 30) description = "Moderately endothermic — requires energy input";
    else description = "Slightly endothermic — small energy absorption";
  }

  return { exothermic, value, description };
}

function getHint(symbols: string[]): string {
  const unique = [...new Set(symbols)];

  // Check if any element is a noble gas
  const nobleGases = ["He", "Ne", "Ar", "Kr", "Xe", "Rn"];
  const hasNoble = unique.find((s) => nobleGases.includes(s));
  if (hasNoble) {
    return `${hasNoble} is a noble gas — it rarely forms compounds. Try different elements!`;
  }

  // Check electronegativity compatibility
  if (unique.length === 2) {
    return `These elements don't form a simple compound with this ratio. Try adjusting the number of each element!`;
  }

  if (unique.length >= 3) {
    return "Complex multi-element compounds are tricky! Try simpler combinations first.";
  }

  return "These elements don't form a known compound. Keep experimenting!";
}

/**
 * Get the bond type between two elements based on electronegativity difference.
 */
export function getBondTypeBetween(el1: Element, el2: Element): "ionic" | "covalent" | "unknown" {
  const chem1 = getChemistryData(el1.number);
  const chem2 = getChemistryData(el2.number);
  if (!chem1 || !chem2) return "unknown";
  return determineBondType(chem1.electronegativity, chem2.electronegativity);
}
