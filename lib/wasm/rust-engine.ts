import type { OrbitalEngine } from "./orbital-engine";

interface RustWasmExports {
  generate_orbital: (
    n: number,
    l: number,
    m: number,
    count: number,
    seed: number
  ) => Float32Array;
  benchmark_generation: (
    n: number,
    l: number,
    m: number,
    count: number,
    seed: number
  ) => number;
}

let wasmModule: RustWasmExports | null = null;
let loadingPromise: Promise<RustWasmExports | null> | null = null;

async function loadRustWasm(): Promise<RustWasmExports | null> {
  if (wasmModule) return wasmModule;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      // Fetch the JS glue code and evaluate it to avoid Turbopack import resolution
      const jsResponse = await fetch("/wasm/rust/orbital_wasm.js");
      const jsText = await jsResponse.text();
      const blob = new Blob([jsText], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const wasm = await import(/* webpackIgnore: true */ url);
      URL.revokeObjectURL(url);

      await wasm.default("/wasm/rust/orbital_wasm_bg.wasm");
      wasmModule = wasm;
      return wasm as RustWasmExports;
    } catch (e) {
      console.warn("Failed to load Rust WASM module:", e);
      loadingPromise = null;
      return null;
    }
  })();

  return loadingPromise;
}

export async function createRustEngine(): Promise<OrbitalEngine | null> {
  const wasm = await loadRustWasm();
  if (!wasm) return null;

  return {
    name: "Rust (WASM)",
    generateOrbital(n: number, l: number, m: number, count: number) {
      return wasm.generate_orbital(n, l, m, count, Date.now() & 0xffffffff);
    },
    benchmark(n: number, l: number, m: number, count: number) {
      return wasm.benchmark_generation(
        n,
        l,
        m,
        count,
        Date.now() & 0xffffffff
      );
    },
  };
}
