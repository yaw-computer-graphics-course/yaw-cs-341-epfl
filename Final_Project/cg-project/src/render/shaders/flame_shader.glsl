precision mediump float;

uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float flame = sin((uv.x + time) * 10.0) * sin((uv.y + time) * 10.0);
  flame = flame * 0.5 + 0.5;
  gl_FragColor = vec4(flame, flame * 0.5, 0.0, 1.0);
}
