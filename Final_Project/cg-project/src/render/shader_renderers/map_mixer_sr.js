
import { ShaderRenderer } from "./shader_renderer.js";



export class MapMixerShaderRenderer extends ShaderRenderer {

    /**
     * Used to render the mix between the 
     * two texture maps: shadows & blinn_phong colors
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `map_mixer.vert.glsl`, 
            `map_mixer.frag.glsl`
        );
    }
    
    /**
     * Render result if the mix of the two texture passed as arguments
     * @param {*} scene_state 
     * @param {*} rendered_shadows a texture containing the shadows information
     * @param {*} rendered_blinn_phong a texture with the objects colors & shading 
     */
    render(scene_state, rendered_shadows, rendered_blinn_phong, rendered_ssao, ui_ssao_strength, ui_use_ssao){

        const scene = scene_state.scene;
        const inputs = [];

        for (const obj of scene.objects) {

            const mesh = this.resource_manager.get_mesh(obj.mesh_reference);
            
            const { 
                mat_model_view, 
                mat_model_view_projection, 
                mat_normals_model_view 
            } = scene.camera.object_matrices.get(obj);

            inputs.push({
                mesh: mesh,

                mat_model_view_projection: mat_model_view_projection,
                mat_model_view: mat_model_view,
                mat_normals_model_view: mat_normals_model_view,

                canvas_width: scene_state.frame.framebufferWidth, 
                canvas_height: scene_state.frame.framebufferHeight,

                shadows: rendered_shadows,

                blinn_phong: rendered_blinn_phong,

                ssao: rendered_ssao,
                ssao_strength: ui_ssao_strength,
                use_ssao: ui_use_ssao,
            });
        }

        this.pipeline(inputs);
    }

    uniforms(regl){
        return{
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            mat_model_view: regl.prop('mat_model_view'),
            mat_normals_model_view: regl.prop('mat_normals_model_view'),

            canvas_width: regl.prop("canvas_width"),
            canvas_height: regl.prop("canvas_height"),

            shadows: regl.prop("shadows"),
            blinn_phong: regl.prop("blinn_phong"),
            ssao: regl.prop('ssao'),
            ssao_strength: regl.prop('ssao_strength'),
            use_ssao: regl.prop('use_ssao'),
        };
    }
}

