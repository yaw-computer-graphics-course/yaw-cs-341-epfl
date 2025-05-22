import {texture_data, light_to_cam_view} from "../../cg_libraries/cg_render_utils.js"
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { EnvironmentCapture } from "../env_capture.js"
import { ShaderRenderer } from "./shader_renderer.js";
import { ShadowMapShaderRenderer } from "./shadow_map_sr.js"


export class ShadowsShaderRenderer extends ShaderRenderer {

    /**
     * Used to produce a black & white map of the shadows of 
     * the scene using the cube map method for a point light
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `point_light_shadows.vert.glsl`, 
            `point_light_shadows.frag.glsl`
        );
        this.env_capture = new EnvironmentCapture(regl, resource_manager);
        // Here we instanciante the ShadowMapShaderRenderer directly into the ShadowsShaderRenderer 
        // because the latter needs to pass shadow_map render function to the env_capture to generate the cube_map 
        this.shadow_map = new ShadowMapShaderRenderer(regl, resource_manager);
        this.shadow_softness = 0.05; // Default softness value
        // 16 Poisson disk samples for PCF (Percentage Closer Filtering)
        this.poissonDisk = [
            [-0.94201624, -0.39906216],
            [0.94558609, -0.76890725],
            [-0.094184101, -0.92938870],
            [0.34495938, 0.29387760],
            [-0.91588581, 0.45771432],
            [-0.81544232, -0.87912464],
            [-0.38277543, 0.27676845],
            [0.97484398, 0.75648379],
            [0.44323325, -0.97511554],
            [0.53742981, -0.47373420],
            [-0.26496911, -0.41893023],
            [0.79197514, 0.19090188],
            [-0.24188840, 0.99706507],
            [-0.81409955, 0.91437590],
            [0.19984126, 0.78641367],
            [0.14383161, -0.14100790]
        ];
    }

    /**
     * The result is a combination of all the light's cast shadows.
     * White means "shadows" black means "no shadows"
     * @param {*} scene_state 
     */
    render(scene_state){

        const scene = scene_state.scene;
        const inputs = [];

        // For every light build a shadow map and do a render of the shadows
        this.regl.clear({color: [0,0,0,1]});

        const num_lights = scene.lights.length;

        const shadow_softness = this.shadow_softness;
        const poissonDisk = this.poissonDisk;

        scene.lights.forEach(light => {
            // Transform light position into camera space
            const light_position_cam = light_to_cam_view(light.position, scene.camera.mat.view);

            // Computation of the cube map from the light
            const cube_shadowmap = this.compute_shadow_cube_map(scene_state, light);

            for (const obj of scene.objects) {

                if(this.exclude_object(obj)) continue;

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

                    light_position_cam : light_position_cam,
                    num_lights: num_lights,

                    cube_shadowmap: cube_shadowmap,

                    shadow_softness: shadow_softness,
                    poissonDisk: poissonDisk,
                });
            }

            this.pipeline(inputs);
        });
    }


    exclude_object(obj){
        // Exclude object with environment material: the sky does not cast shadows
        return obj.material.properties.includes('environment');
    }

    compute_shadow_cube_map(scene_state, light){
        const light_position = light.position;

        this.env_capture.capture_scene_cubemap(
            scene_state, 
            light_position, // position from which to render the cube map
            (s_s) => {this.shadow_map.render(s_s)} // function used to render the cube map
        );
        return this.env_capture.env_cubemap;
    }


    depth(){
        // Use the z-buffer
        return {
            enable: true,
            mask: true,
            func: '<=',
        };
    }

    blend(){
        // Additive blend mode
        return {
            enable: true,
            func: {
                src: 1,
                dst: 1,
            },
        };
    }

    uniforms(regl){
        return{
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            mat_model_view: regl.prop('mat_model_view'),
    
            // Light
            light_position_cam: regl.prop('light_position_cam'),
            num_lights: regl.prop('num_lights'),

            // Cube map
            cube_shadowmap: regl.prop('cube_shadowmap'),
            // Softness value
            shadow_softness: regl.prop('shadow_softness'),

            // Poisson Disk for soft shadows (PCF)
            poissonDisk: regl.prop('poissonDisk'),
        };
    }

    setSoftness(value) {
        this.shadow_softness = value;
    }
}
