"use client";

import { useMemo } from "react";
import { OrbitalScene } from "./orbital-scene";
import { OrbitalPoints } from "./orbital-points";
import { PostProcessing } from "./post-processing";
import { SceneControls } from "./scene-controls";

interface BondOrbital {
  positions: Float32Array;
  colors: Float32Array;
  offset: [number, number, number];
}

interface BondViewerProps {
  orbitals: BondOrbital[];
  pointSize?: number;
  autoRotate?: boolean;
  bloomIntensity?: number;
}

function OffsetPoints({
  positions,
  colors,
  offset,
  pointSize,
  autoRotate,
}: BondOrbital & { pointSize: number; autoRotate: boolean }) {
  const offsetPositions = useMemo(() => {
    const out = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      out[i] = positions[i] + offset[0];
      out[i + 1] = positions[i + 1] + offset[1];
      out[i + 2] = positions[i + 2] + offset[2];
    }
    return out;
  }, [positions, offset]);

  return (
    <OrbitalPoints
      positions={offsetPositions}
      colors={colors}
      pointSize={pointSize}
      autoRotate={autoRotate}
    />
  );
}

export function BondViewer({
  orbitals,
  pointSize = 0.06,
  autoRotate = true,
  bloomIntensity = 1.2,
}: BondViewerProps) {
  return (
    <OrbitalScene className="w-full h-full">
      <ambientLight intensity={0.1} />
      <SceneControls />
      {orbitals.map((orb, i) => (
        <OffsetPoints
          key={i}
          positions={orb.positions}
          colors={orb.colors}
          offset={orb.offset}
          pointSize={pointSize}
          autoRotate={autoRotate}
        />
      ))}
      <PostProcessing bloomIntensity={bloomIntensity} />
    </OrbitalScene>
  );
}
