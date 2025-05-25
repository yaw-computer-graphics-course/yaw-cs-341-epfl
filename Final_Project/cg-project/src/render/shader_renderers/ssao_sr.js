import { vec3 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";
import {texture_data } from "../../cg_libraries/cg_render_utils.js"
import { ShaderRenderer } from "./shader_renderer.js";

export class SSAOShaderRenderer extends ShaderRenderer {

    /**
     * Its render function can be used to render scene objects with 
     * just a color or a texture (wihtout shading effect)
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `texcoords.vert.glsl`, 
            `ssao.frag.glsl`
        );
        this.noiseTexture = noiseTexture(regl);

        // Generate the SSAO kernel ONCE
        this.sample_kernel_size = 64;
        this.sample_kernel = flattenKernel(get_sample_kernel(this.sample_kernel_size));

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
     * Render the objects of the scene_state with its shader
     * @param {*} scene_state 
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

const lerp = (x, y, a) => x * (1 - a) + y * a;

function flattenKernel(kernel) {
    const flat = new Float32Array(kernel.length * 3);
    for (let i = 0; i < kernel.length; ++i) {
        flat.set(kernel[i], i * 3);
    }
    return flat;
}


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

