"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ReactionAnimationProps {
  elements: string[]; // symbols of input elements
  formula: string;
  name: string;
  exothermic: boolean;
  energyValue: number;
  onComplete: () => void;
}

type Phase = "gather" | "merge" | "energy" | "reveal";

export function ReactionAnimation({
  elements,
  formula,
  name,
  exothermic,
  energyValue,
  onComplete,
}: ReactionAnimationProps) {
  const [phase, setPhase] = useState<Phase>("gather");
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const PHASE_DURATIONS: Record<Phase, number> = {
    gather: 600,
    merge: 500,
    energy: 800,
    reveal: 600,
  };

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Background
      ctx.fillStyle = "#050508e0";
      ctx.fillRect(0, 0, w, h);

      if (phase === "gather") {
        // Elements slide toward center
        const p = Math.min(t / PHASE_DURATIONS.gather, 1);
        const ease = 1 - Math.pow(1 - p, 3); // ease out cubic
        const count = elements.length;

        elements.forEach((sym, i) => {
          const angle = (2 * Math.PI * i) / count - Math.PI / 2;
          const startR = Math.min(w, h) * 0.35;
          const r = startR * (1 - ease);
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);

          // Glow
          const grad = ctx.createRadialGradient(x, y, 0, x, y, 30);
          grad.addColorStop(0, exothermic ? "#ff880060" : "#4488ff60");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.fill();

          // Circle
          ctx.fillStyle = exothermic ? "#ff6633" : "#3366ff";
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();

          // Symbol
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sym, x, y);
        });
      }

      if (phase === "merge") {
        // Flash and merge
        const p = Math.min(t / PHASE_DURATIONS.merge, 1);
        const flashIntensity = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
        const flashColor = exothermic ? "#ffffff" : "#88bbff";

        // Central merge sphere
        const mergeRadius = 20 + 40 * Math.sin(p * Math.PI);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, mergeRadius);
        grad.addColorStop(0, flashColor);
        grad.addColorStop(0.5, exothermic ? "#ff660080" : "#4466ff80");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, mergeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Flash overlay
        ctx.fillStyle = `${flashColor}${Math.round(flashIntensity * 40).toString(16).padStart(2, "0")}`;
        ctx.fillRect(0, 0, w, h);
      }

      if (phase === "energy") {
        const p = Math.min(t / PHASE_DURATIONS.energy, 1);
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
          const angle = (2 * Math.PI * i) / particleCount;
          const speed = 0.6 + (i % 3) * 0.3;

          if (exothermic) {
            // Particles radiate outward
            const r = p * Math.min(w, h) * 0.4 * speed;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const alpha = Math.max(0, 1 - p * 1.2);
            const size = 3 + (1 - p) * 4;

            ctx.fillStyle = i % 2 === 0
              ? `rgba(255, 140, 0, ${alpha})`
              : `rgba(255, 60, 20, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Particles converge inward
            const startR = Math.min(w, h) * 0.4 * speed;
            const r = startR * (1 - p);
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const alpha = Math.min(1, p * 2);
            const size = 2 + p * 3;

            ctx.fillStyle = i % 2 === 0
              ? `rgba(100, 160, 255, ${alpha})`
              : `rgba(60, 120, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Energy value text
        const textAlpha = Math.min(1, p * 3);
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha * 0.7})`;
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          `${exothermic ? "-" : "+"}${energyValue.toFixed(1)} kJ/mol`,
          cx,
          cy + 60
        );

        // Central glow
        const glowR = 15 + (exothermic ? -5 * p : 10 * p);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        g.addColorStop(0, exothermic ? "#ff880080" : "#4488ff80");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (phase === "reveal") {
        const p = Math.min(t / PHASE_DURATIONS.reveal, 1);
        const ease = 1 - Math.pow(1 - p, 2);

        // Formula text
        ctx.globalAlpha = ease;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(formula, cx, cy - 12);

        // Name
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "14px sans-serif";
        ctx.fillText(name, cx, cy + 18);

        // Subtle glow behind
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        g.addColorStop(0, exothermic ? "#ff660015" : "#4466ff15");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      }
    },
    [phase, elements, formula, name, exothermic, energyValue, PHASE_DURATIONS]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    startTimeRef.current = performance.now();

    const phases: Phase[] = ["gather", "merge", "energy", "reveal"];
    let currentPhaseIdx = phases.indexOf(phase);

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const currentPhase = phases[currentPhaseIdx];
      const duration = PHASE_DURATIONS[currentPhase];

      draw(ctx, rect.width, rect.height, elapsed);

      if (elapsed >= duration) {
        currentPhaseIdx++;
        if (currentPhaseIdx < phases.length) {
          startTimeRef.current = now;
          setPhase(phases[currentPhaseIdx]);
        } else {
          // Animation complete
          setTimeout(onComplete, 300);
          return;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [phase, draw, onComplete, PHASE_DURATIONS]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onComplete}
      />
      <canvas
        ref={canvasRef}
        className="relative w-[min(90vw,400px)] h-[min(60vh,300px)] rounded-xl"
        style={{ imageRendering: "auto" }}
      />
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-sm z-10"
      >
        Skip
      </button>
    </div>
  );
}
