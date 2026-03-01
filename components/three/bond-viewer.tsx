"use client";

import { useMemo } from "react";
import { OrbitalScene } from "./orbital-scene";
import { OrbitalPoints } from "./orbital-points";
import { OrbitalVolume } from "./orbital-volume";
import { PostProcessing } from "./post-processing";
import { SceneControls } from "./scene-controls";
import type { VolumeData } from "@/lib/wasm/volume-generator";

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
  renderMode?: "points" | "volume";
  volumeData?: (VolumeData | null)[];
  volumeOpacity?: number;
  bondDistance?: number;
  bondType?: string;
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
  renderMode = "points",
  volumeData,
  volumeOpacity = 5.0,
}: BondViewerProps) {
  const showVolume = renderMode === "volume" && volumeData && volumeData.length >= 2 && volumeData[0] && volumeData[1];

  return (
    <OrbitalScene className="w-full h-full">
      <ambientLight intensity={0.1} />
      <SceneControls />
      {renderMode === "points" || !showVolume ? (
        orbitals.map((orb, i) => (
          <OffsetPoints
            key={i}
            positions={orb.positions}
            colors={orb.colors}
            offset={orb.offset}
            pointSize={pointSize}
            autoRotate={autoRotate}
          />
        ))
      ) : (
        <>
          {volumeData!.map((vd, i) =>
            vd ? (
              <group key={i} position={orbitals[i]?.offset ?? [0, 0, 0]}>
                <OrbitalVolume
                  volumeData={vd}
                  opacity={volumeOpacity}
                  autoRotate={autoRotate}
                />
              </group>
            ) : null
          )}
        </>
      )}
      <PostProcessing bloomIntensity={bloomIntensity} />
    </OrbitalScene>
  );
}
