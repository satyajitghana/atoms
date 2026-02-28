"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbitalPointsProps {
  positions: Float32Array;
  colors: Float32Array;
  pointSize?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
}

export function OrbitalPoints({
  positions,
  colors,
  pointSize = 0.08,
  autoRotate = false,
  rotateSpeed = 0.1,
}: OrbitalPointsProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("particleColor", new THREE.BufferAttribute(colors, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [positions, colors]);

  // Dispose old geometry when it changes
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          attribute vec3 particleColor;
          varying vec3 vColor;
          uniform float pointSize;

          void main() {
            vColor = particleColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = pointSize * (200.0 / -mvPosition.z);
            gl_PointSize = max(gl_PointSize, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;

          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            if (dist > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
            gl_FragColor = vec4(vColor, alpha * 0.85);
          }
        `,
        uniforms: {
          pointSize: { value: pointSize },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    material.uniforms.pointSize.value = pointSize;
  }, [material, pointSize]);

  useFrame((_, delta) => {
    if (autoRotate && pointsRef.current) {
      pointsRef.current.rotation.y += delta * rotateSpeed;
    }
  });

  // Cleanup material on unmount
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
    />
  );
}
