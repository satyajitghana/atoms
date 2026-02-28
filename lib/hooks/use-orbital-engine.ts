"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OrbitalEngine, EngineType } from "@/lib/wasm";
import { getEngine } from "@/lib/wasm";

interface OrbitalData {
  positions: Float32Array;
  colors: Float32Array;
}

export function useOrbitalEngine(engineType: EngineType = "js") {
  const [engine, setEngine] = useState<OrbitalEngine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEngine(engineType).then((e) => {
      if (!cancelled) {
        setEngine(e);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [engineType]);

  return { engine, loading };
}

export function useOrbitalData(
  engine: OrbitalEngine | null,
  n: number,
  l: number,
  m: number,
  particleCount: number
) {
  const [data, setData] = useState<OrbitalData | null>(null);
  const [generating, setGenerating] = useState(false);
  const genRef = useRef(0);

  const generate = useCallback(() => {
    if (!engine) return;

    const genId = ++genRef.current;
    setGenerating(true);

    // Use requestAnimationFrame to avoid blocking the UI
    requestAnimationFrame(() => {
      if (genId !== genRef.current) return;

      const raw = engine.generateOrbital(n, l, m, particleCount);

      // Split interleaved [x,y,z,r,g,b,...] into separate arrays
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const srcIdx = i * 6;
        const posIdx = i * 3;
        positions[posIdx] = raw[srcIdx];
        positions[posIdx + 1] = raw[srcIdx + 1];
        positions[posIdx + 2] = raw[srcIdx + 2];
        colors[posIdx] = raw[srcIdx + 3];
        colors[posIdx + 1] = raw[srcIdx + 4];
        colors[posIdx + 2] = raw[srcIdx + 5];
      }

      if (genId === genRef.current) {
        setData({ positions, colors });
        setGenerating(false);
      }
    });
  }, [engine, n, l, m, particleCount]);

  useEffect(() => {
    generate();
  }, [generate]);

  return { data, generating, regenerate: generate };
}
