export const vertex = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    // flow along X axis
    float wave = sin((position.x + time * 2.0) * 0.8) * 0.08;
    vec3 pos = position;
    pos.y += wave * (1.0 - vUv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragment = `
  precision mediump float;
  uniform float time;
  uniform vec3 waterColor;
  uniform vec3 foamColor;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    float flow = fract(vUv.x - time * 0.2);
    float foam = smoothstep(0.0, 0.2, abs(sin(vUv.x * 20.0 + time * 3.0)));
    vec3 base = mix(waterColor, foamColor, foam * 0.4);
    // darken edges
    float edge = smoothstep(0.0, 0.05, min(vUv.y, 1.0 - vUv.y));
    base *= mix(0.9, 1.1, edge);
    gl_FragColor = vec4(base, 0.95);
  }
`;

export default { vertex, fragment }
