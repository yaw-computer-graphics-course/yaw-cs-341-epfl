precision highp float;

varying float v2f_height;

/* #TODO PG1.6.1: Copy Blinn-Phong shader setup from previous exercises */
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_light;
varying vec3 v2f_dir_from_view;


const vec3  light_color = vec3(1.0, 0.941, 0.898);
// Small perturbation to prevent "z-fighting" on the water on some machines...
const float terrain_water_level    = -0.03125 + 1e-6;
const vec3  terrain_color_water    = vec3(0.29, 0.51, 0.62);
const vec3  terrain_color_mountain = vec3(0.8, 0.5, 0.4);
const vec3  terrain_color_grass    = vec3(0.33, 0.43, 0.18);

void main()
{
	float material_ambient = 0.1; // Ambient light coefficient
	float height = v2f_height;

	/* #TODO PG1.6.1
	Compute the terrain color ("material") and shininess based on the height as
	described in the handout. `v2f_height` may be useful.
	
	Water:
			color = terrain_color_water
			shininess = 30.
	Ground:
			color = interpolate between terrain_color_grass and terrain_color_mountain, weight is (height - terrain_water_level)*2
	 		shininess = 2.
	*/
	vec3 material_color = terrain_color_water;
	float shininess = 30.;

	if (height > terrain_water_level) {
		float alpha = 2. * (height - terrain_water_level);
		material_color = mix(terrain_color_grass, terrain_color_mountain, alpha);
		shininess = 2.;
	}

	/* #TODO PG1.6.1: apply the Blinn-Phong lighting model
    	Add the Blinn-Phong implementation from GL2 here.
	*/

	vec3 normal = normalize(v2f_normal);
	vec3 light_direction = normalize(v2f_dir_to_light);
	vec3 view_direction = normalize(v2f_dir_from_view);

	vec3 ambiant_light = material_ambient * material_color * light_color;
	
	vec3 half_vector = normalize(-view_direction + light_direction);

	float n_dot_l = dot(normal, light_direction);
	vec3 diffuse_component = max(n_dot_l, 0.) * material_color;
	
	float n_dot_h = dot(half_vector, normal);
	vec3 specular_component = pow(max(n_dot_h, 0.), shininess) * material_color;

	vec3 color = ambiant_light + light_color * (diffuse_component + specular_component);
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
