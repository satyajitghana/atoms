"use client";

import { cn } from "@/lib/utils";

interface EnergyMeterProps {
  deltaHf: number;
  className?: string;
}

export function EnergyMeter({ deltaHf, className }: EnergyMeterProps) {
  const absValue = Math.abs(deltaHf);
  const exothermic = deltaHf < 0;
  const isZero = deltaHf === 0;

  // Normalize to 0-100 scale (max around 1700 kJ/mol for Al2O3)
  const fillPercent = Math.min((absValue / 1700) * 100, 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {isZero ? "No energy change" : exothermic ? "Exothermic" : "Endothermic"}
        </span>
        <span
          className={cn(
            "text-xs font-mono font-semibold",
            isZero
              ? "text-muted-foreground"
              : exothermic
                ? "text-orange-400"
                : "text-blue-400"
          )}
        >
          {deltaHf === 0 ? "0" : `${deltaHf > 0 ? "+" : ""}${deltaHf.toFixed(1)}`} kJ/mol
        </span>
      </div>

      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            isZero
              ? "bg-muted-foreground/30"
              : exothermic
                ? "bg-gradient-to-r from-orange-600 to-red-500"
                : "bg-gradient-to-r from-cyan-600 to-blue-500"
          )}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {!isZero && (
        <p className="text-[9px] text-muted-foreground">
          {exothermic
            ? "Releases energy as heat and light"
            : "Absorbs energy from surroundings"}
        </p>
      )}
    </div>
  );
}
