"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { EyeDomeLightingEffect } from "./eye-dome-lighting";

interface PostProcessingProps {
  bloomIntensity?: number;
  bloomThreshold?: number;
  edlEnabled?: boolean;
  edlStrength?: number;
}

function EDLEffect({ strength = 0.7 }: { strength?: number }) {
  const { size } = useThree();
  const effect = useMemo(
    () => new EyeDomeLightingEffect({ strength, radius: 1.4 }),
    [strength]
  );

  useMemo(() => {
    effect.setResolution(size.width, size.height);
  }, [effect, size.width, size.height]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <primitive object={effect} dispose={null} /> as any;
}

export function PostProcessing({
  bloomIntensity = 1.5,
  bloomThreshold = 0.2,
  edlEnabled = false,
  edlStrength = 0.7,
}: PostProcessingProps) {
  if (edlEnabled) {
    return (
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <EDLEffect strength={edlStrength} />
        <Vignette darkness={0.4} offset={0.3} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }

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
