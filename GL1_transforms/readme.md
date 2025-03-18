# Solution Description

### Tutorial

We first began by doing the provided tutorial in order to get familiar with matrix operations with the `gl-matrix` library. After that we proceeded to the GPU tutorial pipeline, for the code infrastructure part, we created a similar hierarchy to the code in the main package, the `main_tutorial.js` is located under `tutorial/src` that way the `index_tutorial.html` can properly detect it. After copy pasting the provided code snippet and correctly importing `createREGL`, the red triangle appeared. For the second part, we managed to display a square by drawing two triangles, that is by adding a new array of vertices to the `elements` field. We concluded that our GPU pipeline can only support triangles. As for the window resizing problem, we took a look at how it was implemented in `main.js` and wrote similar code in our `main_tutorial.js`. Finally, for the shader part, we created the GLSL fragment and vertex files and loaded them in `main_tutorial.js` using `fetch` and `await` as instructed. We then added the proper variables in the vertex and fragment shaders along with the appropriate prefixes, especially making sure we're passing `pixel_color` to the fragment shader using the `varying` prefix.

### Tasks 1.1

GL1.1.1: For this first task we simply added the `mouse_offset` to the `position` value in the `vec4` construction when returning it. Then we simply entered the correct argument in the `draw_triangle_with_offset` call.<br>
GL1.1.2: Again here, it was simply a matter of multiplying the matrix `mat_transform` by the `vec4` vector when returning. We then made use of the functions provided by the `gl-matrix` library to create a translation and rotation matrix and multiplying them, the difference between the red and green triangle was the order of the multiplication.

### Tasks 1.2

GL1.2.1: Same approach as earlier, we just multiplied the `mat_mvp` matrix with the constructed `vec4` position vector. As for the MVP matrix, we made use of the `multiply` function and ensured we multiplied in the correct order.<br>
GL1.2.2: In this task, as instructed, we used the `lookAt` function and provided the correct values as parameters. We first computed the camera distance, and then input the minus of its value as the x coordinate in the `eye` vector parameter with 0 as the y and z values. The `center` and `up` are respectively [0, 0, 0] as our turntable camera always looks as the origin point, and [0, 0, 1] to get the camera up-right. We then followed that by creating 2 rotation matrices that take care of the rotations by `cam_angle_y` and `cam_angle_z` which we multiplied by the `lookAt` matrix to get the completed View matrix.<br>
GL1.2.3: For the final task, it is divided into 4 parts. First, the scaling matrix constructed with a scale factor got from the `size` field of the actor. Secondly, we translate the actor to the parent position. Third, we construct a rotation matrix with an orbit angle as given by the exercise. Lastly, we translate again to make the actor orbit around its own parent.


# Contributions

Adam Bekkar (379476): 1/3

Youssef Benhayoun Sadafi (358748): 1/3

Walid Ait Said (356082): 1/3