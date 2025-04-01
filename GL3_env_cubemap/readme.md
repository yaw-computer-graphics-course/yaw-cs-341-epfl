# Solution Description

## Textures

We began by sampling the texture `tex_color` at the UV coordinates provided by the vertex shader. The texture color was obtained by taking the first three components of the output from the `texture2D` function. 

Next, we modified the UV coordinates of the square mesh in `meshes_construct` within `scene.js` to repeat the texture four times. To achieve this, we replaced every `1` with `4` while keeping the `0`s unchanged. We then set the wrapping mode in `tex_load_options` within `scene.js` to `'repeat'`, ensuring a tiled floor appearance.

## Environment Mapping

We computed the projection matrix for a camera positioned at the center of a cube, with its image plane aligned with one of the cube's faces. This was accomplished using the `mat4.perspective` function, which requires values for `near`, `far`, `fovy`, and `aspect`. We set:

```javascript
const near = 0.1;
const far = 200;
const fovy = Math.PI / 2;
const aspect = 1;
```

Since the projection is onto a cube face, it forms a square, making the aspect ratio `1` and the vody `Math.PI / 2`. 

We then updated the `CUBE_FACE_UP` vectors in `env_capture.js` to align the camera with the appropriate cube faces, ensuring our scene capture visualization (bottom left) matched the reference image "Reference result for the cube map implementation for real-time reflections."

The up vectors were defined as follows:

| Face | Up Vector  |
|------|----------- |
| +x   | [0, -1, 0] |
| -x   | [0, -1, 0] |
| +y   | [0, 0, 1]  |
| -y   | [0, 0, -1] |
| +z   | [0, -1, 0] |
| -z   | [0, -1, 0] |

### Reflections from Environment Capture

We passed the view-space normals and viewing direction from the vertex shader to the fragment shader. The reflected ray direction was computed in the fragment shader, and we sampled the cube map to retrieve the color of the reflected ray.

## Shadow Mapping

We transmitted the fragment position in camera space to the fragment shader. Then, we integrated shading code from `GL2_meshes`, adapting variable names accordingly. An attenuation term was included in the shading expression, and we computed the shadow coefficient, which is `1` if the object is visible and `0` otherwise.

To determine the shadow depth, we used the `textureCube` function with `cube_shadowmap` and the negative light direction, i.e. the result of normalizing the fragment position in camera space minus the light position. The relevant shadow depth value was extracted from the red component of the ARGB output. If the Euclidean distance from the light to the intersection point was less than `1.01` times the shadow depth, the object was considered visible.

### Adding Light Contributions

Finally, in the `init_pipeline` function of the `SysRenderMeshesWithLight` class within `mesh_render.js`, we set the blending mode of the pipeline as follows:

```javascript
blend: {
    enable: true,
    func: {
        src: 'src alpha',
        dst: 'one',
    },
},
```

This configuration ensured that each iteration of the lighting loop added to the current image rather than overwriting it.</br></br></br>

# Contributions

Adam Bekkar (379476): 1/3

Youssef Benhayoun Sadafi (358748): 1/3

Walid Ait Said (356082): 1/3
