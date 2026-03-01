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

// Period-based spiral: concentric rings for each period, elements spaced evenly
// Hydrogen at center top, with each period forming a ring outward
function SpiralView({
  selectedElement,
  onElementSelect,
}: {
  selectedElement?: number;
  onElementSelect: (el: Element) => void;
}) {
  // Period ranges: which atomic numbers are in each period
  const PERIODS: { period: number; start: number; end: number }[] = [
    { period: 1, start: 1, end: 2 },
    { period: 2, start: 3, end: 10 },
    { period: 3, start: 11, end: 18 },
    { period: 4, start: 19, end: 36 },
    { period: 5, start: 37, end: 54 },
    { period: 6, start: 55, end: 86 },
    { period: 7, start: 87, end: 118 },
  ];

  const positions = useMemo(() => {
    const results: { el: Element; x: number; y: number; ring: number }[] = [];
    const cx = 400;
    const cy = 400;
    const baseRadius = 30;
    const ringSpacing = 48;

    for (const { period, start, end } of PERIODS) {
      const ring = period;
      const r = baseRadius + (ring - 1) * ringSpacing;
      const count = end - start + 1;

      for (let i = 0; i < count; i++) {
        const atomicNum = start + i;
        const el = ELEMENTS.find((e) => e.number === atomicNum);
        if (!el) continue;

        // Start from top (–π/2), distribute evenly around the circle
        // Leave a small gap at the top for visual separation
        const gapFraction = 0.06; // 6% gap
        const arcSpan = 2 * Math.PI * (1 - gapFraction);
        const startAngle = -Math.PI / 2 + (2 * Math.PI * gapFraction) / 2;
        const angle = startAngle + (arcSpan * i) / Math.max(count - 1, 1);

        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        results.push({ el, x, y, ring });
      }
    }

    return results;
  }, []);

  const svgSize = 800;

  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[700px] mx-auto h-auto">
        {/* Period ring guides */}
        {PERIODS.map(({ period }) => {
          const r = 30 + (period - 1) * 48;
          return (
            <circle
              key={`ring-${period}`}
              cx={400}
              cy={400}
              r={r}
              fill="none"
              stroke="#ffffff08"
              strokeWidth={0.5}
              strokeDasharray="3 6"
            />
          );
        })}

        {/* Period labels */}
        {PERIODS.map(({ period }) => {
          const r = 30 + (period - 1) * 48;
          return (
            <text
              key={`label-${period}`}
              x={400}
              y={400 - r - 6}
              textAnchor="middle"
              fill="#ffffff20"
              fontSize="8"
              fontFamily="monospace"
            >
              Period {period}
            </text>
          );
        })}

        {/* Element dots */}
        {positions.map(({ el, x, y }) => {
          const isSelected = selectedElement === el.number;
          const color = CATEGORY_COLORS[el.category];
          const r = isSelected ? 14 : 10;

          return (
            <g
              key={el.number}
              onClick={() => onElementSelect(el)}
              className="cursor-pointer"
              style={{ transition: "transform 0.2s" }}
            >
              {/* Glow for selected */}
              {isSelected && (
                <circle cx={x} cy={y} r={22} fill={`${color}20`} />
              )}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={isSelected ? color : `${color}30`}
                stroke={color}
                strokeWidth={isSelected ? 2 : 0.8}
              />
              <text
                x={x}
                y={y - 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? "#000" : color}
                fontSize={isSelected ? "8" : "6.5"}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {el.symbol}
              </text>
              <text
                x={x}
                y={y + 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? "#00000080" : `${color}60`}
                fontSize="4"
                fontFamily="monospace"
              >
                {el.number}
              </text>
            </g>
          );
        })}

        {/* Category legend */}
        {(() => {
          const categories = [
            "alkali-metal", "alkaline-earth", "transition-metal",
            "post-transition-metal", "metalloid", "nonmetal",
            "halogen", "noble-gas", "lanthanide", "actinide",
          ] as const;
          return categories.map((cat, i) => (
            <g key={cat} transform={`translate(${20 + (i % 5) * 155}, ${svgSize - 40 + Math.floor(i / 5) * 16})`}>
              <circle cx={0} cy={0} r={4} fill={CATEGORY_COLORS[cat]} />
              <text x={8} y={1} fill="#ffffff60" fontSize="7" fontFamily="monospace" dominantBaseline="middle">
                {cat.replace(/-/g, " ")}
              </text>
            </g>
          ));
        })()}
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
