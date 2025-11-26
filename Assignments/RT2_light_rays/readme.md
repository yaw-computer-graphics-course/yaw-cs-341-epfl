# Solution Description

## Ambiant, diffuse and specular components
We started the exercice by computing the ambiant contribution to the total intensity in the `render_light` function. Then we tackled the `lighting` function in which we first computed, for a given intersection point and surface material, the diffuse component that corresponds to the diffuse coefficient of the material times the color of the material. We then computed the specular component for which the exact computation differs from Blinn-Phong to Phong models.

The exact computation was to compute :
1. For the Phong model : The dot product between (1) the reflection of the normalized vector directed from the light point to the object point by the intersected surface obtained using the integrated `reflect` function, and (2) the vector directed from the object point to the camera.</br>

2. For the Blinn-Phong model : The dot product between (1) the normalized sum of vector directed from the object point to the light point and the vector directed from the object point to the camera, and (2) the normal vector to the surface.

## Shadows
Then we added a shadow component that we managed to compute the following way : we created a ray that goes from the object point to the light and calculated the distance to its first intersection, if this value was close enough to the distance to the light point then there is no shadow to be considered, otherwise we multiplied the sum of all the contribitions by zero, meaning there is a shadow component.

### How we solved the acne issue
The main issue we faced with shadows was that the first time, it used to create some acne effect. To resolve that, we had to shift a bit the object point by a positive constant times the normalized normal before passing it as an argument to the `ray_intersection` function, with which we determine the shadow component as mentioned above.


## Reflections
Finally, we completed the `render_light` function to make it call the lighting function. Additionally, for each reflection we compute the color obtained by the ambiant, diffuse and specular component as explained earlier, then we used that color along with the appropriate reflection weight to construct iteratively, using the formula that we demonstrated in [theory.md](/RT2_light_rays/RT2_theory/theory.md), the final color to output, the construction is made by simply adding the values obtained at each iteration. And at the end of an iteration over the number of reflections, after considering all the lights, we select the new `ray_origin` to be the object point (or the intersection point) and the new `ray_direction` to be the reflection of the previous one by the intersected surface, therefore ensuring the use of the proper for the next iteration. Finally, if for a certain number of reflections reached, the ray does not intersect anything (`ray_intersect` returns `false`) the loop breaks and the function returns the computed result.</br>

# Contributions

Adam Bekkar (379476): 1/3

Youssef Benhayoun Sadafi (358748): 1/3

Walid Ait Said (356082): 1/3