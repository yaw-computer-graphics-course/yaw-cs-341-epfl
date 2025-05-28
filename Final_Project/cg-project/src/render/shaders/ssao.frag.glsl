precision mediump float;

// UV coordinates passed from the vertex shader
varying vec2 uv;

// G-buffer textures containing view-space positions and normals
uniform sampler2D positions_tex;
uniform sampler2D normals_tex;

// Noise texture to introduce randomness in the sampling kernel
uniform sampler2D noise_tex;

// 64-sample kernel in tangent space, precomputed in the CPU
uniform vec3 kernel[64];

// Scaling factor to tile the noise texture across the screen
uniform vec2 noise_scale;

// Projection matrix (used to transform sample positions to screen space)
uniform mat4 mat_projection;

// Constants for SSAO effect
const float bias = 0.2;       // Small offset to avoid self-occlusion
const float radius = 1.0;     // Sampling radius in view space
const int kernelSize = 64;    // Number of samples in the kernel

void main() {
    // Get fragment position and normal from G-buffer
    vec3 fragPos = texture2D(positions_tex, uv).xyz;
    vec3 normal  = texture2D(normals_tex, uv).rgb * 2.0 - 1.0; // decode normal

    // Get random vector from noise texture
    vec3 randomVec = texture2D(noise_tex, uv * noise_scale).xyz;

    // Create TBN matrix
    vec3 tangent   = normalize(randomVec - normal * dot(randomVec, normal));
    vec3 bitangent = cross(normal, tangent);
    mat3 TBN       = mat3(tangent, bitangent, normal);

    float occlusion = 0.0;
    for(int i = 0; i < kernelSize; ++i) {
        // Sample position in view space
        vec3 samplePos = TBN * kernel[i];
        samplePos = fragPos + samplePos * radius;

        // Project sample position into screen space
        vec4 offset = mat_projection * vec4(samplePos, 1.0);
        offset.xy /= offset.w;
        offset.xy = offset.xy * 0.5 + 0.5;

        // Get sample depth from position buffer
        float sampleDepth = texture2D(positions_tex, offset.xy).z;

        // Accumulate occlusion if sample is occluded
        float rangeCheck = smoothstep(0.0, 1.0, radius / abs(fragPos.z - sampleDepth));

        // occlusion += rangeCheck;
        occlusion += (sampleDepth >= samplePos.z + bias ? 1.0 : 0.0) * rangeCheck;
    }
    
    // Normalize occlusion value and invert (since more occlusion = darker)
    occlusion = 1.0 - (occlusion / float(kernelSize));

    // Apply gamma correction (slightly) and write to output
    gl_FragColor = vec4(vec3(pow(occlusion, 1.5)), 1.0);
}
