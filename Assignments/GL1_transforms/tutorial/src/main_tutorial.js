import { createREGL } from "../../lib/regljs_2.1.0/regl.module.js";

const canvas = document.querySelector('canvas');

function resize_canvas() {
    const new_size = Math.min(window.innerHeight, window.innerWidth) - 10;
    canvas.width = new_size;
    canvas.height = new_size;
}

resize_canvas();
window.addEventListener('resize', resize_canvas);

const regl = createREGL(canvas, { profile: true });
//const regl = createREGL();

// The pipeline is constructed only once!
const draw_triangle = regl({

    // Vertex attributes - properties of each vertex such as 
    // position, normal, texture coordinates, etc.
    attributes: {
        // 3 vertices with 2 coordinates each
        position: [
            [0., 0.2],      // [x, y] - vertex 0
            [-0.2, -0.2],   // [x, y] - vertex 1
            [0.2, -0.2],    // [x, y] - vertex 2
        ],
        color: [
            [1, 0, 0, 1],   // Color 0
            [0, 1, 0, 1],   // Color 1
            [0, 0, 1, 1],   // Color 2
        ]
    },

    // Triangles (faces), as triplets of vertex indices
    elements: [
        [0, 1, 2],
    ],
    
    // Uniforms: global data available to the shader
    uniforms: {},

    /* 
    Vertex shader program
    Given vertex attributes, it calculates the position of the vertex on screen
    and intermediate data ("varying") passed on to the fragment shader
    */
   
    // Vertex shader
    vert: await (await fetch('./src/shaders/tutorial.vert.glsl')).text(),

    // Fragment shader
    frag: await (await fetch('./src/shaders/tutorial.frag.glsl')).text(),
    
    /* 
    Fragment shader program
    Calculates the color of each pixel covered by the mesh.
    The "varying" values are interpolated between the values 
    given by the vertex shader on the vertices of the current triangle.
    */
});

const draw_square = regl({

    // Vertex attributes - properties of each vertex such as 
    // position, normal, texture coordinates, etc.
    attributes: {
        // 3 vertices with 2 coordinates each
        position: [
            [-0.2, 0.2],    // [x, y] - vertex 0
            [-0.2, -0.2],   // [x, y] - vertex 1
            [0.2, -0.2],    // [x, y] - vertex 2
            [0.2, 0.2],     // [x, y] - vertex 3
        ],
    },

    // Triangles (faces), as triplets of vertex indices
    elements: [
        [0, 1, 2],
        [0, 2, 3]
    ],
    
    // Uniforms: global data available to the shader
    uniforms: {
        color: regl.prop('color'),
    },

    /* 
    Vertex shader program
    Given vertex attributes, it calculates the position of the vertex on screen
    and intermediate data ("varying") passed on to the fragment shader
    */
   
    /* 
    Vertex shader program
    Given vertex attributes, it calculates the position of the vertex on screen
    and intermediate data ("varying") passed on to the fragment shader
    */
    vert: `
    // Vertex attributes, specified in the "attributes" entry of the pipeline
    attribute vec2 position;
    
    void main() {
        // [x, y, 0, 1]
        gl_Position = vec4(position, 0, 1);
    }`,
    
    /* 
    Fragment shader program
    Calculates the color of each pixel covered by the mesh.
    The "varying" values are interpolated between the values 
    given by the vertex shader on the vertices of the current triangle.
    */
    frag: `
    precision mediump float;
    
    uniform vec3 color;

    void main() {
        // [R, G, B, 1]
        gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
    }`,
    
    /* 
    Fragment shader program
    Calculates the color of each pixel covered by the mesh.
    The "varying" values are interpolated between the values 
    given by the vertex shader on the vertices of the current triangle.
    */
});

// Function run to draw each frame
/*regl.frame((frame) => {
    // Reset the canvas to black
    regl.clear({color: [0, 1, 0, 1]});
        
    // Execute the declared pipeline
    draw_square({color: [0, 0, 1]})
});*/

regl.frame((frame) => {
    // Reset the canvas to black
    regl.clear({color: [0, 0, 0, 1]});
        
    // Execute the declared pipeline
    draw_triangle();
});
