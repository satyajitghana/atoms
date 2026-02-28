"use client";

import { ELEMENTS, CATEGORY_COLORS, type Element } from "@/lib/data/elements";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PeriodicTableProps {
  selectedElement?: number;
  onElementSelect: (element: Element) => void;
  compact?: boolean;
}

// Standard periodic table layout: row, col for each element
function getGridPosition(el: Element): { row: number; col: number } | null {
  // Lanthanides (57-71) go in row 9
  if (el.number >= 57 && el.number <= 71) {
    return { row: 9, col: el.number - 57 + 3 };
  }
  // Actinides (89-103) go in row 10
  if (el.number >= 89 && el.number <= 103) {
    return { row: 10, col: el.number - 89 + 3 };
  }
  return { row: el.period, col: el.group };
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
                  className={`
                    ${compact ? "h-full" : "aspect-square"} flex flex-col items-center justify-center
                    rounded-sm text-[10px] leading-tight transition-all
                    border cursor-pointer
                    ${
                      isSelected
                        ? "ring-2 ring-primary scale-110 z-10"
                        : "hover:scale-105 hover:z-10"
                    }
                  `}
                  style={{
                    gridRow: pos.row,
                    gridColumn: pos.col,
                    backgroundColor: isSelected
                      ? color
                      : `${color}20`,
                    borderColor: `${color}60`,
                    color: isSelected ? "#000" : color,
                  }}
                >
                  {!compact && (
                    <span className="text-[8px] opacity-60">{el.number}</span>
                  )}
                  <span className={`font-bold ${compact ? "text-[9px]" : "text-xs"}`}>
                    {el.symbol}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-semibold">{el.name}</p>
                <p className="text-muted-foreground font-mono">
                  {el.electronConfiguration}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
