"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EngineType } from "@/lib/wasm/orbital-engine";

interface EngineToggleProps {
  value: EngineType;
  onChange: (value: EngineType) => void;
}

export function EngineToggle({ value, onChange }: EngineToggleProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Compute Backend</h3>
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as EngineType)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="js" className="flex-1 text-xs">
            JavaScript
          </TabsTrigger>
          <TabsTrigger value="rust" className="flex-1 text-xs">
            Rust WASM
          </TabsTrigger>
          <TabsTrigger value="cpp" className="flex-1 text-xs">
            C++ WASM
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
