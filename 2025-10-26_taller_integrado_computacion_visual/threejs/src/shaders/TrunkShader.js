// Simple trunk shader: vertical gradient + subtle noise-like banding
export const vertex = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragment = `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform vec3 baseColor;

  // simple band noise using sin
  float band(float y) {
    return 0.5 + 0.5 * sin(y * 30.0 + vPosition.x * 5.0);
  }

  void main() {
    float y = vPosition.y;
    float bands = band(y);
    vec3 col = baseColor * (0.6 + 0.4 * bands);
    // darken near bottom
    col *= mix(0.8, 1.0, smoothstep(-0.5, 1.5, y));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default { vertex, fragment }
