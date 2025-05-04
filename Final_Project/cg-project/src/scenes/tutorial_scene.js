
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"

import { 
  create_slider, 
  create_button_with_hotkey, 
  create_hotkey_action 
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

export class TutorialScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  initialize_scene(){
    const monkey = {
      mesh_reference: "suzanne.obj",
      material: MATERIALS.mirror,
      translation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    this.actors['monkey'] = monkey;
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));
    this.objects.push(monkey);
    

    const object = {
      translation: [1, 1, 1],
      scale: [1, 1, 1],
      mesh_reference: "10680_Dog_v2.obj",
      material: MATERIALS.terrain
    }

    this.objects.push(object)
    this.objects.push({
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });
    
    this.lights.push({
      position : [0.0 , -2.0, 2.5],
      color: [1.0, 1.0, 0.9]
    });
    this.ui_params.is_mirrored = true;
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){

    for (const name in this.actors) {
      const actor = this.actors[name];
      actor.evolve = (dt) => { 
        vec3.add(actor.translation, actor.translation, [0, 0, 0]);
      };
    }
  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    // TODO
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 0.2,
        angle_z : -Math.PI / 2,
        angle_y : 0,
        look_at : [0, 0, 0]
      })
    });

    create_slider("Position", [0, 20], (i) => {
      const monkey = this.actors['monkey'] 
      vec3.scale(monkey.translation, [1, 1, 1], i * 0.1)
    })
    create_button_with_hotkey("Mirror", 'm', () => {
      this.ui_params.is_mirrored = !this.ui_params.is_mirrored;
    })
  }

}
