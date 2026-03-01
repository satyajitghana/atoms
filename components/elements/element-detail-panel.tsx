"use client";

import { useMemo } from "react";
import type { Element } from "@/lib/data/elements";
import { CATEGORY_COLORS } from "@/lib/data/elements";
import { getElementDetails } from "@/lib/data/element-details";
import { COMPOUNDS, type Compound } from "@/lib/data/compounds";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Thermometer, Atom, Zap, Scale, Calendar, FlaskConical } from "lucide-react";

interface ElementDetailPanelProps {
  element: Element;
}

function PropertyRow({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-[10px]">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-foreground">
        {value}{unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

export function ElementDetailPanel({ element }: ElementDetailPanelProps) {
  const details = getElementDetails(element.number);
  const color = CATEGORY_COLORS[element.category];

  const relatedCompounds = useMemo(() => {
    return COMPOUNDS.filter((c) =>
      c.elements.some((e) => e.symbol === element.symbol)
    ).slice(0, 20);
  }, [element.symbol]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-lg flex flex-col items-center justify-center border"
          style={{
            backgroundColor: `${color}20`,
            borderColor: `${color}40`,
          }}
        >
          <span className="text-[8px] font-mono text-muted-foreground">{element.number}</span>
          <span className="text-xl font-bold" style={{ color }}>{element.symbol}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{element.name}</h3>
          <p className="text-[10px] text-muted-foreground font-mono truncate">
            {element.electronConfiguration}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge
              variant="outline"
              className="text-[8px] px-1.5 py-0"
              style={{ borderColor: `${color}60`, color }}
            >
              {element.category.replace(/-/g, " ")}
            </Badge>
            <span className="text-[9px] text-muted-foreground">
              {element.mass.toFixed(3)} u
            </span>
          </div>
        </div>
      </div>

      {details && (
        <>
          <Separator className="opacity-30" />

          {/* State & Appearance */}
          <div className="space-y-0.5">
            <h4 className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Physical Properties
            </h4>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className="text-[8px] capitalize"
              >
                {details.state} at room temp
              </Badge>
              <span className="text-[9px] text-muted-foreground">{details.appearance}</span>
            </div>

            <PropertyRow
              icon={Thermometer}
              label="Melting Point"
              value={details.meltingPoint}
              unit="°C"
            />
            <PropertyRow
              icon={Thermometer}
              label="Boiling Point"
              value={details.boilingPoint}
              unit="°C"
            />
            <PropertyRow
              icon={Scale}
              label="Density"
              value={details.density}
              unit="g/cm³"
            />
            <PropertyRow
              icon={Atom}
              label="Atomic Radius"
              value={details.atomicRadius}
              unit="pm"
            />
          </div>

          <Separator className="opacity-30" />

          {/* Chemical Properties */}
          <div className="space-y-0.5">
            <h4 className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Chemical Properties
            </h4>
            <PropertyRow
              icon={Zap}
              label="Electronegativity"
              value={details.electronegativity}
            />
            <PropertyRow
              icon={Zap}
              label="Ionization Energy"
              value={details.ionizationEnergy}
              unit="kJ/mol"
            />
            {details.oxidationStates.length > 0 && (
              <div className="flex items-center justify-between py-1">
                <span className="text-[10px] text-muted-foreground">Oxidation States</span>
                <div className="flex gap-0.5">
                  {details.oxidationStates.map((os) => (
                    <span
                      key={os}
                      className="text-[8px] font-mono bg-muted/50 px-1 py-0.5 rounded"
                    >
                      {os > 0 ? `+${os}` : os}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="opacity-30" />

          {/* Discovery & Uses */}
          <div className="space-y-1">
            <PropertyRow
              icon={Calendar}
              label="Discovered"
              value={details.yearDiscovered?.toString() ?? null}
            />
            <div className="py-1">
              <span className="text-[10px] text-muted-foreground block mb-0.5">Common Uses</span>
              <p className="text-[9px] text-foreground/80 leading-relaxed">{details.uses}</p>
            </div>
          </div>
        </>
      )}

      {/* Compounds */}
      {relatedCompounds.length > 0 && (
        <>
          <Separator className="opacity-30" />
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FlaskConical className="h-3 w-3 text-muted-foreground" />
              <h4 className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Compounds ({relatedCompounds.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {relatedCompounds.map((c) => (
                <Tooltip key={c.formula}>
                  <TooltipTrigger asChild>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary cursor-default">
                      {c.formula}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-muted-foreground text-[10px]">{c.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
