import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import "./globals.css";

const siteUrl = "https://atoms.thesatyajit.com";

export const viewport: Viewport = {
  themeColor: "#050510",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Quantum Orbital Visualizer",
    template: "%s | Quantum Orbitals",
  },
  description:
    "Interactive 3D visualization of atomic quantum orbitals. Explore electron probability clouds computed with Rust & C++ WebAssembly, rendered with WebGL and Three.js.",
  keywords: [
    "quantum mechanics",
    "atomic orbitals",
    "electron configuration",
    "3D visualization",
    "WebAssembly",
    "Schrodinger equation",
    "periodic table",
    "chemistry",
    "physics",
    "wave function",
    "react-three-fiber",
  ],
  authors: [{ name: "Satyajit Ghana", url: "https://thesatyajit.com" }],
  creator: "Satyajit Ghana",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Quantum Orbital Visualizer",
    title: "Quantum Orbital Visualizer",
    description:
      "Interactive 3D visualization of atomic quantum orbitals using Rust & C++ WebAssembly",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Quantum Orbital Visualizer - 3D atomic orbital visualization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Orbital Visualizer",
    description:
      "Interactive 3D visualization of atomic quantum orbitals using Rust & C++ WebAssembly",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <TooltipProvider delayDuration={200}>
          <Header />
          <main>{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
