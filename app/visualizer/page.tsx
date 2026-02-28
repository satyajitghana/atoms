"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuantumControls } from "@/components/controls/quantum-controls";
import { ParticleControls } from "@/components/controls/particle-controls";
import { EngineToggle } from "@/components/controls/engine-toggle";
import { Slider } from "@/components/ui/slider";
import { useVisualizerStore } from "@/lib/stores/visualizer-store";
import {
  useOrbitalEngine,
  useOrbitalData,
} from "@/lib/hooks/use-orbital-engine";
import { useVolumeData } from "@/lib/hooks/use-volume-data";
import { useAnimatedOrbital, interpolateOrbitalData } from "@/lib/hooks/use-animated-orbital";
import { getOrbitalName } from "@/lib/chemistry/electron-config";
import { Loader2, RotateCcw, Sparkles, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

function RenderModeToggle({
  value,
  onChange,
}: {
  value: "points" | "volume";
  onChange: (mode: "points" | "volume") => void;
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Render Mode
      </h3>
      <div className="flex gap-1">
        {(["points", "volume"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={cn(
              "flex-1 h-7 rounded-md text-[11px] font-medium transition-all border border-border/50",
              value === mode
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            )}
          >
            {mode === "points" ? "Points" : "Volume"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VisualizerPage() {
  const [controlsOpen, setControlsOpen] = useState(false);
  const {
    n, l, m,
    particleCount, setParticleCount,
    pointSize, setPointSize,
    engineType, setEngineType,
    autoRotate, toggleAutoRotate,
    renderMode, setRenderMode,
    volumeOpacity, setVolumeOpacity,
    edlEnabled, toggleEdl,
  } = useVisualizerStore();

  const { engine, loading: engineLoading } = useOrbitalEngine(engineType);
  const { data, generating, regenerate } = useOrbitalData(
    engine, n, l, m, particleCount
  );

  const { data: volumeData, generating: volumeGenerating } = useVolumeData(
    n, l, m, renderMode === "volume" ? 64 : 0
  );

  const animated = useAnimatedOrbital(data, 600);
  const displayData = animated ? interpolateOrbitalData(animated) : null;

  const isLoading = engineLoading || generating || volumeGenerating;

  return (
    <div className="h-[calc(100vh-48px)] relative overflow-hidden">
      {/* 3D Scene fills entire background */}
      <div className="absolute inset-0">
        {displayData ? (
          <OrbitalViewer
            positions={displayData.positions}
            colors={displayData.colors}
            pointSize={pointSize}
            autoRotate={autoRotate}
            renderMode={renderMode}
            volumeData={volumeData}
            volumeOpacity={volumeOpacity}
            edlEnabled={edlEnabled}
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
          <RenderModeToggle value={renderMode} onChange={setRenderMode} />
          {renderMode === "points" ? (
            <ParticleControls
              count={particleCount}
              onCountChange={setParticleCount}
              pointSize={pointSize}
              onPointSizeChange={setPointSize}
            />
          ) : (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Volume
              </h3>
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Density
                  </label>
                  <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
                    {volumeOpacity.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[volumeOpacity]}
                  onValueChange={([v]) => setVolumeOpacity(v)}
                  min={0.5}
                  max={20}
                  step={0.5}
                />
              </div>
            </div>
          )}
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
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Eye Dome Lighting</label>
            <Switch
              checked={edlEnabled}
              onCheckedChange={toggleEdl}
              className="scale-75 origin-right"
            />
          </div>
        </div>

        {/* Footer */}
        {engine && (
          <div className="px-4 py-2 border-t border-border/30 bg-muted/20">
            <p className="text-[9px] text-muted-foreground font-mono">
              Engine: {engine.name} | Mode: {renderMode}
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
          {getOrbitalName(n, l, m)} | {renderMode === "points" ? `${(particleCount / 1000).toFixed(0)}K particles` : "volume"}
        </p>
      </div>
    </div>
  );
}
