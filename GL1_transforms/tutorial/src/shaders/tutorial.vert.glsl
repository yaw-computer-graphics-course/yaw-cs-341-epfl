// Vertex shader

precision mediump float;
attribute vec2 position;
attribute vec4 color;
varying vec4 pixel_color;
    
void main() {
    // [x, y, 0, 1]
    gl_Position = vec4(position, 0, 1);
    pixel_color = color;
}