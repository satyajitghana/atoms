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
import { OrbitalCard } from "@/components/three/orbital-card";

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

const orbitalShowcase = [
  { n: 1, l: 0, m: 0, label: "1s", description: "Spherical" },
  { n: 2, l: 0, m: 0, label: "2s", description: "Spherical, 1 node" },
  { n: 2, l: 1, m: 0, label: "2p", description: "Dumbbell" },
  { n: 3, l: 0, m: 0, label: "3s", description: "Spherical, 2 nodes" },
  { n: 3, l: 1, m: 0, label: "3p", description: "Elongated dumbbell" },
  { n: 3, l: 2, m: 0, label: "3d", description: "Cloverleaf" },
  { n: 4, l: 0, m: 0, label: "4s", description: "Spherical, 3 nodes" },
  { n: 4, l: 1, m: 1, label: "4p", description: "Complex dumbbell" },
  { n: 4, l: 3, m: 0, label: "4f", description: "Multilobed" },
];

function HeroOrbital() {
  const { engine } = useOrbitalEngine("js");
  const { data } = useOrbitalData(engine, 3, 2, 1, 100000);

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
    <div>
      {/* Hero Section */}
      <div className="relative h-[calc(100vh-48px)] min-h-[500px]">
        <div className="absolute inset-0">
          <HeroOrbital />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Badge variant="secondary" className="text-xs px-3 py-1 gap-1.5">
              <Atom className="h-3.5 w-3.5" />
              WebAssembly Powered
            </Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Quantum Orbital
          </h1>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent -mt-1 sm:-mt-2">
            Visualizer
          </h1>
          <p className="text-muted-foreground mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed px-2">
            Interactive 3D visualization of atomic electron orbitals using the
            Schrodinger equation. Computed with Rust and C++ WebAssembly,
            rendered with WebGL.
          </p>
          <div className="flex gap-4 mt-6 sm:mt-8">
            <Link href="/visualizer">
              <Button className="gap-2 text-sm">
                Open Visualizer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/elements">
              <Button variant="outline" className="text-sm">
                Explore Elements
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 sm:px-6 pb-12 sm:pb-16 -mt-8 sm:-mt-12 relative z-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full hover:border-primary/40 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Orbital Gallery */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Orbital Gallery
            </h2>
            <p className="text-muted-foreground mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Electron probability clouds for s, p, d, and f orbitals.
              Each shape represents where an electron is most likely to be found.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orbitalShowcase.map((orbital) => (
              <OrbitalCard key={orbital.label} {...orbital} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
