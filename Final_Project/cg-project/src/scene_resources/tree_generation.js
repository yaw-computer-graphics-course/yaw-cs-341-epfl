import { vec3, mat4 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

let angle = 30 * Math.PI / 180;
const n = 4;
const sides = 8;

const axiom_str = "X";
const rules = {
    X: "F[+X][-X][^X][&X]FX",
    F: "FF"
};

const axiom = axiom_str.split("");
for (const key in rules) rules[key] = rules[key].split("");

function rotateAroundAxis(out, vec, axis, angle) {
    const rotMat = mat4.create();
    mat4.fromRotation(rotMat, angle, axis);
    vec3.transformMat4(out, vec, rotMat);
}

export default function tree_build_mesh() {
    const vertices = [];
    const faces = [];
    const normals = [];
    const tex_coords = [];

    let curr_form = axiom;
    for (let i = 0; i < n; ++i) {
        curr_form = curr_form.flatMap(c => rules[c] || [c]);
    }

    const stack = [];
    let curr_state = {
        position: [0, 0, 0],
        forward: [0, 0, 1],
        up: [0, 1, 0],
        right: [1, 0, 0],
        thickness: 0.18,
        height: 0.5,
        last_ring: []
    };

    for (const char of curr_form) {
        vec3.normalize(curr_state.forward, curr_state.forward);
        vec3.normalize(curr_state.up, curr_state.up);
        vec3.normalize(curr_state.right, curr_state.right);

        switch (char) {
            case '[':
                stack.push({ ...curr_state, 
                    position: vec3.clone(curr_state.position),
                    forward: vec3.clone(curr_state.forward),
                    up: vec3.clone(curr_state.up),
                    right: vec3.clone(curr_state.right),
                    last_ring: [...curr_state.last_ring] });
                break;
            case ']':
                curr_state = stack.pop();
                break;
            case '+':
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.right, angle);
                rotateAroundAxis(curr_state.up, curr_state.up, curr_state.right, angle);
                break;
            case '-':
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.right, -angle);
                rotateAroundAxis(curr_state.up, curr_state.up, curr_state.right, -angle);
                break;
            case '^':
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.up, angle);
                rotateAroundAxis(curr_state.right, curr_state.right, curr_state.up, angle);
                break;
            case '&':
                angle = get_rand_angle();
                rotateAroundAxis(curr_state.forward, curr_state.forward, curr_state.up, -angle);
                rotateAroundAxis(curr_state.right, curr_state.right, curr_state.up, -angle);
                break;
            default:
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

                const delta = vec3.create();
                vec3.scale(delta, curr_state.forward, curr_state.height);
                vec3.add(curr_state.position, curr_state.position, delta);

                // Add a leaf at the end of a branch segment with some probability
                if (Math.random() < 0.15) {
                    const leaf_result = generate_leaf(curr_state.position, curr_state.forward, vertices.length / 3);
                    vertices.push(...leaf_result.vertices);
                    faces.push(...leaf_result.faces);
                    tex_coords.push(...leaf_result.tex_coords);
                }

                curr_state.thickness *= 0.95;
                break;
        }
    }

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


function get_rand_angle(){
    return 30 * Math.random() * Math.PI / 180;
}

function generate_branch_segment(base, forward, right, up, height, bottom_radius, sides, prev_ring, vertex_offset) {
    const taper_factor = 0.8;
    const top_radius = bottom_radius * taper_factor;

    const added_vertices = [];
    const added_faces = [];
    const new_ring = [];

    const top = vec3.create();
    vec3.scaleAndAdd(top, base, forward, height);

    for (let i = 0; i < sides; i++) {
        const theta = (i / sides) * 2 * Math.PI;
        const x = Math.cos(theta);
        const y = Math.sin(theta);

        const offset = vec3.create();
        vec3.scaleAndAdd(offset, offset, right, x);
        vec3.scaleAndAdd(offset, offset, up, y);
        vec3.scale(offset, offset, top_radius);

        const top_pos = vec3.create();
        vec3.add(top_pos, top, offset);
        added_vertices.push(...top_pos);
        new_ring.push(vertex_offset + added_vertices.length / 3 - 1);
    }

    if (prev_ring.length > 0) {
        for (let i = 0; i < sides; i++) {
            const next = (i + 1) % sides;
            const b0 = prev_ring[i];
            const b1 = prev_ring[next];
            const t0 = new_ring[i];
            const t1 = new_ring[next];
            added_faces.push(b0, t0, t1);
            added_faces.push(b0, t1, b1);
        }
    }

    return { new_ring, added_vertices, added_faces };
}

function generate_leaf(position, direction, vertex_offset) {
    const size = 0.05;
    const vertices = [];
    const faces = [];
    const tex_coords = [];

    const right = vec3.fromValues(-direction[1], direction[0], 0);
    vec3.normalize(right, right);
    const up = vec3.create();
    vec3.cross(up, right, direction);
    vec3.normalize(up, up);

    const center = vec3.clone(position);
    const tip = vec3.scaleAndAdd(vec3.create(), center, direction, size);
    const left = vec3.scaleAndAdd(vec3.create(), center, right, -size / 2);
    const right_pt = vec3.scaleAndAdd(vec3.create(), center, right, size / 2);

    vertices.push(...left, ...tip, ...right_pt);
    faces.push(vertex_offset, vertex_offset + 1, vertex_offset + 2);
    tex_coords.push(0, 0, 0.5, 1, 1, 0);

    return { vertices, faces, tex_coords };
}

function compute_triangle_normals_and_angle_weights(vertex_positions, faces) {
    const tri_normals = [], angle_weights = [];
    for (let i = 0; i < faces.length; i += 3) {
        const i1 = faces[i], i2 = faces[i + 1], i3 = faces[i + 2];
        const v1 = vertex_positions.slice(i1 * 3, i1 * 3 + 3);
        const v2 = vertex_positions.slice(i2 * 3, i2 * 3 + 3);
        const v3 = vertex_positions.slice(i3 * 3, i3 * 3 + 3);

        const e1 = vec3.sub(vec3.create(), v2, v1);
        const e2 = vec3.sub(vec3.create(), v3, v1);
        const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), e1, e2));

        tri_normals.push(normal);
        angle_weights.push([1, 1, 1]);
    }
    return [tri_normals, angle_weights];
}

function compute_vertex_normals(vertices, faces, tri_normals, angle_weights) {
    const num_vertices = vertices.length / 3;
    const vertex_normals = Array(num_vertices).fill(0).map(() => vec3.create());

    for (let i = 0; i < faces.length; i += 3) {
        const [i1, i2, i3] = [faces[i], faces[i + 1], faces[i + 2]];
        const normal = tri_normals[i / 3];

        vec3.add(vertex_normals[i1], vertex_normals[i1], normal);
        vec3.add(vertex_normals[i2], vertex_normals[i2], normal);
        vec3.add(vertex_normals[i3], vertex_normals[i3], normal);
    }

    for (let n of vertex_normals) vec3.normalize(n, n);
    return vertex_normals;
}
