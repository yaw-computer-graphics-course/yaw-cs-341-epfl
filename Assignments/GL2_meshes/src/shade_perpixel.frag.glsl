precision mediump float;

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_light;
varying vec3 v2f_dir_from_view;

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main()
{
	float material_ambient = 0.1;

	/*
	/* #TODO GL2.4: Apply the Blinn-Phong lighting model

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	vec3 normal = normalize(v2f_normal);
	vec3 light_direction = normalize(v2f_dir_to_light);
	vec3 view_direction = normalize(v2f_dir_from_view);

	vec3 ambiant_light = material_ambient * material_color * light_color;
	
	vec3 half_vector = normalize(-view_direction + light_direction);

	float n_dot_l = dot(normal, light_direction);
	vec3 diffuse_component = max(n_dot_l, 0.) * material_color;
	
	float n_dot_h = dot(half_vector, normal);
	vec3 specular_component = pow(max(n_dot_h, 0.), material_shininess) * material_color;

	vec3 color = ambiant_light + light_color * (diffuse_component + specular_component);

	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}