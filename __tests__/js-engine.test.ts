import { describe, it, expect } from "vitest";
import { createJsEngine } from "@/lib/wasm/js-engine";

describe("JS Orbital Engine", () => {
  const engine = createJsEngine();

  describe("generate_orbital", () => {
    it("returns correct number of floats (6 per particle)", () => {
      const data = engine.generateOrbital(1, 0, 0, 1000);
      expect(data.length).toBe(1000 * 6);
    });

    it("returns Float32Array", () => {
      const data = engine.generateOrbital(2, 1, 0, 100);
      expect(data).toBeInstanceOf(Float32Array);
    });

    it("produces valid coordinate ranges for 1s orbital", () => {
      const data = engine.generateOrbital(1, 0, 0, 10000);
      for (let i = 0; i < data.length; i += 6) {
        const x = data[i];
        const y = data[i + 1];
        const z = data[i + 2];
        const r = Math.sqrt(x * x + y * y + z * z);
        // 1s orbital: most particles within ~10 Bohr radii
        expect(r).toBeLessThan(50);
      }
    });

    it("1s orbital has spherically symmetric distribution", () => {
      const data = engine.generateOrbital(1, 0, 0, 20000);
      let sumX = 0, sumY = 0, sumZ = 0;
      const count = data.length / 6;
      for (let i = 0; i < data.length; i += 6) {
        sumX += data[i];
        sumY += data[i + 1];
        sumZ += data[i + 2];
      }
      // Mean position should be near origin for a symmetric orbital
      const meanX = sumX / count;
      const meanY = sumY / count;
      const meanZ = sumZ / count;
      expect(Math.abs(meanX)).toBeLessThan(1.0);
      expect(Math.abs(meanY)).toBeLessThan(1.0);
      expect(Math.abs(meanZ)).toBeLessThan(1.0);
    });

    it("2p orbital is elongated along y-axis (m=0)", () => {
      const data = engine.generateOrbital(2, 1, 0, 20000);
      let sumAbsY = 0, sumAbsX = 0;
      const count = data.length / 6;
      for (let i = 0; i < data.length; i += 6) {
        sumAbsX += Math.abs(data[i]);
        sumAbsY += Math.abs(data[i + 1]);
      }
      // For 2p m=0, the distribution is concentrated along the y-axis
      // (since y = r*cos(theta) and the angular part peaks at theta=0,pi)
      const meanAbsX = sumAbsX / count;
      const meanAbsY = sumAbsY / count;
      expect(meanAbsY).toBeGreaterThan(meanAbsX);
    });

    it("colors are in [0, 1] range", () => {
      const data = engine.generateOrbital(3, 2, 1, 5000);
      for (let i = 0; i < data.length; i += 6) {
        const r = data[i + 3];
        const g = data[i + 4];
        const b = data[i + 5];
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(1);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThanOrEqual(1);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(1);
      }
    });

    it("higher n produces larger orbital radius", () => {
      const data1s = engine.generateOrbital(1, 0, 0, 5000);
      const data3s = engine.generateOrbital(3, 0, 0, 5000);

      let avgR1 = 0, avgR3 = 0;
      const count = 5000;
      for (let i = 0; i < count * 6; i += 6) {
        avgR1 += Math.sqrt(
          data1s[i] ** 2 + data1s[i + 1] ** 2 + data1s[i + 2] ** 2
        );
        avgR3 += Math.sqrt(
          data3s[i] ** 2 + data3s[i + 1] ** 2 + data3s[i + 2] ** 2
        );
      }
      avgR1 /= count;
      avgR3 /= count;
      expect(avgR3).toBeGreaterThan(avgR1 * 2);
    });

    it("handles high quantum numbers without errors", () => {
      const data = engine.generateOrbital(5, 3, 2, 1000);
      expect(data.length).toBe(1000 * 6);
      // Check no NaN values
      for (let i = 0; i < data.length; i++) {
        expect(isNaN(data[i])).toBe(false);
      }
    });
  });

  describe("benchmark", () => {
    it("returns positive time in ms", () => {
      const time = engine.benchmark(2, 1, 0, 10000);
      expect(time).toBeGreaterThan(0);
    });
  });
});
