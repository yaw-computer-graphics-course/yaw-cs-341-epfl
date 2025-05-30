precision highp float;

varying vec3 v2f_frag_pos;

uniform vec3 light_position_cam;
uniform samplerCube cube_shadowmap;
uniform float num_lights;
uniform float shadow_softness;
// 16 Poisson disk samples for PCF (Percentage Closer Filtering)
uniform vec2 poissonDisk[16];

void main() {
    vec3 light_dir = normalize(light_position_cam - v2f_frag_pos);

    float dist_frag_light = length(v2f_frag_pos - light_position_cam);

    float shadow = 0.0;      // Accumulator for shadow intensity
    float bias = 0.02;       // Small bias to reduce shadow acne

    // Loop over Poisson disk offsets for soft shadow sampling
    for(int i = 0; i < 16; i++) {
        // Offset sampling direction slightly using scaled Poisson disk
        vec3 sample_dir = normalize(light_dir + vec3(
            poissonDisk[i].x * shadow_softness,
            poissonDisk[i].y * shadow_softness,
            0.0
        ));

        // Fetch depth from cube shadow map (reverse direction for lookup)
        float sample_depth = textureCube(cube_shadowmap, -sample_dir).r;

        // Shadow test: if fragment is further than sampled depth, it's in shadow
        shadow += (dist_frag_light - bias > sample_depth) ? 1.0 : 0.0;
    }

    // Average the shadow samples (PCF result)
    shadow /= 16.0;

    // Final output: gray level proportional to shadow intensity
    vec3 color = vec3(shadow / num_lights);
    gl_FragColor = vec4(color, 1.0);
}
