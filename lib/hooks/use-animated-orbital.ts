"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface OrbitalData {
  positions: Float32Array;
  colors: Float32Array;
}

interface AnimatedOrbitalData {
  current: OrbitalData;
  previous: OrbitalData | null;
  progress: number; // 0 = previous, 1 = current
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function padArray(arr: Float32Array, targetLength: number): Float32Array {
  if (arr.length >= targetLength) return arr;
  const padded = new Float32Array(targetLength);
  padded.set(arr);
  return padded;
}

export function useAnimatedOrbital(
  data: OrbitalData | null,
  duration: number = 600
): AnimatedOrbitalData | null {
  const [state, setState] = useState<AnimatedOrbitalData | null>(null);
  const prevRef = useRef<OrbitalData | null>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!data) {
      setState(null);
      return;
    }

    const prev = prevRef.current;
    prevRef.current = data;

    if (!prev) {
      // First data — no animation
      setState({ current: data, previous: null, progress: 1 });
      return;
    }

    // Start animation
    const animId = ++animRef.current;
    startTimeRef.current = performance.now();

    // Pad arrays to match lengths
    const maxLen = Math.max(prev.positions.length, data.positions.length);
    const paddedPrevPos = padArray(prev.positions, maxLen);
    const paddedPrevCol = padArray(prev.colors, maxLen);
    const paddedCurrPos = padArray(data.positions, maxLen);
    const paddedCurrCol = padArray(data.colors, maxLen);

    const paddedPrev = { positions: paddedPrevPos, colors: paddedPrevCol };
    const paddedCurr = { positions: paddedCurrPos, colors: paddedCurrCol };

    function animate() {
      if (animId !== animRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const progress = easeInOutCubic(rawProgress);

      setState({
        current: paddedCurr,
        previous: paddedPrev,
        progress,
      });

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete — use original (unpadded) data
        setState({ current: data!, previous: null, progress: 1 });
      }
    }

    requestAnimationFrame(animate);

    return () => {
      animRef.current++;
    };
  }, [data, duration]);

  return state;
}

/**
 * Interpolates positions and colors for the current frame.
 * Use this when you don't need shader-based lerping.
 */
export function interpolateOrbitalData(
  animated: AnimatedOrbitalData
): OrbitalData {
  if (!animated.previous || animated.progress >= 1) {
    return animated.current;
  }

  const t = animated.progress;
  const len = animated.current.positions.length;
  const positions = new Float32Array(len);
  const colors = new Float32Array(len);

  for (let i = 0; i < len; i++) {
    positions[i] =
      animated.previous.positions[i] * (1 - t) +
      animated.current.positions[i] * t;
    colors[i] =
      animated.previous.colors[i] * (1 - t) +
      animated.current.colors[i] * t;
  }

  return { positions, colors };
}
