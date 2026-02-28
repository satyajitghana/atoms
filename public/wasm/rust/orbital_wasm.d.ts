/* tslint:disable */
/* eslint-disable */

/**
 * Benchmark orbital generation and return time in milliseconds.
 *
 * Uses `js_sys::Date::now()` for timing in the WASM context.
 */
export function benchmark_generation(n: number, l: number, m: number, num_particles: number, seed: number): number;

/**
 * Generate orbital particle positions and colors.
 *
 * Returns interleaved [x, y, z, r, g, b, x, y, z, r, g, b, ...] (6 floats per particle).
 *
 * # Arguments
 * * `n` - Principal quantum number (n >= 1)
 * * `l` - Azimuthal quantum number (0 <= l < n)
 * * `m` - Magnetic quantum number (|m| <= l)
 * * `num_particles` - Number of particles to generate
 * * `seed` - Random seed for reproducibility
 */
export function generate_orbital(n: number, l: number, m: number, num_particles: number, seed: number): Float32Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly generate_orbital: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly benchmark_generation: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
