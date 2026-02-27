"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useOrbitalEngine,
  useOrbitalData,
} from "@/lib/hooks/use-orbital-engine";
import { Atom, Table2, BookOpen } from "lucide-react";

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
      "Explore individual quantum orbitals with configurable parameters",
    badge: "Interactive 3D",
  },
  {
    href: "/elements",
    icon: Table2,
    title: "Element Explorer",
    description:
      "Select from the periodic table and visualize electron configurations",
    badge: "118 Elements",
  },
  {
    href: "/about",
    icon: BookOpen,
    title: "Learn More",
    description:
      "Understand the quantum mechanics behind orbital visualization",
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
    <div className="h-[calc(100vh-48px)] flex flex-col">
      {/* Hero Section with background orbital */}
      <div className="relative flex-1 min-h-[400px] max-h-[500px]">
        <div className="absolute inset-0">
          <HeroOrbital />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="flex items-center gap-2 mb-3">
            <Atom className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="text-xs">
              WebAssembly Powered
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Quantum Orbital Visualizer
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            Interactive 3D visualization of atomic electron orbitals using the
            Schrodinger equation, rendered with WebGL and computed via Rust/C++
            WebAssembly
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-8 -mt-8 relative z-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                    <Badge
                      variant="secondary"
                      className="text-[9px] opacity-70 group-hover:opacity-100"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
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
