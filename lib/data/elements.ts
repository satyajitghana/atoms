export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide";

export interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: ElementCategory;
  electronConfiguration: string;
  period: number;
  group: number;
}

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  "alkali-metal": "#ef4444",
  "alkaline-earth": "#f97316",
  "transition-metal": "#eab308",
  "post-transition-metal": "#22c55e",
  metalloid: "#14b8a6",
  nonmetal: "#06b6d4",
  halogen: "#3b82f6",
  "noble-gas": "#8b5cf6",
  lanthanide: "#ec4899",
  actinide: "#f43f5e",
};

export const ELEMENTS: Element[] = [
  { number: 1, symbol: "H", name: "Hydrogen", mass: 1.008, category: "nonmetal", electronConfiguration: "1s1", period: 1, group: 1 },
  { number: 2, symbol: "He", name: "Helium", mass: 4.003, category: "noble-gas", electronConfiguration: "1s2", period: 1, group: 18 },
  { number: 3, symbol: "Li", name: "Lithium", mass: 6.941, category: "alkali-metal", electronConfiguration: "1s2 2s1", period: 2, group: 1 },
  { number: 4, symbol: "Be", name: "Beryllium", mass: 9.012, category: "alkaline-earth", electronConfiguration: "1s2 2s2", period: 2, group: 2 },
  { number: 5, symbol: "B", name: "Boron", mass: 10.81, category: "metalloid", electronConfiguration: "1s2 2s2 2p1", period: 2, group: 13 },
  { number: 6, symbol: "C", name: "Carbon", mass: 12.011, category: "nonmetal", electronConfiguration: "1s2 2s2 2p2", period: 2, group: 14 },
  { number: 7, symbol: "N", name: "Nitrogen", mass: 14.007, category: "nonmetal", electronConfiguration: "1s2 2s2 2p3", period: 2, group: 15 },
  { number: 8, symbol: "O", name: "Oxygen", mass: 15.999, category: "nonmetal", electronConfiguration: "1s2 2s2 2p4", period: 2, group: 16 },
  { number: 9, symbol: "F", name: "Fluorine", mass: 18.998, category: "halogen", electronConfiguration: "1s2 2s2 2p5", period: 2, group: 17 },
  { number: 10, symbol: "Ne", name: "Neon", mass: 20.18, category: "noble-gas", electronConfiguration: "1s2 2s2 2p6", period: 2, group: 18 },
  { number: 11, symbol: "Na", name: "Sodium", mass: 22.99, category: "alkali-metal", electronConfiguration: "1s2 2s2 2p6 3s1", period: 3, group: 1 },
  { number: 12, symbol: "Mg", name: "Magnesium", mass: 24.305, category: "alkaline-earth", electronConfiguration: "1s2 2s2 2p6 3s2", period: 3, group: 2 },
  { number: 13, symbol: "Al", name: "Aluminium", mass: 26.982, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p1", period: 3, group: 13 },
  { number: 14, symbol: "Si", name: "Silicon", mass: 28.086, category: "metalloid", electronConfiguration: "1s2 2s2 2p6 3s2 3p2", period: 3, group: 14 },
  { number: 15, symbol: "P", name: "Phosphorus", mass: 30.974, category: "nonmetal", electronConfiguration: "1s2 2s2 2p6 3s2 3p3", period: 3, group: 15 },
  { number: 16, symbol: "S", name: "Sulfur", mass: 32.06, category: "nonmetal", electronConfiguration: "1s2 2s2 2p6 3s2 3p4", period: 3, group: 16 },
  { number: 17, symbol: "Cl", name: "Chlorine", mass: 35.45, category: "halogen", electronConfiguration: "1s2 2s2 2p6 3s2 3p5", period: 3, group: 17 },
  { number: 18, symbol: "Ar", name: "Argon", mass: 39.948, category: "noble-gas", electronConfiguration: "1s2 2s2 2p6 3s2 3p6", period: 3, group: 18 },
  { number: 19, symbol: "K", name: "Potassium", mass: 39.098, category: "alkali-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s1", period: 4, group: 1 },
  { number: 20, symbol: "Ca", name: "Calcium", mass: 40.078, category: "alkaline-earth", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2", period: 4, group: 2 },
  { number: 21, symbol: "Sc", name: "Scandium", mass: 44.956, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d1", period: 4, group: 3 },
  { number: 22, symbol: "Ti", name: "Titanium", mass: 47.867, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d2", period: 4, group: 4 },
  { number: 23, symbol: "V", name: "Vanadium", mass: 50.942, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d3", period: 4, group: 5 },
  { number: 24, symbol: "Cr", name: "Chromium", mass: 51.996, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s1 3d5", period: 4, group: 6 },
  { number: 25, symbol: "Mn", name: "Manganese", mass: 54.938, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d5", period: 4, group: 7 },
  { number: 26, symbol: "Fe", name: "Iron", mass: 55.845, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d6", period: 4, group: 8 },
  { number: 27, symbol: "Co", name: "Cobalt", mass: 58.933, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d7", period: 4, group: 9 },
  { number: 28, symbol: "Ni", name: "Nickel", mass: 58.693, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d8", period: 4, group: 10 },
  { number: 29, symbol: "Cu", name: "Copper", mass: 63.546, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s1 3d10", period: 4, group: 11 },
  { number: 30, symbol: "Zn", name: "Zinc", mass: 65.38, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10", period: 4, group: 12 },
  { number: 31, symbol: "Ga", name: "Gallium", mass: 69.723, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p1", period: 4, group: 13 },
  { number: 32, symbol: "Ge", name: "Germanium", mass: 72.63, category: "metalloid", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p2", period: 4, group: 14 },
  { number: 33, symbol: "As", name: "Arsenic", mass: 74.922, category: "metalloid", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p3", period: 4, group: 15 },
  { number: 34, symbol: "Se", name: "Selenium", mass: 78.971, category: "nonmetal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p4", period: 4, group: 16 },
  { number: 35, symbol: "Br", name: "Bromine", mass: 79.904, category: "halogen", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p5", period: 4, group: 17 },
  { number: 36, symbol: "Kr", name: "Krypton", mass: 83.798, category: "noble-gas", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6", period: 4, group: 18 },
  { number: 37, symbol: "Rb", name: "Rubidium", mass: 85.468, category: "alkali-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1", period: 5, group: 1 },
  { number: 38, symbol: "Sr", name: "Strontium", mass: 87.62, category: "alkaline-earth", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2", period: 5, group: 2 },
  { number: 39, symbol: "Y", name: "Yttrium", mass: 88.906, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d1", period: 5, group: 3 },
  { number: 40, symbol: "Zr", name: "Zirconium", mass: 91.224, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d2", period: 5, group: 4 },
  { number: 41, symbol: "Nb", name: "Niobium", mass: 92.906, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d4", period: 5, group: 5 },
  { number: 42, symbol: "Mo", name: "Molybdenum", mass: 95.95, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d5", period: 5, group: 6 },
  { number: 43, symbol: "Tc", name: "Technetium", mass: 98.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d5", period: 5, group: 7 },
  { number: 44, symbol: "Ru", name: "Ruthenium", mass: 101.07, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d7", period: 5, group: 8 },
  { number: 45, symbol: "Rh", name: "Rhodium", mass: 102.906, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d8", period: 5, group: 9 },
  { number: 46, symbol: "Pd", name: "Palladium", mass: 106.42, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 4d10", period: 5, group: 10 },
  { number: 47, symbol: "Ag", name: "Silver", mass: 107.868, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d10", period: 5, group: 11 },
  { number: 48, symbol: "Cd", name: "Cadmium", mass: 112.414, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10", period: 5, group: 12 },
  { number: 49, symbol: "In", name: "Indium", mass: 114.818, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p1", period: 5, group: 13 },
  { number: 50, symbol: "Sn", name: "Tin", mass: 118.711, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p2", period: 5, group: 14 },
  { number: 51, symbol: "Sb", name: "Antimony", mass: 121.76, category: "metalloid", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p3", period: 5, group: 15 },
  { number: 52, symbol: "Te", name: "Tellurium", mass: 127.6, category: "metalloid", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p4", period: 5, group: 16 },
  { number: 53, symbol: "I", name: "Iodine", mass: 126.904, category: "halogen", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p5", period: 5, group: 17 },
  { number: 54, symbol: "Xe", name: "Xenon", mass: 131.294, category: "noble-gas", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6", period: 5, group: 18 },
  { number: 55, symbol: "Cs", name: "Cesium", mass: 132.905, category: "alkali-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1", period: 6, group: 1 },
  { number: 56, symbol: "Ba", name: "Barium", mass: 137.327, category: "alkaline-earth", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2", period: 6, group: 2 },
  { number: 57, symbol: "La", name: "Lanthanum", mass: 138.905, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 5d1", period: 6, group: 3 },
  { number: 58, symbol: "Ce", name: "Cerium", mass: 140.116, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f1 5d1", period: 6, group: 3 },
  { number: 59, symbol: "Pr", name: "Praseodymium", mass: 140.908, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f3", period: 6, group: 3 },
  { number: 60, symbol: "Nd", name: "Neodymium", mass: 144.242, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f4", period: 6, group: 3 },
  { number: 61, symbol: "Pm", name: "Promethium", mass: 145.0, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f5", period: 6, group: 3 },
  { number: 62, symbol: "Sm", name: "Samarium", mass: 150.36, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f6", period: 6, group: 3 },
  { number: 63, symbol: "Eu", name: "Europium", mass: 151.964, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f7", period: 6, group: 3 },
  { number: 64, symbol: "Gd", name: "Gadolinium", mass: 157.25, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f7 5d1", period: 6, group: 3 },
  { number: 65, symbol: "Tb", name: "Terbium", mass: 158.925, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f9", period: 6, group: 3 },
  { number: 66, symbol: "Dy", name: "Dysprosium", mass: 162.5, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f10", period: 6, group: 3 },
  { number: 67, symbol: "Ho", name: "Holmium", mass: 164.93, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f11", period: 6, group: 3 },
  { number: 68, symbol: "Er", name: "Erbium", mass: 167.259, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f12", period: 6, group: 3 },
  { number: 69, symbol: "Tm", name: "Thulium", mass: 168.934, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f13", period: 6, group: 3 },
  { number: 70, symbol: "Yb", name: "Ytterbium", mass: 173.045, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14", period: 6, group: 3 },
  { number: 71, symbol: "Lu", name: "Lutetium", mass: 174.967, category: "lanthanide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d1", period: 6, group: 3 },
  { number: 72, symbol: "Hf", name: "Hafnium", mass: 178.49, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d2", period: 6, group: 4 },
  { number: 73, symbol: "Ta", name: "Tantalum", mass: 180.948, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d3", period: 6, group: 5 },
  { number: 74, symbol: "W", name: "Tungsten", mass: 183.84, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d4", period: 6, group: 6 },
  { number: 75, symbol: "Re", name: "Rhenium", mass: 186.207, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d5", period: 6, group: 7 },
  { number: 76, symbol: "Os", name: "Osmium", mass: 190.23, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d6", period: 6, group: 8 },
  { number: 77, symbol: "Ir", name: "Iridium", mass: 192.217, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d7", period: 6, group: 9 },
  { number: 78, symbol: "Pt", name: "Platinum", mass: 195.084, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1 4f14 5d9", period: 6, group: 10 },
  { number: 79, symbol: "Au", name: "Gold", mass: 196.967, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1 4f14 5d10", period: 6, group: 11 },
  { number: 80, symbol: "Hg", name: "Mercury", mass: 200.592, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10", period: 6, group: 12 },
  { number: 81, symbol: "Tl", name: "Thallium", mass: 204.38, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p1", period: 6, group: 13 },
  { number: 82, symbol: "Pb", name: "Lead", mass: 207.2, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p2", period: 6, group: 14 },
  { number: 83, symbol: "Bi", name: "Bismuth", mass: 208.98, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p3", period: 6, group: 15 },
  { number: 84, symbol: "Po", name: "Polonium", mass: 209.0, category: "metalloid", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p4", period: 6, group: 16 },
  { number: 85, symbol: "At", name: "Astatine", mass: 210.0, category: "halogen", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p5", period: 6, group: 17 },
  { number: 86, symbol: "Rn", name: "Radon", mass: 222.0, category: "noble-gas", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6", period: 6, group: 18 },
  { number: 87, symbol: "Fr", name: "Francium", mass: 223.0, category: "alkali-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s1", period: 7, group: 1 },
  { number: 88, symbol: "Ra", name: "Radium", mass: 226.0, category: "alkaline-earth", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2", period: 7, group: 2 },
  { number: 89, symbol: "Ac", name: "Actinium", mass: 227.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 6d1", period: 7, group: 3 },
  { number: 90, symbol: "Th", name: "Thorium", mass: 232.038, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 6d2", period: 7, group: 3 },
  { number: 91, symbol: "Pa", name: "Protactinium", mass: 231.036, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f2 6d1", period: 7, group: 3 },
  { number: 92, symbol: "U", name: "Uranium", mass: 238.029, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f3 6d1", period: 7, group: 3 },
  { number: 93, symbol: "Np", name: "Neptunium", mass: 237.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f4 6d1", period: 7, group: 3 },
  { number: 94, symbol: "Pu", name: "Plutonium", mass: 244.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f6", period: 7, group: 3 },
  { number: 95, symbol: "Am", name: "Americium", mass: 243.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f7", period: 7, group: 3 },
  { number: 96, symbol: "Cm", name: "Curium", mass: 247.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f7 6d1", period: 7, group: 3 },
  { number: 97, symbol: "Bk", name: "Berkelium", mass: 247.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f9", period: 7, group: 3 },
  { number: 98, symbol: "Cf", name: "Californium", mass: 251.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f10", period: 7, group: 3 },
  { number: 99, symbol: "Es", name: "Einsteinium", mass: 252.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f11", period: 7, group: 3 },
  { number: 100, symbol: "Fm", name: "Fermium", mass: 257.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f12", period: 7, group: 3 },
  { number: 101, symbol: "Md", name: "Mendelevium", mass: 258.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f13", period: 7, group: 3 },
  { number: 102, symbol: "No", name: "Nobelium", mass: 259.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14", period: 7, group: 3 },
  { number: 103, symbol: "Lr", name: "Lawrencium", mass: 266.0, category: "actinide", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 7p1", period: 7, group: 3 },
  { number: 104, symbol: "Rf", name: "Rutherfordium", mass: 267.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d2", period: 7, group: 4 },
  { number: 105, symbol: "Db", name: "Dubnium", mass: 268.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d3", period: 7, group: 5 },
  { number: 106, symbol: "Sg", name: "Seaborgium", mass: 269.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d4", period: 7, group: 6 },
  { number: 107, symbol: "Bh", name: "Bohrium", mass: 270.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d5", period: 7, group: 7 },
  { number: 108, symbol: "Hs", name: "Hassium", mass: 269.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d6", period: 7, group: 8 },
  { number: 109, symbol: "Mt", name: "Meitnerium", mass: 278.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d7", period: 7, group: 9 },
  { number: 110, symbol: "Ds", name: "Darmstadtium", mass: 281.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d8", period: 7, group: 10 },
  { number: 111, symbol: "Rg", name: "Roentgenium", mass: 282.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d9", period: 7, group: 11 },
  { number: 112, symbol: "Cn", name: "Copernicium", mass: 285.0, category: "transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10", period: 7, group: 12 },
  { number: 113, symbol: "Nh", name: "Nihonium", mass: 286.0, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p1", period: 7, group: 13 },
  { number: 114, symbol: "Fl", name: "Flerovium", mass: 289.0, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p2", period: 7, group: 14 },
  { number: 115, symbol: "Mc", name: "Moscovium", mass: 290.0, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p3", period: 7, group: 15 },
  { number: 116, symbol: "Lv", name: "Livermorium", mass: 293.0, category: "post-transition-metal", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p4", period: 7, group: 16 },
  { number: 117, symbol: "Ts", name: "Tennessine", mass: 294.0, category: "halogen", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p5", period: 7, group: 17 },
  { number: 118, symbol: "Og", name: "Oganesson", mass: 294.0, category: "noble-gas", electronConfiguration: "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p6", period: 7, group: 18 },
];

export function getElement(symbol: string): Element | undefined {
  return ELEMENTS.find((e) => e.symbol === symbol);
}

export function getElementById(number: number): Element | undefined {
  return ELEMENTS.find((e) => e.number === number);
}
