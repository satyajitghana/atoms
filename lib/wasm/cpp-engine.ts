import type { OrbitalEngine } from "./orbital-engine";

interface CppWasmExports {
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

let wasmModule: CppWasmExports | null = null;
let loadingPromise: Promise<CppWasmExports | null> | null = null;

async function loadCppWasm(): Promise<CppWasmExports | null> {
  if (wasmModule) return wasmModule;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch("/wasm/cpp/orbital.js");
      const text = await response.text();
      const blob = new Blob([text], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const mod = await import(/* webpackIgnore: true */ url);
      const instance = await mod.default({
        locateFile: (path: string) => `/wasm/cpp/${path}`,
      });
      URL.revokeObjectURL(url);

      wasmModule = {
        generate_orbital: (
          n: number,
          l: number,
          m: number,
          count: number,
          seed: number
        ) => {
          const ptr = instance._generate_orbital(n, l, m, count, seed);
          const size = count * 6;
          const result = new Float32Array(size);
          result.set(
            new Float32Array(instance.HEAPF32.buffer, ptr, size)
          );
          instance._free_buffer(ptr);
          return result;
        },
        benchmark_generation: (
          n: number,
          l: number,
          m: number,
          count: number,
          seed: number
        ) => {
          return instance._benchmark_generation(n, l, m, count, seed);
        },
      };
      return wasmModule;
    } catch (e) {
      console.warn("Failed to load C++ WASM module:", e);
      loadingPromise = null;
      return null;
    }
  })();

  return loadingPromise;
}

export async function createCppEngine(): Promise<OrbitalEngine | null> {
  const wasm = await loadCppWasm();
  if (!wasm) return null;

  return {
    name: "C++23 (WASM)",
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
