"use client";

import { cn } from "@/lib/utils";

interface OrbitalBoxProps {
  electrons: number; // 0, 1, or 2
  label?: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}

export function OrbitalBox({
  electrons,
  label,
  color = "#6366f1",
  active = false,
  onClick,
}: OrbitalBoxProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-8 h-10 rounded border flex flex-col items-center justify-center transition-all",
        "text-[10px] font-mono",
        onClick ? "cursor-pointer hover:scale-105" : "cursor-default",
        active
          ? "border-primary shadow-sm shadow-primary/30 bg-primary/10"
          : "border-border/50 bg-card/50"
      )}
      style={{
        borderColor: active ? color : undefined,
        boxShadow: active ? `0 0 6px ${color}40` : undefined,
      }}
    >
      <div className="flex gap-0.5 items-end h-5">
        {electrons >= 1 && (
          <span className="text-[11px] leading-none" style={{ color }}>
            ↑
          </span>
        )}
        {electrons >= 2 && (
          <span className="text-[11px] leading-none" style={{ color }}>
            ↓
          </span>
        )}
      </div>
      {label && (
        <span className="text-[7px] text-muted-foreground mt-0.5">
          {label}
        </span>
      )}
    </button>
  );
}
