import { vec3, mat4 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

// Tree generation parameters
let angle = 30 * Math.PI / 180;  // Base rotation angle in radians
const n = 4;                     // Number of L-system iterations
const sides = 8;                 // Number of sides for each branch segment

// L-system rules for tree generation
const axiom_str = "X";
const rules = {
    X: "F[+X][-X][^X][&X]FX",  // Branching rule
    F: "FF"                     // Growth rule
};

// Convert strings to arrays for processing
const axiom = axiom_str.split("");
for (const key in rules) rules[key] = rules[key].split("");

// Rotates a vector around an axis by given angle
function rotateAroundAxis(out, vec, axis, angle) {
    const rotMat = mat4.create();
    mat4.fromRotation(rotMat, angle, axis);
    vec3.transformMat4(out, vec, rotMat);
}

// Main function to build tree mesh using L-system
export default function tree_build_mesh() {
    const vertices = [];   // Vertex positions
    const faces = [];      // Triangle indices
    const normals = [];    // Vertex normals
    const tex_coords = []; // Texture coordinates

    // Apply L-system rules n times
    let curr_form = axiom;
    for (let i = 0; i < n; ++i) {
        curr_form = curr_form.flatMap(c => rules[c] || [c]);
    }

    // Current turtle state (position/orientation)
    const stack = [];
    let curr_state = {
        position: [0, 0, 0],   // Current position
        forward: [0, 0, 1],    // Forward direction
        up: [0, 1, 0],         // Up direction
        right: [1, 0, 0],      // Right direction
        thickness: 0.5,        // Current branch thickness
        height: 0.7,           // Segment length
        last_ring: []          // Previous ring vertices
    };

    // Process each character in expanded L-system string
    for (const char of curr_form) {
        // Normalize direction vectors
        vec3.normalize(curr_state.forward, curr_state.forward);
        vec3.normalize(curr_state.up, curr_state.up);
        vec3.normalize(curr_state.right, curr_state.right);

        switch (char) {
            case '[':  // Push current state to stack (start branch)
                stack.push({ ...curr_state, 
                    position: vec3.clone(curr_state.position),
                    forward: vec3.clone(curr_state.forward),
                    up: vec3.clone(curr_state.up),
                    right: vec3.clone(curr_state.right),
                    last_ring: [...curr_state.last_ring] });
                break;
            case ']':  // Pop state from stack (end branch)
                curr_state = stack.pop();
                break;
            case '+':  // Rotate right around up axis
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.right, angle);
                rotateAroundAxis(curr_state.up, curr_state.up, curr_state.right, angle);
                break;
            case '-':  // Rotate left around up axis
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.right, -angle);
                rotateAroundAxis(curr_state.up, curr_state.up, curr_state.right, -angle);
                break;
            case '^':  // Pitch up
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.up, angle);
                rotateAroundAxis(curr_state.right, curr_state.right, curr_state.up, angle);
                break;
            case '&':  // Pitch down
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.up, -angle);
                rotateAroundAxis(curr_state.right, curr_state.right, curr_state.up, -angle);
                break;
            default:  // Draw branch segment
                const { new_ring, added_vertices, added_faces } = generate_branch_segment(
                    curr_state.position,
                    curr_state.forward,
                    curr_state.right,
                    curr_state.up,
                    curr_state.height,
                    curr_state.thickness,
                    sides,
                    curr_state.last_ring,
                    vertices.length / 3
                );

                vertices.push(...added_vertices);
                faces.push(...added_faces);
                curr_state.last_ring = new_ring;

                // Move forward
                const delta = vec3.create();
                vec3.scale(delta, curr_state.forward, curr_state.height);
                vec3.add(curr_state.position, curr_state.position, delta);

                // 70% chance to add leaf at segment end
                if (Math.random() < 0.7) {
                    const leaf_result = generate_leaf(curr_state.position, curr_state.forward, vertices.length / 3);
                    vertices.push(...leaf_result.vertices);
                    faces.push(...leaf_result.faces);
                    tex_coords.push(...leaf_result.tex_coords);
                }

                // Reduce thickness as we grow outward
                curr_state.thickness *= 0.95;
                break;
        }
    }

    // Compute normals for lighting
    const [tri_normals, angle_weights] = compute_triangle_normals_and_angle_weights(vertices, faces);
    const vertex_normals = compute_vertex_normals(vertices, faces, tri_normals, angle_weights);
    for (const n of vertex_normals) normals.push(...n);

    return {
        vertex_positions: vertices,
        vertex_normals: normals,
        faces: faces,
        vertex_tex_coords: tex_coords
    };
}

// Returns random angle between 0-30 degrees in radians
function get_rand_angle(){
    return 30 * Math.random() * Math.PI / 180;
}

// Generates a cylindrical branch segment
function generate_branch_segment(base, forward, right, up, height, bottom_radius, sides, prev_ring, vertex_offset) {
    const taper_factor = 0.8;
    const top_radius = bottom_radius * taper_factor;

    const added_vertices = [];
    const added_faces = [];
    const new_ring = [];

    // Calculate top center position
    const top = vec3.create();
    vec3.scaleAndAdd(top, base, forward, height);

    // Create ring of vertices at top
    for (let i = 0; i < sides; i++) {
        const theta = (i / sides) * 2 * Math.PI;
        const x = Math.cos(theta);
        const y = Math.sin(theta);

        // Calculate vertex position around ring
        const offset = vec3.create();
        vec3.scaleAndAdd(offset, offset, right, x);
        vec3.scaleAndAdd(offset, offset, up, y);
        vec3.scale(offset, offset, top_radius);

        const top_pos = vec3.create();
        vec3.add(top_pos, top, offset);
        added_vertices.push(...top_pos);
        new_ring.push(vertex_offset + added_vertices.length / 3 - 1);
    }

    // Connect to previous ring if it exists
    if (prev_ring.length > 0) {
        for (let i = 0; i < sides; i++) {
            const next = (i + 1) % sides;
            const b0 = prev_ring[i];
            const b1 = prev_ring[next];
            const t0 = new_ring[i];
            const t1 = new_ring[next];
            added_faces.push(b0, t0, t1);  // First triangle
            added_faces.push(b0, t1, b1);  // Second triangle
        }
    }

    return { new_ring, added_vertices, added_faces };
}

// Generates a simple triangular leaf
function generate_leaf(position, direction, vertex_offset) {
    const length = 0.18;  // Leaf length
    const width = 0.09;   // Leaf width

    // Find two vectors perpendicular to direction
    let up = [0, 1, 0];
    if (Math.abs(vec3.dot(direction, up)) > 0.9) up = [1, 0, 0];
    const right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), direction, up));
    up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), right, direction));

    // Calculate leaf vertices
    const tip = vec3.scaleAndAdd(vec3.create(), position, direction, length);
    const base_left = vec3.scaleAndAdd(vec3.create(), position, right, -width);
    const base_right = vec3.scaleAndAdd(vec3.create(), position, right, width);

    const vertices = [
        ...tip, ...base_left, ...base_right
    ];
    const faces = [
        vertex_offset + 0, vertex_offset + 1, vertex_offset + 2
    ];
    const tex_coords = [
        0.5, 1,  0, 0,  1, 0  // UV coordinates for leaf texture
    ];
    return { vertices, faces, tex_coords };
}

function compute_triangle_normals_and_angle_weights(vertex_positions, faces) {
    const tri_normals = [], angle_weights = [];
    for (let i = 0; i < faces.length; i += 3) {
        const i1 = faces[i], i2 = faces[i + 1], i3 = faces[i + 2];
        const v1 = vertex_positions.slice(i1 * 3, i1 * 3 + 3);
        const v2 = vertex_positions.slice(i2 * 3, i2 * 3 + 3);
        const v3 = vertex_positions.slice(i3 * 3, i3 * 3 + 3);

        // Calculate face normal using cross product
        const e1 = vec3.sub(vec3.create(), v2, v1);
        const e2 = vec3.sub(vec3.create(), v3, v1);
        const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), e1, e2));

        tri_normals.push(normal);
        angle_weights.push([1, 1, 1]);
    }
    return [tri_normals, angle_weights];
}

// Computes vertex normals by averaging adjacent face normals
function compute_vertex_normals(vertices, faces, tri_normals, angle_weights) {
    const num_vertices = vertices.length / 3;
    const vertex_normals = Array(num_vertices).fill(0).map(() => vec3.create());

    // Accumulate normals from adjacent faces
    for (let i = 0; i < faces.length; i += 3) {
        const [i1, i2, i3] = [faces[i], faces[i + 1], faces[i + 2]];
        const normal = tri_normals[i / 3];

        vec3.add(vertex_normals[i1], vertex_normals[i1], normal);
        vec3.add(vertex_normals[i2], vertex_normals[i2], normal);
        vec3.add(vertex_normals[i3], vertex_normals[i3], normal);
    }

    // Normalize all vertex normals
    for (let n of vertex_normals) vec3.normalize(n, n);
    return vertex_normals;
}