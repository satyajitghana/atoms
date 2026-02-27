"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

interface OrbitalSceneProps {
  children: ReactNode;
  className?: string;
}

export function OrbitalScene({ children, className }: OrbitalSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 50, near: 0.1, far: 10000 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050508"]} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
