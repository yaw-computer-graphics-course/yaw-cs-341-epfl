import { vec3 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";
import { texture_data } from "../../cg_libraries/cg_render_utils.js"
import { ShaderRenderer } from "./shader_renderer.js";

export class SSAOShaderRenderer extends ShaderRenderer {
    /**
     * Creates a renderer for Screen Space Ambient Occlusion (SSAO) effect
     * @param {*} regl - regl instance
     * @param {ResourceManager} resource_manager - Resource manager for loading shaders
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `texcoords.vert.glsl`, 
            `ssao.frag.glsl`
        );
        this.noiseTexture = noiseTexture(regl);

        // Generate the SSAO kernel (only once during initialization)
        this.sample_kernel_size = 64;
        this.sample_kernel = flattenKernel(get_sample_kernel(this.sample_kernel_size));

        // Create a full-screen quad mesh for post-processing
        this.quad_mesh = {
            vertex_positions: regl.buffer([
                [-1, -1, 0], // Bottom left
                [1, -1, 0],  // Bottom right
                [1, 1, 0],   // Top right
                [-1, 1, 0]   // Top left
            ]),
            vertex_normals: regl.buffer([
                [0, 0, 1],
                [0, 0, 1],
                [0, 0, 1],
                [0, 0, 1]
            ]),
            vertex_tex_coords: regl.buffer([
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1]
            ]),
            faces: regl.elements([
                [0, 1, 2], // First triangle
                [0, 2, 3]  // Second triangle
            ]),
            count: 6
        };
    }

    /**
     * Renders the SSAO effect using position and normal textures
     * @param {*} scene_state - Current scene state containing camera information
     * @param {*} positions_tex - Texture containing world positions
     * @param {*} normals_tex - Texture containing world normals
     */
    render(scene_state, positions_tex, normals_tex) {
        const sample_kernel_size = 64;
        
        const inputs = [{
            mesh: this.quad_mesh,
            mat_projection: scene_state.scene.camera.mat.projection,
            sample_kernel_size: sample_kernel_size,
            sample_kernel: this.sample_kernel,
            noise_texture: this.noiseTexture,
            noise_scale: [
                positions_tex.width / 4.0,
                positions_tex.height / 4.0,
            ],
            positions_tex: positions_tex,
            normals_tex: normals_tex,
        }];

        this.pipeline(inputs);
    }

    depth(){
        return {
            enable: true,
            mask: true,
            func: '<=',
        };
    }

    uniforms(regl){        
        return {
            mat_projection: regl.prop('mat_projection'),
            kernel: regl.prop('sample_kernel'),
            noise_tex: regl.prop('noise_texture'),
            noise_scale: regl.prop('noise_scale'),
            positions_tex: regl.prop('positions_tex'),
            normals_tex: regl.prop('normals_tex'),
        };
    }
}

/**
 * Linear interpolation between two values
 * @param {number} x - Start value
 * @param {number} y - End value
 * @param {number} a - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
const lerp = (x, y, a) => x * (1 - a) + y * a;

/**
 * Flattens a 3D kernel array into a Float32Array
 * @param {Array<vec3>} kernel - Array of 3D vectors
 * @returns {Float32Array} Flattened kernel data
 */
function flattenKernel(kernel) {
    const flat = new Float32Array(kernel.length * 3);
    for (let i = 0; i < kernel.length; ++i) {
        flat.set(kernel[i], i * 3);
    }
    return flat;
}

/**
 * Generates a sample kernel for SSAO
 * @param {number} kernel_size - Number of samples to generate
 * @returns {Array<vec3>} Array of sample vectors
 */
function get_sample_kernel(kernel_size) {
    const kernel = new Array(kernel_size);

    for (let i = 0; i < kernel_size; ++i) {
        kernel[i] = vec3.fromValues(
            Math.random() * 2.0 - 1.0,
            Math.random() * 2.0 - 1.0,
            Math.random() 
        );

        vec3.normalize(kernel[i], kernel[i]);
        vec3.scale(kernel[i], kernel[i], Math.random());

        let scale = i / kernel_size;
        scale = lerp(0.1, 1.0, scale * scale);
        vec3.scale(kernel[i], kernel[i], scale);
    }

    return kernel;
}

/**
 * Generates random noise texture data for SSAO
 * @returns {Float32Array} Noise texture data
 */
function generateNoiseTextureData() {
    const size = 4 * 4;
    const data = new Float32Array(size * 3); // 3 components per texel (vec3)
    
    for (let i = 0; i < size; i++) {
        const x = Math.random() * 2.0 - 1.0;
        const y = Math.random() * 2.0 - 1.0;
        const z = 0.0;
        data.set([x, y, z], i * 3);
    }

    return data;
}

const noiseData = generateNoiseTextureData();

/**
 * Creates a regl texture from noise data
 * @param {*} regl - regl instance
 * @returns {*} regl texture object
 */
const noiseTexture = (regl) => regl.texture({
    data: noiseData,
    width: 4,
    height: 4,
    format: 'rgb',
    type: 'float',
    wrapS: 'repeat',
    wrapT: 'repeat',
    mag: 'nearest',
    min: 'nearest'
});

