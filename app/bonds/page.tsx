"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useOrbitalEngine, useOrbitalData } from "@/lib/hooks/use-orbital-engine";
import { Loader2, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const BondViewer = dynamic(
  () => import("@/components/three/bond-viewer").then((mod) => mod.BondViewer),
  { ssr: false }
);

type BondType = "sigma-ss" | "sigma-pp" | "pi-pp";

const BOND_TYPES: { key: BondType; label: string; description: string }[] = [
  { key: "sigma-ss", label: "σ (s-s)", description: "Head-on overlap of two s orbitals" },
  { key: "sigma-pp", label: "σ (p-p)", description: "Head-on overlap of two p orbitals" },
  { key: "pi-pp", label: "π (p-p)", description: "Side-by-side overlap of two p orbitals" },
];

function getBondConfig(bondType: BondType) {
  switch (bondType) {
    case "sigma-ss":
      return {
        orbital1: { n: 1, l: 0, m: 0 },
        orbital2: { n: 1, l: 0, m: 0 },
        axis: "x" as const,
      };
    case "sigma-pp":
      return {
        orbital1: { n: 2, l: 1, m: 0 },
        orbital2: { n: 2, l: 1, m: 0 },
        axis: "x" as const,
      };
    case "pi-pp":
      return {
        orbital1: { n: 2, l: 1, m: 1 },
        orbital2: { n: 2, l: 1, m: 1 },
        axis: "x" as const,
      };
  }
}

export default function BondsPage() {
  const [bondType, setBondType] = useState<BondType>("sigma-ss");
  const [bondDistance, setBondDistance] = useState(8);
  const [particleCount] = useState(60000);

  const config = getBondConfig(bondType);

  const { engine } = useOrbitalEngine("js");
  const { data: data1 } = useOrbitalData(
    engine,
    config.orbital1.n,
    config.orbital1.l,
    config.orbital1.m,
    particleCount
  );
  const { data: data2 } = useOrbitalData(
    engine,
    config.orbital2.n,
    config.orbital2.l,
    config.orbital2.m,
    particleCount
  );

  const orbitals = useMemo(() => {
    if (!data1 || !data2) return null;

    const halfDist = bondDistance / 2;
    const mirrorPositions = new Float32Array(data2.positions.length);
    for (let i = 0; i < data2.positions.length; i += 3) {
      // Mirror for sigma bonds (flip x for head-on approach)
      if (bondType === "pi-pp") {
        mirrorPositions[i] = data2.positions[i];
        mirrorPositions[i + 1] = data2.positions[i + 1];
        mirrorPositions[i + 2] = data2.positions[i + 2];
      } else {
        mirrorPositions[i] = -data2.positions[i];
        mirrorPositions[i + 1] = data2.positions[i + 1];
        mirrorPositions[i + 2] = data2.positions[i + 2];
      }
    }

    return [
      { positions: data1.positions, colors: data1.colors, offset: [-halfDist, 0, 0] as [number, number, number] },
      { positions: mirrorPositions, colors: data2.colors, offset: [halfDist, 0, 0] as [number, number, number] },
    ];
  }, [data1, data2, bondDistance, bondType]);

  const isLoading = !data1 || !data2;
  const activeBond = BOND_TYPES.find((b) => b.key === bondType)!;

  return (
    <div className="h-[calc(100vh-48px)] relative overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        {orbitals ? (
          <BondViewer
            orbitals={orbitals}
            pointSize={0.06}
            autoRotate
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#050508]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Generating bond orbitals...</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Control Panel */}
      <div className="absolute z-30 top-4 left-4 w-72 bg-card/70 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-border/30">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <div>
            <h2 className="text-xs font-semibold leading-none">Bond Visualization</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {activeBond.description}
            </p>
          </div>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />}
        </div>

        {/* Controls */}
        <div className="px-4 py-3 space-y-4">
          {/* Bond type selector */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Bond Type
            </h3>
            <div className="flex gap-1">
              {BOND_TYPES.map((bt) => (
                <button
                  key={bt.key}
                  onClick={() => setBondType(bt.key)}
                  className={cn(
                    "flex-1 h-8 rounded-md text-[11px] font-medium transition-all border border-border/50",
                    bondType === bt.key
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  )}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bond distance slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Bond Distance</label>
              <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
                {bondDistance.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[bondDistance]}
              onValueChange={([v]) => setBondDistance(v)}
              min={2}
              max={20}
              step={0.5}
            />
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 right-4 bg-card/60 backdrop-blur-xl rounded-lg border border-border/30 px-3 py-1.5">
        <p className="text-[10px] font-mono text-muted-foreground">
          {activeBond.label} bond | distance: {bondDistance.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
