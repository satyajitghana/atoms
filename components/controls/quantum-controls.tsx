"use client";

import { useVisualizerStore } from "@/lib/stores/visualizer-store";
import { cn } from "@/lib/utils";

const SUBSHELL_NAMES = ["s", "p", "d", "f", "g", "h", "i"];

function SegmentedGroup({
  label,
  sublabel,
  values,
  selected,
  onSelect,
  renderLabel,
  disabledValues,
}: {
  label: string;
  sublabel: string;
  values: number[];
  selected: number;
  onSelect: (v: number) => void;
  renderLabel?: (v: number) => string;
  disabledValues?: Set<number>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">
          {label} <span className="opacity-50">({sublabel})</span>
        </label>
      </div>
      <div className="flex gap-1 flex-wrap">
        {values.map((v) => {
          const disabled = disabledValues?.has(v) ?? false;
          const active = v === selected;
          return (
            <button
              key={v}
              disabled={disabled}
              onClick={() => onSelect(v)}
              className={cn(
                "h-7 min-w-[2rem] px-2 rounded-md text-[11px] font-mono font-medium transition-all",
                "border border-border/50",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : disabled
                    ? "opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              )}
            >
              {renderLabel ? renderLabel(v) : v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuantumControls() {
  const { n, l, m, setN, setL, setM } = useVisualizerStore();

  const lValues = Array.from({ length: Math.min(n, 7) }, (_, i) => i);
  const lDisabled = new Set(lValues.filter((v) => v >= n));

  const mValues = Array.from({ length: 2 * l + 1 }, (_, i) => i - l);

  const orbitalName = `${n}${SUBSHELL_NAMES[l] || "?"}${l > 0 ? `, m=${m >= 0 ? "+" : ""}${m}` : ""}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Quantum Numbers
        </h3>
        <span className="text-sm font-semibold font-mono text-primary">
          {orbitalName}
        </span>
      </div>

      <SegmentedGroup
        label="n"
        sublabel="principal"
        values={[1, 2, 3, 4, 5, 6, 7]}
        selected={n}
        onSelect={setN}
      />

      <SegmentedGroup
        label="ℓ"
        sublabel="angular"
        values={lValues}
        selected={l}
        onSelect={setL}
        disabledValues={lDisabled}
        renderLabel={(v) => `${SUBSHELL_NAMES[v]}`}
      />

      {l > 0 && (
        <SegmentedGroup
          label="m"
          sublabel="magnetic"
          values={mValues}
          selected={m}
          onSelect={setM}
          renderLabel={(v) => (v >= 0 ? `+${v}` : `${v}`)}
        />
      )}
    </div>
  );
}
