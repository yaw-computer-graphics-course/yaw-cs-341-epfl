# Computer Graphics & Ray Tracing Coursework at EPFL

This repository contains the full set of assignments, libraries, assets, and documentation for the CS-341 / Introduction to Computer Graphics course.
It includes interactive WebGL projects, GLSL shader programming, mesh processing, environment mapping, and ray-tracing pipelines.

Each assignment and the final project is self-contained with HTML viewers, documentation, images, shaders, and uses lightweight JavaScript libraries such as glMatrix, regl, preact, and webgl-obj-loader.

---

## Contents

```
Assignments/
│
├── GL1_transforms/ # 2D & 3D transforms, MVP pipeline, solar system demo
├── GL2_meshes/ # Mesh loading, normals, shading (Gouraud/Phong)
├── GL3_env_cubemap/ # Cubemaps, shadows, reflections, environment capture
├── RT1_collisions/ # Ray–object collisions, normals, shading
└── RT2_light_rays/ # Ray tracing with multiple lights & materials

Final_Project/
│
├── cg-project/ # Interactive final 3D scene
├── final-report/ # Report with demos, screenshots, validation videos
├── milestone/ # Milestone deliverables
└── proposal/ # Project proposal and early concept
```

Each assignment includes:

- Interactive WebGL viewer (index.html)
- Markdown specification (.md)
- Source code (src/)
- GLSL shaders
- Meshes and textures
- Documentation images (doc/)

---

# Key Library: glMatrix

This repository uses glMatrix, a high-performance vector and matrix math library for JavaScript.
It is optimized for realtime graphics and is used across all assignments for transformations, camera calculations, and vector math.

---

## glMatrix Overview

JavaScript has evolved into a language capable of handling realtime 3D graphics via WebGL, and computationally intensive tasks such as physics simulations. These applications demand high-performance vector and matrix math, which JavaScript does not provide by default.

glMatrix addresses this need by offering extremely fast vector and matrix operations through efficient code and browser-optimized patterns.

### Learn More

- [Official glmatrix Website](http://glmatrix.net/)
- [Babel plugin](https://github.com/akira-cn/babel-plugin-transform-gl-matrix)

---

## Building and Running

Each assignment is directly runnable in a browser:

```
cd Assignments/GL1_transforms
open index.html
```

No build step is required unless specified in a particular assignment.

Additional contribution and build instructions:

- CONTRIBUTING.md
- BUILDING.md

---

## Technologies Used

- WebGL — Rendering pipeline, programmable shaders
- GLSL — Vertex and fragment shader programming
- glMatrix — Math library (matrices, vectors, quaternions)
- regl.js — Functional wrapper for WebGL
- preact — Lightweight UI components
- webgl-obj-loader — OBJ mesh parsing
- Blender — Scenes used for ray tracing assignments

---

## Assignment Summaries

### 1. GL1 — Transforms

- Model-view-projection pipeline
- 2D and 3D transformations
- Camera transforms
- Solar-system animation
- Introductory shaders

![GL1 Solar System](Assignments/GL1_transforms/doc/icg_solar_title.jpg)

---

### 2. GL2 — Meshes

- OBJ mesh loading
- Vertex and face normals
- Gouraud and Phong shading
- Interactive mesh viewer with Preact UI

![GL2 Mesh Viewer](Assignments/GL2_meshes/doc/teaser.png)

---

### 3. GL3 — Environment Cubemap

- Cubemap textures
- Point-light shadow mapping
- Reflection shader
- Environment capture
- Multi-pass scene rendering

![GL3 Environment](Assignments/GL3_env_cubemap/doc/GL33_view1_2024.webp)

---

### 4. RT1 — Collisions

- Ray–sphere, ray–plane, ray–triangle intersections
- Surface normals and shading
- Basic reflective rays
- GPU-accelerated ray tracing in a fragment shader

![RT1 Collision Diagram](Assignments/RT1_collisions/doc/triangle_intersection_diagram.png)

---

### 5. RT2 — Light Rays

- Multiple lights
- Blinn–Phong shading
- Reflective and transparent materials
- Ray tracing renders of Blender scenes

![RT2 Light Rays](Assignments/RT2_light_rays/doc/scene_3_lights.png)

---

## Final Project

- Interactive 3D scene: terrain, trees, benches, logs, fire, and lighting
- Procedural and texture-based rendering
- Multi-pass shaders, shadows, and SSAO
- Demo video included: `campfire_at_midnight.mov`
- Full source code and scene assets provided in `cg-project/`

<div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;">

<div style="flex: 0 0 45%; text-align: center;">
  <img src="Final_Project/final-report/images/view1.png" alt="Inside Scene View" style="width: 100%; max-width: 400px;">
  <p><strong>View 1:</strong> Inside the scene, immersive up-close view.</p>
</div>

<div style="flex: 0 0 45%; text-align: center;">
  <img src="Final_Project/final-report/images/view2.png" alt="Close Side View 1" style="width: 100%; max-width: 400px;">
  <p><strong>View 2:</strong> Slightly more distant perspective along z-axis.</p>
</div>

<div style="flex: 0 0 45%; text-align: center;">
  <img src="Final_Project/final-report/images/view3.png" alt="Close Side View 2" style="width: 100%; max-width: 400px;">
  <p><strong>View 3:</strong> Similar distance to View 2, different angle.</p>
</div>

<div style="flex: 0 0 45%; text-align: center;">
  <img src="Final_Project/final-report/images/view4.png" alt="Top-Down View" style="width: 100%; max-width: 400px;">
  <p><strong>View 4:</strong> Top-down perspective of the scene layout.</p>
</div>

</div>

<div style="text-align: left;">

## License

This project includes the **GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007**.

Third-party libraries (glMatrix, regl.js, preact, webgl-obj-loader) include their own respective licenses.

</div>
