precision mediump float;

varying vec3 normal;

void main() {
	vec3 color = normalize(normal) * 0.5 + 0.5;
	gl_FragColor = vec4(color, 1.);
}
