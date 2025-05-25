attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 position;

uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;
uniform mat4 mat_model_view;

void main() {

	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1.);
	position = (mat_model_view * vec4(vertex_positions, 1.)).xyz;
}
