"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/visualizer", label: "Orbital Visualizer" },
  { href: "/elements", label: "Elements" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center px-4 gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Atom className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight">
            Quantum Orbitals
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
