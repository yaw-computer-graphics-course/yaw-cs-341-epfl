---
title: Milestone Report CS-341 2025
---

# Project Title


## Progress Summary

1.
	<table>
		<thead>
			<tr>
				<th>Feature</th>
				<th>Adapted Points</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>L-Systems</td>
				<td>10</td>
				<td style="background-color: #fff3cd;">Work in progress</td>
			</tr>
			<tr>
				<td>Bloom</td>
				<td>5</td>
				<td style="background-color: #fff3cd;">Work in progress</td>
			</tr>
			<tr>
				<td>Mesh/Scene design</td>
				<td>5</td>
				<td style="background-color: #fff3cd;">Work in progress</td>
			</tr>
			<tr>
				<td>SSAO</td>
				<td>10</td>
				<td style="background-color: #cce5ff;">Upcoming</td>
			</tr>
			<tr>
				<td>Soft Shadows</td>
				<td>10</td>
				<td style="background-color: #cce5ff;">Upcoming</td>
			</tr>
			<tr>
				<td>PTG</td>
				<td>10</td>
				<td style="background-color: #cce5ff;">Upcoming</td>
			</tr>
		</tbody>
	</table>

	<table>
		<caption>Achieved Goals</caption>
		<tr>
			<th></th>
			<th>Adam Bekkar</th>
			<th>Walid Ait Said</th>
			<th>Youssef Benhayoun Sadafi</th>
		</tr>
		<tr>
			<td>Week 1 (Proposal)</td>
			<td>Write detailed proposal</td>
			<td>Adapt points and find relevant resources</td>
			<td>Find ideas and corresponding features</td>
		</tr>
		<tr style="background-color: #f0f0f0;">
			<td>Week 2 (Easter)</td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Week 3</td>
			<td>Try to find rules for 3D L-Systems and generate terrain structure</td>
			<td>Look into Post processing lighting effects and start Bloom shader code </td>
			<td>Look into L-systems and procedural generation</td>
		</tr>
		<tr>
			<td>Week 4</td>
			<td>Work on Bloom implementation</td>
			<td>Work on Bloom implementation</td>
			<td>Work on Bloom implementation and start tree generation code</td>
		</tr>
	</table>


2. Show some preliminary results.

	| ![Terrain scene without the Bloom effect.](images/bloom-before.png){height="250px"} | ![Terrain scene with the Bloom effect.](images/bloom-after.png){height="250px"} |
	|----------------------------------------------------------|---------------------------------------------------------------|
	| *Figure 1: Terrain scene before applying the Bloom effect.* | *Figure 2: Terrain scene with Bloom effect using Gaussian blur.* |

	| ![Generated tree using L-Systems.](images/generated-tree.png){width="318px"} | ![Terrain scene of a floating island.](images/plateform.jpg){width="300px"} |
	|----------------------------------------------------------|---------------------------------------------------------------|
	| *Figure 3: A tree generated using 3D L-Systems with cylindrical mesh branches.* | *Figure 4: Terrain scene of a floating island mesh.* |

	</br></br>
	Briefly describe the results you obtained until now and the overall state of the project.

	We've had quite a few hiccups at the start of this project, the structure of the project seemed a bit complicated. After some time getting used to it, we managed to implement some things, although not completely. The L-Systems generated trees seem a bit lack luster, the lines are drawn as cylinder meshes but it quickly gets computationnally expensive after a few iterations.</br>
	
	The Bloom effect implementation was confusing at first since it is a post-processing effect, so its shader renderer code is unlike the normals' one used in the tutorial. For now, we managed to implement a version using the Gaussian blur, but we still have some testing and adjustments to make.</br>
	
	We also managed to create a floating island on top of which we'll put together the whole scene. For that, we took the mesh of the PG1_noise assignment and reverted the z component, which gave us a flipped mountain mesh. We then shifted it to the top and added a plane mesh to avoid having them separated and give the impression of an island.</br>

4. Report the number of hours each team member worked on the project.

	<table>
		<caption>Worked Hours</caption>
		<tr>
			<th></th>
			<th>Adam Bekkar</th>
			<th>Walid Ait Said</th>
			<th>Youssef Benhayoun Sadafi</th>
		</tr>
		<tr>
			<td>Week 1 (Proposal)</td>
			<td>5</td>
			<td>5</td>
			<td>5</td>
		</tr>
		<tr style="background-color: #f0f0f0;">
			<td>Week 2 (Easter)</td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Week 3</td>
			<td>10</td>
			<td>10</td>
			<td>10</td>
		</tr>
		<tr>
			<td>Week 4</td>
			<td>16</td>
			<td>16</td>
			<td>16</td>
		</tr>
	</table>

5. Is the project progressing as expected? Was your workload estimate correct? Critically reflect on your work plan and assess if you are on track.

	The progression thus far is a bit underwhelming. It was harder than we thought mainly because the project is unguided so each time we want to implement something new we don't know how to start, so hours and hours go into research and reading documentation. We also had to backtrack multiple times because the path we were taking wasn't leading anywhere.

	Thus far, we are progressively getting the idea of how things should be structured and are still motivated to continue the adventure.

## Schedule Update

1. Acknowledge any delays or unexpected issues, and motivate proposed changes to the schedule, if needed.

	We have a bit of delay regarding the schedule we had in mind, that can be a bit different from the one in the proposal. The reason for that, as stated above, is that we didn't expect the difficulty of implementing a feature without being guided and how much time can be lost in backtracking from ideas that lead nowhere.

2. Present the work plan for the remaining weeks.

	<table>
		<caption>Updated Schedule</caption>
		<tr>
			<th></th>
			<th>Adam Bekkar</th>
			<th>Walid Ait Said</th>
			<th>Youssef Benhayoun Sadafi</th>
		</tr>
		<tr>
			<td>Week 5</td>
			<td>Look into lighting effetcs</td>
			<td>Finalize Bloom effect and work on mesh and scene design</td>
			<td>Continue on tree generation and look into fire and smoke textures</td>
		</tr>
		<tr>
			<td>Week 6</td>
			<td>Start implementing shaders for ambient occlusion</td>
			<td>Finalize the scene to be showcased and help with SSAO</td>
			<td>Work on the fire animation</td>
		</tr>
		<tr>
			<td>Week 7</td>
			<td>Edit the video to be showcased</td>
			<td>Implement UI and Record the video</td>
			<td>Write a detailed report</td>
		</tr>
	</table>