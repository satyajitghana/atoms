"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateVolumeData, type VolumeData } from "@/lib/wasm/volume-generator";

export function useVolumeData(
  n: number,
  l: number,
  m: number,
  resolution: number = 64
) {
  const [data, setData] = useState<VolumeData | null>(null);
  const [generating, setGenerating] = useState(false);
  const genRef = useRef(0);

  const generate = useCallback(() => {
    if (resolution <= 0) return;

    const genId = ++genRef.current;
    setGenerating(true);

    requestAnimationFrame(() => {
      if (genId !== genRef.current) return;
      const volumeData = generateVolumeData(n, l, m, resolution);
      if (genId === genRef.current) {
        setData(volumeData);
        setGenerating(false);
      }
    });
  }, [n, l, m, resolution]);

  useEffect(() => {
    generate();
  }, [generate]);

  return { data, generating, regenerate: generate };
}
