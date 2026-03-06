"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
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
  interactive?: boolean;
  dpr?: [number, number];
}

function CameraFitter({ positions }: { positions: Float32Array }) {
  const { camera } = useThree();
  const prevRadius = useRef<number>(0);

  useEffect(() => {
    if (positions.length === 0) return;

    let maxR2 = 0;
    for (let i = 0; i < positions.length; i += 3) {
      const r2 =
        positions[i] * positions[i] +
        positions[i + 1] * positions[i + 1] +
        positions[i + 2] * positions[i + 2];
      if (r2 > maxR2) maxR2 = r2;
    }
    const radius = Math.sqrt(maxR2);

    if (
      prevRadius.current > 0 &&
      Math.abs(radius - prevRadius.current) / prevRadius.current < 0.2
    ) {
      return;
    }
    prevRadius.current = radius;

    const fov = (camera as THREE.PerspectiveCamera).fov;
    const fovRad = (fov * Math.PI) / 180;
    const dist = (radius / Math.sin(fovRad / 2)) * 1.2;

    const dir = camera.position.clone().normalize();
    if (dir.length() === 0) dir.set(0, 0, 1);
    camera.position.copy(dir.multiplyScalar(Math.max(dist, 10)));
    camera.updateProjectionMatrix();
  }, [positions, camera]);

  return null;
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
  interactive = true,
  dpr,
}: OrbitalViewerProps) {
  return (
    <OrbitalScene className="w-full h-full" dpr={dpr}>
      <ambientLight intensity={0.1} />
      {interactive && <SceneControls />}
      <CameraFitter positions={positions} />
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
