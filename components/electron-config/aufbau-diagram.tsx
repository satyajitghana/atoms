"use client";

import { useMemo } from "react";
import {
  parseElectronConfig,
  getSubshellColor,
  type OrbitalDescriptor,
} from "@/lib/chemistry/electron-config";
import { OrbitalBox } from "./orbital-box";

const SUBSHELL_NAMES = ["s", "p", "d", "f"];
const SUBSHELL_ORBITALS = [1, 3, 5, 7]; // number of orbitals in each subshell

// Aufbau filling order
const FILLING_ORDER: [number, number][] = [
  [1, 0], // 1s
  [2, 0], // 2s
  [2, 1], // 2p
  [3, 0], // 3s
  [3, 1], // 3p
  [4, 0], // 4s
  [3, 2], // 3d
  [4, 1], // 4p
  [5, 0], // 5s
  [4, 2], // 4d
  [5, 1], // 5p
  [6, 0], // 6s
  [4, 3], // 4f
  [5, 2], // 5d
  [6, 1], // 6p
  [7, 0], // 7s
  [5, 3], // 5f
  [6, 2], // 6d
  [7, 1], // 7p
];

interface AufbauDiagramProps {
  electronConfiguration: string;
  activeOrbital?: { n: number; l: number; m: number } | null;
  onOrbitalClick?: (n: number, l: number, m: number) => void;
}

interface SubshellData {
  n: number;
  l: number;
  totalElectrons: number;
  orbitals: { m: number; electrons: number }[];
}

export function AufbauDiagram({
  electronConfiguration,
  activeOrbital,
  onOrbitalClick,
}: AufbauDiagramProps) {
  const parsed = useMemo(
    () => parseElectronConfig(electronConfiguration),
    [electronConfiguration]
  );

  // Build a map of (n,l) -> orbital descriptors
  const subshellMap = useMemo(() => {
    const map = new Map<string, SubshellData>();

    for (const orb of parsed) {
      const key = `${orb.n}-${orb.l}`;
      if (!map.has(key)) {
        const numOrbitals = SUBSHELL_ORBITALS[orb.l] || 1;
        const orbitals = [];
        for (let mi = -orb.l; mi <= orb.l; mi++) {
          orbitals.push({ m: mi, electrons: 0 });
        }
        map.set(key, {
          n: orb.n,
          l: orb.l,
          totalElectrons: 0,
          orbitals,
        });
      }
      const data = map.get(key)!;
      const orbIdx = data.orbitals.findIndex((o) => o.m === orb.m);
      if (orbIdx >= 0) {
        data.orbitals[orbIdx].electrons = orb.electrons;
        data.totalElectrons += orb.electrons;
      }
    }

    return map;
  }, [parsed]);

  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Electron Configuration
      </h3>

      <div className="space-y-1.5">
        {FILLING_ORDER.map(([n, l]) => {
          const key = `${n}-${l}`;
          const data = subshellMap.get(key);
          if (!data) return null;

          const subshellName = `${n}${SUBSHELL_NAMES[l]}`;
          const [cr, cg, cb] = getSubshellColor(l);
          const color = `rgb(${Math.round(cr * 255)}, ${Math.round(cg * 255)}, ${Math.round(cb * 255)})`;

          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-semibold w-6 text-right"
                style={{ color }}
              >
                {subshellName}
              </span>
              <div className="flex gap-0.5">
                {data.orbitals.map((orb) => {
                  const isActive =
                    activeOrbital?.n === n &&
                    activeOrbital?.l === l &&
                    activeOrbital?.m === orb.m;
                  return (
                    <OrbitalBox
                      key={orb.m}
                      electrons={orb.electrons}
                      label={`m=${orb.m >= 0 ? "+" : ""}${orb.m}`}
                      color={color}
                      active={isActive}
                      onClick={
                        onOrbitalClick
                          ? () => onOrbitalClick(n, l, orb.m)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
              <span className="text-[8px] text-muted-foreground font-mono">
                {data.totalElectrons}e⁻
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
