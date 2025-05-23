
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"
import { terrain_build_mesh, ground_build_mesh } from "../scene_resources/terrain_generation.js"
import { noise_functions } from "../render/shader_renderers/noise_sr.js"
import { Scene } from "./scene.js"
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { create_button, create_slider, create_hotkey_action } from "../cg_libraries/cg_web.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js"


export class DemoScene extends Scene {

  /**
   * A scene featuring a procedurally generated terrain with dynamic objects
   * 
   * @param {ResourceManager} resource_manager 
   * @param {ProceduralTextureGenerator} procedural_texture_generator 
   */
  constructor(resource_manager, procedural_texture_generator){
    super();

    this.resource_manager = resource_manager;    
    this.procedural_texture_generator = procedural_texture_generator;

    // Additional helper lists to better organize dynamic object generation
    this.static_objects = [];
    this.dynamic_objects = [];

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  initialize_scene() {
    // Add lights
    /*
    this.lights.push({
      position: [-4, -5, 7],
      color: [0.75, 0.53, 0.45]
    });*/
    this.lights.push({
      position: [0, 0, 4],
      color: [0.7, 0.0, 0.0]
    });

    // Compute height map using procedural texture
    const height_map = this.procedural_texture_generator.compute_texture(
      "perlin_heightmap", 
      noise_functions.FBM_for_terrain, 
      { width: 96, height: 96, mouse_offset: [-12.24, 8.15] }
    );

    this.GROUND_LEVEL = 0.0;
    this.TERRAIN_SCALE = [10, 10, 10];
    
    // Build terrain and ground meshes
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));
    const terrain_mesh = terrain_build_mesh(height_map, this.GROUND_LEVEL);
    this.resource_manager.add_procedural_mesh("mesh_terrain", terrain_mesh);
    this.static_objects.push({
      translation: [0, 0, 0],
      scale: this.TERRAIN_SCALE,
      mesh_reference: 'mesh_terrain',
      material: MATERIALS.rock1
    });

    const ground_mesh = ground_build_mesh(height_map, this.GROUND_LEVEL);
    this.resource_manager.add_procedural_mesh("mesh_ground", ground_mesh);
    this.static_objects.push({
      translation: [0, 0, 0],
      scale: this.TERRAIN_SCALE,
      mesh_reference: 'mesh_ground',
      material: MATERIALS.rock1
    });

    // Add static objects
    this.setup_static_objects();

    // Initialize dynamic objects
    this.initialize_flame();

    // Combine static and dynamic objects
    this.objects = this.static_objects.concat(this.dynamic_objects);
  }

  setup_static_objects() {
    const objects = [
      { name: "stones", mesh: "Stones.obj", material: MATERIALS.stone },
      { name: "log", mesh: "Log.obj", material: MATERIALS.log },
      { name: "coal", mesh: "Coal.obj", material: MATERIALS.coal },
      { name: "branches", mesh: "Branches.obj", material: MATERIALS.branch },
    ];

    objects.forEach(obj => {
      const item = {
        mesh_reference: obj.mesh,
        material: obj.material,
        translation: [0, 0, 0],
        scale: [2, 2, 2],
      };
      this.actors[obj.name] = item;
      this.static_objects.push(item);
    });
  }

  initialize_flame() {
    this.flame_material = this.procedural_texture_generator.generate_flame_material();

    // Check if flame_material is valid
    if (!this.flame_material || !Array.isArray(this.flame_material.properties)) {
        console.error('Flame material is not defined correctly:', this.flame_material);
        return; // Exit if the material is not valid
    }

    const flame = {
        mesh_reference: 'flame.obj',
        material: this.flame_material,
        translation: [0, 0, .4],
        scale: [0.3, 0.3, 0.3],
    };
    this.dynamic_objects.push(flame);
    this.actors["flame"] = flame;
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions() {
    
    for (const name in this.actors) {
      // Pine tree
      if (name.includes("tree")){
        const tree = this.actors[name];
        tree.evolve = (dt) => {
          const max_scale = 0.4;
          if (tree.scale[0] < max_scale){
            grow_tree(tree.scale, dt);
          }
          else{
            tree.scale = [max_scale, max_scale, max_scale];
          }
        };
      }
      else if (name.includes("flame")) {
        const flame = this.actors[name]
        flame.evolve = (dt) => { flame.material.updateColor() };
      }
      // Lights
      else if (name.includes("light")) {
        const light = this.actors[name];
        const light_idx = parseInt(name.split("_")[1]);
        light.evolve = (dt) => {
          const curr_pos = light.position;
          light.position = [curr_pos[0], curr_pos[1], this.ui_params.light_height[light_idx]];
        }
      }
      //Stones
      else if (name.includes("stones")){
        const stones = this.actors[name];
        stones.evolve = (dt) => {};
      }
      //Log
      else if (name.includes("log")){
        const log = this.actors[name];
        log.evolve = (dt) => {};
      }
      //Coal
      else if (name.includes("coal")){
        const coal = this.actors[name];
        coal.evolve = (dt) => {};
      }
      //Branches
      else if (name.includes("branches")){
        const branches = this.actors[name];
        branches.evolve = (dt) => {};
      }

    }
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    this.ui_params.light_height = [7, 6];

    // Set preset view
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 0.8,
        angle_z : 2.440681469282041,
        angle_y : -0.29240122440170113,
        look_at : [0, 0, 0]
      })
    });
    
    // Create a slider to change the height of each light
    const n_steps_slider = 100;
    const min_light_height_1 = 7;
    const max_light_height_1 = 9;
    create_slider("Height light 1 ", [0, n_steps_slider], (i) => {
      this.ui_params.light_height[0] = min_light_height_1 + i * (max_light_height_1 - min_light_height_1) / n_steps_slider;
    });
    const min_light_height_2 = 6;
    const max_light_height_2 = 8;
    create_slider("Height light 2 ", [0, n_steps_slider], (i) => {
      this.ui_params.light_height[1] = min_light_height_2 + i * (max_light_height_2 - min_light_height_2) / n_steps_slider;
    });
    // Add shadow softness control
    create_slider("Shadow Softness", [0, n_steps_slider], (value) => {
      const softness = value / 1000; // Scale to reasonable range
      this.shadows_renderer.setSoftness(softness);
    });
  }
}
