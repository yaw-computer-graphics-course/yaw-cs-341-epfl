precision mediump float;

attribute vec3 vertex_positions;
attribute vec3 vertex_normal;
attribute vec2 vertex_tex_coords;

varying vec2 uv;

void main() {
    gl_Position = vec4(vertex_positions, 1.0);
    uv = vertex_tex_coords;
}
