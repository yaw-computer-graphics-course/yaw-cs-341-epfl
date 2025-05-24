import { vec2, vec3, vec4, mat2, mat3, mat4 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

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
            let elevation = height_map.get(gx, gy) - 0.5;

			const nx = (gx / (grid_width - 1)) * 2 - 1;
            const ny = (gy / (grid_height - 1)) * 2 - 1;

            // Calculate distance from center [0-1] range
            const distFromCenter = Math.sqrt(nx*nx + ny*ny);

            const vx = 1.0/grid_width * gx -0.5;
            const vy = 1.0/grid_height * gy -0.5;
			
			// Check if we are at the boundary
            if (gx <= 0 || gx >= grid_width - 1 || gy <= 0 || gy >= grid_height - 1) {
                elevation = fire_level;
				normals[idx] = [0, 0, -1]; // TODO: check these values
            } else {
                normals[idx] = vec3.normalize([0, 0, 0], [
                    -(height_map.get(gx+1, gy) - height_map.get(gx-1, gy)) / (2. / grid_width),
                    -(height_map.get(gx, gy+1) - height_map.get(gx, gy-1)) / (2. / grid_height),
                    1.,
                ]);
            }

			const vz =  - Math.min(0.5 - 1/(distFromCenter + 1) - Math.abs(1.5*elevation), fire_level) + 0.001;
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