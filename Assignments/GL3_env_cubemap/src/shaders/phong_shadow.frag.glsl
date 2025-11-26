precision highp float;

/* #TODO GL3.3.1: Pass on the normals and fragment position in camera coordinates */
varying vec3 v2f_normal_camera_coord;
varying vec3 v2f_frag_pos_camera_coord;
varying vec2 v2f_uv;


uniform vec3 light_position; // light position in camera coordinates
uniform vec3 light_color;
uniform samplerCube cube_shadowmap;
uniform sampler2D tex_color;

void main() {

	float material_shininess = 12.;
	float material_ambient = 1e-4;

	vec3 material_color = texture2D(tex_color, v2f_uv).xyz;
	
	/*
	#TODO GL3.3.1: Blinn-Phong with shadows and attenuation

	Compute this light's diffuse and specular contributions.
	You should be able to copy your phong lighting code from GL2 mostly as-is,
	though notice that the light and view vectors need to be computed from scratch here; 
	this time, they are not passed from the vertex shader. 
	Also, the light/material colors have changed; see the Phong lighting equation in the handout if you need
	a refresher to understand how to incorporate `light_color` (the diffuse and specular
	colors of the light), `v2f_diffuse_color` and `v2f_specular_color`.
	
	To model the attenuation of a point light, you should scale the light
	color by the inverse distance squared to the point being lit.
	
	The light should only contribute to this fragment if the fragment is not occluded
	by another object in the scene. You need to check this by comparing the distance
	from the fragment to the light against the distance recorded for this
	light ray in the shadow map.
	
	To prevent "shadow acne" and minimize aliasing issues, we need a rather large
	tolerance on the distance comparison. It's recommended to use a *multiplicative*
	instead of additive tolerance: compare the fragment's distance to 1.01x the
	distance from the shadow map.

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	vec3 normal = normalize(v2f_normal_camera_coord);
	vec3 light_direction = normalize(light_position - v2f_frag_pos_camera_coord);
	vec3 view_direction = -normalize(v2f_frag_pos_camera_coord);

	vec3 ambiant_light = material_ambient * material_color * light_color;
	
	vec3 half_vector = normalize(view_direction + light_direction);

	float n_dot_l = dot(normal, light_direction);
	vec3 diffuse_component = max(n_dot_l, 0.) * material_color;
	
	float n_dot_h = dot(half_vector, normal);
	vec3 specular_component = pow(max(n_dot_h, 0.), material_shininess) * material_color;

	float dist_l_p = distance(light_position, v2f_frag_pos_camera_coord);
	float attenuation = 1. / pow(dist_l_p, 2.);

	vec3 color = ambiant_light + attenuation * light_color * (diffuse_component + specular_component);

	vec3 shadow_vec = -normalize(light_direction);
	float shadow_depth = textureCube(cube_shadowmap, shadow_vec).r;
	float shadow = 0.;

	if (dist_l_p < shadow_depth * 1.01) {
		shadow = 1.;
	}
	
	color *= shadow;
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
