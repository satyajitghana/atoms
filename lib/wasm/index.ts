import type { OrbitalEngine, EngineType } from "./orbital-engine";
import { createJsEngine } from "./js-engine";

export type { OrbitalEngine, EngineType };

const engineCache: Partial<Record<EngineType, OrbitalEngine | null>> = {};

export async function getEngine(type: EngineType): Promise<OrbitalEngine> {
  if (engineCache[type]) return engineCache[type]!;

  switch (type) {
    case "rust": {
      const { createRustEngine } = await import("./rust-engine");
      const engine = await createRustEngine();
      if (engine) {
        engineCache[type] = engine;
        return engine;
      }
      console.warn("Rust WASM unavailable, falling back to JS engine");
      return getEngine("js");
    }
    case "cpp": {
      const { createCppEngine } = await import("./cpp-engine");
      const engine = await createCppEngine();
      if (engine) {
        engineCache[type] = engine;
        return engine;
      }
      console.warn("C++ WASM unavailable, falling back to JS engine");
      return getEngine("js");
    }
    case "js":
    default: {
      const engine = createJsEngine();
      engineCache["js"] = engine;
      return engine;
    }
  }
}
