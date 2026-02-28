"use client";

import { OrbitControls } from "@react-three/drei";

export function SceneControls() {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={1.0}
      minDistance={5}
      maxDistance={500}
      enablePan={false}
    />
  );
}
