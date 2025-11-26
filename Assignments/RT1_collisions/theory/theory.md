---
title: Theory Exercise RT1 – Ray-Cylinder Intersection
---

# Theory Exercise Homework 1 (RT1)

## Ray-Cylinder Intersection

## Notation Reminder

-   $\mathbf{o}$ : Ray origin

-   $\mathbf{d}$ : Ray direction

-   $\mathbf{c}$ : Cylinder center

-   $\mathbf{a}$ : Cylinder axis

-   $h$ : Cylinder height

-   $r$ : Cylinder radius

![A cylinder with axis $\mathbf{a}$, center $\mathbf{c}$, radius $r$, and height $h$](images/cyl_diagram.png){width="300px"}

</br>

For the ray-cylinder intersection task, our approach is based on the
following steps:

1.  **Identify the equations of the cylinder and ray trajectory.**\
    \
    They are represented as follows:
    $$\text{Cylinder : } \frac{||\mathbf{a} \times (\mathbf{{\color{red} x} - \mathbf{c}})||}{||\mathbf{a}||} = r \hspace{1cm} ; \hspace{1cm} \text{Ray trajectory : } \mathbf{{\color{red} x}} = \mathbf{o} + t\mathbf{d} \hspace{1cm} t \in \mathbb{R}$$
    *We assume here that our cylinder is of infinite height, we'll make
    sure to restrict the number of rays according to the real height
    later.*

2.  **Compute the intersection points by combining the 2 equations.**\
    \
    We then get the following equation which we solve for t :
    $$\frac{||\mathbf{a} \times (\mathbf{o} + {\color{blue} t}\mathbf{d} - \mathbf{c})||}{||\mathbf{a}||} = r \Leftrightarrow ||\mathbf{a} \times (\mathbf{o} + {\color{blue} t}\mathbf{d} - \mathbf{c})|| = r$$
    *The axis vector given in the ray_cylinder_intersection function is
    normalised so its norm is equal to 1.*\
    \
    We then simplify it to a second degree equation. For ease of
    understanding, we define the following vectors :

    -   $\mathbf{oc} = \mathbf{o} - \mathbf{c}$

    -   $\mathbf{m} = \mathbf{a} \times \mathbf{oc}$

    -   $\mathbf{n} = \mathbf{a} \times \mathbf{d}$

    $$\begin{aligned}
         ||\mathbf{a} \times (\mathbf{o} + {\color{blue} t}\mathbf{d} - \mathbf{c})|| = r 
            &\Leftrightarrow ||\mathbf{a} \times (\mathbf{oc} + {\color{blue} t}\mathbf{d})|| = r \\
            &\Leftrightarrow ||\mathbf{a} \times \mathbf{oc} + \mathbf{a} \times {\color{blue} t}\mathbf{d}|| = r \\
            &\Leftrightarrow ||\mathbf{m} + {\color{blue} t}\mathbf{n}|| = r \\
            &\Leftrightarrow ||\mathbf{m}||^2 + {\color{blue} t}^2||\mathbf{n}||^2 + 2{\color{blue} t} (\mathbf{m} \cdot \mathbf{n}) = r^2\\
            &\Leftrightarrow {\color{blue} t}^2||\mathbf{n}||^2 + 2{\color{blue} t} (\mathbf{m} \cdot \mathbf{n}) + ||\mathbf{m}||^2 - r^2 = 0
    \end{aligned}$

3.  **Choose the solutions**\

    1.  **No intersections between the ray and the cylinder**\
        This is the case where there is no solution to the above
        equation or all solutions are negative, so our function returns
        false.

    2.  **One or more intersections** This is the case where there is at
        least one positive solution (if there are 2, we take the
        smallest one), let's call it t. Given that we assumed in the
        beginning that the cylinder is of infinite height, we know have
        restrict our solution with the real height. For that we first
        compute the intersection point given by :
        $$\mathbf{i} = \mathbf{o} + {\color{blue} t}\mathbf{d}$$ We use
        it then to get the vector $\mathbf{ci}$ connecting the center
        and intersection point:
        $$\mathbf{ci} = \mathbf{i} - \mathbf{c}$$ And finally, we
        compute the norm of its projection on the cylinder axis:
        $$H = \left|\left| (\mathbf{ci} \cdot \mathbf{a}) \mathbf{a} \right|\right| = \mathbf{ci} \cdot \mathbf{a}$$
        If $H \leq \frac{h}{2}$ then ${\color{blue} t}$ is in fact a
        solution.

4.  **Get the normal to the cylinder**\
    \
    All that's left do now is get the normal vector which is obtained by
    taking $\mathbf{ci}$ and retracting its projection on the cylinders
    axis:
    $$\mathbf{cn} = \mathbf{ci} - (\mathbf{ci} \cdot \mathbf{a})\mathbf{a}$$
    But here, the normal can be either $+ \mathbf{cn}$ or
    $- \mathbf{cn}$ depending of where the ray might be coming from. The
    solution can be found using :
    $$\mathbf{normal} = sgn((\mathbf{o} - \mathbf{i}) \cdot \mathbf{cn})\text{ } \mathbf{cn}$$
