import {
  A0,
  radialWaveFunction,
  associatedLegendre,
  heatmapFire,
} from "./wavefunction";

export interface VolumeData {
  density: Float32Array;
  colors: Float32Array;
  resolution: number;
  extent: number;
}

export function generateVolumeData(
  n: number,
  l: number,
  m: number,
  resolution: number = 64
): VolumeData {
  const absM = Math.abs(m);
  const extent = 5.0 * n * n * A0;
  const res = resolution;
  const totalVoxels = res * res * res;
  const density = new Float32Array(totalVoxels);
  const colors = new Float32Array(totalVoxels * 3);
  const step = (2 * extent) / (res - 1);

  let maxDensity = 0;

  // First pass: compute raw |psi|^2
  for (let iz = 0; iz < res; iz++) {
    const z = -extent + iz * step;
    for (let iy = 0; iy < res; iy++) {
      const y = -extent + iy * step;
      for (let ix = 0; ix < res; ix++) {
        const x = -extent + ix * step;
        const r = Math.sqrt(x * x + y * y + z * z);
        if (r < 1e-10) continue;

        const cosTheta = y / r; // y-up convention
        const R = radialWaveFunction(n, l, r);
        const P = associatedLegendre(l, absM, cosTheta);
        const psi2 = R * R * P * P;

        const idx = iz * res * res + iy * res + ix;
        density[idx] = psi2;
        if (psi2 > maxDensity) maxDensity = psi2;
      }
    }
  }

  // Second pass: normalize and compute colors
  if (maxDensity > 0) {
    const invMax = 1.0 / maxDensity;
    for (let i = 0; i < totalVoxels; i++) {
      density[i] *= invMax;
      const [cr, cg, cb] = heatmapFire(density[i]);
      colors[i * 3] = cr;
      colors[i * 3 + 1] = cg;
      colors[i * 3 + 2] = cb;
    }
  }

  return { density, colors, resolution: res, extent };
}
