import type { OrbitalEngine } from "./orbital-engine";
import {
  A0,
  radialWaveFunction,
  associatedLegendre,
  heatmapFire,
} from "./wavefunction";

// Pure JavaScript/TypeScript orbital generation engine
// Used as fallback when WASM is not available, and for comparison

function buildRadialCdf(n: number, l: number): { cdf: Float64Array; rMax: number } {
  const bins = 4096;
  const rMax = 10.0 * n * n * A0;
  const dr = rMax / (bins - 1);
  const cdf = new Float64Array(bins);
  let sum = 0;

  for (let i = 0; i < bins; i++) {
    const r = i * dr;
    const R = radialWaveFunction(n, l, r);
    const pdf = r * r * R * R;
    sum += pdf;
    cdf[i] = sum;
  }
  for (let i = 0; i < bins; i++) cdf[i] /= sum;
  return { cdf, rMax };
}

function buildThetaCdf(l: number, m: number): Float64Array {
  const bins = 2048;
  const dTheta = Math.PI / (bins - 1);
  const cdf = new Float64Array(bins);
  let sum = 0;

  for (let i = 0; i < bins; i++) {
    const theta = i * dTheta;
    const plm = associatedLegendre(l, m, Math.cos(theta));
    const pdf = Math.sin(theta) * plm * plm;
    sum += pdf;
    cdf[i] = sum;
  }
  for (let i = 0; i < bins; i++) cdf[i] /= sum;
  return cdf;
}

function sampleCdf(cdf: Float64Array, u: number, maxVal: number): number {
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cdf[mid] < u) lo = mid + 1;
    else hi = mid;
  }
  return (lo / (cdf.length - 1)) * maxVal;
}

// Simple seeded RNG (xorshift32)
function createRng(seed: number) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4294967296);
  };
}

function generateOrbitalData(
  n: number,
  l: number,
  m: number,
  count: number
): Float32Array {
  const rng = createRng(Date.now());
  const absM = Math.abs(m);

  const { cdf: radialCdf, rMax } = buildRadialCdf(n, l);
  const thetaCdf = buildThetaCdf(l, absM);

  const result = new Float32Array(count * 6);
  const scaleFactor = 1.5 * Math.pow(5, n);

  for (let i = 0; i < count; i++) {
    const r = sampleCdf(radialCdf, rng(), rMax);
    const theta = sampleCdf(thetaCdf, rng(), Math.PI);
    const phi = 2.0 * Math.PI * rng();

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * Math.sin(theta) * Math.sin(phi);

    const R = radialWaveFunction(n, l, r);
    const plm = associatedLegendre(l, absM, Math.cos(theta));
    const intensity = Math.min(1.0, R * R * plm * plm * scaleFactor);
    const [cr, cg, cb] = heatmapFire(intensity);

    const idx = i * 6;
    result[idx] = x;
    result[idx + 1] = y;
    result[idx + 2] = z;
    result[idx + 3] = cr;
    result[idx + 4] = cg;
    result[idx + 5] = cb;
  }

  return result;
}

export function createJsEngine(): OrbitalEngine {
  return {
    name: "JavaScript",
    generateOrbital(n: number, l: number, m: number, count: number) {
      return generateOrbitalData(n, l, m, count);
    },
    benchmark(n: number, l: number, m: number, count: number) {
      const start = performance.now();
      generateOrbitalData(n, l, m, count);
      return performance.now() - start;
    },
  };
}
