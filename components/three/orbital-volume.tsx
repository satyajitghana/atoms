"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { VolumeData } from "@/lib/wasm/volume-generator";

interface OrbitalVolumeProps {
  volumeData: VolumeData;
  opacity?: number;
  autoRotate?: boolean;
  rotateSpeed?: number;
}

const VOLUME_VERTEX = /* glsl */ `
varying vec3 vLocalPos;

void main() {
  vLocalPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const VOLUME_FRAGMENT = /* glsl */ `
precision highp float;
precision highp sampler3D;

uniform sampler3D densityTex;
uniform sampler3D colorTex;
uniform vec3 camPos;
uniform float opacity;
uniform mat4 modelMatInv;

varying vec3 vLocalPos;

const int MAX_STEPS = 128;
const float MIN_TRANSMITTANCE = 0.01;

vec2 intersectBox(vec3 ro, vec3 rd, vec3 bMin, vec3 bMax) {
  vec3 tMin = (bMin - ro) / rd;
  vec3 tMax = (bMax - ro) / rd;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}

void main() {
  vec3 localCam = (modelMatInv * vec4(camPos, 1.0)).xyz;
  vec3 rayDir = normalize(vLocalPos - localCam);
  vec3 rayOrigin = localCam;

  vec3 boxMin = vec3(-0.5);
  vec3 boxMax = vec3(0.5);
  vec2 tHit = intersectBox(rayOrigin, rayDir, boxMin, boxMax);

  if (tHit.x > tHit.y) discard;

  tHit.x = max(tHit.x, 0.0);
  float stepSize = (tHit.y - tHit.x) / float(MAX_STEPS);

  vec3 accColor = vec3(0.0);
  float transmittance = 1.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    float t = tHit.x + (float(i) + 0.5) * stepSize;
    if (t > tHit.y) break;

    vec3 pos = rayOrigin + rayDir * t;
    vec3 texCoord = pos + 0.5;

    float d = texture(densityTex, texCoord).r;
    vec3 sampleColor = texture(colorTex, texCoord).rgb;

    // Beer-Lambert absorption with user-controlled opacity
    float stepAlpha = 1.0 - exp(-d * opacity * stepSize * 50.0);

    accColor += transmittance * sampleColor * stepAlpha;
    transmittance *= (1.0 - stepAlpha);

    if (transmittance < MIN_TRANSMITTANCE) break;
  }

  gl_FragColor = vec4(accColor, 1.0 - transmittance);
}
`;

export function OrbitalVolume({
  volumeData,
  opacity = 5.0,
  autoRotate = false,
  rotateSpeed = 0.1,
}: OrbitalVolumeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const { densityTex, colorTex } = useMemo(() => {
    const res = volumeData.resolution;

    const dTex = new THREE.Data3DTexture(
      new Float32Array(volumeData.density),
      res, res, res
    );
    dTex.format = THREE.RedFormat;
    dTex.type = THREE.FloatType;
    dTex.minFilter = THREE.LinearFilter;
    dTex.magFilter = THREE.LinearFilter;
    dTex.wrapS = THREE.ClampToEdgeWrapping;
    dTex.wrapT = THREE.ClampToEdgeWrapping;
    dTex.wrapR = THREE.ClampToEdgeWrapping;
    dTex.needsUpdate = true;

    const cTex = new THREE.Data3DTexture(
      new Float32Array(volumeData.colors),
      res, res, res
    );
    cTex.format = THREE.RGBFormat;
    cTex.type = THREE.FloatType;
    cTex.minFilter = THREE.LinearFilter;
    cTex.magFilter = THREE.LinearFilter;
    cTex.wrapS = THREE.ClampToEdgeWrapping;
    cTex.wrapT = THREE.ClampToEdgeWrapping;
    cTex.wrapR = THREE.ClampToEdgeWrapping;
    cTex.needsUpdate = true;

    return { densityTex: dTex, colorTex: cTex };
  }, [volumeData]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VOLUME_VERTEX,
      fragmentShader: VOLUME_FRAGMENT,
      uniforms: {
        densityTex: { value: densityTex },
        colorTex: { value: colorTex },
        camPos: { value: camera.position.clone() },
        opacity: { value: opacity },
        modelMatInv: { value: new THREE.Matrix4() },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [densityTex, colorTex, camera.position, opacity]);

  useEffect(() => {
    material.uniforms.opacity.value = opacity;
  }, [material, opacity]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    material.uniforms.camPos.value.copy(state.camera.position);
    material.uniforms.modelMatInv.value
      .copy(meshRef.current.matrixWorld)
      .invert();

    if (autoRotate) {
      meshRef.current.rotation.y += delta * rotateSpeed;
    }
  });

  useEffect(() => {
    return () => {
      densityTex.dispose();
      colorTex.dispose();
      material.dispose();
    };
  }, [densityTex, colorTex, material]);

  const scale = volumeData.extent * 2;

  return (
    <mesh ref={meshRef} material={material} scale={[scale, scale, scale]}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}
