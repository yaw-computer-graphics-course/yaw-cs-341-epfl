import { texture_data } from "../../cg_libraries/cg_render_utils.js"
import { ShaderRenderer } from "./shader_renderer.js";

export class BloomShaderRenderer extends ShaderRenderer {
    /**
     * Post-process renderer for bloom effect
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `texcoords.vert.glsl`, 
            `bloom.frag.glsl`
        );
        
        // Create a full-screen quad mesh
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
     * Render a bloom post-process effect
     * @param {*} scene_state Current scene state
     * @param {*} rendered_lit_scene Texture containing the already-rendered scene
     */
    render(scene_state, rendered_lit_scene){
        // For post-processing, we just need one draw call with the screen quad
        this.pipeline({
            mesh: this.quad_mesh,
            u_sceneTexture: rendered_lit_scene,
            u_texture_size: [1 / rendered_lit_scene.width, 1 / rendered_lit_scene.height],
            u_threshold: 0.33,  // Threshold for bloom intensity
            u_bloom_intensity: 0.9  // Bloom strength
        });
    }

    uniforms(regl){
        return {
            u_sceneTexture: regl.prop('u_sceneTexture'),
            u_texture_size: regl.prop('u_texture_size'),
            u_threshold: regl.prop('u_threshold'),
            u_bloom_intensity: regl.prop('u_bloom_intensity')
        };
    }

    depth(){
        // Disable depth testing for post-processing
        return {
            enable: false
        };
    }

    blend(){
        // No blending needed for the post-process
        return {
            enable: false
        };
    }

    // We need to override the attributes method to match your parent class
    attributes(regl){
        return {
            vertex_positions: regl.prop('mesh.vertex_positions'),
            vertex_normal: regl.prop('mesh.vertex_normals'),
            vertex_tex_coords: regl.prop('mesh.vertex_tex_coords'),
        };
    }
}
