import { Uniform } from 'three';
import { BlendFunction, Effect, EffectAttribute } from 'postprocessing';

// Screen-space "data render" pass for the hero: the lit 3D subject is
// redrawn as horizontal scanlines whose thickness follows its shading,
// the lines carry small gaps that drift sideways across the surface, and
// the subject's trailing (right-hand) side continuously sheds dashes that
// stream away and fade. Nothing is staged — every part of it moves all
// the time, so the scene never sits still the way a fade-in/hold/fade-out
// cycle does.
//
// It reads the rendered frame at other pixels (the row centre, the
// trailing edge, each dash's origin), so it's a CONVOLUTION effect and
// gets its own pass. Output is premultiplied and replaces the frame
// (BlendFunction.SRC), leaving the canvas transparent between lines.
const fragment = /* glsl */ `
  uniform float uPeriod;
  uniform float uPixelRatio;
  uniform float uReveal;
  uniform float uStream;
  uniform float uFlow;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 px = uv * resolution;
    float period = uPeriod * uPixelRatio;
    float row = floor(px.y / period);
    float fy = fract(px.y / period) - 0.5;
    float rowV = (row + 0.5) * period / resolution.y;
    float aa = 1.0 / period;
    float cssPx = uPixelRatio;
    float t = uFlow;

    // Intro: rows print in from the top, with a burst of dashes riding
    // the leading edge.
    float depth = 1.0 - rowV;
    float sweep = uReveal * 1.1;
    float revealed = 1.0 - smoothstep(sweep - 0.05, sweep, depth);
    float front = exp(-abs(depth - sweep) * 28.0) * (1.0 - step(1.0, uReveal));

    // Core scanline, sampled at the row's centre so each line is one
    // clean band. Brighter shading draws a thicker line.
    vec4 src = texture2D(inputBuffer, vec2(uv.x, rowV));
    float cover = src.a;
    float L = clamp(luma(src.rgb) * 1.4, 0.0, 1.0);

    // Gaps drift rightward through the surface; they open up in darker
    // shading and toward the trailing edge, where the shape is coming
    // apart into the stream.
    float ahead1 = texture2D(inputBuffer, vec2(uv.x + 12.0 * cssPx / resolution.x, rowV)).a;
    float ahead2 = texture2D(inputBuffer, vec2(uv.x + 30.0 * cssPx / resolution.x, rowV)).a;
    float trailing = 1.0 - min(ahead1, ahead2);
    // Segments are 8-20px long, so lines read as long strokes with the
    // occasional break rather than as static.
    float segW = 8.0 + 12.0 * hash12(vec2(row, 3.7));
    float seg = floor((px.x / cssPx - t * 16.0) / segW);
    float gapChance = 0.02 + (1.0 - L) * 0.14 + trailing * 0.6;
    float keep = step(gapChance, hash12(vec2(seg, row)));
    float halfWidth = clamp(0.07 + L * 0.24, 0.0, 0.32);
    float line = 1.0 - smoothstep(halfWidth - aa, halfWidth + aa, abs(fy));
    float core = line * keep * cover * revealed;

    // Dash stream: three layers of dashes at different spacings and
    // speeds. Each dash knows how far it has travelled, looks back that
    // far for the surface it left, and is only lit if there was one —
    // so dashes peel off the shape's bright parts and fade as they go.
    float stream = 0.0;
    vec3 streamColor = vec3(0.0);
    float thin = 1.0 - smoothstep(0.12 - aa, 0.12 + aa, abs(fy));
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      float cellW = (22.0 + fk * 15.0) * cssPx;
      float speed = (34.0 + fk * 20.0) * cssPx;
      float maxTravel = (140.0 + fk * 100.0) * cssPx;
      float xs = px.x - t * speed;
      float cell = floor(xs / cellW);
      float h = hash12(vec2(cell, row * 1.37 + fk * 17.0));
      if (h > 0.7) {
        float len = 0.12 + 0.5 * hash12(vec2(row + fk * 3.0, cell * 0.71));
        float dash = step(fract(xs / cellW), len);
        float age = fract(t * speed / maxTravel + h * 7.13);
        vec4 origin = texture2D(inputBuffer, vec2((px.x - age * maxTravel) / resolution.x, rowV));
        float life = smoothstep(0.0, 0.08, age) * pow(1.0 - age, 1.6);
        float s = dash * thin * origin.a * life;
        if (s > stream) {
          stream = s;
          streamColor = origin.rgb;
        }
      }
    }
    stream *= clamp(uStream * revealed + front * 2.5, 0.0, 1.0);

    float mask = max(core, stream);
    // Lines are lifted toward white and scaled by shading, so the faces
    // separate by brightness as well as by line weight.
    vec3 lineColor = mix(src.rgb, vec3(1.0), 0.16) * (0.5 + L * 0.7);
    vec3 dashColor = mix(streamColor, vec3(1.0), 0.25) * 1.05;
    vec3 color = core >= stream ? lineColor : dashColor;
    outputColor = vec4(color * mask, mask);
  }
`;

export class ScanlineDissolveEffect extends Effect {
  constructor({ period = 4, pixelRatio = 1 }: { period?: number; pixelRatio?: number } = {}) {
    super('ScanlineDissolveEffect', fragment, {
      blendFunction: BlendFunction.SRC,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ['uPeriod', new Uniform(period)],
        ['uPixelRatio', new Uniform(pixelRatio)],
        ['uReveal', new Uniform(0)],
        ['uStream', new Uniform(1)],
        ['uFlow', new Uniform(0)],
      ]),
    });
  }

  set(name: 'uPeriod' | 'uPixelRatio' | 'uReveal' | 'uStream' | 'uFlow', value: number) {
    this.uniforms.get(name)!.value = value;
  }
}
