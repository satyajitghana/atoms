export interface Compound {
  formula: string;
  name: string;
  elements: { symbol: string; count: number }[];
  deltaHf: number; // Formation enthalpy (kJ/mol), negative = exothermic
  bondType: "ionic" | "covalent" | "metallic";
  description: string;
  difficulty: 1 | 2 | 3;
}

export const COMPOUNDS: Compound[] = [
  // Difficulty 1 - Easy (diatomic, simple ionic/covalent)
  { formula: "H2", name: "Hydrogen Gas", elements: [{ symbol: "H", count: 2 }], deltaHf: 0, bondType: "covalent", description: "The lightest and most abundant element in the universe", difficulty: 1 },
  { formula: "O2", name: "Oxygen Gas", elements: [{ symbol: "O", count: 2 }], deltaHf: 0, bondType: "covalent", description: "Essential for respiration in most life forms", difficulty: 1 },
  { formula: "N2", name: "Nitrogen Gas", elements: [{ symbol: "N", count: 2 }], deltaHf: 0, bondType: "covalent", description: "Makes up 78% of Earth's atmosphere", difficulty: 1 },
  { formula: "F2", name: "Fluorine Gas", elements: [{ symbol: "F", count: 2 }], deltaHf: 0, bondType: "covalent", description: "The most electronegative element", difficulty: 1 },
  { formula: "Cl2", name: "Chlorine Gas", elements: [{ symbol: "Cl", count: 2 }], deltaHf: 0, bondType: "covalent", description: "Used in water purification", difficulty: 1 },
  { formula: "HF", name: "Hydrogen Fluoride", elements: [{ symbol: "H", count: 1 }, { symbol: "F", count: 1 }], deltaHf: -273.3, bondType: "covalent", description: "Used in etching glass", difficulty: 1 },
  { formula: "HCl", name: "Hydrogen Chloride", elements: [{ symbol: "H", count: 1 }, { symbol: "Cl", count: 1 }], deltaHf: -92.3, bondType: "covalent", description: "Stomach acid is mainly HCl", difficulty: 1 },
  { formula: "NaCl", name: "Sodium Chloride", elements: [{ symbol: "Na", count: 1 }, { symbol: "Cl", count: 1 }], deltaHf: -411.2, bondType: "ionic", description: "Table salt — the most common ionic compound", difficulty: 1 },
  { formula: "NaF", name: "Sodium Fluoride", elements: [{ symbol: "Na", count: 1 }, { symbol: "F", count: 1 }], deltaHf: -576.6, bondType: "ionic", description: "Used in toothpaste to prevent cavities", difficulty: 1 },
  { formula: "LiF", name: "Lithium Fluoride", elements: [{ symbol: "Li", count: 1 }, { symbol: "F", count: 1 }], deltaHf: -616.0, bondType: "ionic", description: "Used in optics for UV light", difficulty: 1 },
  { formula: "LiCl", name: "Lithium Chloride", elements: [{ symbol: "Li", count: 1 }, { symbol: "Cl", count: 1 }], deltaHf: -408.6, bondType: "ionic", description: "Used as a desiccant", difficulty: 1 },
  { formula: "KCl", name: "Potassium Chloride", elements: [{ symbol: "K", count: 1 }, { symbol: "Cl", count: 1 }], deltaHf: -436.5, bondType: "ionic", description: "Salt substitute for low-sodium diets", difficulty: 1 },
  { formula: "KF", name: "Potassium Fluoride", elements: [{ symbol: "K", count: 1 }, { symbol: "F", count: 1 }], deltaHf: -567.3, bondType: "ionic", description: "Used in organic chemistry as a fluorinating agent", difficulty: 1 },
  { formula: "NaBr", name: "Sodium Bromide", elements: [{ symbol: "Na", count: 1 }, { symbol: "Br", count: 1 }], deltaHf: -361.1, bondType: "ionic", description: "Formerly used as a sedative", difficulty: 1 },
  { formula: "HBr", name: "Hydrogen Bromide", elements: [{ symbol: "H", count: 1 }, { symbol: "Br", count: 1 }], deltaHf: -36.3, bondType: "covalent", description: "Used in organic synthesis", difficulty: 1 },

  // Difficulty 2 - Medium (oxides, hydroxides, acids, binary compounds)
  { formula: "H2O", name: "Water", elements: [{ symbol: "H", count: 2 }, { symbol: "O", count: 1 }], deltaHf: -285.8, bondType: "covalent", description: "The universal solvent — essential for all known life", difficulty: 2 },
  { formula: "CO2", name: "Carbon Dioxide", elements: [{ symbol: "C", count: 1 }, { symbol: "O", count: 2 }], deltaHf: -393.5, bondType: "covalent", description: "Greenhouse gas exhaled by animals", difficulty: 2 },
  { formula: "CO", name: "Carbon Monoxide", elements: [{ symbol: "C", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -110.5, bondType: "covalent", description: "Toxic gas with a triple bond", difficulty: 2 },
  { formula: "NH3", name: "Ammonia", elements: [{ symbol: "N", count: 1 }, { symbol: "H", count: 3 }], deltaHf: -45.9, bondType: "covalent", description: "Pungent gas used in fertilizers (Haber process)", difficulty: 2 },
  { formula: "CH4", name: "Methane", elements: [{ symbol: "C", count: 1 }, { symbol: "H", count: 4 }], deltaHf: -74.6, bondType: "covalent", description: "Natural gas — simplest hydrocarbon", difficulty: 2 },
  { formula: "NO", name: "Nitric Oxide", elements: [{ symbol: "N", count: 1 }, { symbol: "O", count: 1 }], deltaHf: 91.3, bondType: "covalent", description: "Signaling molecule in the cardiovascular system", difficulty: 2 },
  { formula: "NO2", name: "Nitrogen Dioxide", elements: [{ symbol: "N", count: 1 }, { symbol: "O", count: 2 }], deltaHf: 33.2, bondType: "covalent", description: "Reddish-brown toxic gas in smog", difficulty: 2 },
  { formula: "SO2", name: "Sulfur Dioxide", elements: [{ symbol: "S", count: 1 }, { symbol: "O", count: 2 }], deltaHf: -296.8, bondType: "covalent", description: "Volcanic gas that causes acid rain", difficulty: 2 },
  { formula: "SO3", name: "Sulfur Trioxide", elements: [{ symbol: "S", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -395.7, bondType: "covalent", description: "Key intermediate in sulfuric acid production", difficulty: 2 },
  { formula: "H2S", name: "Hydrogen Sulfide", elements: [{ symbol: "H", count: 2 }, { symbol: "S", count: 1 }], deltaHf: -20.6, bondType: "covalent", description: "Rotten egg smell — toxic but important in geology", difficulty: 2 },
  { formula: "MgO", name: "Magnesium Oxide", elements: [{ symbol: "Mg", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -601.6, bondType: "ionic", description: "Refractory material with very high melting point", difficulty: 2 },
  { formula: "CaO", name: "Calcium Oxide", elements: [{ symbol: "Ca", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -635.1, bondType: "ionic", description: "Quicklime — used in cement production", difficulty: 2 },
  { formula: "Na2O", name: "Sodium Oxide", elements: [{ symbol: "Na", count: 2 }, { symbol: "O", count: 1 }], deltaHf: -414.2, bondType: "ionic", description: "Reacts violently with water to form NaOH", difficulty: 2 },
  { formula: "K2O", name: "Potassium Oxide", elements: [{ symbol: "K", count: 2 }, { symbol: "O", count: 1 }], deltaHf: -361.5, bondType: "ionic", description: "Used in fertilizer production", difficulty: 2 },
  { formula: "BaO", name: "Barium Oxide", elements: [{ symbol: "Ba", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -548.0, bondType: "ionic", description: "Used in cathode ray tubes", difficulty: 2 },
  { formula: "Li2O", name: "Lithium Oxide", elements: [{ symbol: "Li", count: 2 }, { symbol: "O", count: 1 }], deltaHf: -597.9, bondType: "ionic", description: "White powder used in ceramics", difficulty: 2 },
  { formula: "MgCl2", name: "Magnesium Chloride", elements: [{ symbol: "Mg", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -641.3, bondType: "ionic", description: "Found in seawater, used for de-icing", difficulty: 2 },
  { formula: "CaCl2", name: "Calcium Chloride", elements: [{ symbol: "Ca", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -795.4, bondType: "ionic", description: "Highly hygroscopic — used as a desiccant", difficulty: 2 },
  { formula: "AlCl3", name: "Aluminium Chloride", elements: [{ symbol: "Al", count: 1 }, { symbol: "Cl", count: 3 }], deltaHf: -704.2, bondType: "ionic", description: "Lewis acid catalyst in organic chemistry", difficulty: 2 },
  { formula: "NaH", name: "Sodium Hydride", elements: [{ symbol: "Na", count: 1 }, { symbol: "H", count: 1 }], deltaHf: -56.3, bondType: "ionic", description: "Strong base used in organic synthesis", difficulty: 2 },
  { formula: "SiO2", name: "Silicon Dioxide", elements: [{ symbol: "Si", count: 1 }, { symbol: "O", count: 2 }], deltaHf: -910.7, bondType: "covalent", description: "Sand and quartz — most common mineral on Earth", difficulty: 2 },
  { formula: "PCl3", name: "Phosphorus Trichloride", elements: [{ symbol: "P", count: 1 }, { symbol: "Cl", count: 3 }], deltaHf: -319.7, bondType: "covalent", description: "Important in pesticide manufacturing", difficulty: 2 },

  // Difficulty 3 - Hard (complex compounds, multi-element)
  { formula: "Fe2O3", name: "Iron(III) Oxide", elements: [{ symbol: "Fe", count: 2 }, { symbol: "O", count: 3 }], deltaHf: -824.2, bondType: "ionic", description: "Rust — the most common form of iron corrosion", difficulty: 3 },
  { formula: "Al2O3", name: "Aluminium Oxide", elements: [{ symbol: "Al", count: 2 }, { symbol: "O", count: 3 }], deltaHf: -1675.7, bondType: "ionic", description: "Corundum — sapphires and rubies are impure forms", difficulty: 3 },
  { formula: "NaOH", name: "Sodium Hydroxide", elements: [{ symbol: "Na", count: 1 }, { symbol: "O", count: 1 }, { symbol: "H", count: 1 }], deltaHf: -425.6, bondType: "ionic", description: "Caustic soda — used in soap making", difficulty: 3 },
  { formula: "Ca(OH)2", name: "Calcium Hydroxide", elements: [{ symbol: "Ca", count: 1 }, { symbol: "O", count: 2 }, { symbol: "H", count: 2 }], deltaHf: -985.2, bondType: "ionic", description: "Slaked lime — used in construction", difficulty: 3 },
  { formula: "H2SO4", name: "Sulfuric Acid", elements: [{ symbol: "H", count: 2 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -814.0, bondType: "covalent", description: "King of chemicals — most produced industrial acid", difficulty: 3 },
  { formula: "HNO3", name: "Nitric Acid", elements: [{ symbol: "H", count: 1 }, { symbol: "N", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -174.1, bondType: "covalent", description: "Strong acid used in fertilizers and explosives", difficulty: 3 },
  { formula: "H3PO4", name: "Phosphoric Acid", elements: [{ symbol: "H", count: 3 }, { symbol: "P", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -1271.7, bondType: "covalent", description: "Used in cola drinks and fertilizers", difficulty: 3 },
  { formula: "Na2CO3", name: "Sodium Carbonate", elements: [{ symbol: "Na", count: 2 }, { symbol: "C", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -1130.7, bondType: "ionic", description: "Washing soda — used in glass making", difficulty: 3 },
  { formula: "NaHCO3", name: "Sodium Bicarbonate", elements: [{ symbol: "Na", count: 1 }, { symbol: "H", count: 1 }, { symbol: "C", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -950.8, bondType: "ionic", description: "Baking soda — leavening agent in cooking", difficulty: 3 },
  { formula: "CaCO3", name: "Calcium Carbonate", elements: [{ symbol: "Ca", count: 1 }, { symbol: "C", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -1206.9, bondType: "ionic", description: "Limestone, chalk, and marble", difficulty: 3 },
  { formula: "FeCl3", name: "Iron(III) Chloride", elements: [{ symbol: "Fe", count: 1 }, { symbol: "Cl", count: 3 }], deltaHf: -399.5, bondType: "ionic", description: "Used in water treatment and circuit board etching", difficulty: 3 },
  { formula: "FeCl2", name: "Iron(II) Chloride", elements: [{ symbol: "Fe", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -341.8, bondType: "ionic", description: "Used as a reducing agent", difficulty: 3 },
  { formula: "CuO", name: "Copper(II) Oxide", elements: [{ symbol: "Cu", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -157.3, bondType: "ionic", description: "Black powder used in ceramics glazing", difficulty: 3 },
  { formula: "Cu2O", name: "Copper(I) Oxide", elements: [{ symbol: "Cu", count: 2 }, { symbol: "O", count: 1 }], deltaHf: -168.6, bondType: "ionic", description: "Red mineral used in antifouling paints", difficulty: 3 },
  { formula: "ZnO", name: "Zinc Oxide", elements: [{ symbol: "Zn", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -350.5, bondType: "ionic", description: "Used in sunscreen and rubber production", difficulty: 3 },
  { formula: "NH4Cl", name: "Ammonium Chloride", elements: [{ symbol: "N", count: 1 }, { symbol: "H", count: 4 }, { symbol: "Cl", count: 1 }], deltaHf: -314.4, bondType: "ionic", description: "Sal ammoniac — used in soldering flux", difficulty: 3 },
  { formula: "C2H2", name: "Acetylene", elements: [{ symbol: "C", count: 2 }, { symbol: "H", count: 2 }], deltaHf: 227.4, bondType: "covalent", description: "Triple-bonded gas used in welding torches", difficulty: 3 },
  { formula: "C2H4", name: "Ethylene", elements: [{ symbol: "C", count: 2 }, { symbol: "H", count: 4 }], deltaHf: 52.4, bondType: "covalent", description: "Plant hormone — used to ripen fruit", difficulty: 3 },
  { formula: "C2H6", name: "Ethane", elements: [{ symbol: "C", count: 2 }, { symbol: "H", count: 6 }], deltaHf: -84.0, bondType: "covalent", description: "Second-simplest alkane — component of natural gas", difficulty: 3 },
  { formula: "CH3OH", name: "Methanol", elements: [{ symbol: "C", count: 1 }, { symbol: "H", count: 4 }, { symbol: "O", count: 1 }], deltaHf: -239.2, bondType: "covalent", description: "Wood alcohol — simplest alcohol, toxic if ingested", difficulty: 3 },
  { formula: "C2H5OH", name: "Ethanol", elements: [{ symbol: "C", count: 2 }, { symbol: "H", count: 6 }, { symbol: "O", count: 1 }], deltaHf: -277.6, bondType: "covalent", description: "Drinking alcohol — found in beer, wine, spirits", difficulty: 3 },
  { formula: "MnO2", name: "Manganese Dioxide", elements: [{ symbol: "Mn", count: 1 }, { symbol: "O", count: 2 }], deltaHf: -520.0, bondType: "ionic", description: "Used in alkaline batteries", difficulty: 3 },
  { formula: "Cr2O3", name: "Chromium(III) Oxide", elements: [{ symbol: "Cr", count: 2 }, { symbol: "O", count: 3 }], deltaHf: -1139.7, bondType: "ionic", description: "Green pigment used since ancient times", difficulty: 3 },
  { formula: "AgCl", name: "Silver Chloride", elements: [{ symbol: "Ag", count: 1 }, { symbol: "Cl", count: 1 }], deltaHf: -127.0, bondType: "ionic", description: "Light-sensitive compound used in photography", difficulty: 3 },
  { formula: "FeS2", name: "Iron Pyrite", elements: [{ symbol: "Fe", count: 1 }, { symbol: "S", count: 2 }], deltaHf: -178.2, bondType: "ionic", description: "Fool's gold — metallic luster resembles gold", difficulty: 3 },
  { formula: "P2O5", name: "Phosphorus Pentoxide", elements: [{ symbol: "P", count: 2 }, { symbol: "O", count: 5 }], deltaHf: -1492.0, bondType: "covalent", description: "Powerful desiccant — absorbs water aggressively", difficulty: 3 },

  // Additional Tier 1
  { formula: "KBr", name: "Potassium Bromide", elements: [{ symbol: "K", count: 1 }, { symbol: "Br", count: 1 }], deltaHf: -393.8, bondType: "ionic", description: "Used in photographic film development", difficulty: 1 },
  { formula: "NaI", name: "Sodium Iodide", elements: [{ symbol: "Na", count: 1 }, { symbol: "I", count: 1 }], deltaHf: -287.8, bondType: "ionic", description: "Used in radiation detectors", difficulty: 1 },
  { formula: "LiBr", name: "Lithium Bromide", elements: [{ symbol: "Li", count: 1 }, { symbol: "Br", count: 1 }], deltaHf: -351.2, bondType: "ionic", description: "Used in absorption chillers for air conditioning", difficulty: 1 },
  { formula: "KI", name: "Potassium Iodide", elements: [{ symbol: "K", count: 1 }, { symbol: "I", count: 1 }], deltaHf: -327.9, bondType: "ionic", description: "Used to protect the thyroid from radiation", difficulty: 1 },
  { formula: "HI", name: "Hydrogen Iodide", elements: [{ symbol: "H", count: 1 }, { symbol: "I", count: 1 }], deltaHf: 26.5, bondType: "covalent", description: "Strong acid — one of the few endothermic hydrogen halides", difficulty: 1 },
  { formula: "Br2", name: "Bromine", elements: [{ symbol: "Br", count: 2 }], deltaHf: 0, bondType: "covalent", description: "The only non-metallic liquid element at room temperature", difficulty: 1 },
  { formula: "I2", name: "Iodine", elements: [{ symbol: "I", count: 2 }], deltaHf: 0, bondType: "covalent", description: "Purple vapor — used as a disinfectant", difficulty: 1 },

  // Additional Tier 2
  { formula: "FeO", name: "Iron(II) Oxide", elements: [{ symbol: "Fe", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -272.0, bondType: "ionic", description: "Wüstite — a non-stoichiometric mineral", difficulty: 2 },
  { formula: "Fe3O4", name: "Iron(II,III) Oxide", elements: [{ symbol: "Fe", count: 3 }, { symbol: "O", count: 4 }], deltaHf: -1118.4, bondType: "ionic", description: "Magnetite — naturally magnetic iron ore", difficulty: 2 },
  { formula: "TiO2", name: "Titanium Dioxide", elements: [{ symbol: "Ti", count: 1 }, { symbol: "O", count: 2 }], deltaHf: -944.0, bondType: "ionic", description: "White pigment in paint, sunscreen, and food coloring", difficulty: 2 },
  { formula: "BaCl2", name: "Barium Chloride", elements: [{ symbol: "Ba", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -858.6, bondType: "ionic", description: "Used in fireworks for green color", difficulty: 2 },
  { formula: "NiO", name: "Nickel(II) Oxide", elements: [{ symbol: "Ni", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -239.7, bondType: "ionic", description: "Green powder used in ceramics and batteries", difficulty: 2 },
  { formula: "CS2", name: "Carbon Disulfide", elements: [{ symbol: "C", count: 1 }, { symbol: "S", count: 2 }], deltaHf: 89.0, bondType: "covalent", description: "Flammable liquid solvent with ether-like odor", difficulty: 2 },
  { formula: "CCl4", name: "Carbon Tetrachloride", elements: [{ symbol: "C", count: 1 }, { symbol: "Cl", count: 4 }], deltaHf: -128.2, bondType: "covalent", description: "Former dry cleaning solvent — now banned as ozone depleter", difficulty: 2 },
  { formula: "N2O", name: "Nitrous Oxide", elements: [{ symbol: "N", count: 2 }, { symbol: "O", count: 1 }], deltaHf: 82.1, bondType: "covalent", description: "Laughing gas — used in anesthesia and whipped cream", difficulty: 2 },
  { formula: "COCl2", name: "Phosgene", elements: [{ symbol: "C", count: 1 }, { symbol: "O", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -218.8, bondType: "covalent", description: "Toxic gas once used as a chemical weapon — now used in plastics", difficulty: 2 },
  { formula: "SF6", name: "Sulfur Hexafluoride", elements: [{ symbol: "S", count: 1 }, { symbol: "F", count: 6 }], deltaHf: -1209.0, bondType: "covalent", description: "Dense inert gas — makes your voice deep (opposite of helium)", difficulty: 2 },
  { formula: "BF3", name: "Boron Trifluoride", elements: [{ symbol: "B", count: 1 }, { symbol: "F", count: 3 }], deltaHf: -1137.0, bondType: "covalent", description: "Strong Lewis acid catalyst used in chemical synthesis", difficulty: 2 },
  { formula: "CuCl2", name: "Copper(II) Chloride", elements: [{ symbol: "Cu", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -220.1, bondType: "ionic", description: "Blue-green compound — makes flames green in fireworks", difficulty: 2 },
  { formula: "ZnCl2", name: "Zinc Chloride", elements: [{ symbol: "Zn", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -415.1, bondType: "ionic", description: "Used as flux for soldering and in batteries", difficulty: 2 },
  { formula: "PH3", name: "Phosphine", elements: [{ symbol: "P", count: 1 }, { symbol: "H", count: 3 }], deltaHf: 5.4, bondType: "covalent", description: "Toxic gas — detected in Venus's atmosphere", difficulty: 2 },
  { formula: "AsH3", name: "Arsine", elements: [{ symbol: "As", count: 1 }, { symbol: "H", count: 3 }], deltaHf: 66.4, bondType: "covalent", description: "Extremely toxic gas used in semiconductor manufacturing", difficulty: 2 },

  // Additional Tier 3
  { formula: "KOH", name: "Potassium Hydroxide", elements: [{ symbol: "K", count: 1 }, { symbol: "O", count: 1 }, { symbol: "H", count: 1 }], deltaHf: -424.6, bondType: "ionic", description: "Caustic potash — used in soap and biodiesel production", difficulty: 3 },
  { formula: "CaSO4", name: "Calcium Sulfate", elements: [{ symbol: "Ca", count: 1 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -1434.1, bondType: "ionic", description: "Gypsum — used in plaster and drywall", difficulty: 3 },
  { formula: "KNO3", name: "Potassium Nitrate", elements: [{ symbol: "K", count: 1 }, { symbol: "N", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -494.6, bondType: "ionic", description: "Saltpeter — key ingredient in gunpowder and fertilizer", difficulty: 3 },
  { formula: "Na2SO4", name: "Sodium Sulfate", elements: [{ symbol: "Na", count: 2 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -1387.1, bondType: "ionic", description: "Glauber's salt — used in detergent manufacturing", difficulty: 3 },
  { formula: "NH4NO3", name: "Ammonium Nitrate", elements: [{ symbol: "N", count: 2 }, { symbol: "H", count: 4 }, { symbol: "O", count: 3 }], deltaHf: -365.6, bondType: "ionic", description: "Fertilizer that can also be an explosive", difficulty: 3 },
  { formula: "NaNO3", name: "Sodium Nitrate", elements: [{ symbol: "Na", count: 1 }, { symbol: "N", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -467.9, bondType: "ionic", description: "Chile saltpeter — used in fertilizers and food preservation", difficulty: 3 },
  { formula: "CuSO4", name: "Copper(II) Sulfate", elements: [{ symbol: "Cu", count: 1 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -771.4, bondType: "ionic", description: "Bright blue crystals — used in swimming pool treatment", difficulty: 3 },
  { formula: "ZnS", name: "Zinc Sulfide", elements: [{ symbol: "Zn", count: 1 }, { symbol: "S", count: 1 }], deltaHf: -205.6, bondType: "ionic", description: "Phosphorescent — used in glow-in-the-dark paints", difficulty: 3 },
  { formula: "SnO2", name: "Tin Dioxide", elements: [{ symbol: "Sn", count: 1 }, { symbol: "O", count: 2 }], deltaHf: -577.6, bondType: "ionic", description: "Cassiterite — the primary ore of tin", difficulty: 3 },
  { formula: "PbO", name: "Lead(II) Oxide", elements: [{ symbol: "Pb", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -218.0, bondType: "ionic", description: "Litharge — yellow powder used in lead-acid batteries", difficulty: 3 },
  { formula: "CoO", name: "Cobalt(II) Oxide", elements: [{ symbol: "Co", count: 1 }, { symbol: "O", count: 1 }], deltaHf: -237.9, bondType: "ionic", description: "Olive-green powder used to make blue glass and pottery", difficulty: 3 },
  { formula: "B2O3", name: "Boron Trioxide", elements: [{ symbol: "B", count: 2 }, { symbol: "O", count: 3 }], deltaHf: -1273.5, bondType: "covalent", description: "Glassy material used in borosilicate glass (Pyrex)", difficulty: 3 },
  { formula: "K2CO3", name: "Potassium Carbonate", elements: [{ symbol: "K", count: 2 }, { symbol: "C", count: 1 }, { symbol: "O", count: 3 }], deltaHf: -1151.0, bondType: "ionic", description: "Potash — historically used to make soap and glass", difficulty: 3 },
  { formula: "MgSO4", name: "Magnesium Sulfate", elements: [{ symbol: "Mg", count: 1 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -1284.9, bondType: "ionic", description: "Epsom salt — used in bath salts and agriculture", difficulty: 3 },
  { formula: "FeSO4", name: "Iron(II) Sulfate", elements: [{ symbol: "Fe", count: 1 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -928.4, bondType: "ionic", description: "Green vitriol — used in iron supplements and water treatment", difficulty: 3 },
  { formula: "BaSO4", name: "Barium Sulfate", elements: [{ symbol: "Ba", count: 1 }, { symbol: "S", count: 1 }, { symbol: "O", count: 4 }], deltaHf: -1473.2, bondType: "ionic", description: "Used as contrast agent in medical X-ray imaging", difficulty: 3 },
  { formula: "NiCl2", name: "Nickel(II) Chloride", elements: [{ symbol: "Ni", count: 1 }, { symbol: "Cl", count: 2 }], deltaHf: -305.3, bondType: "ionic", description: "Yellow-green salt used in nickel electroplating", difficulty: 3 },
  { formula: "SiC", name: "Silicon Carbide", elements: [{ symbol: "Si", count: 1 }, { symbol: "C", count: 1 }], deltaHf: -65.3, bondType: "covalent", description: "Moissanite — nearly as hard as diamond, used in abrasives", difficulty: 3 },
];

/**
 * Build a canonical key from an array of {symbol, count} for compound lookup.
 * Sorts alphabetically by symbol, then concatenates "symbol:count" pairs.
 */
function buildKey(elements: { symbol: string; count: number }[]): string {
  return [...elements]
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
    .map((e) => `${e.symbol}:${e.count}`)
    .join(",");
}

const COMPOUND_INDEX = new Map<string, Compound>();
for (const c of COMPOUNDS) {
  COMPOUND_INDEX.set(buildKey(c.elements), c);
}

/**
 * Look up a compound from element symbols with counts.
 */
export function findCompound(
  elements: { symbol: string; count: number }[]
): Compound | null {
  return COMPOUND_INDEX.get(buildKey(elements)) ?? null;
}

/**
 * Try to find a compound from a flat array of symbols (allowing duplicates).
 */
export function findCompoundFromSymbols(symbols: string[]): Compound | null {
  const counts = new Map<string, number>();
  for (const s of symbols) {
    counts.set(s, (counts.get(s) || 0) + 1);
  }
  const elements = Array.from(counts.entries()).map(([symbol, count]) => ({
    symbol,
    count,
  }));
  return findCompound(elements);
}
