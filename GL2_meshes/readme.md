# Solution Description

## Normal computation

For the first task of this section, we began by finding the vectors corresponding to each of the edges which we used to compute the normal for a given face. Our approach was simply taking the cross product of 2 of the 3 edges and normalizing, we also had to make sure the vectors were correctly directed ($\overrightarrow{V_{12}} \times \overrightarrow{V_{13}}$ or $\overrightarrow{V_{23}} \times \overrightarrow{V_{21}}$ or $\overrightarrow{V_{31}} \times \overrightarrow{V_{32}}$), only then will we get a correctly directed normal with respect to the color of the reference image. We then move to the angles, where we made use of the `angle` function provided to use by the `glmatrix` library, we then included the `abs` function which made sure we got a positive angle.

In regard to the vertex normal computation, our thought process was: for each triangle face, for each of its vertices, we use the `scale` function to scale the face normal by the corresponding angle extracted from the `angle_weights` array indexed by the face index and then the vertex offset, and finally adding the result to the value in the `vertex_normals` array indexed by the vertex index using the `add` method. At the end of the computation, we simply normalized the computed normal for each vertex.

## Normal visualization

The shader part here was fairly simple to implement. We added the `normal` field with the `varying` prefix in the vertex and fragment shaders. In the fragment shader we assigned our `color` variable according to the `false_color` represention and simply put in the formula as instructed.<br>
As for the transformation matrices, we calculated the Model-View and Model-View-Projection matrices the same way we did in the previous assignment, the new task was finding the normal transformation matrix which we did by applying the inverse and the transpose operations to the Model-View matrix using the corresponding functions in the `glmatrix`. The challenge here was the fact that we only needed a 3x3 matrix, we solved it by using the `fromMat4` in the `mat3` API.

## Shading

Finally for the shading part, starting with the Gouraud version, we computed the color following the Phong lighting model in the vertex shader, this color was then passed to the fragment shader using the `varying` prefix. The notable details here were that we considered the $I_a$ and $I_l$ light components were equal, we took the camera position as the center (0, 0, 0) in the View coordinates and most importantly we made sure to transform the vertex position and normal to the View coordinates by multiplying by the correct transformation matrices.

As for the Phong shading, the difference consists in computing the color until the fragment shader. The transformed vectors (vertex position and normal) were passed from the vertex shader using the `varying` prefix. Our fragment shader does the work of normalizing the passed values, and then computing the color using the formula similarly to the Gouraud shading.

# Contributions

Adam Bekkar (379476): 1/3

Youssef Benhayoun Sadafi (358748): 1/3

Walid Ait Said (356082): 1/3