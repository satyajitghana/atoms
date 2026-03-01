"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PeriodicTable } from "@/components/periodic-table/periodic-table";
import { PeriodicTableViews, VIEW_OPTIONS, type ViewMode } from "@/components/periodic-table/periodic-table-views";
import { ElementDetailPanel } from "@/components/elements/element-detail-panel";
import { ParticleControls } from "@/components/controls/particle-controls";
import { AufbauDiagram } from "@/components/electron-config/aufbau-diagram";
import {
  parseElectronConfig,
  getSubshellName,
} from "@/lib/chemistry/electron-config";
import { useOrbitalEngine, useOrbitalData } from "@/lib/hooks/use-orbital-engine";
import { useElementsStore } from "@/lib/stores/elements-store";
import type { Element } from "@/lib/data/elements";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

export default function ElementsPage() {
  const {
    selectedElement,
    selectedOrbitalIdx,
    particleCount,
    pointSize,
    setSelectedElement,
    clearSelection,
    setSelectedOrbitalIdx,
    setParticleCount,
    setPointSize,
  } = useElementsStore();

  const [viewMode, setViewMode] = useState<ViewMode>("standard");

  const orbitals = selectedElement
    ? parseElectronConfig(selectedElement.electronConfiguration)
    : [];

  const activeOrbital = orbitals[selectedOrbitalIdx] || orbitals[0];

  const { engine } = useOrbitalEngine("rust");
  const { data } = useOrbitalData(
    engine,
    activeOrbital?.n || 1,
    activeOrbital?.l || 0,
    activeOrbital?.m || 0,
    particleCount
  );

  const handleElementSelect = (el: Element) => {
    setSelectedElement(el);
  };

  const handleAufbauClick = (n: number, l: number, m: number) => {
    const idx = orbitals.findIndex(
      (o) => o.n === n && o.l === l && o.m === m
    );
    if (idx >= 0) setSelectedOrbitalIdx(idx);
  };

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold">Element Explorer</h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {selectedElement
              ? `${selectedElement.name} — ${selectedElement.electronConfiguration}`
              : "Select an element to visualize its electron orbitals"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* View mode selector */}
          <div className="flex gap-0.5 bg-muted/30 rounded-md p-0.5">
            {VIEW_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] transition-all",
                  viewMode === key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {selectedElement && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
              onClick={clearSelection}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop: side by side | Mobile: stacked */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Periodic Table + Details */}
        <div className={`${selectedElement ? "lg:w-[52%]" : "w-full"} overflow-auto p-3 sm:p-4 pt-1 transition-all duration-300 ${selectedElement ? "max-h-[45vh] lg:max-h-full" : ""}`}>
          {viewMode === "standard" ? (
            <PeriodicTable
              selectedElement={selectedElement?.number}
              onElementSelect={handleElementSelect}
              compact={!!selectedElement}
            />
          ) : (
            <PeriodicTableViews
              selectedElement={selectedElement?.number}
              onElementSelect={handleElementSelect}
              view={viewMode}
            />
          )}

          {selectedElement && (
            <>
              {/* Element Details */}
              <div className="mt-4 p-3 rounded-lg border border-border/30 bg-card/30">
                <ElementDetailPanel element={selectedElement} />
              </div>

              {/* Aufbau Diagram */}
              <div className="mt-3 p-3 rounded-lg border border-border/30 bg-card/30">
                <AufbauDiagram
                  electronConfiguration={selectedElement.electronConfiguration}
                  activeOrbital={activeOrbital}
                  onOrbitalClick={handleAufbauClick}
                />
              </div>
            </>
          )}
        </div>

        {/* Orbital Visualization */}
        {selectedElement ? (
          <div className="lg:w-[48%] border-t lg:border-t-0 lg:border-l border-border/50 flex flex-col min-h-0 flex-1 bg-card/30">
            {/* Orbital pills */}
            <div className="shrink-0 px-3 pt-2 pb-2">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Orbitals
                </h3>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                {activeOrbital && (
                  <span className="text-[10px] font-mono text-primary">
                    {getSubshellName(activeOrbital.n, activeOrbital.l)} m={activeOrbital.m >= 0 ? "+" : ""}{activeOrbital.m}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {orbitals.map((orb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOrbitalIdx(idx)}
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono transition-all ${
                      idx === selectedOrbitalIdx
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : "text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {getSubshellName(orb.n, orb.l)}
                    <Badge variant="secondary" className="ml-0.5 text-[7px] px-1 py-0 h-3">
                      {orb.electrons}e
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="opacity-30" />

            {/* 3D Viewer */}
            <div className="flex-1 relative min-h-[200px]">
              {data ? (
                <OrbitalViewer
                  positions={data.positions}
                  colors={data.colors}
                  pointSize={pointSize}
                  autoRotate
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-[#050508]">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-[10px] text-muted-foreground">Loading orbital...</span>
                  </div>
                </div>
              )}
              {activeOrbital && (
                <div className="absolute bottom-2 left-2 bg-card/70 backdrop-blur-xl rounded-lg border border-border/30 px-2 py-1">
                  <p className="text-[8px] sm:text-[9px] font-mono text-muted-foreground">
                    n={activeOrbital.n}, l={activeOrbital.l}, m={activeOrbital.m}
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="shrink-0 px-3 py-2 border-t border-border/30">
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
