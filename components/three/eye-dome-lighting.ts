"use client";

import { Uniform, Vector2 } from "three";
import { Effect, EffectAttribute } from "postprocessing";

const EDL_FRAGMENT = /* glsl */ `
uniform float edlStrength;
uniform float edlRadius;
uniform vec2 resolution;

float readDepth(vec2 coord) {
  return texture2D(depthBuffer, coord).r;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec2 pixelSize = edlRadius / resolution;

  float centerDepth = depth;
  if (centerDepth >= 1.0) {
    outputColor = inputColor;
    return;
  }

  float logCenter = log2(centerDepth);

  float sum = 0.0;
  sum += max(0.0, logCenter - log2(readDepth(uv + vec2(-pixelSize.x, 0.0))));
  sum += max(0.0, logCenter - log2(readDepth(uv + vec2( pixelSize.x, 0.0))));
  sum += max(0.0, logCenter - log2(readDepth(uv + vec2(0.0, -pixelSize.y))));
  sum += max(0.0, logCenter - log2(readDepth(uv + vec2(0.0,  pixelSize.y))));

  float shade = exp(-sum * 300.0 * edlStrength);
  outputColor = vec4(inputColor.rgb * shade, inputColor.a);
}
`;

export class EyeDomeLightingEffect extends Effect {
  constructor({
    strength = 0.7,
    radius = 1.4,
    resolution = new Vector2(1920, 1080),
  } = {}) {
    super("EyeDomeLightingEffect", EDL_FRAGMENT, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ["edlStrength", new Uniform(strength)],
        ["edlRadius", new Uniform(radius)],
        ["resolution", new Uniform(resolution)],
      ]),
    });
  }

  set strength(value: number) {
    this.uniforms.get("edlStrength")!.value = value;
  }

  set radius(value: number) {
    this.uniforms.get("edlRadius")!.value = value;
  }

  setResolution(width: number, height: number) {
    (this.uniforms.get("resolution")!.value as Vector2).set(width, height);
  }
}
