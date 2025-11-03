// Simple foliage shader: vertex wind displacement + color tint
export const vertex = `
  uniform float time;
  uniform float windStrength;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    // Simple wind: displacement along normal using a sin of world position + time
    vec3 pos = position;
    float sway = sin((pos.x + pos.y) * 2.0 + time * 2.0) * 0.08 * windStrength;
    // larger displacement for tips (use vUv.y)
    float tipFactor = pow(vUv.y, 1.5);
    pos.z += sway * tipFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragment = `
  precision mediump float;
  uniform vec3 leafColor;
  uniform vec3 nightTint;
  uniform float isNight;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    // simple gradient from center to edge
    float shade = 0.6 + 0.4 * (1.0 - vUv.y);
    vec3 color = mix(leafColor, nightTint, isNight);
    gl_FragColor = vec4(color * shade, 1.0);
  }
`;

export default { vertex, fragment }
