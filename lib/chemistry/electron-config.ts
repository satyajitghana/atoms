const SUBSHELL_L: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 };
const SUBSHELL_NAMES = ["s", "p", "d", "f", "g", "h"];

export interface OrbitalDescriptor {
  n: number;
  l: number;
  m: number;
  electrons: number;
  label: string;
}

export function parseElectronConfig(config: string): OrbitalDescriptor[] {
  const orbitals: OrbitalDescriptor[] = [];
  const subshells = config.trim().split(/\s+/);

  for (const sub of subshells) {
    const match = sub.match(/^(\d+)([spdf])(\d+)$/);
    if (!match) continue;

    const n = parseInt(match[1]);
    const l = SUBSHELL_L[match[2]];
    const electronCount = parseInt(match[3]);
    const label = `${n}${match[2]}`;

    const mValues: number[] = [];
    for (let mv = -l; mv <= l; mv++) mValues.push(mv || 0);

    // Distribute electrons following Hund's rule:
    // First pass: one electron per orbital
    // Second pass: pair up
    const occupancy = new Array(mValues.length).fill(0);
    let remaining = electronCount;

    // First pass: fill one each
    for (let i = 0; i < mValues.length && remaining > 0; i++) {
      occupancy[i] = 1;
      remaining--;
    }
    // Second pass: fill second electron
    for (let i = 0; i < mValues.length && remaining > 0; i++) {
      occupancy[i] = 2;
      remaining--;
    }

    for (let i = 0; i < mValues.length; i++) {
      if (occupancy[i] > 0) {
        orbitals.push({
          n,
          l,
          m: mValues[i],
          electrons: occupancy[i],
          label: `${label}(m=${mValues[i] >= 0 ? "+" : ""}${mValues[i]})`,
        });
      }
    }
  }

  return orbitals;
}

export function getOrbitalName(n: number, l: number, m: number): string {
  const subshell = SUBSHELL_NAMES[l] || `l${l}`;
  const mSign = m >= 0 ? "+" : "";
  return `${n}${subshell} (m=${mSign}${m})`;
}

export function getSubshellName(n: number, l: number): string {
  return `${n}${SUBSHELL_NAMES[l] || `l${l}`}`;
}

export function validateQuantumNumbers(
  n: number,
  l: number,
  m: number
): boolean {
  return n >= 1 && l >= 0 && l < n && Math.abs(m) <= l;
}

export function constrainQuantumNumbers(
  n: number,
  l: number,
  m: number
): { n: number; l: number; m: number } {
  const clampedL = Math.min(Math.max(l, 0), n - 1);
  const clampedM = Math.max(-clampedL, Math.min(m, clampedL));
  return { n, l: clampedL, m: clampedM };
}

// Orbital colors for multi-orbital view (distinguishing subshells)
const SUBSHELL_COLORS: Record<string, [number, number, number]> = {
  s: [1.0, 0.4, 0.2], // warm orange
  p: [0.2, 0.6, 1.0], // blue
  d: [0.2, 1.0, 0.5], // green
  f: [0.7, 0.3, 1.0], // purple
};

export function getSubshellColor(l: number): [number, number, number] {
  const name = SUBSHELL_NAMES[l] || "s";
  return SUBSHELL_COLORS[name] || [1.0, 1.0, 1.0];
}
