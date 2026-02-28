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
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Compute Backend
      </h3>
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as EngineType)}
      >
        <TabsList className="w-full h-8">
          <TabsTrigger value="js" className="flex-1 text-[10px]">
            JavaScript
          </TabsTrigger>
          <TabsTrigger value="rust" className="flex-1 text-[10px]">
            Rust WASM
          </TabsTrigger>
          <TabsTrigger value="cpp" className="flex-1 text-[10px]">
            C++ WASM
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
