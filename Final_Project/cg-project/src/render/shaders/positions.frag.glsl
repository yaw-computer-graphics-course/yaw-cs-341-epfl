precision highp float;

varying vec3 position;

void main() {
  // Encode view-space position as color output
  gl_FragColor = vec4(position, 1.0);
}
