precision highp float;

// Position of the fragment in view (camera) space, passed from vertex shader
varying vec3 v2f_frag_pos;

// Uniforms
uniform vec3 light_position_cam;     // Light position in camera coordinates
uniform samplerCube cube_shadowmap;  // Shadow map stored as a cube texture
uniform float num_lights;            // Number of lights used

void main() {
	// Compute normalized direction from fragment to camera
    vec3 v = normalize(-v2f_frag_pos);
	// Compute direction from fragment to light
	vec3 l = normalize(light_position_cam - v2f_frag_pos);
	 // Compute distance from fragment to light source
	float dist_frag_light = length(v2f_frag_pos - light_position_cam);

    // Sample the cube shadow map using the direction from the light to the fragment
	vec4 result = textureCube(cube_shadowmap, -l);
	float shadow_depth = result.r;
	
	// Initialize fragment color to black
    vec3 color = vec3(0.0);

    // if the distance of the fragment from the light is farther
	// than the one we saved in the cube map, then this fragment is in shadows
	if ((dist_frag_light > 1.01 *shadow_depth)){
		color = vec3(1.0 / num_lights);
	}

    gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
