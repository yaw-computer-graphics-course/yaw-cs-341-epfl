# Solution Description  

We began by implementing ray tracing for plane intersections. First, we derived the mathematical formula on paper, starting from the explicit equation of a ray and the implicit equation of a plane. We simplified these equations as much as possible to arrive at a form that could be computed efficiently.

For the `ray_plane_intersection` function, we determined the intersection by solving for the parameter \( t \) along the ray. If the ray and the plane were parallel, we ensured that no intersection was detected. Otherwise, we computed the intersection point and normal vector, returning `true` if the intersection was in front of the viewer (\( t > 0 \)). At the end, we had to choose the correct normal vector among the two possible ones, selecting the one that points toward the ray source \( O \).

Next, we tackled ray tracing for cylinders. We started by using the explicit equation of the ray and the implicit equation of the cylinder. By substituting the ray equation into the cylinder equation, we derived a quadratic equation that determines the intersection points. We checked for valid solutions (\( t > 0 \)) and ensured that the intersection point lay within the cylinder’s height limits. If a valid intersection was found, we computed the normal at the intersection point and then choosed the correct normal vector among all possible normals of the cylinder, selecting the one that points outward from the cylinder’s surface toward the ray source \( O \).

To validate our implementation, we wrote another `main` function to test our intersection functions. This block tests the intersection functions for specific ray and object configurations. It compares the computed values of \( t \), intersection points, and normal vectors against expected results. If the computed values match the expected ones within a small error margin, the output is displayed in green. Otherwise, it is displayed in red to indicate discrepancies. This helped us verify the correctness of our implementation.

# Contributions

Adam Bekkar (379476): 1/3

Youssef Benhayoun Sadafi (358748): 1/3

Walid Ait Said (356082): 1/3