// Fragment shader

precision mediump float;
varying vec4 pixel_color;

void main() {
    // [R, G, B, 1]
    gl_FragColor = pixel_color;
}