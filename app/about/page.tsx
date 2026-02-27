import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const orbitalShapes = [
  {
    name: "s orbitals",
    l: 0,
    description: "Spherically symmetric. The probability density depends only on the distance from the nucleus.",
    example: "1s, 2s, 3s",
  },
  {
    name: "p orbitals",
    l: 1,
    description: "Dumbbell-shaped with one nodal plane through the nucleus. Three orientations (m = -1, 0, +1).",
    example: "2p, 3p, 4p",
  },
  {
    name: "d orbitals",
    l: 2,
    description: "Cloverleaf patterns with two nodal surfaces. Five orientations (m = -2 to +2).",
    example: "3d, 4d, 5d",
  },
  {
    name: "f orbitals",
    l: 3,
    description: "Complex multi-lobed shapes with three nodal surfaces. Seven orientations (m = -3 to +3).",
    example: "4f, 5f",
  },
];

export default function AboutPage() {
  return (
    <div className="h-[calc(100vh-48px)] overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-xl font-semibold">About Quantum Orbitals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Understanding the physics behind electron orbital visualization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              What Are Quantum Orbitals?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              An atomic orbital is a mathematical function describing the
              wave-like behavior of an electron in an atom. It does not describe
              a definite path - instead, it gives the probability of finding an
              electron at any point in space.
            </p>
            <p>
              The shape and size of an orbital are determined by three{" "}
              <strong className="text-foreground">quantum numbers</strong>:
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <Badge className="mb-2 font-mono">n</Badge>
              <h3 className="text-sm font-semibold">Principal</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Determines energy level and size. n = 1, 2, 3, ... Higher n
                means larger orbital and higher energy.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Badge className="mb-2 font-mono">l</Badge>
              <h3 className="text-sm font-semibold">Angular Momentum</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Determines orbital shape. l = 0 (s), 1 (p), 2 (d), 3 (f).
                Range: 0 to n-1.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Badge className="mb-2 font-mono">m</Badge>
              <h3 className="text-sm font-semibold">Magnetic</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Determines orientation in space. Range: -l to +l. Gives 2l+1
                possible orientations.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h2 className="text-sm font-semibold mb-3">Orbital Shapes</h2>
          <div className="space-y-3">
            {orbitalShapes.map((shape) => (
              <Card key={shape.name}>
                <CardContent className="p-4 flex items-start gap-4">
                  <Badge variant="secondary" className="shrink-0 font-mono">
                    l={shape.l}
                  </Badge>
                  <div>
                    <h3 className="text-sm font-semibold">{shape.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {shape.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      Examples: {shape.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">The Wave Function</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              The hydrogen atom wave function is:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-xs">
              {"\u03C8(r,\u03B8,\u03C6) = R\u2099\u2097(r) \u00D7 Y\u2097\u1D50(\u03B8,\u03C6)"}
            </div>
            <p>
              Where <strong className="text-foreground font-mono">R(r)</strong>{" "}
              is the radial part (depends on distance from nucleus) and{" "}
              <strong className="text-foreground font-mono">Y(\u03B8,\u03C6)</strong>{" "}
              is the angular part (determines shape).
            </p>
            <p>
              The probability of finding an electron at any point is{" "}
              <strong className="text-foreground font-mono">|\u03C8|\u00B2</strong>.
              This is what we visualize - brighter regions have higher
              probability density.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How This Visualizer Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong className="text-foreground">CDF Sampling</strong> -
                Build cumulative distribution functions from the radial and
                angular probability densities
              </li>
              <li>
                <strong className="text-foreground">
                  Inverse Transform Sampling
                </strong>{" "}
                - Draw uniform random numbers and map them through the CDF to
                get physically distributed r, \u03B8, \u03C6 coordinates
              </li>
              <li>
                <strong className="text-foreground">Color Mapping</strong> -
                Compute |\u03C8|\u00B2 at each point and map to a fire heatmap
                (black \u2192 purple \u2192 red \u2192 orange \u2192 yellow \u2192 white)
              </li>
              <li>
                <strong className="text-foreground">GPU Rendering</strong> -
                Send positions and colors to WebGL as point particles with bloom
                post-processing for glow
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 16",
                "React 19",
                "Three.js",
                "react-three-fiber",
                "Rust + WASM",
                "C++23 + Emscripten",
                "shadcn/ui",
                "Tailwind CSS v4",
              ].map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground pb-8">
          <p>
            Inspired by{" "}
            <a
              href="https://github.com/kavan010/Atoms"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              kavan010/Atoms
            </a>{" "}
            - a C++ OpenGL hydrogen quantum orbital visualizer.
          </p>
        </div>
      </div>
    </div>
  );
}
