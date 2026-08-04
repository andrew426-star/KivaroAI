import * as THREE from 'three';

let cached: THREE.CanvasTexture | null = null;

// Every PointsMaterial in the site's 3D scenes (hero dust, agent-network
// hub nodes, constellation ambient fill) rendered as hard-edged squares —
// the default Points sprite shape with no map set. A single shared soft
// radial-gradient sprite, generated once and reused everywhere, is what
// actually makes these read as soft glowing particles instead of pixels.
export function getSoftParticleTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  cached = new THREE.CanvasTexture(canvas);
  return cached;
}
