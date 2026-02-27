// =============================================================================
// orbital.cpp — Quantum Orbital Physics Simulation (C++23, Emscripten/WASM)
// =============================================================================
//
// This module generates 3D particle distributions that visualize hydrogen-like
// atomic orbitals. Each orbital is defined by three quantum numbers (n, l, m)
// and the module produces a point cloud where particle density matches the
// quantum mechanical probability distribution |Ψ(r,θ,φ)|².
//
// PHYSICS BACKGROUND:
// -------------------
// The hydrogen atom wavefunction in spherical coordinates is:
//
//   Ψ_nlm(r, θ, φ) = R_nl(r) · Y_lm(θ, φ)
//
// where:
//   - R_nl(r) is the radial wave function
//   - Y_lm(θ, φ) is a spherical harmonic
//   - n = principal quantum number (1, 2, 3, ...) — determines energy/size
//   - l = azimuthal quantum number (0, 1, ..., n-1) — determines shape
//   - m = magnetic quantum number (-l, ..., 0, ..., +l) — determines orientation
//
// The probability of finding the electron at position (r, θ, φ) is:
//   P(r, θ, φ) dV = |Ψ|² r² sin(θ) dr dθ dφ
//
// We separate this into independent radial and angular parts, build cumulative
// distribution functions (CDFs) for each, and use inverse CDF sampling to
// generate particle positions that faithfully reproduce the orbital shapes.
//
// IMPLEMENTATION APPROACH:
// -----------------------
// 1. Build a radial CDF from P_radial(r) = r² |R_nl(r)|²
// 2. Build an angular CDF from P_angular(θ) = sin(θ) |P_l^|m|(cos θ)|²
// 3. Sample φ uniformly on [0, 2π) (azimuthal symmetry for real orbitals)
// 4. Convert (r, θ, φ) to Cartesian (x, y, z)
// 5. Color each particle using |Ψ|² mapped through a fire heatmap
//
// C++23 FEATURES USED:
// --------------------
// - constexpr for compile-time constants and functions
// - std::array with structured bindings
// - Abbreviated function templates (auto parameters)
// - std::ranges for cleaner iteration
// - <numbers> for mathematical constants
// - [[nodiscard]] attributes for safety
//
// =============================================================================

#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <array>
#include <algorithm>
#include <numbers>
#include <span>

// Emscripten macro that prevents the linker from stripping a function,
// ensuring it remains callable from JavaScript.
#include <emscripten/emscripten.h>

// =============================================================================
// Physical and Numerical Constants
// =============================================================================

// The Bohr radius (a₀) is the most probable distance of the electron from
// the nucleus in the ground state of hydrogen. We work in "atomic units"
// where a₀ = 1, which simplifies all formulas (no unit conversions needed).
constexpr double A0 = 1.0;

// Pi from the C++20 <numbers> header — more precise than hand-typing.
constexpr double PI = std::numbers::pi;

// Number of bins for the radial CDF. More bins = smoother sampling but
// more memory and setup time. 4096 provides excellent accuracy for orbitals
// up to about n=7 without excessive cost.
constexpr int RADIAL_BINS = 4096;

// Number of bins for the angular (polar/theta) CDF. The angular distribution
// varies more gently than the radial one, so 2048 bins is sufficient.
constexpr int ANGULAR_BINS = 2048;

// =============================================================================
// XorShift64 Pseudo-Random Number Generator
// =============================================================================
//
// We use a simple XorShift64 PRNG instead of <random> to keep the WASM binary
// small and deterministic. XorShift has a period of 2^64 - 1 and passes most
// statistical tests for our purposes (Monte Carlo sampling).
//
// The algorithm applies three XOR-shift operations that mix the bits:
//   x ^= x << 13   (shift left and XOR — spreads low bits up)
//   x ^= x >> 7    (shift right and XOR — spreads high bits down)
//   x ^= x << 17   (shift left and XOR — further mixing)
//
// This specific triplet (13, 7, 17) is one of the well-known full-period
// parameter sets identified by Marsaglia (2003).
//
// IMPORTANT: The state must never be zero, as that would make the generator
// permanently stuck at zero (0 XOR anything_shifted = 0).
//
class XorShift {
    uint64_t state_;

public:
    // Construct with a seed. If the seed is zero, use a non-zero default
    // to avoid the degenerate all-zeros fixed point.
    constexpr explicit XorShift(uint32_t seed) noexcept
        : state_(seed != 0 ? static_cast<uint64_t>(seed) : 0x12345678ULL)
    {}

    // Generate the next 64-bit pseudo-random integer.
    // Each call advances the internal state irreversibly.
    constexpr uint64_t next_u64() noexcept {
        uint64_t x = state_;
        x ^= x << 13;  // Step 1: mix by shifting left 13 bits
        x ^= x >> 7;   // Step 2: mix by shifting right 7 bits
        x ^= x << 17;  // Step 3: mix by shifting left 17 bits
        state_ = x;
        return x;
    }

    // Generate a double-precision float uniformly distributed in [0, 1).
    //
    // We take the lower 53 bits of the 64-bit output (since a double has
    // 53 bits of mantissa precision) and divide by 2^53 to normalize.
    // This gives us the maximum possible resolution in [0, 1).
    constexpr double next_f64() noexcept {
        // Mask to extract exactly 53 bits (the mantissa width of IEEE 754 double)
        constexpr uint64_t MANTISSA_MASK = 0x001FFFFFFFFFFFFFULL;  // 2^53 - 1
        constexpr double NORM = static_cast<double>(1ULL << 53);   // 2^53
        return static_cast<double>(next_u64() & MANTISSA_MASK) / NORM;
    }
};

// =============================================================================
// Factorial Function
// =============================================================================
//
// Computes n! (n factorial) as a double-precision float.
//
// In quantum mechanics, factorials appear in the normalization constants of
// wave functions. For example, the radial normalization involves:
//   sqrt( (2/(n·a₀))³ · (n-l-1)! / (2n · (n+l)!) )
//
// We use double rather than integer to avoid overflow for large n.
// For n ≤ 170, double can represent n! exactly or with negligible error.
// Beyond that, we'd need extended precision, but atomic orbitals rarely
// need n > 7 in practice.
//
// Parameters:
//   n — the non-negative integer whose factorial we compute
//
// Returns:
//   n! as a double-precision floating point number
//
[[nodiscard]] constexpr double factorial(uint64_t n) noexcept {
    if (n <= 1) return 1.0;
    double result = 1.0;
    for (uint64_t i = 2; i <= n; ++i) {
        result *= static_cast<double>(i);
    }
    return result;
}

// =============================================================================
// Associated Laguerre Polynomial L_k^α(ρ)
// =============================================================================
//
// The associated Laguerre polynomials appear in the radial part of the
// hydrogen wave function. They describe the oscillatory behavior of the
// radial probability distribution — the number of radial nodes equals k.
//
// MATHEMATICAL DEFINITION:
// The associated (generalized) Laguerre polynomial L_k^α(ρ) can be defined
// via Rodrigues' formula or through the following recurrence relation, which
// is numerically stable and efficient for computation:
//
//   L_0^α(ρ) = 1                                               (base case)
//   L_1^α(ρ) = 1 + α - ρ                                       (base case)
//   L_k^α(ρ) = [(2k - 1 + α - ρ) · L_{k-1}^α(ρ)              (recurrence)
//               - (k - 1 + α) · L_{k-2}^α(ρ)] / k
//
// PHYSICAL MEANING:
// In the hydrogen atom, the radial wave function uses:
//   k     = n - l - 1   (number of radial nodes)
//   α     = 2l + 1      (related to the angular momentum quantum number)
//   ρ     = 2r/(n·a₀)   (dimensionless radial coordinate)
//
// The polynomial determines WHERE the radial probability has peaks and zeros.
// For example, the 2s orbital (n=2, l=0) has k=1 radial node, while
// 3s (n=3, l=0) has k=2 radial nodes.
//
// WHY RECURRENCE?
// Direct computation via the power series is numerically unstable for large k
// due to alternating signs and catastrophic cancellation. The three-term
// recurrence is more stable and avoids computing large binomial coefficients.
//
// Parameters:
//   k     — polynomial degree (= n - l - 1 for hydrogen orbitals)
//   alpha — generalized order (= 2l + 1 for hydrogen orbitals)
//   rho   — evaluation point (= 2r / (n·a₀), the scaled radial coordinate)
//
// Returns:
//   The value L_k^α(ρ) at the given point
//
[[nodiscard]] constexpr double associated_laguerre(uint32_t k, double alpha, double rho) noexcept {
    // Base case: L_0^α(ρ) = 1 for all α and ρ.
    // Physically: with zero radial nodes, the polynomial is just a constant.
    if (k == 0) return 1.0;

    // Base case: L_1^α(ρ) = 1 + α - ρ.
    // This is a linear function that crosses zero at ρ = 1 + α,
    // giving the single radial node for k=1.
    if (k == 1) return 1.0 + alpha - rho;

    // For k ≥ 2, use the three-term recurrence relation.
    // We keep track of only the two most recent values (sliding window),
    // which uses O(1) memory regardless of k.
    double L_prev2 = 1.0;                // L_0^α(ρ)
    double L_prev1 = 1.0 + alpha - rho;  // L_1^α(ρ)

    for (uint32_t i = 2; i <= k; ++i) {
        double i_f = static_cast<double>(i);
        // The recurrence: each new value is a weighted combination of the
        // two previous values, with coefficients that depend on i, α, and ρ.
        double L_curr = ((2.0 * i_f - 1.0 + alpha - rho) * L_prev1
                         - (i_f - 1.0 + alpha) * L_prev2) / i_f;
        L_prev2 = L_prev1;
        L_prev1 = L_curr;
    }

    return L_prev1;
}

// =============================================================================
// Associated Legendre Polynomial P_l^m(x)
// =============================================================================
//
// The associated Legendre polynomials describe the polar (θ) dependence of
// spherical harmonics and thus the angular shape of atomic orbitals.
//
// MATHEMATICAL DEFINITION:
// P_l^m(x) where x = cos(θ), computed via recurrence:
//
//   Step 1 — Compute P_m^m (the "diagonal" starting value):
//     P_m^m(x) = (-1)^m · (2m-1)!! · (1-x²)^(m/2)
//
//     This is built iteratively: start with P_0^0 = 1, then for each
//     increment of m, multiply by -factor · sin(θ), where factor = 1, 3, 5, ...
//     (the odd numbers, i.e., the double factorial).
//
//   Step 2 — Step up one degree:
//     P_{m+1}^m(x) = x · (2m+1) · P_m^m(x)
//
//   Step 3 — Recurrence for l > m+1:
//     P_l^m(x) = [(2l-1)·x·P_{l-1}^m(x) - (l+m-1)·P_{l-2}^m(x)] / (l-m)
//
// PHYSICAL MEANING:
// The value of |P_l^m(cos θ)|² determines the angular probability distribution:
// - l=0, m=0 (s orbitals): spherically symmetric, P_0^0 = 1
// - l=1, m=0 (p_z): P_1^0 = cos θ → two lobes along z-axis
// - l=1, m=1 (p_x/p_y): P_1^1 = -sin θ → torus in the xy-plane
// - Higher l,m create more complex multi-lobed patterns
//
// IMPORTANT: This function expects m ≥ 0. The caller should pass |m|.
// For negative m, the Condon-Shortley phase convention gives:
//   P_l^{-m} = (-1)^m · (l-m)!/(l+m)! · P_l^m
// but since we only need |P_l^m|² for probability densities, we can ignore
// the sign and just use |m|.
//
// Parameters:
//   l — degree (azimuthal quantum number, l ≥ 0)
//   m — order (|magnetic quantum number|, 0 ≤ m ≤ l)
//   x — evaluation point = cos(θ), where θ is the polar angle, so x ∈ [-1, 1]
//
// Returns:
//   P_l^m(x), the associated Legendre polynomial value
//
[[nodiscard]] constexpr double associated_legendre(uint32_t l, uint32_t m, double x) noexcept {
    // -------------------------------------------------------------------------
    // Step 1: Compute P_m^m(x) — the "seed" value on the diagonal
    // -------------------------------------------------------------------------
    //
    // We build this iteratively using the identity:
    //   P_m^m(x) = (-1)^m · (2m-1)!! · (1 - x²)^(m/2)
    //
    // But instead of computing the double factorial and the power separately,
    // we accumulate the product step by step:
    //   Start: pmm = 1 (= P_0^0)
    //   For each i from 1 to m:
    //     pmm *= -fact * sqrt(1 - x²)    where fact = 1, 3, 5, 7, ... = (2i-1)
    //
    // The (-1) at each step gives the Condon-Shortley phase (-1)^m.
    // The sqrt(1-x²) = sin(θ) factor gives (sin θ)^m.
    // The accumulating odd numbers give (2m-1)!!
    //
    double pmm = 1.0;
    if (m > 0) {
        // sin(θ) = sqrt(1 - cos²θ), clamped to avoid sqrt of negative due to
        // floating-point round-off when |x| is very close to 1.
        double somx2 = std::sqrt(std::max(0.0, 1.0 - x * x));
        double fact = 1.0;  // Will take values 1, 3, 5, 7, ... (double factorial)
        for (uint32_t i = 1; i <= m; ++i) {
            pmm *= -fact * somx2;  // Each step: multiply by -(2i-1) * sin(θ)
            fact += 2.0;           // Next odd number: 1 -> 3 -> 5 -> ...
        }
    }

    // If l == m, we already have our answer: P_m^m(x).
    if (l == m) return pmm;

    // -------------------------------------------------------------------------
    // Step 2: Compute P_{m+1}^m(x) — one step above the diagonal
    // -------------------------------------------------------------------------
    //
    // This uses the identity:
    //   P_{m+1}^m(x) = x · (2m + 1) · P_m^m(x)
    //
    double pmm1 = x * (2.0 * static_cast<double>(m) + 1.0) * pmm;

    // If l == m+1, this is our answer.
    if (l == m + 1) return pmm1;

    // -------------------------------------------------------------------------
    // Step 3: Recurrence for l > m + 1
    // -------------------------------------------------------------------------
    //
    // P_l^m(x) = [(2l-1)·x·P_{l-1}^m - (l+m-1)·P_{l-2}^m] / (l - m)
    //
    // This three-term recurrence steps from degree m+1 up to the desired l.
    // Each step requires only the two previous values (sliding window).
    //
    double p_prev2 = pmm;   // P_{l-2}^m, starting at P_m^m
    double p_prev1 = pmm1;  // P_{l-1}^m, starting at P_{m+1}^m

    for (uint32_t ll = m + 2; ll <= l; ++ll) {
        double ll_f = static_cast<double>(ll);
        double m_f  = static_cast<double>(m);
        double p_curr = ((2.0 * ll_f - 1.0) * x * p_prev1
                         - (ll_f + m_f - 1.0) * p_prev2) / (ll_f - m_f);
        p_prev2 = p_prev1;
        p_prev1 = p_curr;
    }

    return p_prev1;
}

// =============================================================================
// Radial Wave Function R_nl(r)
// =============================================================================
//
// The radial wave function describes how the electron's probability amplitude
// varies with distance from the nucleus. It determines the SIZE and RADIAL
// STRUCTURE of the orbital.
//
// FORMULA:
//   R_nl(r) = sqrt(norm) · exp(-ρ/2) · ρ^l · L_{n-l-1}^{2l+1}(ρ)
//
// where:
//   ρ = 2r / (n · a₀)          — dimensionless scaled radial coordinate
//   norm = (2/(n·a₀))³ · (n-l-1)! / (2n · (n+l)!)   — normalization constant
//
// COMPONENT BREAKDOWN:
//
// 1. exp(-ρ/2) — Exponential decay
//    Ensures the wave function goes to zero as r → ∞ (bound state).
//    The electron is exponentially unlikely to be found very far from the nucleus.
//
// 2. ρ^l — Centrifugal factor
//    For l > 0, forces R(0) = 0, meaning there is zero probability of finding
//    the electron at the nucleus. Higher l = stronger suppression near r = 0.
//    This reflects the angular momentum barrier: an orbiting electron cannot
//    be at the exact center.
//
// 3. L_{n-l-1}^{2l+1}(ρ) — Laguerre polynomial
//    Creates the radial nodes (zeros of R). The number of radial nodes is
//    n - l - 1. For example:
//      1s (n=1, l=0): 0 nodes
//      2s (n=2, l=0): 1 node
//      3d (n=3, l=2): 0 nodes
//
// 4. sqrt(norm) — Normalization
//    Ensures ∫₀^∞ |R_nl(r)|² r² dr = 1 (total probability = 1 in radial part)
//
// Parameters:
//   n — principal quantum number (n ≥ 1)
//   l — azimuthal quantum number (0 ≤ l < n)
//   r — radial distance from the nucleus in Bohr radii
//
// Returns:
//   R_nl(r), the radial wave function value at distance r
//
[[nodiscard]] double radial_wave_function(uint32_t n, uint32_t l, double r) noexcept {
    double n_f = static_cast<double>(n);
    double l_f = static_cast<double>(l);

    // ρ = 2r/(n·a₀): the "natural" radial coordinate for the n-th shell.
    // Dividing by n·a₀ scales the coordinate so that the orbital fits
    // naturally into the [0, ~4] range regardless of n.
    double rho = 2.0 * r / (n_f * A0);

    // -------------------------------------------------------------------------
    // Normalization constant
    // -------------------------------------------------------------------------
    //
    // norm = (2/(n·a₀))³ · (n-l-1)! / (2n · (n+l)!)
    //
    // This comes from requiring ∫₀^∞ |R_nl(r)|² r² dr = 1.
    // The (2/(n·a₀))³ factor accounts for the coordinate scaling,
    // and the factorials arise from the orthogonality of Laguerre polynomials.
    //
    double numerator   = std::pow(2.0 / (n_f * A0), 3.0) * factorial(static_cast<uint64_t>(n - l - 1));
    double denominator = 2.0 * n_f * factorial(static_cast<uint64_t>(n + l));
    double norm = numerator / denominator;

    // The Laguerre polynomial indices for the hydrogen atom:
    //   degree k = n - l - 1  (number of radial nodes)
    //   order  α = 2l + 1     (from the angular momentum coupling)
    uint32_t laguerre_k = n - l - 1;
    double alpha = 2.0 * l_f + 1.0;
    double laguerre_val = associated_laguerre(laguerre_k, alpha, rho);

    // Assemble R_nl(r) = sqrt(norm) * exp(-ρ/2) * ρ^l * L_{n-l-1}^{2l+1}(ρ)
    return std::sqrt(norm) * std::exp(-rho / 2.0) * std::pow(rho, l_f) * laguerre_val;
}

// =============================================================================
// Cumulative Distribution Function (CDF) Building and Sampling
// =============================================================================
//
// To generate particles distributed according to the quantum probability
// density, we use the INVERSE CDF METHOD (also called inverse transform
// sampling). The idea:
//
// 1. Build a CDF: CDF(x) = ∫₀^x pdf(x') dx'   (cumulative probability)
// 2. To sample, draw u ~ Uniform(0,1) and find x such that CDF(x) = u
//
// This works because if CDF(X) ~ Uniform(0,1) then X ~ pdf.
// It's exact in the continuous limit, and with enough bins, the discrete
// approximation is excellent.
//

// A simple struct to hold a CDF and its corresponding coordinate values.
// Using std::vector because the size depends on the number of bins.
struct CdfData {
    std::vector<double> values;  // The coordinate values (r or θ at each bin edge)
    std::vector<double> cdf;     // The cumulative probability at each bin edge
};

// =============================================================================
// Build Radial CDF
// =============================================================================
//
// Constructs the cumulative distribution function for the radial coordinate.
//
// The radial probability density (the probability of finding the electron
// between r and r+dr, regardless of angle) is:
//
//   P_radial(r) dr = |R_nl(r)|² · r² dr
//
// The r² factor comes from the spherical volume element dV = r² sin(θ) dr dθ dφ.
// It means that even though the wave function amplitude is highest near
// the nucleus (for s orbitals), the PROBABILITY peaks further out because
// there's more "volume" at larger r (surface area of a sphere = 4πr²).
//
// We integrate this numerically using the midpoint rule over [0, r_max],
// where r_max = 10·n² Bohr radii — far enough to capture essentially all
// the probability for any orbital up to the n-th shell.
//
// Parameters:
//   n — principal quantum number
//   l — azimuthal quantum number
//
// Returns:
//   CdfData containing bin-edge radii and their cumulative probabilities
//
[[nodiscard]] CdfData build_radial_cdf(uint32_t n, uint32_t l) {
    // r_max = 10·n²: the maximum radius to consider.
    // The most probable radius scales as ~n², and 10× that captures
    // the exponential tail with negligible truncation error.
    double r_max = 10.0 * static_cast<double>(n) * static_cast<double>(n);
    double dr = r_max / static_cast<double>(RADIAL_BINS);

    CdfData data;
    data.values.resize(RADIAL_BINS + 1);
    data.cdf.resize(RADIAL_BINS + 1);

    // First bin edge starts at r = 0 with CDF = 0
    data.values[0] = 0.0;
    data.cdf[0] = 0.0;

    // Numerically integrate the radial PDF using the midpoint rule.
    // For each bin [r_i, r_{i+1}], evaluate the PDF at the midpoint
    // and add the contribution pdf(r_mid) * dr to the running CDF sum.
    for (int i = 1; i <= RADIAL_BINS; ++i) {
        double r = static_cast<double>(i) * dr;
        data.values[i] = r;

        // Midpoint of this bin for more accurate integration
        double r_mid = (data.values[i - 1] + r) / 2.0;

        // Evaluate the radial wave function at the midpoint
        double R = radial_wave_function(n, l, r_mid);

        // The radial probability density: P(r) = r² · |R_nl(r)|²
        // This is the probability per unit radius of finding the electron
        // at distance r from the nucleus.
        double pdf = r_mid * r_mid * R * R;

        // Accumulate into the CDF (trapezoidal/midpoint integration)
        data.cdf[i] = data.cdf[i - 1] + pdf * dr;
    }

    // Normalize the CDF so it goes from 0 to 1.
    // After normalization, CDF[i] = P(r ≤ r_i), the probability of finding
    // the electron within radius r_i.
    double total = data.cdf[RADIAL_BINS];
    if (total > 0.0) {
        for (auto& val : data.cdf) {
            val /= total;
        }
    }

    return data;
}

// =============================================================================
// Build Angular CDF
// =============================================================================
//
// Constructs the cumulative distribution function for the polar angle θ.
//
// The angular probability density for the polar angle is:
//
//   P_angular(θ) dθ = sin(θ) · |P_l^|m|(cos θ)|² dθ
//
// The sin(θ) factor comes from the spherical solid angle element
// dΩ = sin(θ) dθ dφ. It ensures that angles near the poles (θ ≈ 0, π)
// are weighted less than angles near the equator (θ ≈ π/2), because
// there's less "area" near the poles of a sphere.
//
// The |P_l^m|² factor shapes the distribution according to the orbital's
// angular character. For example:
// - l=0, m=0: P_0^0 = 1, so the distribution is just sin(θ) → uniform on sphere
// - l=1, m=0: P_1^0 = cos θ, so density ∝ sin(θ)cos²(θ) → two polar lobes
// - l=1, m=1: P_1^1 = -sin θ, so density ∝ sin³(θ) → equatorial torus
//
// Parameters:
//   l     — azimuthal quantum number
//   m_abs — |m|, absolute value of the magnetic quantum number
//
// Returns:
//   CdfData containing bin-edge theta values [0, π] and their cumulative probs
//
[[nodiscard]] CdfData build_angular_cdf(uint32_t l, uint32_t m_abs) {
    double dtheta = PI / static_cast<double>(ANGULAR_BINS);

    CdfData data;
    data.values.resize(ANGULAR_BINS + 1);
    data.cdf.resize(ANGULAR_BINS + 1);

    data.values[0] = 0.0;
    data.cdf[0] = 0.0;

    for (int i = 1; i <= ANGULAR_BINS; ++i) {
        double theta = static_cast<double>(i) * dtheta;
        data.values[i] = theta;

        // Midpoint of this angular bin
        double theta_mid = (data.values[i - 1] + theta) / 2.0;

        // cos(θ) is the argument to the Legendre polynomial
        double cos_theta = std::cos(theta_mid);

        // Evaluate the associated Legendre polynomial at this angle
        double plm = associated_legendre(l, m_abs, cos_theta);

        // Angular PDF: sin(θ) · |P_l^m(cos θ)|²
        // sin(θ) accounts for the solid angle, |P_l^m|² gives the angular shape
        double pdf = std::sin(theta_mid) * plm * plm;

        data.cdf[i] = data.cdf[i - 1] + pdf * dtheta;
    }

    // Normalize to [0, 1]
    double total = data.cdf[ANGULAR_BINS];
    if (total > 0.0) {
        for (auto& val : data.cdf) {
            val /= total;
        }
    }

    return data;
}

// =============================================================================
// Inverse CDF Sampling via Binary Search
// =============================================================================
//
// Given a CDF table and a uniform random number u ∈ [0, 1), find the value x
// such that CDF(x) = u. This is the inverse CDF (or quantile function).
//
// ALGORITHM:
// 1. Binary search the CDF array for the interval where cdf[i-1] ≤ u < cdf[i]
// 2. Linearly interpolate within that interval for sub-bin accuracy
//
// Binary search is O(log N) where N is the number of bins, which is much
// faster than linear search for our 4096-bin CDFs.
//
// The linear interpolation within the bin assumes the PDF is approximately
// constant within each bin, which is a good approximation when the bins
// are sufficiently narrow.
//
// Parameters:
//   vals — the coordinate values at each bin edge (r or θ)
//   cdf  — the cumulative probability at each bin edge
//   u    — the uniform random number to invert, in [0, 1)
//
// Returns:
//   The sampled coordinate value corresponding to probability u
//
[[nodiscard]] double sample_cdf(std::span<const double> vals, std::span<const double> cdf, double u) noexcept {
    // Binary search: find the smallest index where cdf[index] >= u.
    // This identifies which bin the random number u falls into.
    size_t lo = 0;
    size_t hi = cdf.size() - 1;

    while (lo < hi) {
        size_t mid = (lo + hi) / 2;
        if (cdf[mid] < u) {
            lo = mid + 1;  // u is in the upper half
        } else {
            hi = mid;      // u might be here or in the lower half
        }
    }

    // Edge case: if u is in the very first bin, return the first value
    if (lo == 0) return vals[0];

    // Linear interpolation within the bin [lo-1, lo]:
    //
    //   t = (u - cdf[lo-1]) / (cdf[lo] - cdf[lo-1])
    //   result = vals[lo-1] + t * (vals[lo] - vals[lo-1])
    //
    // This maps the fraction of u within the bin to a proportional position
    // between the two bin edges. Without interpolation, we'd get visible
    // "banding" artifacts in the particle distribution.
    double cdf_range = cdf[lo] - cdf[lo - 1];
    double t = (std::abs(cdf_range) > 1e-30)
                   ? (u - cdf[lo - 1]) / cdf_range
                   : 0.5;  // Fallback for degenerate (zero-width) bins

    return vals[lo - 1] + t * (vals[lo] - vals[lo - 1]);
}

// =============================================================================
// Fire Heatmap Color Mapping
// =============================================================================
//
// Maps a scalar intensity value ∈ [0, 1] to an RGB color using a "fire"
// gradient that progresses through:
//
//   Black → Purple → Red → Orange → Yellow → White
//
// This color scheme is chosen because:
// 1. It's perceptually intuitive: dark = low density, bright = high density
// 2. It has good contrast across the full range
// 3. The purple-red transition highlights the intermediate probability regions
// 4. White at the peak makes the highest-density regions visually prominent
//
// COLOR STOPS (defined as linear interpolation waypoints):
//   t=0.0 → (  0,   0,   0)  Black  — zero probability
//   t=0.2 → (128,   0, 128)  Purple — low probability
//   t=0.4 → (255,   0,   0)  Red    — moderate probability
//   t=0.6 → (255, 165,   0)  Orange — high probability
//   t=0.8 → (255, 255,   0)  Yellow — very high probability
//   t=1.0 → (255, 255, 255)  White  — peak probability
//
// Between stops, colors are linearly interpolated in RGB space.
//

// A color stop defines one waypoint in the gradient.
// The 't' value is the intensity at which this exact color appears.
struct ColorStop {
    double t;  // Position in [0, 1]
    double r;  // Red channel [0, 255]
    double g;  // Green channel [0, 255]
    double b;  // Blue channel [0, 255]
};

// The gradient is defined by 6 stops, evenly spaced at intervals of 0.2.
// constexpr so the compiler can evaluate lookups at compile time if possible.
constexpr std::array<ColorStop, 6> COLOR_STOPS = {{
    {0.0,   0.0,   0.0,   0.0},    // Black  — vacuum / zero density
    {0.2, 128.0,   0.0, 128.0},    // Purple — faint glow, low probability
    {0.4, 255.0,   0.0,   0.0},    // Red    — moderate probability
    {0.6, 255.0, 165.0,   0.0},    // Orange — significant probability
    {0.8, 255.0, 255.0,   0.0},    // Yellow — high probability
    {1.0, 255.0, 255.0, 255.0},    // White  — maximum probability density
}};

// Represents an RGB color with float components in [0, 1].
struct RGBColor {
    float r;
    float g;
    float b;
};

// Map an intensity value to an RGB color via the fire heatmap.
//
// Parameters:
//   intensity — a value in [0, 1] representing the local probability density
//               (0 = zero density, 1 = maximum density)
//
// Returns:
//   RGBColor with components in [0, 1], suitable for GPU rendering
//
[[nodiscard]] RGBColor fire_heatmap(double intensity) noexcept {
    // Clamp to [0, 1] to handle any floating-point overshoot
    double t = std::clamp(intensity, 0.0, 1.0);

    // Find the two color stops that bracket the intensity value.
    // Since stops are evenly spaced at 0.2 intervals, we could compute the
    // index directly, but a loop is clearer and works for any stop spacing.
    size_t idx = 1;  // Default: interpolate between stops 0 and 1
    for (size_t i = 1; i < COLOR_STOPS.size(); ++i) {
        if (COLOR_STOPS[i].t >= t) {
            idx = i;
            break;
        }
    }

    // Get the two bracketing stops
    const auto& c0 = COLOR_STOPS[idx - 1];  // Lower bound stop
    const auto& c1 = COLOR_STOPS[idx];       // Upper bound stop

    // Compute the fractional position between the two stops.
    // frac = 0 means exactly at c0, frac = 1 means exactly at c1.
    double range = c1.t - c0.t;
    double frac = (range > 1e-12) ? (t - c0.t) / range : 0.0;

    // Linearly interpolate each color channel and normalize from [0, 255] to [0, 1]
    float r = static_cast<float>((c0.r + frac * (c1.r - c0.r)) / 255.0);
    float g = static_cast<float>((c0.g + frac * (c1.g - c0.g)) / 255.0);
    float b = static_cast<float>((c0.b + frac * (c1.b - c0.b)) / 255.0);

    return {r, g, b};
}

// =============================================================================
// Intensity Computation for Coloring
// =============================================================================
//
// Computes the "raw" probability density |Ψ|² at a point (r, θ) for use in
// coloring. The full probability density is:
//
//   |Ψ_nlm(r,θ,φ)|² = |R_nl(r)|² · |P_l^m(cos θ)|² · (angular norm terms)
//
// We omit the angular normalization and φ-dependent factors because we only
// need a RELATIVE intensity for the color map — the scale_factor normalizes
// the result to [0, ~1].
//
// Parameters:
//   n            — principal quantum number
//   l            — azimuthal quantum number
//   m_abs        — |m|, absolute magnetic quantum number
//   r            — radial distance
//   theta        — polar angle
//   scale_factor — multiplicative factor to map raw |Ψ|² to [0, ~1]
//
// Returns:
//   A non-negative intensity value, ideally in [0, 1] after scaling
//
[[nodiscard]] double compute_intensity(uint32_t n, uint32_t l, uint32_t m_abs,
                                       double r, double theta, double scale_factor) noexcept {
    double R = radial_wave_function(n, l, r);
    double cos_theta = std::cos(theta);
    double plm = associated_legendre(l, m_abs, cos_theta);

    // |Ψ|² ∝ R² · P² (ignoring normalization constants that are absorbed
    // into the scale_factor)
    return R * R * plm * plm * scale_factor;
}

// =============================================================================
// Scale Factor Computation
// =============================================================================
//
// Determines a multiplicative scaling constant so that the maximum intensity
// across the orbital maps to approximately 0.9 on the [0, 1] color scale.
//
// WHY IS THIS NEEDED?
// Different orbitals have wildly different peak |Ψ|² values. The 1s orbital
// has R(0) = 2 giving |R|² = 4, while the 5f orbital peaks at much smaller
// values. Without scaling, some orbitals would appear entirely white (saturated)
// and others entirely black (invisible).
//
// ALGORITHM:
// We sample |R(r)|² · |P_l^m(cos θ)|² on a grid of (r, θ) values,
// find the maximum, and set scale = 0.9 / max. The 0.9 factor leaves a
// small margin so the very brightest points aren't fully white.
//
// Parameters:
//   n     — principal quantum number
//   l     — azimuthal quantum number
//   m_abs — |m|, absolute magnetic quantum number
//
// Returns:
//   A positive scale factor to multiply with |Ψ|² for color mapping
//
[[nodiscard]] double compute_scale_factor(uint32_t n, uint32_t l, uint32_t m_abs) noexcept {
    double r_max = 10.0 * static_cast<double>(n) * static_cast<double>(n);

    constexpr int R_STEPS = 200;      // Radial sample points
    constexpr int THETA_STEPS = 100;  // Angular sample points

    // Scan over a grid to find the maximum of |R(r)|² · |P_l^m(cos θ)|²
    // (without the r² volume factor, since we want the RAW density for coloring)
    double max_raw = 0.0;

    for (int ir = 1; ir <= R_STEPS; ++ir) {
        double r = r_max * static_cast<double>(ir) / static_cast<double>(R_STEPS);
        double R = radial_wave_function(n, l, r);

        for (int ith = 0; ith <= THETA_STEPS; ++ith) {
            double theta = PI * static_cast<double>(ith) / static_cast<double>(THETA_STEPS);
            double cos_theta = std::cos(theta);
            double plm = associated_legendre(l, m_abs, cos_theta);

            double val = R * R * plm * plm;
            if (val > max_raw) {
                max_raw = val;
            }
        }
    }

    // Return scale factor that maps the peak to 0.9.
    // The 1e-30 guard prevents division by zero for pathological cases.
    return (max_raw > 1e-30) ? (0.9 / max_raw) : 1.0;
}

// =============================================================================
// Internal Orbital Generation
// =============================================================================
//
// This is the core function that generates the particle point cloud for a
// given orbital. It performs the full pipeline:
//
// 1. Initialize the PRNG with the given seed
// 2. Build radial and angular CDFs from the quantum mechanics
// 3. Compute the color scale factor
// 4. For each particle:
//    a. Sample r from the radial CDF
//    b. Sample θ from the angular CDF
//    c. Sample φ uniformly in [0, 2π)
//    d. Convert spherical (r, θ, φ) to Cartesian (x, y, z)
//    e. Compute color from the local probability density
// 5. Return all particles as an interleaved array
//
// COORDINATE CONVENTION:
//   - θ (theta) is the polar angle from the +y axis (0 at north pole, π at south)
//   - φ (phi) is the azimuthal angle in the xz-plane
//   - y = r·cos(θ)  (vertical axis, aligned with orbital symmetry axis)
//   - x = r·sin(θ)·cos(φ)
//   - z = r·sin(θ)·sin(φ)
//
// This convention puts the orbital symmetry axis along y (vertical),
// which matches typical 3D rendering setups where y is "up".
//
// Parameters:
//   n              — principal quantum number (n ≥ 1)
//   l              — azimuthal quantum number (0 ≤ l < n)
//   m_abs          — |m|, absolute magnetic quantum number (0 ≤ m_abs ≤ l)
//   num_particles  — how many particles to generate
//   seed           — PRNG seed for reproducibility
//
// Returns:
//   A vector of floats: [x₁, y₁, z₁, r₁, g₁, b₁, x₂, y₂, z₂, r₂, g₂, b₂, ...]
//   (6 floats per particle: 3 for position, 3 for color)
//
[[nodiscard]] std::vector<float> generate_orbital_internal(
    uint32_t n, uint32_t l, uint32_t m_abs,
    uint32_t num_particles, uint32_t seed)
{
    // Initialize the pseudo-random number generator with the given seed.
    // Using the same seed always produces the same particle distribution,
    // which is important for deterministic rendering and benchmarking.
    XorShift rng(seed);

    // Build the cumulative distribution functions.
    // These are relatively expensive to compute (O(BINS) evaluations of
    // wave functions), but they're built once and reused for all particles.
    auto radial_cdf  = build_radial_cdf(n, l);
    auto angular_cdf = build_angular_cdf(l, m_abs);

    // Compute the scale factor that normalizes color intensity to [0, ~1].
    double scale_factor = compute_scale_factor(n, l, m_abs);

    // Allocate the output buffer: 6 floats per particle (x, y, z, r, g, b)
    std::vector<float> output;
    output.reserve(static_cast<size_t>(num_particles) * 6);

    for (uint32_t i = 0; i < num_particles; ++i) {
        // -----------------------------------------------------------------
        // Step 1: Sample the radial distance r from the radial CDF
        // -----------------------------------------------------------------
        // Draw a uniform random number and invert the CDF to get r.
        // Particles are distributed with density ∝ r² |R_nl(r)|².
        double u_r = rng.next_f64();
        double r = sample_cdf(radial_cdf.values, radial_cdf.cdf, u_r);

        // -----------------------------------------------------------------
        // Step 2: Sample the polar angle θ from the angular CDF
        // -----------------------------------------------------------------
        // Draw another uniform random number and invert the angular CDF.
        // Particles are distributed with density ∝ sin(θ) |P_l^m(cos θ)|².
        double u_theta = rng.next_f64();
        double theta = sample_cdf(angular_cdf.values, angular_cdf.cdf, u_theta);

        // -----------------------------------------------------------------
        // Step 3: Sample the azimuthal angle φ uniformly in [0, 2π)
        // -----------------------------------------------------------------
        // For real-valued orbitals (which we're visualizing), the probability
        // density has no φ-dependence — it's symmetric around the z-axis.
        // (Complex orbitals with e^{imφ} also have |e^{imφ}|² = 1, so φ
        // is always uniform.)
        double phi = rng.next_f64() * 2.0 * PI;

        // -----------------------------------------------------------------
        // Step 4: Convert spherical coordinates to Cartesian
        // -----------------------------------------------------------------
        // Standard spherical → Cartesian conversion, with y as the polar axis:
        //   x = r sin(θ) cos(φ)   — horizontal, perpendicular to symmetry axis
        //   y = r cos(θ)          — vertical, along the orbital symmetry axis
        //   z = r sin(θ) sin(φ)   — depth, perpendicular to symmetry axis
        //
        double sin_theta = std::sin(theta);
        double cos_theta = std::cos(theta);
        double x = r * sin_theta * std::cos(phi);
        double y = r * cos_theta;
        double z = r * sin_theta * std::sin(phi);

        // -----------------------------------------------------------------
        // Step 5: Compute the color for this particle
        // -----------------------------------------------------------------
        // The color represents the local probability density |Ψ|² at this
        // point, mapped through the fire heatmap. Particles near the
        // nucleus (for s orbitals) or near the angular lobes are brighter.
        double intensity = compute_intensity(n, l, m_abs, r, theta, scale_factor);
        auto [cr, cg, cb] = fire_heatmap(intensity);  // C++17 structured binding

        // Append this particle's data: position (x, y, z) + color (r, g, b)
        output.push_back(static_cast<float>(x));
        output.push_back(static_cast<float>(y));
        output.push_back(static_cast<float>(z));
        output.push_back(cr);
        output.push_back(cg);
        output.push_back(cb);
    }

    return output;
}

// =============================================================================
// Exported C Functions (WASM API)
// =============================================================================
//
// These functions are the public API callable from JavaScript. They use
// extern "C" to prevent C++ name mangling, and EMSCRIPTEN_KEEPALIVE to
// ensure the linker doesn't strip them as unused.
//
// Memory management note:
// Since WASM has a flat memory model, we malloc a buffer in WASM heap space,
// copy the result into it, and return the pointer. The JavaScript caller is
// responsible for reading the data and then calling free_buffer() to release it.
//

extern "C" {

// =============================================================================
// generate_orbital — Main entry point
// =============================================================================
//
// Generates a particle cloud representing a hydrogen-like atomic orbital.
//
// The returned buffer contains interleaved float data:
//   [x₁, y₁, z₁, r₁, g₁, b₁, x₂, y₂, z₂, r₂, g₂, b₂, ...]
//
// where (x, y, z) is the particle position in Bohr radii and (r, g, b) is
// the color in [0, 1] from the fire heatmap.
//
// QUANTUM NUMBER VALIDATION:
//   - n < 1 is clamped to 1 (minimum principal quantum number)
//   - l is clamped to [0, n-1] (physical constraint)
//   - |m| is clamped to [0, l] (physical constraint)
//
// Parameters:
//   n              — principal quantum number (energy level)
//   l              — azimuthal quantum number (orbital shape: s, p, d, f, ...)
//   m              — magnetic quantum number (orientation, can be negative)
//   num_particles  — number of particles to generate
//   seed           — random seed for reproducible generation
//
// Returns:
//   Pointer to a malloc'd float array of size (num_particles * 6).
//   The caller MUST call free_buffer() when done to avoid memory leaks.
//
EMSCRIPTEN_KEEPALIVE
float* generate_orbital(int n, int l, int m, int num_particles, unsigned int seed) {
    // Validate and clamp quantum numbers to physically allowed ranges.
    // In hydrogen: n ≥ 1, 0 ≤ l ≤ n-1, -l ≤ m ≤ l.
    uint32_t n_val = (n < 1) ? 1u : static_cast<uint32_t>(n);
    uint32_t l_val = std::min(static_cast<uint32_t>(std::abs(l)), n_val - 1);
    uint32_t m_abs = std::min(static_cast<uint32_t>(std::abs(m)), l_val);

    // Generate the particle data
    auto result = generate_orbital_internal(n_val, l_val, m_abs,
                                            static_cast<uint32_t>(num_particles), seed);

    // Allocate a buffer in WASM heap memory and copy the data into it.
    // We use malloc (not new) because the JS side will call free_buffer(),
    // and mixing new/free or malloc/delete is undefined behavior.
    size_t byte_size = result.size() * sizeof(float);
    float* buffer = static_cast<float*>(std::malloc(byte_size));

    if (buffer) {
        std::memcpy(buffer, result.data(), byte_size);
    }

    return buffer;
}

// =============================================================================
// benchmark_generation — Performance measurement
// =============================================================================
//
// Generates an orbital and measures the wall-clock time taken.
// Useful for comparing performance between the C++ and Rust WASM modules.
//
// Uses emscripten_get_now() which provides high-resolution timing in the
// browser environment (based on performance.now()).
//
// Parameters:
//   Same as generate_orbital (n, l, m, num_particles, seed)
//
// Returns:
//   Elapsed time in milliseconds (double precision)
//
EMSCRIPTEN_KEEPALIVE
double benchmark_generation(int n, int l, int m, int num_particles, unsigned int seed) {
    // emscripten_get_now() returns milliseconds since page load with
    // sub-millisecond precision — equivalent to performance.now() in JS.
    double start = emscripten_get_now();

    // Run the generation. We capture the result to prevent the compiler from
    // optimizing away the entire computation as dead code.
    float* result = generate_orbital(n, l, m, num_particles, seed);

    double end = emscripten_get_now();

    // Clean up the allocated buffer
    if (result) {
        std::free(result);
    }

    return end - start;
}

// =============================================================================
// free_buffer — Memory deallocation
// =============================================================================
//
// Frees a buffer previously allocated by generate_orbital().
//
// In the WASM memory model, JavaScript can read the buffer contents using
// Module.HEAPF32 (a typed array view of WASM linear memory), but it cannot
// free the memory directly. This function provides a way for JS to trigger
// the deallocation.
//
// Usage from JavaScript:
//   const ptr = Module._generate_orbital(n, l, m, count, seed);
//   // ... read data from Module.HEAPF32.subarray(ptr/4, ptr/4 + count*6) ...
//   Module._free_buffer(ptr);  // Release the memory
//
// Parameters:
//   ptr — pointer to a buffer previously returned by generate_orbital()
//          (passing nullptr is safe and has no effect)
//
EMSCRIPTEN_KEEPALIVE
void free_buffer(float* ptr) {
    std::free(ptr);  // std::free(nullptr) is defined to do nothing
}

} // extern "C"
