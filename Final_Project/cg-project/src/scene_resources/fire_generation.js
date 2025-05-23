import {vec2, vec3, vec4, mat2, mat3, mat4} from "../../lib/gl-matrix_3.3.0/esm/index.js"

// Custom function to generate procedural fire effects
export function fire_build_mesh(height_map, fire_level, time) {
    const grid_width = height_map.width;
    const grid_height = height_map.height;

    const vertices = [];
    const normals = [];
    const faces = [];
    const tex_coords = [];

    // Function to convert 2D coordinates to vertex index
    function xy_to_v_index(x, y) {
        return x + y * grid_width;
    }

    for (let gy = 0; gy < grid_height; gy++) {
        for (let gx = 0; gx < grid_width; gx++) {
            const idx = xy_to_v_index(gx, gy);
            const elevation = height_map.get(gx, gy); // Get height value from height_map

            // Calculate the flame height using a Gaussian-like function
            const centerX = grid_width / 2;
            const width = grid_width * 0.2; // Control the width of the flame
            const distance = Math.abs(gx - centerX);
            const peak = fire_level * Math.exp(-Math.pow(distance / width, 2)); // Gaussian-like

            // Use smooth random flicker effect
            const flicker = Math.sin(time * 10 + gx * 0.1) * 0.1;
            const flame_height = Math.max(0, elevation + peak + flicker);

            // Flame position
            const vx = (1.0 / grid_width * gx) - 0.5;
            const vy = (1.0 / grid_height * gy) - 0.5;
            const vz = flame_height;

            vertices[idx] = [vx, vy, vz]; // Position in 3D space

            // Normals and texture coordinates
            normals[idx] = [0, 0, 1]; // Normal facing up
            tex_coords[idx] = [gx / (grid_width - 1), gy / (grid_height - 1)];
        }
    }

    // Create faces for the mesh
    for (let gy = 0; gy < grid_height - 1; gy++) {
        for (let gx = 0; gx < grid_width - 1; gx++) {
            const va = xy_to_v_index(gx, gy);
            const vb = xy_to_v_index(gx + 1, gy);
            const vc = xy_to_v_index(gx, gy + 1);
            const vd = xy_to_v_index(gx + 1, gy + 1);

            faces.push([va, vb, vc]);
            faces.push([vb, vd, vc]);
        }
    }

    return {
        vertex_positions: vertices,
        vertex_normals: normals,
        faces: faces,
        vertex_tex_coords: tex_coords
    };
}
