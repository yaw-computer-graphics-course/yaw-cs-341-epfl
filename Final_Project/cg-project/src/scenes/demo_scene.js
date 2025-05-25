import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"
import { terrain_build_mesh, ground_build_mesh } from "../scene_resources/terrain_generation.js"
import { fire_build_mesh } from "../scene_resources/fire_generation.js"
import { noise_functions } from "../render/shader_renderers/noise_sr.js"
import { Scene } from "./scene.js"
import { create_slider, create_hotkey_action, create_button_with_hotkey } from "../cg_libraries/cg_web.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js"
import tree_build_mesh from "../scene_resources/tree_generation.js"


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
    // Compute the initial height map for flames if required
    this.flame_height_map = this.create_height_map(0, 0); // Initial offsets for height map creation

    // Initialize lights after the flame height map is available
    this.initialize_lights();

    // Compute height map for terrain using procedural texture
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

    for (let i = 0; i < 5; i++) {
      const radius = 7; // Increase this value for a larger circle
      const angle = i * 2 * Math.PI / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const tree_mesh = tree_build_mesh();
      const mesh_name = `mesh_tree_${i}`;
      this.resource_manager.add_procedural_mesh(mesh_name, tree_mesh);

      const tree_obj = {
        mesh_reference: mesh_name,
        material: MATERIALS.gray,
        translation: [x, y, -0.25],
        scale: [10, 10, 10],
      };
      this.static_objects.push(tree_obj);
      this.actors[`tree_${i}`] = tree_obj;
    }

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
    // bench 1
    const item1 = {
      mesh_reference: "bench1.obj",
      material: MATERIALS.bench,
      translation: [0, 3, 0],
      scale: [2, 2, 2],
    };
    this.actors["bench1"] = item1;
    this.static_objects.push(item1);
    // bench 2
    const item2 = {
      mesh_reference: "bench2.obj",
      material: MATERIALS.bench,
      translation: [-3, -3, 0],
      scale: [2, 2, 2],
    };
    this.actors["bench2"] = item2;
    this.static_objects.push(item2);
    // firewood
    const item3 = {
      mesh_reference: "firewood.obj",
      material: MATERIALS.firewood,
      translation: [2.5, 2.5, 0],
      scale: [2, 2, 2],
    };
    this.actors["firewood"] = item3;
    this.static_objects.push(item3);
  }

  initialize_lights() {
    const height_map = this.flame_height_map; 

    // Ensure flame_height_map is available before calculating max elevation
    if (!height_map || !height_map.data) {
        console.error("Height map is not available");
        return;
    }

    let maxElevation = -Infinity;

    for (let gx = 0; gx < height_map.width; gx++) {
        for (let gy = 0; gy < height_map.height; gy++) {
            const elevation = height_map.data[gx + gy * height_map.width]; // accessing elevation directly
            if (elevation > maxElevation) {
                maxElevation = elevation;
            }
        }
    }

    // Add dynamic lights for flame objects
    const flameLight = {
      position: [0, 0, maxElevation], 
      color: [1.0, 0., 0.0],
      intensity: 5.0
    };
    
    this.lights.push(flameLight);
  
    // Store the flame light for later reference
    this.flameLight = flameLight;
  }

  update_flame_light() {
    if (this.flameLight) {
        const height_map = this.flame_height_map;

        if (!height_map || !height_map.data) {
            console.error("Height map is not available");
            return;
        }

        let maxElevation = -Infinity;

        for (let gx = 0; gx < height_map.width; gx++) {
            for (let gy = 0; gy < height_map.height; gy++) {
                const elevation = height_map.data[gx + gy * height_map.width];
                if (elevation > maxElevation) {
                    maxElevation = elevation;
                }
            }
        }

        // Update the position of the flame light to the new max elevation
        this.flameLight.position[2] = maxElevation; 
    }
  }

  initialize_flame() {
    const initial_height_map = this.create_height_map(96, 96);

    this.flame_height_map = initial_height_map;

    const flame = fire_build_mesh(initial_height_map, this.GROUND_LEVEL + 0.2);
    //const flame = terrain_build_mesh(height_map, this.GROUND_LEVEL)
    this.resource_manager.add_procedural_mesh("mesh_flame", flame);
    
    const flame_obj = {
        mesh_reference: 'mesh_flame',
        material: MATERIALS.flame_material,
        translation: [0, 0, 0],
        scale: [.7, .7, .7],
    };
    this.dynamic_objects.push(flame_obj);
    this.actors["flame"] = flame_obj;
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
        const flame = this.actors[name];
        let lastUpdateTime = 0;     // Keep track of the last update time
        //const updateInterval = 0.090;
        const updateInterval = 0.1;
  
        flame.evolve = dt => {
          lastUpdateTime += dt;
          if (lastUpdateTime < updateInterval) return;
    
          lastUpdateTime = 0;
          const timeFactor = (Date.now() / 1000) * 7;
          const new_height_map = this.create_height_map(
            Math.sin(timeFactor) * 5,
            Math.cos(timeFactor) * 4
          );
          this.flame_height_map = new_height_map;
    
          if (!new_height_map || !new_height_map.data) {
            console.error("Invalid height map", new_height_map);
            return;
          }
    
          const new_mesh = fire_build_mesh(new_height_map, this.GROUND_LEVEL + 0.2, timeFactor);
          this.resource_manager.add_procedural_mesh("mesh_flame", new_mesh);
          flame.mesh_reference = "mesh_flame";
          
          const time = performance.now() * 0.001; // Convert in seconds
          const cycle = Math.floor(Math.sin(time * 2) * 1.2 + 1); // 0, 1, or 2

          // Define the distinct colors
          const colors = [
              [1.0, 0.0, 0.0],   // Red
              [1.0, 0.0, 0.4],  // Orange
              [1.0, 0.3, 0.0]    // Yellow
          ];

          const color = colors[Math.max(Math.min(cycle, 2), 0)]
          this.resource_manager.update_flame_color(color)
        };
      }
      // Lights
      else if (name.includes("light")) {
        const light = this.actors[name];
        const light_idx = parseInt(name.split("_")[1]);
        light.evolve = (dt) => {
          const curr_pos = light.position;
          light.position = [curr_pos[0], curr_pos[1], this.ui_params.light_height[light_idx]];
          this.update_flame_light();
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
      //Benches
      else if (name.includes("bench1")){
        const bench1 = this.actors[name];
        bench1.evolve = (dt) => {};
      }
      else if (name.includes("bench2")){
        const bench2 = this.actors[name];
        bench2.evolve = (dt) => {};
      }
      //firewood
      else if (name.includes("firewood")){
        const firewood = this.actors[name];
        firewood.evolve = (dt) => {};
      }

    }
  }

  create_height_map(offsetX, offsetY) {
    const width = 64;
    const height = 128;
    const data = new Float32Array(width * height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            data[x + y * width] = 1.2 * Math.sin((x + offsetX) / 10) * Math.cos((y + offsetY) / 10);
        }
    }

    return {
        width: width,
        height: height,
        data: data, // Important to ensure this structure
    };
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    this.ui_params.light_height = [7, 6];

    this.ui_params.ssao_strength = 0.5;

    this.ui_params.use_ssao = true;

    this.ui_params.shadow_softness = 0.05;
    this.ui_params.use_soft_shadows = true; // Initial state: soft shadows

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
      this.ui_params.shadow_softness = value / 1000;
    });

    // SSAO strength slider
    create_slider("SSAO Strength", [0, n_steps_slider], (i) => {
        this.ui_params.ssao_strength = i / n_steps_slider; // Range [0,1]
    });

    // SSAO toggle
    create_button_with_hotkey("Toggle SSAO", "a", () => {
        this.ui_params.use_ssao = !this.ui_params.use_ssao;
    });

    create_hotkey_action("Soft Shadows", "s", () => {
      this.ui_params.use_soft_shadows = !this.ui_params.use_soft_shadows;
    })
  }
}
