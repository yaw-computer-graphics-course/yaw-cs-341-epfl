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

This report presents the development of a real-time, interactive campfire scene built using the **regl** framework. The goal was to combine several computer graphics techniques to create a visually rich and atmospheric environment. Key features include soft shadows, SSAO, bloom effects, procedural fire and smoke, and L-System-based tree generation. The project emphasizes both technical execution and artistic expression, aiming to simulate a warm, immersive nighttime setting. This document outlines the methods used, challenges faced, and solutions implemented throughout the development process.

## Overview

Here are several views showcasing the scene from different camera perspectives:

<div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;">

<div style="flex: 0 0 45%; text-align: center;">
  <img src="images/view1.png" alt="Inside Scene View" style="width: 100%; max-width: 400px;">
  <p><strong>View 1:</strong> Inside the scene, offering an immersive, up-close experience of the environment.</p>
</div>

<div style="flex: 0 0 45%; text-align: center;">
  <img src="images/view2.png" alt="Close Side View 1" style="width: 100%; max-width: 400px;">
  <p><strong>View 2:</strong> Near the scene along the z-axis, showing a slightly more distant perspective.</p>
</div>

<div style="flex: 0 0 45%; text-align: center;">
  <img src="images/view3.png" alt="Close Side View 2" style="width: 100%; max-width: 400px;">
  <p><strong>View 3:</strong> Similar distance to View 2 but from a slightly different angle for more spatial context.</p>
</div>

<div style="flex: 0 0 45%; text-align: center;">
  <img src="images/view4.png" alt="Top-Down View" style="width: 100%; max-width: 400px;">
  <p><strong>View 4:</strong> A top-down perspective showing the overall layout and composition of the scene.</p>
</div>

</div>

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
			<td>Soft Shadows</td>
			<td>10</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>SSAO</td>
			<td>10</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>PTG</td>
			<td>10</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>L-Systems</td>
			<td>10</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Mesh/Scene Design</td>
			<td>5</td>
			<td style="background-color: #d4edda;">Completed</td>
		</tr>
		<tr>
			<td>Bloom</td>
			<td>5</td>
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

Despite progress, two major issues with soft shadow rendering remain unresolved.

#### Issues in Soft Shadow Implementation

During the development of soft shadow rendering, two primary visual issues were encountered. These affect the consistency and realism of shadows across different lighting conditions and viewing angles.

__-> 1. Inconsistent Shadow Rendering Near Light Sources:__ <br>

In some situations—especially around bright light sources like the flame of the campfire and from certain camera angles—soft shadows were missing or appeared unnaturally sharp. This led to inconsistent lighting and a less realistic appearance.

</br>

<div style="text-align:center; margin: 20px 0;">
  <img src="images/failed_exp_circle.png" width="60%" />
  <figcaption>Figure: Missing soft shadows near the campfire light source.</figcaption>
</div>

</br>

**Potential Causes:**

- **Cube Mapping Limitations**: Fragments near the edges of the cube map’s coverage may lack sufficient detail.
- **Poisson Disk Sampling Variation**: The shadow softness depends on the sampling distribution, which may produce inconsistent results depending on the view angle and location.

**Potential Mitigation Strategies:**

- **Increased Sampling Resolution**: More Poisson disk samples can produce smoother shadow edges, at a higher computational cost.
- **Adjustable Shadow Softness**: Dynamically modifying the `shadow_softness` parameter, possibly based on distance to the light source.
- **Bias Optimization**: Carefully adjusting the bias used in depth comparisons to reduce shadow acne and artifacts.
- **Hybrid Shadow Techniques**: Mixing soft and hard shadows to balance realism and detail near complex lighting regions.
- **Higher Cube Map Resolution**: Improves detail capture and helps reduce shadow loss near bright or complex surfaces.

__-> 2. Artifacts at Greater Distances:__ <br>

On distant terrain surfaces, especially in shadowed regions, visual artifacts such as black lines were visible. These disrupted the visual flow and were particularly noticeable in low-light conditions.

</br>

<div style="text-align:center; margin: 20px 0;">
  <img src="images/failed_exp_dark_lines.png" width="60%" />
  <figcaption>Figure: Black line artifacts appearing in distant shadows on terrain surfaces.</figcaption>
</div>

</br>

**Potential Causes:**

- **Depth Precision Loss**: Shadow map precision decreases with distance, leading to inaccurate shadow results.
- **Insufficient Sampling Coverage**: Poisson disk samples may not provide adequate variation at longer distances.
- **Fixed Bias Limitations**: A uniform bias does not adapt well to varying fragment depths, resulting in incorrect shadowing.

**Potential Solutions:**

- **Higher Shadow Map Resolution**: Improves shadow accuracy and reduces artifacts in large or distant surfaces.
- **Distance-Based Biasing**: Modifying bias based on fragment distance to improve consistency across depth ranges.
- **Post-Processing Filters**: Applying blur or blending filters during post-processing to smooth out hard lines or discontinuities.

### Challenges

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

Despite the setbacks shown above, we were able to resolve all of them through iterative improvements. We included these failed attempts in the report as a trace of the development process and the challenges we faced and overcame.

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
			<td>Walid Ait Said</td>
			<td>8</td>
			<td style="background-color: #f0f0f0;"></td>
			<td>10</td>
			<td>7</td>
			<td>6</td>
			<td>8</td>
			<td>10</td>
			<td>50</td>
		</tr>
		<tr>
			<td>Youssef Benhayoun Sadafi</td>
			<td>8</td>
			<td style="background-color: #f0f0f0;"></td>
			<td>11</td>
			<td>7</td>
			<td>7</td>
			<td>6</td>
			<td>10</td>
			<td>50</td>
		</tr>
		<tr>
			<td>Adam Bekkar</td>
			<td>8</td>
			<td style="background-color: #f0f0f0;"></td>
			<td>10</td>
			<td>6</td>
			<td>8</td>
			<td>7</td>
			<td>10</td>
			<td>50</td>
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
			<td>Walid Ait Said</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Youssef Benhayoun Sadafi</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Adam Bekkar</td>
			<td>1/3</td>
		</tr>
	</tbody>
</table>


## References

### 📚 **Books**

- **Marschner & Shirley: _Fundamentals of Computer Graphics_, 5th Edition, AK Peters, 2021**
- **Glassner: _Graphics Gems_, Academic Press, 1989**
- **Ebert, Musgrave, Peachey, Perlin, Worley: _Texturing & Modeling: A Procedural Approach_, 3rd Edition**

### 🌐 **Blogs**

- [3D Game Shaders for Beginners](https://github.com/lettier/3d-game-shaders-for-beginners)

### 🎓 **Online Tutorials**

- [Awesome Computer Graphics Resources by lettier](https://github.com/lettier/awesome-computer-graphics)
- [Introduction to Computer Graphics by Cem Yuksel](https://www.youtube.com/watch?v=vLSphLtKQ0o&list=PLplnkTzzqsZTfYh4UbhLGpI5kGd5oW_Hh)
- [Blender 4.0 Beginner Donut Tutorial (Newest) by Blender Guru](https://youtube.com/playlist?list=PLjEaoINr3zgEPv5y--4MKpciLaoQYZB1Z&si=tnK_WiwRdk_pP7cw)
- [Learn OpenGL: Learn modern OpenGL graphics programming in a step-by-step fashion](https://learnopengl.com/)

### 🖼️ **Meshes and Textures**

- [Benches](https://free3d.com/3d-model/hipster-bench-83378.html)
- [Campfire](https://www.cgtrader.com/free-3d-models/various/various-models/campfire-7c95f25c-078b-4386-b6b6-fed4b0a0375b)
- [Grass](https://www.freepik.com/free-photo/green-grass-texture_969018.htm#fromView=keyword&page=1&position=37&uuid=6a92b9ae-c3d6-4912-ad3f-e0337f5b4947&query=Grass+Texture)
- [Chest](https://sketchfab.com/3d-models/medieval-chest-e84b6208cbb148ab9a32d6c52897dad1)
- [Sky Island](https://www.freepik.com/free-photo/closeup-shot-gray-rough-concrete-background_9990863.htm#fromView=keyword&page=1&position=45&uuid=ac5cc307-b3ab-4939-b72e-3ac48c98413d&query=Rock+Texture)