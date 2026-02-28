#![allow(non_snake_case)]

use wasm_bindgen::prelude::*;
use std::f64::consts::PI;

// =============================================================================
// Constants
// =============================================================================

const A0: f64 = 1.0; // Bohr radius in atomic units
const RADIAL_BINS: usize = 4096;
const ANGULAR_BINS: usize = 2048;

// =============================================================================
// XorShift RNG (keeps binary small, no rand crate needed)
// =============================================================================

struct Xorshift {
    state: u64,
}

impl Xorshift {
    fn new(seed: u32) -> Self {
        // Ensure non-zero state
        let s = if seed == 0 { 0x12345678u64 } else { seed as u64 };
        Xorshift { state: s }
    }

    fn next_u64(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        x
    }

    /// Returns a f64 in [0, 1)
    fn next_f64(&mut self) -> f64 {
        (self.next_u64() & 0x001F_FFFF_FFFF_FFFF) as f64 / (1u64 << 53) as f64
    }
}

// =============================================================================
// Factorial and Gamma helpers (integer arguments only)
// =============================================================================

/// Computes n! as f64. For Gamma(n) = (n-1)! with integer n.
fn factorial(n: u64) -> f64 {
    if n <= 1 {
        return 1.0;
    }
    let mut result = 1.0f64;
    for i in 2..=n {
        result *= i as f64;
    }
    result
}

// =============================================================================
// Associated Laguerre Polynomial L_k^alpha(rho) via recurrence
// =============================================================================
//
// L_0^alpha(rho) = 1
// L_1^alpha(rho) = 1 + alpha - rho
// L_k^alpha(rho) = ((2k - 1 + alpha - rho) * L_{k-1} - (k - 1 + alpha) * L_{k-2}) / k
//

fn associated_laguerre(k: u32, alpha: f64, rho: f64) -> f64 {
    if k == 0 {
        return 1.0;
    }
    if k == 1 {
        return 1.0 + alpha - rho;
    }

    let mut l_prev2 = 1.0; // L_0
    let mut l_prev1 = 1.0 + alpha - rho; // L_1

    for i in 2..=k {
        let i_f = i as f64;
        let l_curr =
            ((2.0 * i_f - 1.0 + alpha - rho) * l_prev1 - (i_f - 1.0 + alpha) * l_prev2) / i_f;
        l_prev2 = l_prev1;
        l_prev1 = l_curr;
    }

    l_prev1
}

// =============================================================================
// Associated Legendre Polynomial P_l^m(x) via recurrence
// =============================================================================
//
// P_m^m(x)   = (-1)^m * (2m-1)!! * (1-x^2)^(m/2)
// P_{m+1}^m  = x * (2m+1) * P_m^m
// P_l^m      = ((2l-1)*x*P_{l-1}^m - (l+m-1)*P_{l-2}^m) / (l-m)
//
// We compute for m >= 0. The input m should be |m|.

fn associated_legendre(l: u32, m: u32, x: f64) -> f64 {
    // Start with P_m^m
    let mut pmm = 1.0f64;
    if m > 0 {
        let somx2 = (1.0 - x * x).max(0.0).sqrt();
        let mut fact = 1.0f64;
        for _i in 1..=m {
            pmm *= -fact * somx2;
            fact += 2.0;
        }
    }

    if l == m {
        return pmm;
    }

    // P_{m+1}^m = x * (2m+1) * P_m^m
    let pmm1 = x * (2.0 * m as f64 + 1.0) * pmm;

    if l == m + 1 {
        return pmm1;
    }

    // Recurrence for l > m+1
    let mut p_prev2 = pmm;
    let mut p_prev1 = pmm1;

    for ll in (m + 2)..=l {
        let ll_f = ll as f64;
        let m_f = m as f64;
        let p_curr =
            ((2.0 * ll_f - 1.0) * x * p_prev1 - (ll_f + m_f - 1.0) * p_prev2) / (ll_f - m_f);
        p_prev2 = p_prev1;
        p_prev1 = p_curr;
    }

    p_prev1
}

// =============================================================================
// Radial Wave Function R_nl(r)
// =============================================================================
//
// R_nl(r) = sqrt(norm) * exp(-rho/2) * rho^l * L_{n-l-1}^{2l+1}(rho)
//
// where:
//   rho  = 2r / (n * a0)
//   norm = (2/(n*a0))^3 * (n-l-1)! / (2n * (n+l)!)
//

fn radial_wave_function(n: u32, l: u32, r: f64) -> f64 {
    let n_f = n as f64;
    let l_f = l as f64;

    let rho = 2.0 * r / (n_f * A0);

    // Normalization: (2/(n*a0))^3 * Gamma(n-l) / (2n * Gamma(n+l+1))
    // Gamma(n-l) = (n-l-1)! and Gamma(n+l+1) = (n+l)!
    let num = (2.0 / (n_f * A0)).powi(3) * factorial((n - l - 1) as u64);
    let den = 2.0 * n_f * factorial((n + l) as u64);
    let norm = num / den;

    let laguerre_k = n - l - 1;
    let alpha = 2.0 * l_f + 1.0;
    let laguerre_val = associated_laguerre(laguerre_k, alpha, rho);

    norm.sqrt() * (-rho / 2.0).exp() * rho.powf(l_f) * laguerre_val
}

// =============================================================================
// CDF Building and Sampling
// =============================================================================

/// Build the radial CDF.
/// pdf(r) = r^2 * R_nl(r)^2
/// We integrate over r from 0 to r_max = 10 * n^2 (in Bohr radii).
fn build_radial_cdf(n: u32, l: u32) -> (Vec<f64>, Vec<f64>) {
    let r_max = 10.0 * (n as f64) * (n as f64);
    let dr = r_max / RADIAL_BINS as f64;

    let mut cdf = vec![0.0f64; RADIAL_BINS + 1];
    let mut r_vals = vec![0.0f64; RADIAL_BINS + 1];

    for i in 0..=RADIAL_BINS {
        let r = i as f64 * dr;
        r_vals[i] = r;

        if i > 0 {
            let r_mid = (r_vals[i - 1] + r) / 2.0;
            let R = radial_wave_function(n, l, r_mid);
            let pdf = r_mid * r_mid * R * R;
            cdf[i] = cdf[i - 1] + pdf * dr;
        }
    }

    // Normalize CDF to [0, 1]
    let total = cdf[RADIAL_BINS];
    if total > 0.0 {
        for val in cdf.iter_mut() {
            *val /= total;
        }
    }

    (r_vals, cdf)
}

/// Build the angular CDF for theta.
/// pdf(theta) = sin(theta) * P_l^|m|(cos(theta))^2
fn build_angular_cdf(l: u32, m_abs: u32) -> (Vec<f64>, Vec<f64>) {
    let dtheta = PI / ANGULAR_BINS as f64;

    let mut cdf = vec![0.0f64; ANGULAR_BINS + 1];
    let mut theta_vals = vec![0.0f64; ANGULAR_BINS + 1];

    for i in 0..=ANGULAR_BINS {
        let theta = i as f64 * dtheta;
        theta_vals[i] = theta;

        if i > 0 {
            let theta_mid = (theta_vals[i - 1] + theta) / 2.0;
            let cos_theta = theta_mid.cos();
            let plm = associated_legendre(l, m_abs, cos_theta);
            let pdf = theta_mid.sin() * plm * plm;
            cdf[i] = cdf[i - 1] + pdf * dtheta;
        }
    }

    // Normalize
    let total = cdf[ANGULAR_BINS];
    if total > 0.0 {
        for val in cdf.iter_mut() {
            *val /= total;
        }
    }

    (theta_vals, cdf)
}

/// Sample from a CDF using binary search (inverse CDF method).
fn sample_cdf(vals: &[f64], cdf: &[f64], u: f64) -> f64 {
    // Binary search for the interval where cdf[i-1] <= u < cdf[i]
    let mut lo = 0usize;
    let mut hi = cdf.len() - 1;

    while lo < hi {
        let mid = (lo + hi) / 2;
        if cdf[mid] < u {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    if lo == 0 {
        return vals[0];
    }

    // Linear interpolation within the bin
    let t = if (cdf[lo] - cdf[lo - 1]).abs() > 1e-30 {
        (u - cdf[lo - 1]) / (cdf[lo] - cdf[lo - 1])
    } else {
        0.5
    };

    vals[lo - 1] + t * (vals[lo] - vals[lo - 1])
}

// =============================================================================
// Fire Heatmap Color Mapping
// =============================================================================
//
// Color stops:
//   0.0 -> Black   (0, 0, 0)
//   0.2 -> Purple  (128, 0, 128)
//   0.4 -> Red     (255, 0, 0)
//   0.6 -> Orange  (255, 165, 0)
//   0.8 -> Yellow  (255, 255, 0)
//   1.0 -> White   (255, 255, 255)
//

struct ColorStop {
    t: f64,
    r: f64,
    g: f64,
    b: f64,
}

const COLOR_STOPS: [ColorStop; 6] = [
    ColorStop { t: 0.0, r: 0.0,   g: 0.0,   b: 0.0 },
    ColorStop { t: 0.2, r: 128.0, g: 0.0,   b: 128.0 },
    ColorStop { t: 0.4, r: 255.0, g: 0.0,   b: 0.0 },
    ColorStop { t: 0.6, r: 255.0, g: 165.0, b: 0.0 },
    ColorStop { t: 0.8, r: 255.0, g: 255.0, b: 0.0 },
    ColorStop { t: 1.0, r: 255.0, g: 255.0, b: 255.0 },
];

fn fire_heatmap(intensity: f64) -> (f32, f32, f32) {
    let t = intensity.clamp(0.0, 1.0);

    // Find the two bracketing color stops
    let mut idx = 0;
    for i in 1..COLOR_STOPS.len() {
        if COLOR_STOPS[i].t >= t {
            idx = i;
            break;
        }
    }

    if idx == 0 {
        idx = 1;
    }

    let c0 = &COLOR_STOPS[idx - 1];
    let c1 = &COLOR_STOPS[idx];

    let range = c1.t - c0.t;
    let frac = if range > 1e-12 {
        (t - c0.t) / range
    } else {
        0.0
    };

    let r = (c0.r + frac * (c1.r - c0.r)) / 255.0;
    let g = (c0.g + frac * (c1.g - c0.g)) / 255.0;
    let b = (c0.b + frac * (c1.b - c0.b)) / 255.0;

    (r as f32, g as f32, b as f32)
}

// =============================================================================
// Compute intensity at a point for coloring
// =============================================================================
//
// intensity = |R(r)|^2 * |P_l^m(cos(theta))|^2 * scale_factor
//

fn compute_intensity(n: u32, l: u32, m_abs: u32, r: f64, theta: f64, scale_factor: f64) -> f64 {
    let R = radial_wave_function(n, l, r);
    let cos_theta = theta.cos();
    let plm = associated_legendre(l, m_abs, cos_theta);

    R * R * plm * plm * scale_factor
}

// =============================================================================
// Determine a good scale factor for the intensity mapping
// =============================================================================
//
// We sample the wave function at many points to find a reasonable max intensity,
// then set scale_factor so that the peak maps to ~1.0 in the heatmap.

fn compute_scale_factor(n: u32, l: u32, m_abs: u32) -> f64 {
    let r_max = 10.0 * (n as f64) * (n as f64);
    let mut max_intensity = 0.0f64;

    // Sample radial direction
    let r_steps = 200;
    let theta_steps = 100;

    for ir in 1..=r_steps {
        let r = r_max * ir as f64 / r_steps as f64;
        let R = radial_wave_function(n, l, r);
        let r2_R2 = r * r * R * R;

        for ith in 0..=theta_steps {
            let theta = PI * ith as f64 / theta_steps as f64;
            let cos_theta = theta.cos();
            let plm = associated_legendre(l, m_abs, cos_theta);
            let val = r2_R2 * plm * plm;
            if val > max_intensity {
                max_intensity = val;
            }
        }
    }

    // We use a scale that maps the approximate peak to ~0.9
    // The r^2 factor was included in sampling to weight by where particles actually are,
    // but for coloring we use R^2 * P^2 (without r^2), so recompute properly.
    let mut max_raw = 0.0f64;

    for ir in 1..=r_steps {
        let r = r_max * ir as f64 / r_steps as f64;
        let R = radial_wave_function(n, l, r);

        for ith in 0..=theta_steps {
            let theta = PI * ith as f64 / theta_steps as f64;
            let cos_theta = theta.cos();
            let plm = associated_legendre(l, m_abs, cos_theta);
            let val = R * R * plm * plm;
            if val > max_raw {
                max_raw = val;
            }
        }
    }

    if max_raw > 1e-30 {
        0.9 / max_raw
    } else {
        1.0
    }
}

// =============================================================================
// Main orbital generation
// =============================================================================

fn generate_orbital_internal(
    n: u32,
    l: u32,
    m_abs: u32,
    num_particles: u32,
    seed: u32,
) -> Vec<f32> {
    let mut rng = Xorshift::new(seed);

    // Build CDFs
    let (r_vals, r_cdf) = build_radial_cdf(n, l);
    let (theta_vals, theta_cdf) = build_angular_cdf(l, m_abs);

    // Compute scale factor for coloring
    let scale_factor = compute_scale_factor(n, l, m_abs);

    // Generate particles
    let mut output = Vec::with_capacity(num_particles as usize * 6);

    for _ in 0..num_particles {
        // Sample r from radial CDF
        let u_r = rng.next_f64();
        let r = sample_cdf(&r_vals, &r_cdf, u_r);

        // Sample theta from angular CDF
        let u_theta = rng.next_f64();
        let theta = sample_cdf(&theta_vals, &theta_cdf, u_theta);

        // Sample phi uniformly in [0, 2*PI)
        let phi = rng.next_f64() * 2.0 * PI;

        // Spherical to cartesian
        let sin_theta = theta.sin();
        let cos_theta = theta.cos();
        let x = r * sin_theta * phi.cos();
        let y = r * cos_theta;
        let z = r * sin_theta * phi.sin();

        // Compute color intensity
        let intensity = compute_intensity(n, l, m_abs, r, theta, scale_factor);
        let (cr, cg, cb) = fire_heatmap(intensity);

        output.push(x as f32);
        output.push(y as f32);
        output.push(z as f32);
        output.push(cr);
        output.push(cg);
        output.push(cb);
    }

    output
}

// =============================================================================
// WASM Exported Functions
// =============================================================================

/// Generate orbital particle positions and colors.
///
/// Returns interleaved [x, y, z, r, g, b, x, y, z, r, g, b, ...] (6 floats per particle).
///
/// # Arguments
/// * `n` - Principal quantum number (n >= 1)
/// * `l` - Azimuthal quantum number (0 <= l < n)
/// * `m` - Magnetic quantum number (|m| <= l)
/// * `num_particles` - Number of particles to generate
/// * `seed` - Random seed for reproducibility
#[wasm_bindgen]
pub fn generate_orbital(n: u32, l: i32, m: i32, num_particles: u32, seed: u32) -> Vec<f32> {
    // Validate and clamp quantum numbers
    let n = if n < 1 { 1 } else { n };
    let l = l.unsigned_abs().min(n - 1);
    let m_abs = m.unsigned_abs().min(l);

    generate_orbital_internal(n, l, m_abs, num_particles, seed)
}

/// Benchmark orbital generation and return time in milliseconds.
///
/// Uses `js_sys::Date::now()` for timing in the WASM context.
#[wasm_bindgen]
pub fn benchmark_generation(n: u32, l: i32, m: i32, num_particles: u32, seed: u32) -> f64 {
    let start = js_sys::Date::now();

    let _result = generate_orbital(n, l, m, num_particles, seed);

    let end = js_sys::Date::now();
    end - start
}

// =============================================================================
// Tests (run with `cargo test`, not in WASM)
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_factorial() {
        assert_eq!(factorial(0), 1.0);
        assert_eq!(factorial(1), 1.0);
        assert_eq!(factorial(5), 120.0);
        assert_eq!(factorial(10), 3628800.0);
    }

    #[test]
    fn test_associated_laguerre() {
        // L_0^alpha(x) = 1 for any alpha, x
        assert!((associated_laguerre(0, 3.0, 5.0) - 1.0).abs() < 1e-12);

        // L_1^alpha(x) = 1 + alpha - x
        let alpha = 2.0;
        let rho = 3.0;
        let expected = 1.0 + alpha - rho;
        assert!((associated_laguerre(1, alpha, rho) - expected).abs() < 1e-12);
    }

    #[test]
    fn test_associated_legendre() {
        // P_0^0(x) = 1
        assert!((associated_legendre(0, 0, 0.5) - 1.0).abs() < 1e-12);

        // P_1^0(x) = x
        let x = 0.3;
        assert!((associated_legendre(1, 0, x) - x).abs() < 1e-12);

        // P_1^1(x) = -sqrt(1-x^2)
        let expected = -(1.0 - x * x).sqrt();
        assert!((associated_legendre(1, 1, x) - expected).abs() < 1e-10);
    }

    #[test]
    fn test_radial_wave_1s() {
        // For n=1, l=0 (1s orbital):
        // R_10(r) = 2 * exp(-r) (in atomic units)
        let r = 1.0;
        let R = radial_wave_function(1, 0, r);
        let expected = 2.0 * (-r).exp();
        assert!(
            (R - expected).abs() < 1e-10,
            "R_10({}) = {}, expected {}",
            r,
            R,
            expected
        );
    }

    #[test]
    fn test_xorshift_range() {
        let mut rng = Xorshift::new(42);
        for _ in 0..1000 {
            let val = rng.next_f64();
            assert!(val >= 0.0 && val < 1.0, "RNG value out of range: {}", val);
        }
    }

    #[test]
    fn test_fire_heatmap_boundaries() {
        let (r, g, b) = fire_heatmap(0.0);
        assert_eq!((r, g, b), (0.0, 0.0, 0.0)); // Black

        let (r, g, b) = fire_heatmap(1.0);
        assert_eq!((r, g, b), (1.0, 1.0, 1.0)); // White
    }

    #[test]
    fn test_generate_orbital_output_length() {
        let result = generate_orbital_internal(1, 0, 0, 100, 42);
        assert_eq!(result.len(), 600); // 100 particles * 6 floats
    }

    #[test]
    fn test_quantum_number_validation() {
        // These should not panic even with invalid quantum numbers
        let _ = generate_orbital(0, 0, 0, 10, 1); // n=0 gets clamped to 1
        let _ = generate_orbital(1, 5, 3, 10, 1); // l gets clamped to n-1=0
        let _ = generate_orbital(3, 2, -5, 10, 1); // m gets clamped to |m|<=l
    }
}
