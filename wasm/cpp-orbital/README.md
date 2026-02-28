# C++23 WASM Orbital Engine

Quantum orbital probability distribution generator compiled to WebAssembly via Emscripten. Extensively commented for educational purposes.

## What It Does

Same physics and output format as the Rust engine — generates interleaved `[x, y, z, r, g, b, ...]` particle data for visualizing hydrogen-like atomic orbitals. Designed as a comparison implementation to benchmark C++ vs Rust WASM performance.

## Physics

The source code (`src/orbital.cpp`) contains thorough inline documentation explaining:

- The Schrodinger equation and hydrogen atom wave function
- Associated Laguerre polynomial recurrence relations
- Associated Legendre polynomial computation
- CDF construction and inverse-transform sampling
- Spherical-to-Cartesian coordinate conversion
- Fire heatmap color mapping from probability density

Each section is annotated to serve as a learning resource for quantum mechanics computation.

## Building

```bash
# Requires Emscripten SDK
mkdir -p build && cd build
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
emmake make
cp orbital.js orbital.wasm ../../public/wasm/cpp/
```

## API (Emscripten Bindings)

```cpp
// Exported via EMSCRIPTEN_BINDINGS
float* generate_orbital(int n, int l, int m, int num_particles, unsigned int seed)
// Returns pointer to heap-allocated float array [x,y,z,r,g,b, ...] — caller must free

double benchmark_generation(int n, int l, int m, int num_particles, int iterations)
// Returns average time in milliseconds

void free_buffer(float* ptr)
// Frees heap memory allocated by generate_orbital
```

## C++23 Features Used

- `std::numbers::pi` for mathematical constants
- `constexpr` for compile-time computations
- Structured bindings and range-based constructs
- `<cmath>` functions with `std::` prefixes

## Binary Size

~28 KB `.wasm` — minimal runtime, no C++ standard library heap (uses Emscripten's allocator).
