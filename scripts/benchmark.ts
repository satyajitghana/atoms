/**
 * WASM Benchmark Script
 *
 * Compares JS, Rust WASM, and C++ WASM orbital generation performance.
 * Run with: npx tsx scripts/benchmark.ts
 *
 * Note: Rust and C++ WASM modules require a browser environment.
 * This script benchmarks the JS engine directly.
 * For WASM benchmarks, use the Playwright test or browser console.
 */

import { createJsEngine } from "../lib/wasm/js-engine";

const CONFIGS = [
  { n: 1, l: 0, m: 0, label: "1s" },
  { n: 2, l: 1, m: 0, label: "2p" },
  { n: 3, l: 2, m: 0, label: "3d" },
  { n: 4, l: 3, m: 0, label: "4f" },
];

const PARTICLE_COUNTS = [10000, 50000, 100000, 250000];

async function main() {
  const engine = createJsEngine();

  console.log("=== Quantum Orbital Generation Benchmark ===\n");
  console.log(`Engine: ${engine.name}\n`);

  for (const count of PARTICLE_COUNTS) {
    console.log(`--- ${(count / 1000).toFixed(0)}K particles ---`);

    for (const config of CONFIGS) {
      // Warm up
      engine.generateOrbital(config.n, config.l, config.m, 1000);

      // Benchmark (5 runs, take median)
      const times: number[] = [];
      for (let i = 0; i < 5; i++) {
        const t = engine.benchmark(config.n, config.l, config.m, count);
        times.push(t);
      }
      times.sort((a, b) => a - b);
      const median = times[2];
      const pPerMs = (count / median).toFixed(0);

      console.log(
        `  ${config.label.padEnd(4)} ${median.toFixed(1).padStart(8)}ms  (${pPerMs} particles/ms)`
      );
    }
    console.log();
  }
}

main().catch(console.error);
