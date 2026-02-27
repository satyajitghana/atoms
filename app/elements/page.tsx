"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PeriodicTable } from "@/components/periodic-table/periodic-table";
import { ParticleControls } from "@/components/controls/particle-controls";
import {
  parseElectronConfig,
  getSubshellName,
} from "@/lib/chemistry/electron-config";
import { useOrbitalEngine, useOrbitalData } from "@/lib/hooks/use-orbital-engine";
import type { Element } from "@/lib/data/elements";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

export default function ElementsPage() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedOrbitalIdx, setSelectedOrbitalIdx] = useState(0);
  const [particleCount, setParticleCount] = useState(100000);
  const [pointSize, setPointSize] = useState(0.08);

  const orbitals = selectedElement
    ? parseElectronConfig(selectedElement.electronConfiguration)
    : [];

  const activeOrbital = orbitals[selectedOrbitalIdx] || orbitals[0];

  const { engine } = useOrbitalEngine("js");
  const { data } = useOrbitalData(
    engine,
    activeOrbital?.n || 1,
    activeOrbital?.l || 0,
    activeOrbital?.m || 0,
    particleCount
  );

  const handleElementSelect = (el: Element) => {
    setSelectedElement(el);
    setSelectedOrbitalIdx(0);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Element Explorer</h1>
          <p className="text-xs text-muted-foreground">
            Select an element to visualize its electron orbitals
          </p>
        </div>
        {selectedElement && (
          <div className="text-right">
            <p className="text-sm font-semibold">
              {selectedElement.name} ({selectedElement.symbol})
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {selectedElement.electronConfiguration}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Periodic Table */}
        <div className={`${selectedElement ? "w-[55%]" : "w-full"} overflow-auto p-4 pt-1 transition-all`}>
          <PeriodicTable
            selectedElement={selectedElement?.number}
            onElementSelect={handleElementSelect}
            compact={!!selectedElement}
          />
        </div>

        {/* Right: Orbital Visualization */}
        {selectedElement ? (
          <div className="w-[45%] border-l border-border flex flex-col min-h-0">
            {/* Orbital list */}
            <div className="shrink-0 px-3 pt-3 pb-2">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">
                Electron Orbitals
              </h3>
              <div className="flex flex-wrap gap-1">
                {orbitals.map((orb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOrbitalIdx(idx)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                      idx === selectedOrbitalIdx
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                    }`}
                  >
                    {getSubshellName(orb.n, orb.l)}
                    <span className="opacity-60 ml-0.5">
                      m={orb.m >= 0 ? "+" : ""}{orb.m}
                    </span>
                    <Badge variant="secondary" className="ml-1 text-[8px] px-1 py-0">
                      {orb.electrons}e
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* 3D Viewer */}
            <div className="flex-1 relative min-h-0">
              {data ? (
                <OrbitalViewer
                  positions={data.positions}
                  colors={data.colors}
                  pointSize={pointSize}
                  autoRotate
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {activeOrbital && (
                <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-xl rounded-lg border border-border/50 px-3 py-1.5">
                  <p className="text-[10px] font-mono text-foreground">
                    n={activeOrbital.n}, l={activeOrbital.l}, m={activeOrbital.m}
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="shrink-0 px-3 py-2 border-t border-border">
              <ParticleControls
                count={particleCount}
                onCountChange={setParticleCount}
                pointSize={pointSize}
                onPointSizeChange={setPointSize}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
