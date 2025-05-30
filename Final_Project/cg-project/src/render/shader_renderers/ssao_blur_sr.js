import { vec2 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";
import { texture_data } from "../../cg_libraries/cg_render_utils.js"
import { ShaderRenderer } from "./shader_renderer.js";

export class SSAOBlurShaderRenderer extends ShaderRenderer {
    /**
     * Creates a renderer for SSAO blur post-processing effect
     * @param {*} regl - regl instance
     * @param {ResourceManager} resource_manager - Resource manager for loading shaders
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `texcoords.vert.glsl`, 
            `ssao_blur.frag.glsl`
        );
        
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
     * Renders the SSAO blur effect
     * @param {*} scene_state - Current scene state
     * @param {*} ssao_texture - Texture containing SSAO data to be blurred
     */
    render(scene_state, ssao_texture){
        // Single draw call with the screen quad for post-processing
        this.pipeline({
            mesh: this.quad_mesh,
            ssao_tex: ssao_texture,
            ssao_tex_size: vec2.fromValues(ssao_texture.width, ssao_texture.height),
        });
    }

    uniforms(regl){
        return {
            ssao_tex: regl.prop('ssao_tex'),
            ssao_tex_size: regl.prop('ssao_tex_size'),
        };
    }

    depth(){
        // Disable depth testing for post-processing
        return {
            enable: false
        };
    }

    blend(){
        // Disable blending for post-processing
        return {
            enable: false
        };
    }
}
