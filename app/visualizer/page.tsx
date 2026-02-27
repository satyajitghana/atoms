"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { QuantumControls } from "@/components/controls/quantum-controls";
import { ParticleControls } from "@/components/controls/particle-controls";
import { EngineToggle } from "@/components/controls/engine-toggle";
import {
  useOrbitalEngine,
  useOrbitalData,
} from "@/lib/hooks/use-orbital-engine";
import { constrainQuantumNumbers, getOrbitalName } from "@/lib/chemistry/electron-config";
import type { EngineType } from "@/lib/wasm/orbital-engine";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

export default function VisualizerPage() {
  const [n, setN] = useState(2);
  const [l, setL] = useState(1);
  const [m, setM] = useState(0);
  const [particleCount, setParticleCount] = useState(100000);
  const [pointSize, setPointSize] = useState(0.08);
  const [engineType, setEngineType] = useState<EngineType>("js");
  const [autoRotate, setAutoRotate] = useState(true);

  const { engine, loading: engineLoading } = useOrbitalEngine(engineType);
  const { data, generating, regenerate } = useOrbitalData(
    engine,
    n,
    l,
    m,
    particleCount
  );

  const handleNChange = useCallback(
    (newN: number) => {
      const constrained = constrainQuantumNumbers(newN, l, m);
      setN(constrained.n);
      setL(constrained.l);
      setM(constrained.m);
    },
    [l, m]
  );

  const handleLChange = useCallback(
    (newL: number) => {
      const constrained = constrainQuantumNumbers(n, newL, m);
      setL(constrained.l);
      setM(constrained.m);
    },
    [n, m]
  );

  const handleMChange = useCallback((newM: number) => {
    setM(newM);
  }, []);

  return (
    <div className="h-[calc(100vh-48px)] relative">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        {data ? (
          <OrbitalViewer
            positions={data.positions}
            colors={data.colors}
            pointSize={pointSize}
            autoRotate={autoRotate}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Floating Control Panel */}
      <div className="absolute top-4 left-4 w-72 bg-card/80 backdrop-blur-xl rounded-lg border border-border/50 p-4 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Orbital Visualizer</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {getOrbitalName(n, l, m)}
            </p>
          </div>
          <div className="flex gap-1">
            {(engineLoading || generating) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={regenerate}
              title="Regenerate"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <QuantumControls
          n={n}
          l={l}
          m={m}
          onNChange={handleNChange}
          onLChange={handleLChange}
          onMChange={handleMChange}
        />

        <ParticleControls
          count={particleCount}
          onCountChange={setParticleCount}
          pointSize={pointSize}
          onPointSizeChange={setPointSize}
        />

        <EngineToggle value={engineType} onChange={setEngineType} />

        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Auto Rotate</label>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`w-8 h-4 rounded-full transition-colors ${
              autoRotate ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white transition-transform ${
                autoRotate ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {engine && (
          <p className="text-[10px] text-muted-foreground">
            Engine: {engine.name}
          </p>
        )}
      </div>
    </div>
  );
}
