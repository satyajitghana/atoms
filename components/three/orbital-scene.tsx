"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

interface OrbitalSceneProps {
  children: ReactNode;
  className?: string;
  dpr?: [number, number];
}

export function OrbitalScene({ children, className, dpr = [1, 2] }: OrbitalSceneProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 50, near: 0.1, far: 10000 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={dpr}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#050508"]} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
