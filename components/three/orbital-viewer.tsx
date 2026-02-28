"use client";

import { OrbitalScene } from "./orbital-scene";
import { OrbitalPoints } from "./orbital-points";
import { OrbitalVolume } from "./orbital-volume";
import { PostProcessing } from "./post-processing";
import { SceneControls } from "./scene-controls";
import type { VolumeData } from "@/lib/wasm/volume-generator";

interface OrbitalViewerProps {
  positions: Float32Array;
  colors: Float32Array;
  pointSize?: number;
  autoRotate?: boolean;
  bloomIntensity?: number;
  renderMode?: "points" | "volume";
  volumeData?: VolumeData | null;
  volumeOpacity?: number;
  edlEnabled?: boolean;
}

export function OrbitalViewer({
  positions,
  colors,
  pointSize = 0.08,
  autoRotate = false,
  bloomIntensity = 1.5,
  renderMode = "points",
  volumeData = null,
  volumeOpacity = 5.0,
  edlEnabled = false,
}: OrbitalViewerProps) {
  return (
    <OrbitalScene className="w-full h-full">
      <ambientLight intensity={0.1} />
      <SceneControls />
      {renderMode === "points" ? (
        <OrbitalPoints
          positions={positions}
          colors={colors}
          pointSize={pointSize}
          autoRotate={autoRotate}
        />
      ) : volumeData ? (
        <OrbitalVolume
          volumeData={volumeData}
          opacity={volumeOpacity}
          autoRotate={autoRotate}
        />
      ) : null}
      <PostProcessing
        bloomIntensity={bloomIntensity}
        edlEnabled={edlEnabled}
      />
    </OrbitalScene>
  );
}
