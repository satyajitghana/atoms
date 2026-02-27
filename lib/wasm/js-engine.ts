import type { OrbitalEngine } from "./orbital-engine";

// Pure JavaScript/TypeScript orbital generation engine
// Used as fallback when WASM is not available, and for comparison

const A0 = 1.0; // Bohr radius in atomic units

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function associatedLaguerre(k: number, alpha: number, rho: number): number {
  if (k === 0) return 1.0;
  let lm2 = 1.0;
  let lm1 = 1.0 + alpha - rho;
  if (k === 1) return lm1;
  let l = 0;
  for (let j = 2; j <= k; j++) {
    l = ((2 * j - 1 + alpha - rho) * lm1 - (j - 1 + alpha) * lm2) / j;
    lm2 = lm1;
    lm1 = l;
  }
  return l;
}

function associatedLegendre(l: number, m: number, x: number): number {
  const absM = Math.abs(m);
  // P_m^m
  let pmm = 1.0;
  if (absM > 0) {
    const somx2 = Math.sqrt((1.0 - x) * (1.0 + x));
    let fact = 1.0;
    for (let j = 1; j <= absM; j++) {
      pmm *= -fact * somx2;
      fact += 2.0;
    }
  }
  if (l === absM) return pmm;

  // P_{m+1}^m
  let pm1m = x * (2 * absM + 1) * pmm;
  if (l === absM + 1) return pm1m;

  // Recurrence
  for (let ll = absM + 2; ll <= l; ll++) {
    const pll =
      ((2 * ll - 1) * x * pm1m - (ll + absM - 1) * pmm) / (ll - absM);
    pmm = pm1m;
    pm1m = pll;
  }
  return pm1m;
}

function radialWaveFunction(n: number, l: number, r: number): number {
  const rho = (2.0 * r) / (n * A0);
  const k = n - l - 1;
  const alpha = 2 * l + 1;
  const laguerreVal = associatedLaguerre(k, alpha, rho);
  const norm =
    Math.pow(2.0 / (n * A0), 3) *
    (factorial(n - l - 1) / (2.0 * n * factorial(n + l)));
  return Math.sqrt(norm) * Math.exp(-rho / 2.0) * Math.pow(rho, l) * laguerreVal;
}

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
  // Binary search
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cdf[mid] < u) lo = mid + 1;
    else hi = mid;
  }
  return (lo / (cdf.length - 1)) * maxVal;
}

function heatmapFire(value: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));
  const colors: [number, number, number][] = [
    [0.0, 0.0, 0.0],
    [0.5, 0.0, 0.99],
    [0.8, 0.0, 0.0],
    [1.0, 0.5, 0.0],
    [1.0, 1.0, 0.0],
    [1.0, 1.0, 1.0],
  ];
  const scaled = v * (colors.length - 1);
  const i = Math.min(Math.floor(scaled), colors.length - 2);
  const t = scaled - i;
  return [
    colors[i][0] + t * (colors[i + 1][0] - colors[i][0]),
    colors[i][1] + t * (colors[i + 1][1] - colors[i][1]),
    colors[i][2] + t * (colors[i + 1][2] - colors[i][2]),
  ];
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

  // Output: 6 floats per particle [x, y, z, r, g, b]
  const result = new Float32Array(count * 6);
  const scaleFactor = 1.5 * Math.pow(5, n);

  for (let i = 0; i < count; i++) {
    const r = sampleCdf(radialCdf, rng(), rMax);
    const theta = sampleCdf(thetaCdf, rng(), Math.PI);
    const phi = 2.0 * Math.PI * rng();

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * Math.sin(theta) * Math.sin(phi);

    // Compute intensity for coloring
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
