# Solution Description

## Noise

### Perlin Noise in 1D

We implemented the 1D Perlin noise in the function `perlin_noise_1d`. The process starts by identifying the two points surrounding the input `x`, calculated as the floor of `x` and the next integer. Gradients at these points are computed using a hash function and gradient lookup. The linear functions for each point are:

$$
\varphi_k = g_k \cdot (x - c_k), \quad \text{for } k = i, i+1
$$

We then computed the interpolation weight `t` and applied a smooth blending function. Finally, we interpolated between the two values using the `mix` function to get the final Perlin noise value.

### Fractional Brownian Motion (fBm)

The 1D fractional Brownian motion was implemented in the function `perlin_fbm_1d` as:

$$
\text{result} = \sum_{i=0}^{N-1} A_1^i \cdot \text{Perlin}(p \cdot w_1^i)
$$

Where the symbols are defined in the handout.

### 2D Perlin Noise

For 2D Perlin noise, we extended the 1D approach to work with both `x` and `y` coordinates. This involves identifying the four corners of the surrounding grid: left-top, left-bottom, right-top, and right-bottom.

We then computed the gradients at these points and calculated the dot products between each gradient and the distance vectors from the grid points to the input `point`.

After that, we computed the relative positions of the point within the grid, specifically calculating the distances between the `x` and `y` coordinates of the point and their floored values. A smooth blend was applied to each axis, and the final result was interpolated using the `mix` function as:

$$
\text{st} = \text{mix}(s, t, f_x)
$$

$$
\text{uv} = \text{mix}(u, v, f_x)
$$

$$
\text{noise} = \text{mix}(\text{st}, \text{uv}, f_y)
$$

Where:
- \( s, t, u, v \) are the dot products between the gradients and the distance vectors.
- \( f_x \) and \( f_y \) are the smooth blending weights along the `x` and `y` axes.

### 2D Fractional Brownian Motion (fBm) and Turbulence

Implementing the 2D fBm and Turbulence was quite straightforward. It was done by simply implementing:

$$
\text{result} = \sum_{i=0}^{N-1} A_1^i \cdot \text{Perlin2D}(p * w_1^i)
$$

and

$$
\text{result} = \sum_{i=0}^{N-1} A_1^i \cdot |\text{Perlin2D}(p * w_1^i)|
$$

Where * is the 2D component-wise multiplication and where each symbol is defined in the handout.

## Textures

### Terrain Texture Map

The terrain texture map was simply computed as follows:

$$
\text{color} = \text{terrain\_color\_water} \quad \text{if} \quad s < \text{terrain\_water\_level}
$$

$$
\text{color} = \text{mix}(\text{terrain\_color\_grass}, \text{terrain\_color\_mountain}, \alpha) \quad \text{if} \quad s \geq \text{terrain\_water\_level}
$$

Where:

$$
\quad s\_water = \text{perlin\_fbm\_1d}(\text{terrain\_water\_level})
$$

$$
s = \text{perlin\_fbm}(p), \quad \alpha = s - s\_water
$$

### Wood Texture

The wood texture is computed as:

$$
\text{alpha} = 0.5 \times (1 + \sin(100 \times (\text{length}(p) + 0.15 \times \text{turbulence}(p))))
$$

$$
\text{color} = \text{mix}(\text{brown\_dark}, \text{brown\_light}, \alpha)
$$

### Marble Texture

The marble texture is computed as:

$$
q = \begin{bmatrix} \text{perlin\_fbm}(p) \\ \text{perlin\_fbm}(p + \begin{bmatrix} 1.7 \\ 4.6 \end{bmatrix}) \end{bmatrix}
$$

$$
\alpha = 0.5 \times (1 + \text{perlin\_fbm}(p + 4 \times q))
$$

$$
\text{color} = \text{mix}(\text{white}, \text{brown\_dark}, \alpha)
$$

## Terrain

The terrain implementation involved using various textures like wood and marble. The terrain was created in a grid format, and each grid cell was assigned a height and texture based on its Perlin noise value. The Perlin noise determines the terrain’s elevation and its texture color.

First of all, we copied the update_cam_transform function from your previous exercise solutions to `src/main_terrain.js`.

Then we had to complete the `terrain_build_mesh` function that generates a 3D terrain mesh from a height map. It calculates the 3D position of each vertex using the height map for the `z` coordinate, with the `x` and `y` values based on grid positions. Vertices below the water level are clamped to the water level, and their normals are set to `[0, 0, 1]` for flat surfaces. Normals for other vertices are calculated using neighboring grid points. The function also divides each grid cell into two triangles, creating the terrain mesh.

It pushes each calculated vertex into the `vertices` array and for each rectangle (a, b, c, d), it adds the indices of the vertices of the triangles (a, b, c) and (b, d, c) to the `faces` array.


One of the notable changes involves the calculation of the material color, which is now computed as follows :

1. Initially, the material color is set to terrain_color_water, representing the water surface, with a shininess value of 30.
2. If the height of the terrain exceeds the water level, the material color is then adjusted. This blending is controlled by a factor twice the height difference from the water level.
In addition to adjusting the material color, the shininess value is also modified. For terrain above the water level, the shininess is reduced to 2.</br></br>

# Contributions

Adam Bekkar (379476): 1/3

Youssef Benhayoun Sadafi (358748): 1/3

Walid Ait Said (356082): 1/3
