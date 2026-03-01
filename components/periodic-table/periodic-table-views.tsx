"use client";

import { useState, useMemo } from "react";
import { ELEMENTS, CATEGORY_COLORS, type Element, type ElementCategory } from "@/lib/data/elements";
import { getElementDetails } from "@/lib/data/element-details";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ViewMode = "standard" | "electronegativity" | "state" | "discovery" | "radius" | "spiral";

interface PeriodicTableViewsProps {
  selectedElement?: number;
  onElementSelect: (element: Element) => void;
  view: ViewMode;
}

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: "standard", label: "Standard" },
  { key: "electronegativity", label: "Electronegativity" },
  { key: "state", label: "State of Matter" },
  { key: "discovery", label: "Discovery Year" },
  { key: "radius", label: "Atomic Radius" },
  { key: "spiral", label: "Spiral" },
];

export { VIEW_OPTIONS };
export type { ViewMode };

function getColorForValue(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // Blue -> Cyan -> Green -> Yellow -> Red
  const r = Math.round(t < 0.5 ? 0 : (t - 0.5) * 2 * 255);
  const g = Math.round(t < 0.5 ? t * 2 * 255 : (1 - (t - 0.5) * 2) * 255);
  const b = Math.round(t < 0.5 ? (1 - t * 2) * 255 : 0);
  return `rgb(${r}, ${g}, ${b})`;
}

const STATE_COLORS: Record<string, string> = {
  solid: "#22c55e",
  liquid: "#3b82f6",
  gas: "#ef4444",
  unknown: "#666666",
};

function getDiscoveryColor(year: number | string | null): string {
  if (year === "Ancient" || year === null) return "#8b5cf6";
  const y = typeof year === "string" ? parseInt(year) : year;
  if (y < 1700) return "#ec4899";
  if (y < 1800) return "#f97316";
  if (y < 1900) return "#eab308";
  if (y < 1950) return "#22c55e";
  return "#06b6d4";
}

// Sorted grid view for property-based views
function SortedGridView({
  elements,
  selectedElement,
  onElementSelect,
  getColor,
  getLegend,
}: {
  elements: Element[];
  selectedElement?: number;
  onElementSelect: (el: Element) => void;
  getColor: (el: Element) => string;
  getLegend: () => { color: string; label: string }[];
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {elements.map((el) => {
          const isSelected = selectedElement === el.number;
          const color = getColor(el);
          return (
            <Tooltip key={el.number}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onElementSelect(el)}
                  className={cn(
                    "w-9 h-9 rounded-sm text-[10px] font-bold border cursor-pointer flex flex-col items-center justify-center transition-all",
                    isSelected ? "scale-110 z-10 ring-2 ring-white/50" : "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: isSelected ? color : `${color}30`,
                    borderColor: `${color}60`,
                    color: isSelected ? "#000" : color,
                  }}
                >
                  <span className="text-[6px] opacity-60">{el.number}</span>
                  <span className="text-[10px] font-bold leading-none">{el.symbol}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-semibold">{el.name}</p>
                <p className="text-muted-foreground text-[10px]">{el.mass.toFixed(3)} u</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {getLegend().map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[8px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Spiral/circular view
function SpiralView({
  selectedElement,
  onElementSelect,
}: {
  selectedElement?: number;
  onElementSelect: (el: Element) => void;
}) {
  const positions = useMemo(() => {
    // Place elements in a spiral from center outward
    // Hydrogen at center, then expand outward by period
    const results: { el: Element; x: number; y: number }[] = [];
    const centerX = 300;
    const centerY = 300;

    ELEMENTS.forEach((el, i) => {
      // Archimedean spiral
      const angle = i * 0.5;
      const r = 8 + i * 2.2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      results.push({ el, x, y });
    });

    return results;
  }, []);

  return (
    <div className="w-full overflow-auto">
      <svg viewBox="0 0 600 600" className="w-full max-w-[500px] mx-auto h-auto">
        {/* Background */}
        <rect width="600" height="600" fill="transparent" />

        {positions.map(({ el, x, y }) => {
          const isSelected = selectedElement === el.number;
          const color = CATEGORY_COLORS[el.category];

          return (
            <g
              key={el.number}
              onClick={() => onElementSelect(el)}
              className="cursor-pointer"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <g>
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? color : `${color}40`}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 0.5}
                    />
                    <text
                      x={x}
                      y={y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? "#000" : color}
                      fontSize={isSelected ? "7" : "5"}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {el.symbol}
                    </text>
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{el.name}</p>
                  <p className="text-muted-foreground text-[10px]">{el.mass.toFixed(3)} u</p>
                </TooltipContent>
              </Tooltip>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PeriodicTableViews({
  selectedElement,
  onElementSelect,
  view,
}: PeriodicTableViewsProps) {
  if (view === "spiral") {
    return (
      <SpiralView
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
      />
    );
  }

  if (view === "electronegativity") {
    const sorted = [...ELEMENTS].sort((a, b) => {
      const da = getElementDetails(a.number);
      const db = getElementDetails(b.number);
      const va = da?.electronegativity ?? 0;
      const vb = db?.electronegativity ?? 0;
      return vb - va;
    });

    return (
      <SortedGridView
        elements={sorted}
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
        getColor={(el) => {
          const d = getElementDetails(el.number);
          if (!d?.electronegativity) return "#666666";
          return getColorForValue(d.electronegativity, 0.5, 4.0);
        }}
        getLegend={() => [
          { color: getColorForValue(0.5, 0.5, 4.0), label: "Low (0.5)" },
          { color: getColorForValue(1.5, 0.5, 4.0), label: "1.5" },
          { color: getColorForValue(2.5, 0.5, 4.0), label: "2.5" },
          { color: getColorForValue(3.5, 0.5, 4.0), label: "High (3.5+)" },
        ]}
      />
    );
  }

  if (view === "state") {
    // Group by state
    const byState: Record<string, Element[]> = { solid: [], liquid: [], gas: [], unknown: [] };
    ELEMENTS.forEach((el) => {
      const d = getElementDetails(el.number);
      const state = d?.state ?? "unknown";
      byState[state].push(el);
    });

    return (
      <div className="space-y-3">
        {(["solid", "liquid", "gas", "unknown"] as const).map((state) => {
          if (byState[state].length === 0) return null;
          return (
            <div key={state}>
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATE_COLORS[state] }}
                />
                <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground capitalize">
                  {state} ({byState[state].length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {byState[state].map((el) => {
                  const isSelected = selectedElement === el.number;
                  const color = STATE_COLORS[state];
                  return (
                    <Tooltip key={el.number}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onElementSelect(el)}
                          className={cn(
                            "w-8 h-8 rounded-sm text-[9px] font-bold border cursor-pointer flex items-center justify-center transition-all",
                            isSelected ? "scale-110 z-10" : "hover:scale-105"
                          )}
                          style={{
                            backgroundColor: isSelected ? color : `${color}25`,
                            borderColor: `${color}50`,
                            color: isSelected ? "#000" : color,
                          }}
                        >
                          {el.symbol}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{el.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (view === "discovery") {
    const sorted = [...ELEMENTS].sort((a, b) => {
      const da = getElementDetails(a.number);
      const db = getElementDetails(b.number);
      const ya = da?.yearDiscovered === "Ancient" ? 0 : (typeof da?.yearDiscovered === "number" ? da.yearDiscovered : 9999);
      const yb = db?.yearDiscovered === "Ancient" ? 0 : (typeof db?.yearDiscovered === "number" ? db.yearDiscovered : 9999);
      return ya - yb;
    });

    return (
      <SortedGridView
        elements={sorted}
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
        getColor={(el) => {
          const d = getElementDetails(el.number);
          return getDiscoveryColor(d?.yearDiscovered ?? null);
        }}
        getLegend={() => [
          { color: "#8b5cf6", label: "Ancient" },
          { color: "#ec4899", label: "< 1700" },
          { color: "#f97316", label: "1700s" },
          { color: "#eab308", label: "1800s" },
          { color: "#22c55e", label: "1900-1950" },
          { color: "#06b6d4", label: "After 1950" },
        ]}
      />
    );
  }

  if (view === "radius") {
    const sorted = [...ELEMENTS].sort((a, b) => {
      const da = getElementDetails(a.number);
      const db = getElementDetails(b.number);
      return (db?.atomicRadius ?? 0) - (da?.atomicRadius ?? 0);
    });

    return (
      <SortedGridView
        elements={sorted}
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
        getColor={(el) => {
          const d = getElementDetails(el.number);
          if (!d?.atomicRadius) return "#666666";
          return getColorForValue(d.atomicRadius, 30, 300);
        }}
        getLegend={() => [
          { color: getColorForValue(30, 30, 300), label: "Small (< 50 pm)" },
          { color: getColorForValue(100, 30, 300), label: "100 pm" },
          { color: getColorForValue(200, 30, 300), label: "200 pm" },
          { color: getColorForValue(300, 30, 300), label: "Large (300 pm)" },
        ]}
      />
    );
  }

  // "standard" view - handled by the main PeriodicTable component
  return null;
}
