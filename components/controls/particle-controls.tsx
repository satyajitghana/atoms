"use client";

import { Slider } from "@/components/ui/slider";

interface ParticleControlsProps {
  count: number;
  onCountChange: (count: number) => void;
  pointSize: number;
  onPointSizeChange: (size: number) => void;
}

const PARTICLE_STEPS = [10000, 25000, 50000, 100000, 150000, 200000, 300000, 500000];

function countToSlider(count: number): number {
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < PARTICLE_STEPS.length; i++) {
    const diff = Math.abs(PARTICLE_STEPS[i] - count);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

function sliderToCount(val: number): number {
  return PARTICLE_STEPS[Math.round(val)] || 50000;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function ParticleControls({
  count,
  onCountChange,
  pointSize,
  onPointSizeChange,
}: ParticleControlsProps) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Rendering
      </h3>

      <div className="group">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Particles
          </label>
          <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
            {formatCount(count)}
          </span>
        </div>
        <Slider
          value={[countToSlider(count)]}
          onValueChange={([v]) => onCountChange(sliderToCount(v))}
          min={0}
          max={PARTICLE_STEPS.length - 1}
          step={1}
        />
      </div>

      <div className="group">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Point Size
          </label>
          <span className="text-xs font-mono tabular-nums text-foreground bg-muted px-1.5 rounded">
            {pointSize.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[pointSize]}
          onValueChange={([v]) => onPointSizeChange(v)}
          min={0.02}
          max={0.3}
          step={0.01}
        />
      </div>
    </div>
  );
}
