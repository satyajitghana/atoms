// Molecular geometries and bond lengths for compound visualization

export type MolecularShape =
  | "linear"
  | "bent"
  | "trigonal-planar"
  | "tetrahedral"
  | "trigonal-pyramidal"
  | "octahedral"
  | "single-atom";

export interface AtomPosition {
  symbol: string;
  position: [number, number, number]; // relative coordinates
}

export interface MoleculeGeometry {
  shape: MolecularShape;
  atoms: AtomPosition[];
  bonds: [number, number][]; // pairs of atom indices
  bondLength: number; // in visualization units
}

// Default bond length (Angstroms)
const BL = 3.0;

// Pre-defined geometries for common compounds
const GEOMETRIES: Record<string, MoleculeGeometry> = {
  // Diatomic
  H2: { shape: "linear", atoms: [{ symbol: "H", position: [-BL / 2, 0, 0] }, { symbol: "H", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  O2: { shape: "linear", atoms: [{ symbol: "O", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  N2: { shape: "linear", atoms: [{ symbol: "N", position: [-BL / 2, 0, 0] }, { symbol: "N", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  F2: { shape: "linear", atoms: [{ symbol: "F", position: [-BL / 2, 0, 0] }, { symbol: "F", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  Cl2: { shape: "linear", atoms: [{ symbol: "Cl", position: [-BL / 2, 0, 0] }, { symbol: "Cl", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  Br2: { shape: "linear", atoms: [{ symbol: "Br", position: [-BL / 2, 0, 0] }, { symbol: "Br", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  I2: { shape: "linear", atoms: [{ symbol: "I", position: [-BL / 2, 0, 0] }, { symbol: "I", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  HF: { shape: "linear", atoms: [{ symbol: "H", position: [-BL / 2, 0, 0] }, { symbol: "F", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  HCl: { shape: "linear", atoms: [{ symbol: "H", position: [-BL / 2, 0, 0] }, { symbol: "Cl", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  HBr: { shape: "linear", atoms: [{ symbol: "H", position: [-BL / 2, 0, 0] }, { symbol: "Br", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  HI: { shape: "linear", atoms: [{ symbol: "H", position: [-BL / 2, 0, 0] }, { symbol: "I", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  CO: { shape: "linear", atoms: [{ symbol: "C", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  NO: { shape: "linear", atoms: [{ symbol: "N", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },

  // Ionic (linear)
  NaCl: { shape: "linear", atoms: [{ symbol: "Na", position: [-BL / 2, 0, 0] }, { symbol: "Cl", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  NaF: { shape: "linear", atoms: [{ symbol: "Na", position: [-BL / 2, 0, 0] }, { symbol: "F", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  LiF: { shape: "linear", atoms: [{ symbol: "Li", position: [-BL / 2, 0, 0] }, { symbol: "F", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  KCl: { shape: "linear", atoms: [{ symbol: "K", position: [-BL / 2, 0, 0] }, { symbol: "Cl", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  NaH: { shape: "linear", atoms: [{ symbol: "Na", position: [-BL / 2, 0, 0] }, { symbol: "H", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  CuO: { shape: "linear", atoms: [{ symbol: "Cu", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  ZnO: { shape: "linear", atoms: [{ symbol: "Zn", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  MgO: { shape: "linear", atoms: [{ symbol: "Mg", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  CaO: { shape: "linear", atoms: [{ symbol: "Ca", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  BaO: { shape: "linear", atoms: [{ symbol: "Ba", position: [-BL / 2, 0, 0] }, { symbol: "O", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
  AgCl: { shape: "linear", atoms: [{ symbol: "Ag", position: [-BL / 2, 0, 0] }, { symbol: "Cl", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },

  // Bent
  H2O: { shape: "bent", atoms: [{ symbol: "O", position: [0, 0, 0] }, { symbol: "H", position: [-BL * 0.78, -BL * 0.62, 0] }, { symbol: "H", position: [BL * 0.78, -BL * 0.62, 0] }], bonds: [[0, 1], [0, 2]], bondLength: BL },
  H2S: { shape: "bent", atoms: [{ symbol: "S", position: [0, 0, 0] }, { symbol: "H", position: [-BL * 0.73, -BL * 0.68, 0] }, { symbol: "H", position: [BL * 0.73, -BL * 0.68, 0] }], bonds: [[0, 1], [0, 2]], bondLength: BL },
  SO2: { shape: "bent", atoms: [{ symbol: "S", position: [0, 0, 0] }, { symbol: "O", position: [-BL * 0.87, -BL * 0.5, 0] }, { symbol: "O", position: [BL * 0.87, -BL * 0.5, 0] }], bonds: [[0, 1], [0, 2]], bondLength: BL },
  NO2: { shape: "bent", atoms: [{ symbol: "N", position: [0, 0, 0] }, { symbol: "O", position: [-BL * 0.82, -BL * 0.57, 0] }, { symbol: "O", position: [BL * 0.82, -BL * 0.57, 0] }], bonds: [[0, 1], [0, 2]], bondLength: BL },

  // Linear triatomic
  CO2: { shape: "linear", atoms: [{ symbol: "O", position: [-BL, 0, 0] }, { symbol: "C", position: [0, 0, 0] }, { symbol: "O", position: [BL, 0, 0] }], bonds: [[0, 1], [1, 2]], bondLength: BL },
  N2O: { shape: "linear", atoms: [{ symbol: "N", position: [-BL, 0, 0] }, { symbol: "N", position: [0, 0, 0] }, { symbol: "O", position: [BL, 0, 0] }], bonds: [[0, 1], [1, 2]], bondLength: BL },
  CS2: { shape: "linear", atoms: [{ symbol: "S", position: [-BL, 0, 0] }, { symbol: "C", position: [0, 0, 0] }, { symbol: "S", position: [BL, 0, 0] }], bonds: [[0, 1], [1, 2]], bondLength: BL },
  SiO2: { shape: "linear", atoms: [{ symbol: "O", position: [-BL, 0, 0] }, { symbol: "Si", position: [0, 0, 0] }, { symbol: "O", position: [BL, 0, 0] }], bonds: [[0, 1], [1, 2]], bondLength: BL },

  // Trigonal planar
  SO3: { shape: "trigonal-planar", atoms: [{ symbol: "S", position: [0, 0, 0] }, { symbol: "O", position: [0, BL, 0] }, { symbol: "O", position: [-BL * 0.87, -BL * 0.5, 0] }, { symbol: "O", position: [BL * 0.87, -BL * 0.5, 0] }], bonds: [[0, 1], [0, 2], [0, 3]], bondLength: BL },
  BF3: { shape: "trigonal-planar", atoms: [{ symbol: "B", position: [0, 0, 0] }, { symbol: "F", position: [0, BL, 0] }, { symbol: "F", position: [-BL * 0.87, -BL * 0.5, 0] }, { symbol: "F", position: [BL * 0.87, -BL * 0.5, 0] }], bonds: [[0, 1], [0, 2], [0, 3]], bondLength: BL },

  // Trigonal pyramidal
  NH3: { shape: "trigonal-pyramidal", atoms: [{ symbol: "N", position: [0, BL * 0.4, 0] }, { symbol: "H", position: [0, -BL * 0.3, BL * 0.8] }, { symbol: "H", position: [-BL * 0.69, -BL * 0.3, -BL * 0.4] }, { symbol: "H", position: [BL * 0.69, -BL * 0.3, -BL * 0.4] }], bonds: [[0, 1], [0, 2], [0, 3]], bondLength: BL },
  PH3: { shape: "trigonal-pyramidal", atoms: [{ symbol: "P", position: [0, BL * 0.4, 0] }, { symbol: "H", position: [0, -BL * 0.3, BL * 0.8] }, { symbol: "H", position: [-BL * 0.69, -BL * 0.3, -BL * 0.4] }, { symbol: "H", position: [BL * 0.69, -BL * 0.3, -BL * 0.4] }], bonds: [[0, 1], [0, 2], [0, 3]], bondLength: BL },

  // Tetrahedral
  CH4: { shape: "tetrahedral", atoms: [{ symbol: "C", position: [0, 0, 0] }, { symbol: "H", position: [BL, BL, BL] }, { symbol: "H", position: [-BL, -BL, BL] }, { symbol: "H", position: [-BL, BL, -BL] }, { symbol: "H", position: [BL, -BL, -BL] }], bonds: [[0, 1], [0, 2], [0, 3], [0, 4]], bondLength: BL },
  CCl4: { shape: "tetrahedral", atoms: [{ symbol: "C", position: [0, 0, 0] }, { symbol: "Cl", position: [BL, BL, BL] }, { symbol: "Cl", position: [-BL, -BL, BL] }, { symbol: "Cl", position: [-BL, BL, -BL] }, { symbol: "Cl", position: [BL, -BL, -BL] }], bonds: [[0, 1], [0, 2], [0, 3], [0, 4]], bondLength: BL },
  SiC: { shape: "linear", atoms: [{ symbol: "Si", position: [-BL / 2, 0, 0] }, { symbol: "C", position: [BL / 2, 0, 0] }], bonds: [[0, 1]], bondLength: BL },
};

/**
 * Get molecular geometry for a compound. Returns null if not defined.
 */
export function getMoleculeGeometry(formula: string): MoleculeGeometry | null {
  return GEOMETRIES[formula] ?? null;
}

/**
 * Get atom color by element symbol for nucleus visualization.
 */
export function getAtomColor(symbol: string): string {
  const colors: Record<string, string> = {
    H: "#ffffff",
    He: "#d9ffff",
    Li: "#cc80ff",
    C: "#404040",
    N: "#3050f8",
    O: "#ff0d0d",
    F: "#90e050",
    Na: "#ab5cf2",
    Mg: "#8aff00",
    Al: "#bfa6a6",
    Si: "#f0c8a0",
    P: "#ff8000",
    S: "#ffff30",
    Cl: "#1ff01f",
    K: "#8f40d4",
    Ca: "#3dff00",
    Ti: "#bfc2c7",
    Fe: "#e06633",
    Co: "#f090a0",
    Ni: "#50d050",
    Cu: "#c88033",
    Zn: "#7d80b0",
    Br: "#a62929",
    Ag: "#c0c0c0",
    I: "#940094",
    Ba: "#00c900",
    Pb: "#575961",
    Sn: "#668080",
    Mn: "#9c7ac7",
    Cr: "#8a99c7",
    B: "#ffb5b5",
    As: "#bd80e3",
  };
  return colors[symbol] ?? "#808080";
}

/**
 * Get approximate atomic radius (in visualization units) for an element.
 */
export function getAtomRadius(symbol: string): number {
  const radii: Record<string, number> = {
    H: 0.4, He: 0.5,
    Li: 0.8, Be: 0.7, B: 0.7, C: 0.65, N: 0.6, O: 0.55, F: 0.5, Ne: 0.5,
    Na: 0.9, Mg: 0.85, Al: 0.8, Si: 0.75, P: 0.7, S: 0.65, Cl: 0.6, Ar: 0.6,
    K: 1.0, Ca: 0.95, Fe: 0.8, Cu: 0.75, Zn: 0.75, Br: 0.7,
    Ag: 0.85, I: 0.8, Ba: 1.05, Pb: 0.9,
  };
  return radii[symbol] ?? 0.7;
}
