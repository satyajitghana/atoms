"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

interface PostProcessingProps {
  bloomIntensity?: number;
  bloomThreshold?: number;
}

export function PostProcessing({
  bloomIntensity = 1.5,
  bloomThreshold = 0.2,
}: PostProcessingProps) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette darkness={0.4} offset={0.3} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
