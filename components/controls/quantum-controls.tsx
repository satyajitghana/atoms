"use client";

import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface QuantumControlsProps {
  n: number;
  l: number;
  m: number;
  onNChange: (n: number) => void;
  onLChange: (l: number) => void;
  onMChange: (m: number) => void;
}

const SUBSHELL_NAMES = ["s", "p", "d", "f", "g", "h", "i"];

export function QuantumControls({
  n,
  l,
  m,
  onNChange,
  onLChange,
  onMChange,
}: QuantumControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Quantum Numbers
        </h3>
        <Badge variant="secondary" className="font-mono text-xs">
          {n}
          {SUBSHELL_NAMES[l] || "?"}
          {l > 0 ? ` m=${m >= 0 ? "+" : ""}${m}` : ""}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground">
              n (principal)
            </label>
            <span className="text-xs font-mono text-foreground">{n}</span>
          </div>
          <Slider
            value={[n]}
            onValueChange={([v]) => onNChange(v)}
            min={1}
            max={7}
            step={1}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground">
              l (angular momentum)
            </label>
            <span className="text-xs font-mono text-foreground">
              {l} ({SUBSHELL_NAMES[l] || "?"})
            </span>
          </div>
          <Slider
            value={[l]}
            onValueChange={([v]) => onLChange(v)}
            min={0}
            max={Math.max(n - 1, 0)}
            step={1}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground">
              m (magnetic)
            </label>
            <span className="text-xs font-mono text-foreground">
              {m >= 0 ? "+" : ""}
              {m}
            </span>
          </div>
          <Slider
            value={[m]}
            onValueChange={([v]) => onMChange(v)}
            min={-l}
            max={l}
            step={1}
            disabled={l === 0}
          />
        </div>
      </div>
    </div>
  );
}
