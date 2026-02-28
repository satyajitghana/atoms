// Electronegativity (Pauling scale), common oxidation states, and valence electrons
// for elements commonly used in compound formation

export interface ChemistryProperties {
  electronegativity: number;
  oxidationStates: number[];
  valenceElectrons: number;
}

// Indexed by atomic number
export const CHEMISTRY_DATA: Record<number, ChemistryProperties> = {
  1:  { electronegativity: 2.20, oxidationStates: [1, -1], valenceElectrons: 1 },
  2:  { electronegativity: 0, oxidationStates: [0], valenceElectrons: 2 },
  3:  { electronegativity: 0.98, oxidationStates: [1], valenceElectrons: 1 },
  4:  { electronegativity: 1.57, oxidationStates: [2], valenceElectrons: 2 },
  5:  { electronegativity: 2.04, oxidationStates: [3], valenceElectrons: 3 },
  6:  { electronegativity: 2.55, oxidationStates: [-4, 4, 2], valenceElectrons: 4 },
  7:  { electronegativity: 3.04, oxidationStates: [-3, 3, 5], valenceElectrons: 5 },
  8:  { electronegativity: 3.44, oxidationStates: [-2], valenceElectrons: 6 },
  9:  { electronegativity: 3.98, oxidationStates: [-1], valenceElectrons: 7 },
  10: { electronegativity: 0, oxidationStates: [0], valenceElectrons: 8 },
  11: { electronegativity: 0.93, oxidationStates: [1], valenceElectrons: 1 },
  12: { electronegativity: 1.31, oxidationStates: [2], valenceElectrons: 2 },
  13: { electronegativity: 1.61, oxidationStates: [3], valenceElectrons: 3 },
  14: { electronegativity: 1.90, oxidationStates: [-4, 4], valenceElectrons: 4 },
  15: { electronegativity: 2.19, oxidationStates: [-3, 3, 5], valenceElectrons: 5 },
  16: { electronegativity: 2.58, oxidationStates: [-2, 4, 6], valenceElectrons: 6 },
  17: { electronegativity: 3.16, oxidationStates: [-1, 1, 3, 5, 7], valenceElectrons: 7 },
  18: { electronegativity: 0, oxidationStates: [0], valenceElectrons: 8 },
  19: { electronegativity: 0.82, oxidationStates: [1], valenceElectrons: 1 },
  20: { electronegativity: 1.00, oxidationStates: [2], valenceElectrons: 2 },
  24: { electronegativity: 1.66, oxidationStates: [2, 3, 6], valenceElectrons: 1 },
  25: { electronegativity: 1.55, oxidationStates: [2, 4, 7], valenceElectrons: 2 },
  26: { electronegativity: 1.83, oxidationStates: [2, 3], valenceElectrons: 2 },
  27: { electronegativity: 1.88, oxidationStates: [2, 3], valenceElectrons: 2 },
  28: { electronegativity: 1.91, oxidationStates: [2], valenceElectrons: 2 },
  29: { electronegativity: 1.90, oxidationStates: [1, 2], valenceElectrons: 1 },
  30: { electronegativity: 1.65, oxidationStates: [2], valenceElectrons: 2 },
  35: { electronegativity: 2.96, oxidationStates: [-1, 1, 3, 5], valenceElectrons: 7 },
  47: { electronegativity: 1.93, oxidationStates: [1], valenceElectrons: 1 },
  53: { electronegativity: 2.66, oxidationStates: [-1, 1, 5, 7], valenceElectrons: 7 },
  56: { electronegativity: 0.89, oxidationStates: [2], valenceElectrons: 2 },
};

export function getChemistryData(atomicNumber: number): ChemistryProperties | null {
  return CHEMISTRY_DATA[atomicNumber] ?? null;
}

export function determineBondType(
  en1: number,
  en2: number
): "ionic" | "covalent" {
  const diff = Math.abs(en1 - en2);
  return diff > 1.8 ? "ionic" : "covalent";
}
