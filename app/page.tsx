"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useOrbitalEngine,
  useOrbitalData,
} from "@/lib/hooks/use-orbital-engine";
import { Atom, Table2, BookOpen, ArrowRight } from "lucide-react";

const OrbitalViewer = dynamic(
  () =>
    import("@/components/three/orbital-viewer").then(
      (mod) => mod.OrbitalViewer
    ),
  { ssr: false }
);

const features = [
  {
    href: "/visualizer",
    icon: Atom,
    title: "Orbital Visualizer",
    description:
      "Explore quantum orbitals with adjustable quantum numbers, particle density, and compute backend",
    badge: "Interactive 3D",
  },
  {
    href: "/elements",
    icon: Table2,
    title: "Element Explorer",
    description:
      "Browse the periodic table and visualize each element's electron orbital configurations",
    badge: "118 Elements",
  },
  {
    href: "/about",
    icon: BookOpen,
    title: "Learn the Physics",
    description:
      "Understand quantum numbers, wave functions, and how probability clouds form orbital shapes",
    badge: "Educational",
  },
];

function HeroOrbital() {
  const { engine } = useOrbitalEngine("js");
  const { data } = useOrbitalData(engine, 3, 2, 1, 80000);

  if (!data) return null;

  return (
    <OrbitalViewer
      positions={data.positions}
      colors={data.colors}
      pointSize={0.06}
      autoRotate
      bloomIntensity={2.0}
    />
  );
}

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[400px] max-h-[520px]">
        <div className="absolute inset-0">
          <HeroOrbital />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-2 py-0.5 gap-1">
              <Atom className="h-3 w-3" />
              WebAssembly Powered
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Quantum Orbital
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent -mt-1">
            Visualizer
          </h1>
          <p className="text-muted-foreground mt-2 sm:mt-3 max-w-lg text-xs sm:text-sm leading-relaxed px-2">
            Interactive 3D visualization of atomic electron orbitals using the
            Schrodinger equation. Computed with Rust and C++ WebAssembly,
            rendered with WebGL.
          </p>
          <div className="flex gap-3 mt-4 sm:mt-5">
            <Link href="/visualizer">
              <Button size="sm" className="gap-1.5 text-xs">
                Open Visualizer
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/elements">
              <Button variant="outline" size="sm" className="text-xs">
                Explore Elements
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-8 -mt-4 sm:-mt-6 relative z-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full hover:border-primary/40 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[9px] opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
