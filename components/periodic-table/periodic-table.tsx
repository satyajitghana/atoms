"use client";

import { ELEMENTS, CATEGORY_COLORS, type Element, type ElementCategory } from "@/lib/data/elements";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PeriodicTableProps {
  selectedElement?: number;
  onElementSelect: (element: Element) => void;
  compact?: boolean;
}

function getGridPosition(el: Element): { row: number; col: number } | null {
  if (el.number >= 57 && el.number <= 71) {
    return { row: 9, col: el.number - 57 + 3 };
  }
  if (el.number >= 89 && el.number <= 103) {
    return { row: 10, col: el.number - 89 + 3 };
  }
  return { row: el.period, col: el.group };
}

const CATEGORY_LABELS: { key: ElementCategory; label: string }[] = [
  { key: "alkali-metal", label: "Alkali Metal" },
  { key: "alkaline-earth", label: "Alkaline Earth" },
  { key: "transition-metal", label: "Transition Metal" },
  { key: "post-transition-metal", label: "Post-Transition" },
  { key: "metalloid", label: "Metalloid" },
  { key: "nonmetal", label: "Nonmetal" },
  { key: "halogen", label: "Halogen" },
  { key: "noble-gas", label: "Noble Gas" },
  { key: "lanthanide", label: "Lanthanide" },
  { key: "actinide", label: "Actinide" },
];

function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 px-1">
      {CATEGORY_LABELS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: CATEGORY_COLORS[key] }}
          />
          <span className="text-[9px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function PeriodicTable({
  selectedElement,
  onElementSelect,
  compact = false,
}: PeriodicTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div
        className={`grid ${compact ? "gap-px" : "gap-0.5"} min-w-[700px]`}
        style={{
          gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
          gridTemplateRows: compact
            ? "repeat(10, 32px)"
            : "repeat(10, minmax(0, 1fr))",
        }}
      >
        {/* Lanthanide / Actinide row labels */}
        {!compact && (
          <>
            <div
              className="flex items-center justify-end pr-1"
              style={{ gridRow: 9, gridColumn: "1 / 3" }}
            >
              <span className="text-[8px] text-muted-foreground font-mono">Lanthanides</span>
            </div>
            <div
              className="flex items-center justify-end pr-1"
              style={{ gridRow: 10, gridColumn: "1 / 3" }}
            >
              <span className="text-[8px] text-muted-foreground font-mono">Actinides</span>
            </div>
          </>
        )}

        {ELEMENTS.map((el) => {
          const pos = getGridPosition(el);
          if (!pos) return null;

          const isSelected = selectedElement === el.number;
          const color = CATEGORY_COLORS[el.category];

          return (
            <Tooltip key={el.number}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onElementSelect(el)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-sm text-[10px] leading-tight border cursor-pointer",
                    "transition-all duration-200",
                    compact ? "h-full" : "aspect-square",
                    isSelected
                      ? "scale-110 z-10"
                      : "hover:scale-105 hover:z-10"
                  )}
                  style={{
                    gridRow: pos.row,
                    gridColumn: pos.col,
                    background: isSelected
                      ? color
                      : `linear-gradient(135deg, ${color}18, ${color}35)`,
                    borderColor: isSelected ? color : `${color}50`,
                    color: isSelected ? "#000" : color,
                    boxShadow: isSelected
                      ? `0 0 12px ${color}80, 0 0 4px ${color}60, inset 0 0 8px ${color}30`
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.boxShadow = `0 0 8px ${color}50, 0 0 2px ${color}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  {!compact && (
                    <span className="text-[7px] font-mono opacity-50">{el.number}</span>
                  )}
                  <span className={`font-bold ${compact ? "text-[9px]" : "text-xs"}`}>
                    {el.symbol}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-semibold">{el.name}</p>
                <p className="text-muted-foreground text-[10px]">
                  {el.mass.toFixed(3)} u
                </p>
                <p className="text-muted-foreground font-mono text-[10px]">
                  {el.electronConfiguration}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {!compact && <CategoryLegend />}
    </div>
  );
}
