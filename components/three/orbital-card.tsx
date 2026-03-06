"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import {
  useOrbitalEngine,
  useOrbitalData,
} from "@/lib/hooks/use-orbital-engine";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

interface OrbitalCardProps {
  n: number;
  l: number;
  m: number;
  label: string;
  description: string;
}

function OrbitalCardContent({ n, l, m }: { n: number; l: number; m: number }) {
  const { engine } = useOrbitalEngine("js");
  const { data } = useOrbitalData(engine, n, l, m, 8000);

  if (!data) return null;

  return (
    <OrbitalViewer
      positions={data.positions}
      colors={data.colors}
      pointSize={0.07}
      autoRotate
      bloomIntensity={0.8}
      interactive={false}
      dpr={[1, 1.5]}
    />
  );
}

export function OrbitalCard({ n, l, m, label, description }: OrbitalCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card ref={ref} className="overflow-hidden hover:border-primary/40 transition-all duration-200">
      <div className="aspect-square bg-[#050508] pointer-events-none">
        {isVisible && <OrbitalCardContent n={n} l={l} m={m} />}
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-mono font-bold">{label}</span>
          <span className="text-xs text-muted-foreground font-mono">
            n={n}, l={l}, m={m}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </CardContent>
    </Card>
  );
}
