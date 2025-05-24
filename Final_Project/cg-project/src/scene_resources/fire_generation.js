import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

export function fire_build_mesh(height_map, fire_level) {
    const grid_width = height_map.width;
    const grid_height = height_map.height;

    const vertices = [];
    const normals = [];
    const faces = [];
    const tex_coords = [];

    function xy_to_v_index(x, y) {
        return x + y * grid_width;
    }

    for (let gy = 0; gy < grid_height; gy++) {
        for (let gx = 0; gx < grid_width; gx++) {
            const idx = xy_to_v_index(gx, gy);
            // Access height values directly from data
            let elevation = height_map.data[gx + gy * grid_width] - 0.5;

            const nx = (gx / (grid_width - 1)) * 2 - 1;
            const ny = (gy / (grid_height - 1)) * 2 - 1;

            const distFromCenter = Math.sqrt(nx * nx + ny * ny);

            const vx = 1.0 / grid_width * gx - 0.5;
            const vy = 1.0 / grid_height * gy - 0.5;

            // Check if we are at the boundary
            if (gx <= 0 || gx >= grid_width - 1 || gy <= 0 || gy >= grid_height - 1) {
                elevation = fire_level;
                normals[idx] = [0, 0, -1]; // Flat normal for boundary vertices
            } else {
                // Calculate normals by using height values directly
                const heightRight = height_map.data[(gx + 1) + gy * grid_width];
                const heightLeft = height_map.data[(gx - 1) + gy * grid_width];
                const heightUp = height_map.data[gx + (gy + 1) * grid_width];
                const heightDown = height_map.data[gx + (gy - 1) * grid_width];
                
                normals[idx] = vec3.normalize([0, 0, 0], [
                    -(heightRight - heightLeft) / (2.0 / grid_width),
                    -(heightUp - heightDown) / (2.0 / grid_height),
                    1.0,
                ]);
            }

            const vz = -Math.min(0.5 - 1 / (distFromCenter + 1) - Math.abs(1.5 * elevation), fire_level) + 0.001;
            vertices[idx] = [vx, vy, vz];
            const UV_SCALE = 1.0;
            tex_coords[idx] = [gx * UV_SCALE / (grid_width - 1), gy * UV_SCALE / (grid_height - 1)];
        }
    }

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
