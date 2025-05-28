precision mediump float;

// Texture coordinates
varying vec2 uv;

// SSAO texture and resolution
uniform sampler2D ssao_tex;
uniform vec2 ssao_tex_size;

void main() {
    // Calculate the size of one texel (1 pixel in texture space)
    vec2 texelSize = 1.0 / ssao_tex_size;
    
    // Accumulator for the result
    float result = 0.0;

    // Loop through a 4x4 grid of surrounding texels (from -2 to +1 inclusive)
    for (int x = -2; x < 2; ++x) {
        for (int y = -2; y < 2; ++y) {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            result += texture2D(ssao_tex, uv + offset).r;
        }
    }

    // Average the result by dividing by the number of samples (16)
    gl_FragColor = vec4(result / (4.0 * 4.0));
}
