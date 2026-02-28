export interface OrbitalEngine {
  generateOrbital(
    n: number,
    l: number,
    m: number,
    count: number
  ): Float32Array;
  benchmark(n: number, l: number, m: number, count: number): number;
  name: string;
}

export type EngineType = "rust" | "cpp" | "js";
