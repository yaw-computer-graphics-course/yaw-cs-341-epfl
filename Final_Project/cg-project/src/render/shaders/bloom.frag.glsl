// bloom.frag.glsl
precision mediump float;

// Uniforms
uniform sampler2D u_sceneTexture;
uniform vec2 u_texture_size;
uniform float u_threshold;
uniform float u_bloom_intensity;

varying vec2 uv;

const int u_blurRadius = 5;

void main() {
    // Sample the original scene color
    vec3 sceneColor = texture2D(u_sceneTexture, uv).rgb;
    
    // Calculate luminance and extract bright areas
    float brightness = dot(sceneColor, vec3(0.2126, 0.7152, 0.0722)); // Luminance formula
    vec3 brightColor = brightness > u_threshold ? sceneColor : vec3(0.0);
    
    // Initialize bloom accumulation
    vec3 bloomColor = vec3(0.0);
    float totalWeight = 0.0;
    
    // Gaussian blur for bloom effect
    for (int x = -u_blurRadius; x <= u_blurRadius; x++) {
        for (int y = -u_blurRadius; y <= u_blurRadius; y++) {
            // Calculate Gaussian weight (bell curve distribution)
            float weight = exp(-float(x*x + y*y) / (2.0 * float(u_blurRadius * u_blurRadius)));
            vec2 offset = vec2(float(x), float(y)) * u_texture_size;
            
            // Sample neighboring pixels
            vec3 sampledColor = texture2D(u_sceneTexture, uv + offset).rgb;
            float sampleBrightness = dot(sampledColor, vec3(0.2126, 0.7152, 0.0722));
            
            // Only include bright samples
            vec3 brightSample = sampleBrightness > u_threshold ? sampledColor : vec3(0.0);
            
            // Accumulate weighted samples
            bloomColor += brightSample * weight;
            totalWeight += weight;
        }
    }
    
    // Normalize by total weight to maintain brightness
    bloomColor /= max(totalWeight, 0.0001); // Prevent division by zero
    
    // Combine original scene with bloom effect
    vec3 finalColor = sceneColor + bloomColor * u_bloom_intensity;
    
    gl_FragColor = vec4(finalColor, 1.0);
}