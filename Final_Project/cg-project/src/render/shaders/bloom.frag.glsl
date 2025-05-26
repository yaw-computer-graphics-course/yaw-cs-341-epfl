// bloom.frag.glsl
precision mediump float;

uniform sampler2D u_sceneTexture;  // Lit scene texture
uniform vec2 u_texture_size;       // Texel size (1/width, 1/height)
uniform float u_threshold;         // Brightness threshold
uniform float u_bloom_intensity;   // Bloom strength

varying vec2 uv;

const int u_blurRadius = 5;

void main() {
    // Sample the original scene
    vec3 sceneColor = texture2D(u_sceneTexture, uv).rgb;
    
    // Extract bright parts using the threshold
    float brightness = dot(sceneColor, vec3(0.2126, 0.7152, 0.0722)); // Luminance
    vec3 brightColor = brightness > u_threshold ? sceneColor : vec3(0.0);
    
    // Apply Gaussian blur to bright parts
    vec3 bloomColor = vec3(0.0);
    float totalWeight = 0.0;
    
    for (int x = -u_blurRadius; x <= u_blurRadius; x++) {
        for (int y = -u_blurRadius; y <= u_blurRadius; y++) {
            // Gaussian weight (simple approximation)
            float weight = exp(-float(x*x + y*y) / (2.0 * float(u_blurRadius * u_blurRadius)));
            vec2 offset = vec2(float(x), float(y)) * u_texture_size;
            
            vec3 sampledColor = texture2D(u_sceneTexture, uv + offset).rgb;
            float sampleBrightness = dot(sampledColor, vec3(0.2126, 0.7152, 0.0722));
            vec3 brightSample = sampleBrightness > u_threshold ? sampledColor : vec3(0.0);
            
            bloomColor += brightSample * weight;
            totalWeight += weight;
        }
    }
    
    // Normalize by total weight
    bloomColor /= max(totalWeight, 0.0001); // Avoid division by zero
    
    // Combine original scene with bloom
    vec3 finalColor = sceneColor + bloomColor * u_bloom_intensity;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
