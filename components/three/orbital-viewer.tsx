"use client";

import { OrbitalScene } from "./orbital-scene";
import { OrbitalPoints } from "./orbital-points";
import { PostProcessing } from "./post-processing";
import { SceneControls } from "./scene-controls";

interface OrbitalViewerProps {
  positions: Float32Array;
  colors: Float32Array;
  pointSize?: number;
  autoRotate?: boolean;
  bloomIntensity?: number;
}

export function OrbitalViewer({
  positions,
  colors,
  pointSize = 0.08,
  autoRotate = false,
  bloomIntensity = 1.5,
}: OrbitalViewerProps) {
  return (
    <OrbitalScene className="w-full h-full">
      <ambientLight intensity={0.1} />
      <SceneControls />
      <OrbitalPoints
        positions={positions}
        colors={colors}
        pointSize={pointSize}
        autoRotate={autoRotate}
      />
      <PostProcessing bloomIntensity={bloomIntensity} />
    </OrbitalScene>
  );
}
