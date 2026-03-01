// Shared wavefunction math used by both JS engine and volume generator

const A0 = 1.0; // Bohr radius in atomic units

export function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function associatedLaguerre(k: number, alpha: number, rho: number): number {
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

export function associatedLegendre(l: number, m: number, x: number): number {
  const absM = Math.abs(m);
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

  let pm1m = x * (2 * absM + 1) * pmm;
  if (l === absM + 1) return pm1m;

  for (let ll = absM + 2; ll <= l; ll++) {
    const pll =
      ((2 * ll - 1) * x * pm1m - (ll + absM - 1) * pmm) / (ll - absM);
    pmm = pm1m;
    pm1m = pll;
  }
  return pm1m;
}

export function radialWaveFunction(n: number, l: number, r: number): number {
  const rho = (2.0 * r) / (n * A0);
  const k = n - l - 1;
  const alpha = 2 * l + 1;
  const laguerreVal = associatedLaguerre(k, alpha, rho);
  const norm =
    Math.pow(2.0 / (n * A0), 3) *
    (factorial(n - l - 1) / (2.0 * n * factorial(n + l)));
  return Math.sqrt(norm) * Math.exp(-rho / 2.0) * Math.pow(rho, l) * laguerreVal;
}

export function heatmapFire(value: number): [number, number, number] {
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

export { A0 };
