precision mediump float;

varying vec2 uv;
  
uniform sampler2D ssao_tex;
uniform vec2 ssao_tex_size;
void main() {
    vec2 texelSize = 1.0 / ssao_tex_size;
    float result = 0.0;
    for (int x = -2; x < 2; ++x) {
        for (int y = -2; y < 2; ++y) {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            result += texture2D(ssao_tex, uv + offset).r;
        }
    }
    gl_FragColor = vec4(result / (4.0 * 4.0));
}  