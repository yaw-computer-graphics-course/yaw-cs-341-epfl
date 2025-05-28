// Vertex attribute
attribute vec3 vertex_positions;  // The position of the vertex in model space
attribute vec3 vertex_normal;     // The normal at the vertex

// Varying to pass the fragment position in view space to the fragment shader
varying vec3 v2f_frag_pos;

// Uniform transformation matrices
uniform mat4 mat_model_view;              // Model-View matrix
uniform mat4 mat_model_view_projection;   // Model-View-Projection matrix

void main() {
	// Convert the vertex position to a 4D homogeneous coordinate
	vec4 position_v4 = vec4(vertex_positions, 1);
	
	// Compute the fragment position in camera (view) space
	v2f_frag_pos = (mat_model_view * vec4(position_v4)).xyz;

	// Compute the vertex position after applying the MVP matrix
	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
