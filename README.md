<p align="center">
  <img src="public/icon-512.png" alt="Quantum Orbitals" width="120" height="120" />
</p>

<h1 align="center">Quantum Orbital Visualizer</h1>

<p align="center">
  Interactive 3D visualization of atomic electron orbitals powered by WebAssembly
</p>

<p align="center">
  <a href="https://atoms.thesatyajit.com"><img src="https://img.shields.io/badge/demo-atoms.thesatyajit.com-00d4ff?style=flat-square" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-black?style=flat-square&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Rust-WASM-dea584?style=flat-square&logo=rust" alt="Rust WASM" />
  <img src="https://img.shields.io/badge/C%2B%2B23-WASM-00599C?style=flat-square&logo=cplusplus" alt="C++23 WASM" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/Zustand-State-443a2e?style=flat-square" alt="Zustand" />
</p>

<p align="center">
  <img src="public/og.png" alt="Quantum Orbital Visualizer Screenshot" width="100%" />
</p>

---

Explore the quantum world through real-time particle simulations of hydrogen-like atomic orbitals. Each visualization represents the probability density |ψ|² of an electron's position, computed from the exact solutions to the Schrodinger equation and rendered as hundreds of thousands of glowing particles.

<p align="center">
  <img src="public/orbital-grid.png" alt="Orbital Gallery" width="100%" />
</p>

## Features

**Orbital Visualizer** — Full interactive control over quantum numbers (n, l, m), particle count (10K-500K), point size, compute backend, and camera. Watch probability clouds morph in real time as you adjust parameters.

**Element Explorer** — Interactive periodic table with all 118 elements. Click any element to see its electron configuration parsed into individual orbitals, then visualize each one.

**Dual WASM Backends** — Switch between JavaScript, Rust WASM (~41KB), and C++23 WASM (~28KB) compute engines at runtime. Same physics, different implementations — useful for benchmarking and comparison.

**Physically Accurate** — Uses exact hydrogen atom wave functions: associated Laguerre polynomials for the radial part, associated Legendre polynomials for the angular part, and CDF inverse-transform sampling to generate particles that faithfully reproduce orbital shapes.

**Fire Heatmap Coloring** — Particles are colored based on local probability density: black → purple → red → orange → yellow → white. Higher density regions glow brighter with bloom post-processing.

**Responsive Design** — Works on desktop, tablet, and mobile. Controls adapt to screen size with a slide-up panel on small screens.

## How It Works

The hydrogen atom wave function in spherical coordinates:

```
ψ_nlm(r, θ, φ) = R_nl(r) × Y_lm(θ, φ)
```

1. **Build CDFs** — Compute cumulative distribution functions from the radial probability density `r²|R(r)|²` (4096 bins) and angular probability density `sin(θ)|Y(θ)|²` (2048 bins)
2. **Inverse-Transform Sample** — Draw uniform random numbers and map through the CDFs to get physically distributed (r, θ, φ) coordinates
3. **Color by Density** — Evaluate |ψ|² at each sample point and map to a fire heatmap color
4. **GPU Render** — Send positions and colors to WebGL as point particles with custom shaders, additive blending, and bloom post-processing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, shadcn/ui, Tailwind CSS v4 |
| 3D | Three.js, react-three-fiber, @react-three/postprocessing |
| State | Zustand |
| Physics (Rust) | wasm-pack → WebAssembly (~41KB) |
| Physics (C++) | C++23, Emscripten → WebAssembly (~28KB) |
| Physics (JS) | TypeScript fallback engine |
| Fonts | Geist Sans & Mono |
| Testing | Vitest (24 tests), Playwright (visual) |

## Project Structure

```
atoms/
├── app/                    # Next.js pages (home, visualizer, elements, about)
├── components/
│   ├── controls/           # Quantum number, particle, engine controls
│   ├── layout/             # Header with responsive nav
│   ├── periodic-table/     # Interactive periodic table (118 elements)
│   ├── three/              # R3F scene, points, postprocessing, controls
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── chemistry/          # Electron config parser, quantum number utils
│   ├── data/               # Element data (118 elements)
│   ├── hooks/              # useOrbitalEngine, useOrbitalData
│   ├── stores/             # Zustand stores (visualizer, elements)
│   └── wasm/               # Engine interfaces, JS/Rust/C++ loaders
├── wasm/
│   ├── rust-orbital/       # Rust WASM source
│   └── cpp-orbital/        # C++23 WASM source (educational comments)
├── public/wasm/            # Compiled WASM binaries
├── scripts/                # Benchmark & visual test scripts
└── __tests__/              # Vitest unit tests
```

## Credits

Inspired by [kavan010/Atoms](https://github.com/kavan010/Atoms) — a C++ OpenGL desktop application for hydrogen quantum orbital visualization.

## License

MIT
