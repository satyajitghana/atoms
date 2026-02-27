import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantum Orbital Visualizer",
  description:
    "Interactive 3D visualization of atomic quantum orbitals using WebAssembly and WebGL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen`}
      >
        <TooltipProvider>
          <Header />
          <main>{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
