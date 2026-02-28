"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuantumControls } from "@/components/controls/quantum-controls";
import { ParticleControls } from "@/components/controls/particle-controls";
import { EngineToggle } from "@/components/controls/engine-toggle";
import { useVisualizerStore } from "@/lib/stores/visualizer-store";
import {
  useOrbitalEngine,
  useOrbitalData,
} from "@/lib/hooks/use-orbital-engine";
import { getOrbitalName } from "@/lib/chemistry/electron-config";
import { Loader2, RotateCcw, Sparkles, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

export default function VisualizerPage() {
  const [controlsOpen, setControlsOpen] = useState(false);
  const {
    n, l, m,
    particleCount, setParticleCount,
    pointSize, setPointSize,
    engineType, setEngineType,
    autoRotate, toggleAutoRotate,
  } = useVisualizerStore();

  const { engine, loading: engineLoading } = useOrbitalEngine(engineType);
  const { data, generating, regenerate } = useOrbitalData(
    engine, n, l, m, particleCount
  );

  const isLoading = engineLoading || generating;

  return (
    <div className="h-[calc(100vh-48px)] relative overflow-hidden">
      {/* 3D Scene fills entire background */}
      <div className="absolute inset-0">
        {data ? (
          <OrbitalViewer
            positions={data.positions}
            colors={data.colors}
            pointSize={pointSize}
            autoRotate={autoRotate}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#050508]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Generating orbital...</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: floating toggle button */}
      <button
        onClick={() => setControlsOpen(!controlsOpen)}
        className="md:hidden absolute top-3 left-3 z-30 bg-card/70 backdrop-blur-xl rounded-lg border border-border/40 p-2 shadow-lg"
      >
        <Settings2 className="h-4 w-4 text-primary" />
      </button>

      {/* Mobile: orbital name badge */}
      <div className="md:hidden absolute top-3 left-12 z-20 bg-card/60 backdrop-blur-xl rounded-lg border border-border/30 px-2.5 py-1.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">
          {getOrbitalName(n, l, m)}
        </span>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      </div>

      {/* Desktop: Floating Control Panel */}
      <div className={`
        absolute z-30 bg-card/70 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/50 overflow-hidden
        transition-all duration-300
        md:top-4 md:left-4 md:w-64 md:rounded-xl md:translate-x-0
        ${controlsOpen
          ? "bottom-0 left-0 right-0 rounded-t-xl max-h-[70vh] overflow-y-auto"
          : "bottom-0 left-0 right-0 translate-y-full md:translate-y-0 rounded-t-xl"
        }
        md:bottom-auto md:right-auto
      `}>
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <div>
              <h2 className="text-xs font-semibold leading-none">Orbital Visualizer</h2>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {getOrbitalName(n, l, m)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={regenerate}
              title="Regenerate orbital"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 py-3 space-y-4">
          <QuantumControls />
          <Separator className="opacity-30" />
          <ParticleControls
            count={particleCount}
            onCountChange={setParticleCount}
            pointSize={pointSize}
            onPointSizeChange={setPointSize}
          />
          <Separator className="opacity-30" />
          <EngineToggle value={engineType} onChange={setEngineType} />
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Auto Rotate</label>
            <Switch
              checked={autoRotate}
              onCheckedChange={toggleAutoRotate}
              className="scale-75 origin-right"
            />
          </div>
        </div>

        {/* Footer */}
        {engine && (
          <div className="px-4 py-2 border-t border-border/30 bg-muted/20">
            <p className="text-[9px] text-muted-foreground font-mono">
              Engine: {engine.name}
            </p>
          </div>
        )}
      </div>

      {/* Mobile overlay backdrop */}
      {controlsOpen && (
        <div
          className="md:hidden absolute inset-0 bg-black/40 z-20"
          onClick={() => setControlsOpen(false)}
        />
      )}

      {/* Bottom-right orbital label (desktop only) */}
      <div className="hidden md:block absolute bottom-4 right-4 bg-card/60 backdrop-blur-xl rounded-lg border border-border/30 px-3 py-1.5">
        <p className="text-[10px] font-mono text-muted-foreground">
          {getOrbitalName(n, l, m)} | {(particleCount / 1000).toFixed(0)}K particles
        </p>
      </div>
    </div>
  );
}
