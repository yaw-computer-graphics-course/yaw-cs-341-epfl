---
title: Final Project Report CS-341 2025
---

# A Campfire At Midnight

</br></br>
<div style="text-align: center;">
<video src="videos/campfire_at_midnight.mov" height="300px" autoplay loop></video>
</div>
<figcaption style="text-align: center;">The flame dances gently, flickering with life — warm, wild, and never still.</figcaption>

## Abstract

TODO


## Overview

<div style="display: flex; justify-content: space-around; align-items: center;">
<div>
<img src="images/demo_detail.png" height="210px" style="vertical-align: middle;">
</div>
<div>
<video src="videos/demo_detail.mp4" height="210px" autoplay loop style="vertical-align: middle;"></video>
</div>
</div>
<figcaption style="text-align: center;">Some more visuals focusing on interesting details of your scene.</figcaption>

TODO


## Feature validation

<table>
	<caption>Feature Summary</caption>
	<thead>
		<tr>
			<th>Feature</th>
			<th>Adapted Points</th>
			<th>Status</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Feature 1</td>
			<td>5</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Feature 2</td>
			<td>5</td>
			<td style="background-color: #cce5ff;">Missing</td>
		</tr>
		<tr>
			<td>Feature 3</td>
			<td>10</td>
			<td style="background-color: #e8ebca;">Partially Completed</td>
		</tr>
		<tr>
			<td>Feature 4</td>
			<td>10</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Feature 5</td>
			<td>20</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
	</tbody>
</table>


### Feature 1 : Procedurally Generated Texture

#### Implementation

To achieve a realistic flame effect in our scene, we used procedural generation techniques to create both the flame's mesh and texture. This approach allows for a dynamic visual representation that simulates the behavior of real flames.

__-> Mesh Generation and Noise Functions:__ <br>

The flame mesh is generated using the `fire_build_mesh` function, which takes into account a height map, a base flame level, and a time parameter. The height map defines the shape of the flame, and the Perlin noise algorithm is used to introduce variability to the flame's appearance.

To create the height map, we use the `create_height_map` method, which generates a 2D grid of float values based on a sine-cosine wave pattern. This pattern simulates elevation data that can be influenced by time-dependent offsets. The resulting height map is then used to construct a grid of vertices, where each vertex's height is influenced by multiple noise functions, including:

- **Base flame height** from a Perlin noise generator
- **Turbulence** for chaotic movement
- **Detail noise** for finer variations

These noise functions work together to create a realistic and dynamic flame shape. To ensure proper lighting and shading on the mesh, we compute normals using height values from neighboring vertices.

__-> Texture Application and Animation:__ <br>

The flame texture is designed to reflect realistic flame colors and is updated dynamically. We achieve this through:

- **Color Cycling**: A set of predefined flame colors is cycled through over time, creating a smooth animation. This is managed in the `evolve` method of the flame actor, where a timer tracks the interval between updates.
- **Texture Mapping**: The mesh vertices are assigned texture coordinates, allowing the flame texture to wrap around the procedural mesh correctly. This involves scaling and mapping coordinates based on the vertex positions.

__-> Real-Time Updates and Flickering Behavior:__ <br>

To simulate the flickering behavior of real flames, we update the mesh and texture of the flame in real-time. The `initialize_flame` method initially creates the flame object and establishes its dynamic properties. The `update_flame_light` function tracks the maximum elevation of the flame to adjust the position of light sources, creating a realistic flickering effect.

The `evolve` function, called every frame, updates the height map using sine and cosine functions to create animated motion. A new flame mesh is then generated based on the modified height map, ensuring that the visual representation appears organic and responsive.

To maintain performance while still achieving visual realism, we used a simple animated texture with color cycling instead of generating complex procedural textures. The noise-based mesh already gave a satisfying flame shape and motion, so the cycling colors were enough to create the desired flame look without adding extra complexity.

#### Validation

TODO


### Feature 2 : Bloom Effect Shader

#### Implementation

A bloom effect was implemented using a fragment shader (`bloom.frag.glsl`) to simulate light diffusion around high-intensity areas. This effect is commonly used to approximate the scattering of light in real-world optics and to improve visual clarity of bright regions.

__-> Brightness Detection and Thresholding:__ <br>

The shader samples color data from the scene texture and computes luminance for each pixel using a weighted sum of the RGB components. A brightness threshold (`u_brightness_threshold`) is applied to determine which pixels are considered bright. Only these pixels are selected for further processing to minimize computational overhead.

__-> Gaussian Blur Application:__ <br>

For pixels that exceed the threshold, a Gaussian blur is applied using a two-dimensional kernel. The blur is performed by sampling neighboring pixels within a defined radius (`u_blurRadius`). Each sample is weighted by its distance from the center pixel using a Gaussian distribution. This step approximates the light diffusion typically observed around bright light sources.

__-> Normalization and Final Composition:__ <br>

After accumulating the blurred values, the result is normalized by dividing by the sum of the sample weights. This prevents undesired artifacts such as dimming or dark borders. The bloom contribution is then added to the original pixel color, scaled by a user-defined factor (`u_bloom_intensity`) to allow control over the effect's strength.

__-> Dynamic Integration and User Controls:__ <br>

The bloom effect is integrated into the rendering pipeline and can be toggled via user controls in real time.

#### Validation

TODO


### Feature 3 : Soft Shadows

#### Implementation

Soft shadow rendering is implemented using a combination of Percentage Closer Filtering (PCF) and cube mapping. This approach reduces hard shadow edges and produces more gradual light occlusion transitions.

__-> Cube Mapping for Shadow Capture:__ <br>

To capture the necessary depth information for shadow determination, the scene is rendered from the light source’s perspective using cube mapping. This is handled by the `EnvironmentCapture` class, which generates a cube map texture. The `compute_shadow_cube_map` function manages this process, capturing six views corresponding to each face of the cube. The resulting cube map encodes depth values, enabling shadow visibility calculations for fragments in all directions relative to the light source.

__-> Fragment Shader for Shadow Mapping:__ <br>

In the fragment shader, each fragment's world position is converted into light space to determine its relationship to the light source. The shader computes the direction vector from the fragment to the light, and the distance between the two. These values are used to test shadow visibility against the depth information stored in the cube map.

__-> Poisson Disk Sampling:__ <br>

To produce soft shadow edges, the shader applies Poisson disk sampling with 16 offset vectors. These offsets are used to sample the shadow map at slightly varied directions around the original light vector. The offsets are scaled by a configurable `shadow_softness` parameter to control the shadow blur radius. This multi-sample approach helps reduce aliasing and creates smoother shadow boundaries.

__-> Shadow Testing:__ <br>

For each Poisson disk sample, the shader retrieves the corresponding depth from the cube shadow map and compares it to the fragment-to-light distance. If the sampled depth is less than the actual distance, the fragment is considered to be in shadow for that sample. This process is repeated across all samples, with the results accumulated to compute overall shadow intensity.

__-> Averaging and Final Output:__ <br>

The accumulated shadow values are averaged to generate the final shadow factor. This averaging blends the transitions between fully lit and fully shadowed regions, distinguishing soft shadows from hard-edged shadows. The resulting shadow factor is used to adjust the fragment color and lighting intensity. The system supports accumulation from multiple light sources, ensuring consistent blending of shadow effects across different illumination contributions.

#### Validation

TODO

### Feature 4

#### Implementation

TODO

#### Validation

TODO


### Feature 5

#### Implementation

TODO

#### Validation

TODO

### Feature 6

#### Implementation

TODO

#### Validation

TODO


## Discussion

### Additional Components

#### Flame Generation Approach

Although the original approach focused only on using procedurally generated textures for the flame, it was later decided to also incorporate a procedurally generated mesh. This combination provided greater visual depth and contributed to a more dynamic and realistic flame effect. For a more technical explanation, refer to **Feature 1**.

### Failed Experiments

Before settling on the final scene, we explored numerous different approaches and had to backtrack several times. Here is a compilation of some of the alternative methods and ideas that were tested but ultimately set aside.

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">

<div style="flex: 0 0 30%; text-align: center;">
  <img src="images/failed_exp1.png" width="100%" />
  <p>Terrain generation using a weird height map created unstable and exaggerated shapes that looked unrealistic.</p>
</div>

<div style="flex: 0 0 30%; text-align: center;">
  <img src="images/failed_exp2.png" width="100%" />
  <p>Another terrain attempt with an odd height map led to exaggerated shapes that looked unrealistic.</p>
</div>

<div style="flex: 0 0 30%; text-align: center;">
  <img src="images/failed_exp3.png" width="100%" />
  <p>Incorrect bloom parameters resulted in overly bright highlights and loss of visual detail.</p>
</div>

<div style="flex: 0 0 30%; text-align: center;">
  <img src="images/failed_exp4.png" width="100%" />
  <p>Sky brightness caused the bloom effect to be exaggerated, making the upper part of the scene overly intense.</p>
</div>

<div style="flex: 0 0 30%; text-align: center;">
  <img src="images/failed_exp5.png" width="100%" />
  <p>Combining fire mesh from Blender* with dynamic properties lacked realism and visual clarity.</p>
</div>

<div style="flex: 0 0 30%; text-align: center;">
  <img src="images/failed_exp6.png" width="100%" />
  <p>Procedural flame using noise produced awkward shapes that didn’t look natural.</p>
</div>

</div>

\* *We later replaced the Blender-created flame with a procedurally generated mesh and applied a procedural texture on top, which better captured the desired dynamic and natural appearance.*

### Challenges

#### Challenges in Soft Shadow Implementation

During the development of soft shadow rendering, two primary visual issues were encountered. These issues affect the consistency and realism of shadows across different lighting conditions and viewing angles.

---

### 1. Inconsistent Shadow Rendering Near Light Sources

In certain cases, especially around bright light sources like the flame of the campfire and when viewed from specific camera angles, soft shadows were either missing or appeared overly sharp. This led to unnatural lighting transitions and reduced visual realism.

**Potential Causes:**

- **Cube Mapping Limitations**: Shadow data is captured using cube maps, and fragments near the edge of the cube’s coverage may not receive sufficient detail.
- **Poisson Disk Sampling Variation**: The softness of shadows depends on sampling. Depending on the viewing angle and fragment location, this could explain to inconsistent results.

**Potential Mitigation Strategies:**

- **Increased Sampling Resolution**: Using more Poisson disk samples can produce smoother transitions, though it increases performance costs.
- **Adjustable Shadow Softness**: Dynamically modifying the `shadow_softness` parameter, possibly based on distance to the light source, can help maintain consistent shadow quality.
- **Bias Optimization**: Fine-tuning the depth comparison bias reduces artifacts like shadow acne and helps improve rendering accuracy.
- **Hybrid Shadow Techniques**: Combining hard and soft shadow methods may offer a more balanced appearance, especially near light sources.
- **Higher Cube Map Resolution**: Increasing the depth map resolution can improve detail capture and minimize shadow loss near complex geometry.

---

### 2. Artifacts at Greater Distances

At greater distances from light sources, particularly on large terrain surfaces, visual artifacts such as black lines were observed. These artifacts break the visual continuity of the scene and are especially visible in low-light or shadowed areas.

**Potential Causes:**

- **Depth Precision Loss**: Shadow map depth resolution decreases with distance, resulting in mismatches during shadow comparison.
- **Insufficient Sampling Coverage**: At long ranges, the Poisson disk sampling may not provide enough variance, leading to sharp transitions and visible lines.
- **Fixed Bias Limitations**: A static bias value may not be suitable for all distances, causing some fragments to be incorrectly shadowed.

**Potential Solutions:**

- **Higher Shadow Map Resolution**: Improves detail accuracy at long distances, reducing depth-related artifacts.
- **Distance-Based Biasing**: Adjusting the bias based on fragment distance allows more accurate depth comparison across varying ranges.
- **Post-Processing Filters**: Blurring or blending operations applied after shadow rendering can reduce the visibility of hard lines and improve visual integration.

## Contributions

<table>
	<caption>Worked hours</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Week 1</th>
			<th>Week 2</th>
			<th>Week 3</th>
			<th>Week 4</th>
			<th>Week 5</th>
			<th>Week 6</th>
			<th>Week 7</th>
			<th>Total</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Name 1</td>
			<td></td>
			<td style="background-color: #f0f0f0;"></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Name 2</td>
			<td></td>
			<td style="background-color: #f0f0f0;"></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Name 3</td>
			<td></td>
			<td style="background-color: #f0f0f0;"></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
	</tbody>
</table>

<table>
	<caption>Individual contributions</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Contribution</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Name 1</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Name 2</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Name 3</td>
			<td>1/3</td>
		</tr>
	</tbody>
</table>


#### Comments

TODO


## References

TODO