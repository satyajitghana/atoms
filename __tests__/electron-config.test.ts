import { describe, it, expect } from "vitest";
import {
  parseElectronConfig,
  validateQuantumNumbers,
  constrainQuantumNumbers,
  getOrbitalName,
  getSubshellName,
} from "@/lib/chemistry/electron-config";

describe("parseElectronConfig", () => {
  it("parses hydrogen: 1s1", () => {
    const orbitals = parseElectronConfig("1s1");
    expect(orbitals).toHaveLength(1);
    expect(orbitals[0]).toMatchObject({ n: 1, l: 0, m: 0, electrons: 1 });
  });

  it("parses helium: 1s2", () => {
    const orbitals = parseElectronConfig("1s2");
    expect(orbitals).toHaveLength(1);
    expect(orbitals[0]).toMatchObject({ n: 1, l: 0, m: 0, electrons: 2 });
  });

  it("parses carbon: 1s2 2s2 2p2 (Hund's rule)", () => {
    const orbitals = parseElectronConfig("1s2 2s2 2p2");
    // 1s(2), 2s(2), 2p_-1(1), 2p_0(1) — Hund's rule: spread first
    expect(orbitals.length).toBeGreaterThanOrEqual(4);
    const pOrbitals = orbitals.filter((o) => o.l === 1);
    expect(pOrbitals).toHaveLength(2);
    // Each p orbital should have 1 electron (Hund's rule)
    expect(pOrbitals[0].electrons).toBe(1);
    expect(pOrbitals[1].electrons).toBe(1);
  });

  it("parses neon: 1s2 2s2 2p6", () => {
    const orbitals = parseElectronConfig("1s2 2s2 2p6");
    // 1s(2), 2s(2), 2p_-1(2), 2p_0(2), 2p_+1(2)
    expect(orbitals).toHaveLength(5);
    const pOrbitals = orbitals.filter((o) => o.l === 1);
    expect(pOrbitals).toHaveLength(3);
    pOrbitals.forEach((p) => expect(p.electrons).toBe(2));
  });

  it("handles d orbitals correctly", () => {
    const orbitals = parseElectronConfig("3d5");
    expect(orbitals).toHaveLength(5); // 5 d orbitals, each with 1 electron
    orbitals.forEach((o) => {
      expect(o.n).toBe(3);
      expect(o.l).toBe(2);
      expect(o.electrons).toBe(1);
    });
  });

  it("total electron count matches input", () => {
    const config = "1s2 2s2 2p6 3s2 3p6 4s2 3d10";
    const orbitals = parseElectronConfig(config);
    const totalElectrons = orbitals.reduce((sum, o) => sum + o.electrons, 0);
    expect(totalElectrons).toBe(30); // Zinc
  });
});

describe("validateQuantumNumbers", () => {
  it("accepts valid numbers", () => {
    expect(validateQuantumNumbers(1, 0, 0)).toBe(true);
    expect(validateQuantumNumbers(3, 2, -1)).toBe(true);
    expect(validateQuantumNumbers(4, 3, 3)).toBe(true);
  });

  it("rejects l >= n", () => {
    expect(validateQuantumNumbers(1, 1, 0)).toBe(false);
    expect(validateQuantumNumbers(2, 2, 0)).toBe(false);
  });

  it("rejects |m| > l", () => {
    expect(validateQuantumNumbers(3, 1, 2)).toBe(false);
    expect(validateQuantumNumbers(2, 0, 1)).toBe(false);
  });

  it("rejects n < 1", () => {
    expect(validateQuantumNumbers(0, 0, 0)).toBe(false);
  });
});

describe("constrainQuantumNumbers", () => {
  it("clamps l when n decreases", () => {
    const result = constrainQuantumNumbers(2, 3, 1);
    expect(result.l).toBe(1);
  });

  it("clamps m when l decreases", () => {
    const result = constrainQuantumNumbers(3, 1, 3);
    expect(result.m).toBe(1);
  });

  it("preserves valid numbers", () => {
    const result = constrainQuantumNumbers(3, 2, -1);
    expect(result).toEqual({ n: 3, l: 2, m: -1 });
  });
});

describe("getOrbitalName", () => {
  it("formats correctly", () => {
    expect(getOrbitalName(1, 0, 0)).toBe("1s (m=+0)");
    expect(getOrbitalName(2, 1, -1)).toBe("2p (m=-1)");
    expect(getOrbitalName(3, 2, 2)).toBe("3d (m=+2)");
  });
});

describe("getSubshellName", () => {
  it("formats correctly", () => {
    expect(getSubshellName(1, 0)).toBe("1s");
    expect(getSubshellName(3, 2)).toBe("3d");
    expect(getSubshellName(4, 3)).toBe("4f");
  });
});
