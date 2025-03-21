// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.3
	Pass the values needed for per-pixel illumination by creating a varying vertex-to-fragment variable.
*/
varying vec3 color;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position; // in camera space coordinates already

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main() {

	vec4 transformed_v_pos = mat_model_view * vec4(vertex_position, 1.);
	vec3 v_position = transformed_v_pos.xyz;

	vec3 transformed_normal = normalize(mat_normals_to_view * vertex_normal);

	float material_ambient = 0.1;

	vec3 ambiant_light = material_ambient * material_color * light_color;

	vec3 light_direction = normalize(light_position - v_position);
	vec3 ray_direction = -normalize(v_position);
	vec3 half_vector = normalize(ray_direction + light_direction);

	float n_dot_l = dot(transformed_normal, light_direction);
	vec3 diffuse_component = max(n_dot_l, 0.) * material_color;
	
	float n_dot_h = dot(half_vector, transformed_normal);
	vec3 specular_component = pow(max(n_dot_h, 0.), material_shininess) * material_color;

	color = ambiant_light + light_color * (diffuse_component + specular_component);

	 
	/** #TODO GL2.3 Gouraud lighting
	Compute the visible object color based on the Blinn-Phong formula.

	Hint: Compute the vertex position, normal and light_position in view space. 
	*/
	gl_Position = mat_mvp * vec4(vertex_position, 1);
}