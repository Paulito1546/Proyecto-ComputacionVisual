export const vertex = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // simple Gerstner-like wave using sines
    pos.y += sin((position.x + time) * 0.6) * 0.12;
    pos.y += cos((position.z - time * 0.8) * 0.7) * 0.08;
    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragment = `
  precision mediump float;
  uniform float time;
  uniform vec3 colorA;
  uniform vec3 colorB;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    float fresnel = pow(1.0 - dot(normalize(vec3(0.0,1.0,0.0)), normalize(vPos)), 3.0);
    float stripes = smoothstep(0.0, 1.0, sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5);
    vec3 base = mix(colorA, colorB, vUv.y + 0.2 * stripes);
    vec3 col = mix(base, vec3(0.8,0.9,1.0), fresnel * 0.5);
    gl_FragColor = vec4(col, 0.9);
  }
`;

export default { vertex, fragment }
