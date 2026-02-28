"use client";

import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useVisualizerStore } from "@/lib/stores/visualizer-store";

const SUBSHELL_NAMES = ["s", "p", "d", "f", "g", "h", "i"];

export function QuantumControls() {
  const { n, l, m, setN, setL, setM } = useVisualizerStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Quantum Numbers
        </h3>
        <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
          {n}{SUBSHELL_NAMES[l] || "?"}{l > 0 ? ` m=${m >= 0 ? "+" : ""}${m}` : ""}
        </Badge>
      </div>

      <div className="space-y-2.5">
        <div className="group">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              n <span className="opacity-50">(principal)</span>
            </label>
            <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
              {n}
            </span>
          </div>
          <Slider
            value={[n]}
            onValueChange={([v]) => setN(v)}
            min={1}
            max={7}
            step={1}
          />
        </div>

        <div className="group">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              l <span className="opacity-50">(angular)</span>
            </label>
            <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
              {l} <span className="text-muted-foreground">{SUBSHELL_NAMES[l]}</span>
            </span>
          </div>
          <Slider
            value={[l]}
            onValueChange={([v]) => setL(v)}
            min={0}
            max={Math.max(n - 1, 0)}
            step={1}
          />
        </div>

        <div className="group">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              m <span className="opacity-50">(magnetic)</span>
            </label>
            <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
              {m >= 0 ? "+" : ""}{m}
            </span>
          </div>
          <Slider
            value={[m]}
            onValueChange={([v]) => setM(v)}
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
