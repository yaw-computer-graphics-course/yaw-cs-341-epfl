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

  /**
   * Generates a procedural height map using a sine-cosine wave pattern.
   *
   * The resulting height map is a 2D grid of float values simulating elevation data.
   * It can be used for simulating terrain, flame shapes, or other procedural surfaces.
   *
   * @param {number} offsetX - Horizontal offset to shift the wave pattern (e.g., for animation or variation).
   * @param {number} offsetY - Vertical offset to shift the wave pattern.
   * @returns {{
   *   width: number,
    *   height: number,
    *   data: Float32Array
    * }} A height map object containing dimensions and elevation values.
    */
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
        data: data,
    };
  }

  /**
   * Initializes the 3D scene with terrain, lighting, and all objects (static and dynamic).
   * 
   * This method:
   * 1. Creates procedural height maps for flame and terrain.
   * 2. Builds terrain and ground meshes.
   * 3. Initializes lighting, static objects, and dynamic flame entities.
   * 4. Combines all scene elements into a unified `this.objects` array.
   */
  initialize_scene() {
    // Cretate the initial height map for height map creation
    this.flame_height_map = this.create_height_map(0, 0);

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
    
    // Build the terrain mesh procedurally
    const terrain_mesh = terrain_build_mesh(height_map, this.GROUND_LEVEL);
    this.resource_manager.add_procedural_mesh("mesh_terrain", terrain_mesh);
    this.static_objects.push({
      translation: [0, 0, 0],
      scale: this.TERRAIN_SCALE,
      mesh_reference: 'mesh_terrain',
      material: MATERIALS.rock1
    });

    // Build the flat ground mesh procedurally
    // This plane is used to enclose the island from the top
    const ground_mesh = ground_build_mesh(height_map, this.GROUND_LEVEL);
    this.resource_manager.add_procedural_mesh("mesh_ground", ground_mesh);
    this.static_objects.push({
      translation: [0, 0, 0],
      scale: this.TERRAIN_SCALE,
      mesh_reference: 'mesh_ground',
      material: MATERIALS.grass
    });
    
    // Add static objects
    this.setup_static_objects();

    // Initialize dynamic objects
    this.initialize_flame();

    // Combine static and dynamic objects
    this.objects = this.static_objects.concat(this.dynamic_objects);
  }

  /**
   * Initializes and populates the 3D scene with static objects such as stones, logs,
   * benches, firewood, and a chest. It also generates a number of procedural trees
   * using L-Systems.
   */
  setup_static_objects() {
    // Initialize the scene objects
    const objects = [
      { name: "stones", mesh: "Stones.obj", material: MATERIALS.stone },
      { name: "log", mesh: "Log.obj", material: MATERIALS.log },
      { name: "coal", mesh: "Coal.obj", material: MATERIALS.coal },
      { name: "branches", mesh: "Branches.obj", material: MATERIALS.branch },
    ];
    
    // Generate the L-Systems
    this.generate_trees(14, 12);
    
    // Push the objets into the scene and as actors
    objects.forEach(obj => {
      const item = {
        mesh_reference: obj.mesh,
        material: obj.material,
        translation: [0, 0, 0],
        scale: [3.5, 3.5, 3.5],
      };
      this.actors[obj.name] = item;
      this.static_objects.push(item);
    });
    
    // Bench 1
    const item1 = {
      mesh_reference: "bench1.obj",
      material: MATERIALS.bench,
      translation: [0, 5, 0],
      scale: [4, 4, 4],
    };
    this.actors["bench1"] = item1;
    this.static_objects.push(item1);
    
    // Bench 2
    const item2 = {
      mesh_reference: "bench2.obj",
      material: MATERIALS.bench,
      translation: [-3, -3, 0],
      scale: [4, 4, 4],
    };
    this.actors["bench2"] = item2;
    this.static_objects.push(item2);
    
    // Firewood
    const item3 = {
      mesh_reference: "firewood.obj",
      material: MATERIALS.firewood,
      translation: [6, 4, 0],
      scale: [4, 4, 4],
    };
    this.actors["firewood"] = item3;
    this.static_objects.push(item3);
    
    // Chest
    const item4 = {
      mesh_reference: "chest.obj",
      material: MATERIALS.chest_tex,
      translation: [-2, 9, 0],
      scale: [0.8, 0.8, 0.8],
    };
    this.actors["chest"] = item4;
    this.static_objects.push(item4);
  }
  /**
   * Procedurally generates tree objects and places them randomly within a specified area.
   * Ensures trees are not placed too close to the center (e.g., a campfire) or existing static objects.
   *
   * @param {number} area_radius - The maximum radius from the center in which to place trees.
   * @param {number} count - The number of trees to generate.
   * @param {number} [exclusion_radius=3] - The radius around the center where no trees should be placed.
   */
  generate_trees(area_radius, count, exclusion_radius = 3) {
    const min_dist_to_objects = 5.0; // Minimum distance from other static objects
    const max_attempts = 100; // To avoid infinite loops

    // Gather positions of static objects to avoid
    const avoid_positions = this.static_objects.map(obj => obj.translation);

    for (let i = 0, placed = 0; placed < count && i < count * max_attempts; i++) {
      // Generate random position in a ring (outside exclusion_radius, inside area_radius)
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()) * (area_radius - exclusion_radius) + exclusion_radius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      // Check distance to the campfire (the center)
      const d = Math.sqrt(x * x + y * y);
      if (d < exclusion_radius) continue;

      // Check distance to other static objects
      let too_close = false;
      for (const pos of avoid_positions) {
        const dx = x - pos[0];
        const dy = y - pos[1];
        if (Math.sqrt(dx * dx + dy * dy) < min_dist_to_objects) {
          too_close = true;
          break;
        }
      }
      if (too_close) continue;

      // Place the tree
      const tree_mesh = tree_build_mesh();
      const mesh_name = `mesh_tree_${placed}`;
      this.resource_manager.add_procedural_mesh(mesh_name, tree_mesh);

      const tree_obj = {
        mesh_reference: mesh_name,
        material: MATERIALS.bench,
        translation: [x, y, -0.25],
        scale: [10, 10, 10],
      };
      this.static_objects.push(tree_obj);
      this.actors[`tree_${placed}`] = tree_obj;

      // Maintains the list so that next trees avoid this one
      avoid_positions.push([x, y, -0.25]);
      placed++;
    }
  }

  /**
   * Computes the highest elevation value from a given height map.
   * 
   * @param {{ width: number, height: number, data: Float32Array }} height_map 
   *        The height map containing elevation data.
   * @returns {number|null} The highest elevation found, or null if input is invalid.
   */
  highest_elevation(height_map) {
    // Ensure flame_height_map is available before calculating max elevation
    if (!height_map || !height_map.data) {
        console.error("Height map is not available");
        return;
    }

    let maxElevation = -Infinity;

    // Iterate through each point in the height map to find the highest elevation
    for (let gx = 0; gx < height_map.width; gx++) {
        for (let gy = 0; gy < height_map.height; gy++) {
            const elevation = height_map.data[gx + gy * height_map.width];
            if (elevation > maxElevation) {
                maxElevation = elevation;
            }
        }
    }

    return maxElevation
  }

  /**
   * Initializes dynamic lighting in the scene, specifically for the campfire.
   * 
   * This method uses the elevation data from the `flame_height_map` to determine
   * the highest point (peak flame height) and places a light source there to simulate
   * the illumination from a campfire. The light's color resembles a warm flame.
   */
  initialize_lights() {
    // Create a dynamic light representing the campfire
    const flameLight = {
      // Positioned at the center base with max flame height as Z
      position: [0, 0, this.highest_elevation(this.flame_height_map)],
      // Warm orange color for flame
      color: [1.0, 0.4, 0.1],
    };
    
    // Add the light to the scene
    this.lights.push(flameLight);
  
    // Store the flame light for later reference
    this.flameLight = flameLight;
  }

  /**
   * Updates the Z-position (height) of the flame's dynamic light based on the
   * current flame height map.
   * 
   * This function should be called each frame to simulate a flickering light
   * that tracks the flame’s highest point.
   */
  update_flame_light() {
    if (this.flameLight) {
        // Update the position of the flame light to the new max elevation
        this.flameLight.position[2] = this.highest_elevation(this.flame_height_map);
    }
  }

  /**
   * Initializes the flame object in the scene.
   *
   * This function:
   * 1. Creates a procedural height map for the flame shape.
   * 2. Defines the color gradient used for the flame.
   * 3. Builds the flame mesh and registers it with the resource manager.
   * 4. Pushes the flame into the scene and add it as an actor
   */
  initialize_flame() {
    // Generate initial flame height map (offset for variation)
    const initial_height_map = this.create_height_map(96, 96);
    this.flame_height_map = initial_height_map;

    // Initialize animation index to later select the flame colors
    this.flame_index = 0;

    // Initialize flame colors
    this.flame_colors = [
        [1.0, 0.78, 0.3],     // Red
        [1.0, 0.9059, 0.6],   // Orange
        [1.0, 0.9804, 0.8941] // Yellow
    ];

    // Build flame mesh from the height map
    const flame = fire_build_mesh(initial_height_map, this.GROUND_LEVEL + 0.2);
    this.resource_manager.add_procedural_mesh("mesh_flame", flame);

    // Define and add the flame object into the scene
    const flame_obj = {
        mesh_reference: 'mesh_flame',
        material: MATERIALS.flame_material,
        translation: [0, 0, 0],
        scale: [1.4, 1.4, 1.4],
    };
    this.dynamic_objects.push(flame_obj);
    this.actors["flame"] = flame_obj;
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor
   */
  initialize_actor_actions() {
    for (const name in this.actors) {
      // L-System tree
      if (name.includes("tree")){
        const tree = this.actors[name];
        tree.evolve = (dt) => {
          const max_scale = 0.4;
          // Grow tree if current scale is below max scale
          if (tree.scale[0] < max_scale){
            grow_tree(tree.scale, dt);
          }
          else{
            // Clamp scale to max scale to prevent overgrowth
            tree.scale = [max_scale, max_scale, max_scale];
          }
        };
      }
      // Flame
      else if (name.includes("flame")) {
        const flame = this.actors[name];
        let lastUpdateTime = 0;     // Track of the last update time
        const updateInterval = 0.1; // Minimum interval (seconds) between updates
  
        flame.evolve = dt => {
          lastUpdateTime += dt;
          
          // Skip update if interval not reached
          if (lastUpdateTime < updateInterval) return;
    
          lastUpdateTime = 0;

          // Calculate time-dependent offsets for flame height map animation
          const timeFactor = (Date.now() / 1000) * 7;

          // Create new height map using sinusoidal offsets
          // to simulate flickering flame
          const new_height_map = this.create_height_map(
            Math.sin(timeFactor) * 5,
            Math.cos(timeFactor) * 4
          );
          this.flame_height_map = new_height_map;
    
          if (!new_height_map || !new_height_map.data) {
            console.error("Invalid height map", new_height_map);
            return;
          }
    
          // Generate new flame mesh based on updated height map and time factor
          const new_mesh = fire_build_mesh(new_height_map, this.GROUND_LEVEL + 0.2, timeFactor);
          this.resource_manager.add_procedural_mesh("mesh_flame", new_mesh);
          flame.mesh_reference = "mesh_flame";
          
          // Cycle through predefined flame colors and update its color
          this.flame_index = (this.flame_index + 1) % 3
          const color = this.flame_colors[this.flame_index]
          this.resource_manager.update_flame_color(color)
        };
      }
      // Lights
      else if (name.includes("light")) {
        const light = this.actors[name];
        const light_idx = parseInt(name.split("_")[1]);
        light.evolve = (dt) => {
          const curr_pos = light.position;

          // Update the light's height based on external UI parameter
          light.position = [curr_pos[0], curr_pos[1], this.ui_params.light_height[light_idx]];
          
          // Update the light's color
          const color = this.flame_colors[this.flame_index]
          light.color = color;

          // Update the flame light's Z position to simulate a
          // flickering light that tracks the flame’s highest point
          this.update_flame_light();
        }
      }
      else {
        const actor = this.actors[name];
        actor.evolve = (dt) => {}
      }
    }
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

    this.ui_params.use_soft_shadows = true; // Initial shadow state: soft shadows

    this.ui_params.use_bloom = true;

    this.raw_ssao = false;

    // Set preset views
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 1.0,
        angle_z : 2.440681469282041,
        angle_y : -0.39240122440170113,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "2", () => {
      this.camera.set_preset_view({
        distance_factor : 2.5,
        angle_z : 5.2,
        angle_y : -0.41,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "3", () => {
      this.camera.set_preset_view({
        distance_factor : 5.2,
        angle_z : 5.5,
        angle_y : 5.5,
        look_at : [0, 0, 0]
      })
    });
    
    const n_steps_slider = 100;
    // Add shadow softness control
    create_slider("Shadow Softness", [0, 500], (value) => {
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

    create_button_with_hotkey("Toggle Raw SSAO", "r", () => {
        this.ui_params.raw_ssao = !this.ui_params.raw_ssao;
    });

    create_hotkey_action("Soft Shadows", "s", () => {
      this.ui_params.use_soft_shadows = !this.ui_params.use_soft_shadows;
    });

    create_hotkey_action("Bloom", "b", () => {
      this.ui_params.use_bloom = !this.ui_params.use_bloom;
    });

  }
}
