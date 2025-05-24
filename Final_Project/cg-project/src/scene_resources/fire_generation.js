import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

// Simple Perlin noise implementation
class PerlinNoise {
    constructor(seed = 0) {
        this.permutation = this.generatePermutation(seed);
    }

    generatePermutation(seed) {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // Shuffle using seed
        let rng = this.seededRandom(seed);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Duplicate for easier indexing
        for (let i = 0; i < 256; i++) {
            p[i + 256] = p[i];
        }
        
        return p;
    }

    seededRandom(seed) {
        let x = Math.log(seed) * 10000;
        return function() {
            x = Math.log(x) * 10000;
            return x - Math.floor(x);
        };
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.permutation[X] + Y;
        const AA = this.permutation[A] + Z;
        const AB = this.permutation[A + 1] + Z;
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B] + Z;
        const BB = this.permutation[B + 1] + Z;

        return this.lerp(
            this.lerp(
                this.lerp(this.grad(this.permutation[AA], x, y, z),
                         this.grad(this.permutation[BA], x - 1, y, z), u),
                this.lerp(this.grad(this.permutation[AB], x, y - 1, z),
                         this.grad(this.permutation[BB], x - 1, y - 1, z), u), v),
            this.lerp(
                this.lerp(this.grad(this.permutation[AA + 1], x, y, z - 1),
                         this.grad(this.permutation[BA + 1], x - 1, y, z - 1), u),
                this.lerp(this.grad(this.permutation[AB + 1], x, y - 1, z - 1),
                         this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    }

    octaveNoise(x, y, z, octaves = 4, persistence = 0.5, scale = 1.0) {
        let value = 0;
        let amplitude = 1;
        let frequency = scale;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return value / maxValue;
    }
}

export function fire_build_mesh(height_map, fire_level, time = 0) {
    const grid_width = height_map.width;
    const grid_height = height_map.height;

    const vertices = [];
    const normals = [];
    const faces = [];
    const tex_coords = [];

    // Create Perlin noise instances for different flame characteristics
    const flameNoise = new PerlinNoise(42);
    const turbulenceNoise = new PerlinNoise(123);
    const detailNoise = new PerlinNoise(789);

    function xy_to_v_index(x, y) {
        return x + y * grid_width;
    }

    for (let gy = 0; gy < grid_height; gy++) {
        for (let gx = 0; gx < grid_width; gx++) {
            const idx = xy_to_v_index(gx, gy);
            let elevation = height_map.data[gx + gy * grid_width] - 0.5;

            const nx = (gx / (grid_width - 1)) * 2 - 1;
            const ny = (gy / (grid_height - 1)) * 2 - 1;

            const distFromCenter = Math.sqrt(nx * nx + ny * ny);

            const vx = 1.0 / grid_width * gx - 0.5;
            const vy = 1.0 / grid_height * gy - 0.5;

            // Check if we are at the boundary
            if (gx <= 0 || gx >= grid_width - 1 || gy <= 0 || gy >= grid_height - 1) {
                elevation = fire_level;
                normals[idx] = [0, 0, -1];
            } else {
                // Calculate normals with noise-modified heights
                const getNoiseHeight = (x, y) => {
                    const baseHeight = height_map.data[x + y * grid_width] - 0.5;
                    const flameHeight = flameNoise.octaveNoise(x * 0.1, y * 0.1, time * 0.02, 4, 0.6, 1.0);
                    const turbulence = turbulenceNoise.octaveNoise(x * 0.3, y * 0.3, time * 0.05, 3, 0.4, 1.0);
                    return baseHeight + flameHeight * 0.3 + turbulence * 0.15;
                };

                const heightRight = getNoiseHeight(gx + 1, gy);
                const heightLeft = getNoiseHeight(gx - 1, gy);
                const heightUp = getNoiseHeight(gx, gy + 1);
                const heightDown = getNoiseHeight(gx, gy - 1);
                
                normals[idx] = vec3.normalize([0, 0, 0], [
                    -(heightRight - heightLeft) / (2.0 / grid_width),
                    -(heightUp - heightDown) / (2.0 / grid_height),
                    1.0,
                ]);
            }

            // Apply multiple layers of Perlin noise for flame effect
            const baseFlame = flameNoise.octaveNoise(
                vx * 3.0, 
                vy * 3.0, 
                time * 0.03, 
                4, 
                0.6, 
                1.0
            );

            // Turbulence for chaotic movement
            const turbulence = turbulenceNoise.octaveNoise(
                vx * 8.0, 
                vy * 8.0, 
                time * 0.08, 
                3, 
                0.4, 
                1.0
            );

            // Fine detail noise
            const detail = detailNoise.octaveNoise(
                vx * 15.0, 
                vy * 15.0, 
                time * 0.12, 
                2, 
                0.3, 
                1.0
            );

            // Create flame-like displacement
            const flameIntensity = Math.max(0, 1.0 - distFromCenter * 1.5);
            const flameDisplacement = (baseFlame * 0.4 + turbulence * 0.3 + detail * 0.1) * flameIntensity;
            
            // Add upward bias for flame-like shape
            const upwardBias = Math.pow(flameIntensity, 2) * 0.3;
            
            // Combine all effects
            const totalDisplacement = flameDisplacement + upwardBias;
            
            const vz = -Math.exp(distFromCenter) -Math.min(
                0.5 - 1 / (distFromCenter + 1) - Math.abs(1.5 * elevation) + 2. * totalDisplacement, 
                fire_level
            ) + 3.001;

            vertices[idx] = [vx, vy, vz];
            
            const UV_SCALE = 1.0;
            tex_coords[idx] = [
                gx * UV_SCALE / (grid_width - 1), 
                gy * UV_SCALE / (grid_height - 1)
            ];
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
