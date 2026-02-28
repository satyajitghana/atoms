# Rust WASM Orbital Engine

Quantum orbital probability distribution generator compiled to WebAssembly via `wasm-pack`.

## What It Does

Generates 3D particle clouds representing hydrogen-like atomic orbitals. Given quantum numbers (n, l, m) and a particle count, it outputs an interleaved `Float32Array` of `[x, y, z, r, g, b, ...]` values where positions follow the |ψ|² probability distribution and colors use a fire heatmap.

## Physics

The engine solves the hydrogen atom wave function:

```
ψ(r, θ, φ) = R_nl(r) × Y_lm(θ, φ)
```

- **Radial part R(r)**: Associated Laguerre polynomials via stable recurrence
- **Angular part Y(θ,φ)**: Associated Legendre polynomials (real spherical harmonics)
- **Sampling**: CDF inverse-transform sampling (4096 radial bins, 2048 angular bins)
- **Color**: Fire heatmap based on local probability density |ψ|²

## Building

```bash
# Requires wasm-pack: cargo install wasm-pack
wasm-pack build --target web --out-dir ../../public/wasm/rust
```

## API

```rust
#[wasm_bindgen]
pub fn generate_orbital(n: u32, l: u32, m: i32, num_particles: u32, seed: u32) -> Vec<f32>
// Returns interleaved [x, y, z, r, g, b, ...] — 6 floats per particle

#[wasm_bindgen]
pub fn benchmark_generation(n: u32, l: u32, m: i32, num_particles: u32, iterations: u32) -> f64
// Returns average generation time in milliseconds
```

## Tests

```bash
wasm-pack test --node
```

8 unit tests covering: output dimensions, coordinate ranges, spherical symmetry of s orbitals, anisotropy of p orbitals, color value ranges, and scaling behavior.

## Binary Size

~41 KB `.wasm` — no external crate dependencies (custom XorShift RNG, manual polynomial evaluation).
