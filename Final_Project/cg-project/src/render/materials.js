
const default_texture = null; 
const default_base_color = [1.0, 0.0, 1.0];  // magenta, used when no texture is provided
const default_shininess = 0.1;


/*---------------------------------------------------------------
	Materials
---------------------------------------------------------------*/
/**
 * Materials are defined by parameters that describe how 
 * different objects interact with light.
 * 
 * The `properties` array can be used to indicate by 
 * which shaders will process this material. 
 * ShaderRenderer classes have an `exclude()` function whose
 * behavior can be customized to adapt to different material properties.
 */

class Material {

    constructor(){
        this.texture = default_texture;
        this.color = default_base_color;
        this.shininess = default_shininess;
        this.properties = [];
    }

}

class BackgroundMaterial extends Material {

    constructor({texture = default_texture}){
        super()
        this.texture = texture;
        this.properties.push("environment");
        this.properties.push("no_blinn_phong");
        this.properties.push("no_shadow");
    }
}

export class DiffuseMaterial extends Material {

    constructor({
        texture = null, 
        color = default_base_color, 
        shininess = default_shininess
    }){
        super()
        this.texture = texture;
        this.color = color;
        this.shininess = shininess;
    }
}

export class FireMaterial extends Material {

    constructor({
        texture = null,
        color = default_base_color, 
        shininess = default_shininess
    }){
        super()
        this.texture = texture;
        this.color = color;
        this.shininess = shininess;
        this.properties.push("flame");
    }

    updateColor() {
        // Compute the new color based on the previous color
        this.color[0] = this.color[0] * 0.9 + 0.1; // Decrease red slightly
        this.color[1] = this.color[1] * 0.9 + 0.1 * Math.sin(Date.now() / 100); // Change green dynamically
        this.color[2] = this.color[2] * 0.1; // Keep blue low
        
        // Clamp values to ensure they stay within [0, 1]
        this.color = this.color.map(c => Math.max(0, Math.min(c, 1)));
    }
}

class ReflectiveMaterial extends Material {
    constructor(){
        super()
        this.properties.push("reflective");
    }
}

class TerrainMaterial extends Material {
    constructor({
        water_color = [0.29, 0.51, 0.62],
        water_shininess = 30.,
        grass_color = [0.33, 0.43, 0.18],
        grass_shininess = 5.,
        peak_color = [0.9, 0.9, 0.9],
        peak_shininess = 10.
    }){
        super()
        this.water_color = water_color;
        this.water_shininess = water_shininess;
        this.grass_color = grass_color 
        this.grass_shininess = grass_shininess;
        this.peak_color = peak_color;
        this.peak_shininess = peak_shininess;

        this.properties.push("terrain");
        this.properties.push("no_blinn_phong");
    }
}

/*---------------------------------------------------------------
	Material Instantiation
---------------------------------------------------------------*/
/**
 * Here materials are defined to later be assigned to objects.
 * Choose the material class, and specify its customizable parameters.
 */
export const sunset_sky = new BackgroundMaterial({
    texture: 'kloppenheim_07_puresky_blur.jpg'
});

export const gray = new DiffuseMaterial({
    color: [0.4, 0.4, 0.4],
    shininess: 0.5
});

export const gold = new DiffuseMaterial({
    texture: 'tex_gold',
    shininess: 14.0
});

export const flame_material = new FireMaterial({
    texture: 'tex_flame',
    shininess: 14.0
});

export const pine = new DiffuseMaterial({
    texture: 'pine.png',
    shininess: 0.5
});

export const rock1 = new DiffuseMaterial({
    texture: 'rock_texture_1.jpg',
    shininess: 20.0
});

export const rock2 = new DiffuseMaterial({
    texture: 'rock_texture_2.jpg',
    shininess: 20.0
});

export const rock3 = new DiffuseMaterial({
    texture: 'rock_texture_3.jpg',
    shininess: 20.0
});

export const rock4 = new DiffuseMaterial({
    texture: 'rock_texture_4.jpg',
    shininess: 20.0
});

export const terrain = new TerrainMaterial({
    water_color: [0.29, 0.51, 0.62],
    grass_color: [0.33, 0.43, 0.18],
    peak_color: [0.8, 0.5, 0.4]
});

export const stone = new DiffuseMaterial({
    texture: 'Rock047_1K_Color.png',
    shininess: 0.1
});

export const log = new DiffuseMaterial({
    texture: 'Wood006_1K_Color.png',
    shininess: 0.5
});
log.properties.push('flame');

export const coal = new DiffuseMaterial({
    texture: 'Rock035_1K_Color.png',
    shininess: 0.8
});

export const branch = new DiffuseMaterial({
    texture: 'Wood006_1K_Color.png',
    shininess: 0.5
});

export const bench = new DiffuseMaterial({
    texture: 'eb_hipster_bench_01_c.png',
    shininess: 0.5
});

export const firewood = new DiffuseMaterial({
    texture: 'firewood.png',
    shininess: 0.5
});

export const grass = new DiffuseMaterial({
    texture: 'green-grass-texture.jpg',
    shininess: 5,
});
//grass.properties.push("no_shadow");

export const chest_tex = new DiffuseMaterial({
    texture: 'Wood.png',
    shininess: 5,
});

export const gray_pure_sky = new BackgroundMaterial({
    texture: 'mud_road_puresky.jpg',
});

export const tree_wood = new DiffuseMaterial({
    texture: 'tree_texture.jpg',
})

