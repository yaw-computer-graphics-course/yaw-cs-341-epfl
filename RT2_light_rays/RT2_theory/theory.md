---
title: Theory Exercise RT2 – Lighting and Light Rays
---

# Theory Exercise Homework 2 (RT2)

## Lighting and Light Rays

### Derivation of the Iterative Formula

In order to show the following :
$$\mathbf{c_b} = \sum_{i=0}^{+\infty}(1-\alpha_i)(\prod_{k=0}^{i-1} \alpha_k)\mathbf{c}_i$$

We'll start with the recursive formula :
$$\mathbf{c}_b = (1 - \alpha_0)\mathbf{c}_0 + \alpha_0\mathbf{c}^{1}$$

$\mathbf{c^{1}}$ can be replaced by its formula shown here :
$$\mathbf{c^{1}} = (1 - \alpha_1)\mathbf{c}_1 + \alpha_1\mathbf{c}^{2}$$

The formula for $\mathbf{c}_b$ becomes :
$$\mathbf{c}_b = (1 - \alpha_0)\mathbf{c}_0 + \alpha_0(1 - \alpha_1)\mathbf{c}_1 + \alpha_0\alpha_1\mathbf{c}^{2}$$

Now substituting $\mathbf{c}_2$ with:
$$\mathbf{c}^{2} = (1 - \alpha_2)\mathbf{c}_2 + \alpha_2\mathbf{c}^{3}$$

We get :
$$\mathbf{c}_b = (1 - \alpha_0)\mathbf{c}_0 + \alpha_0(1 - \alpha_1)\mathbf{c}_1 + \alpha_0\alpha_1(1 - \alpha_2)\mathbf{c}_2 + \alpha_0\alpha_1\alpha_2\mathbf{c}^{3}$$

And replacing $\mathbf{c}_3$ :
$$\mathbf{c}_b = (1 - \alpha_0)\mathbf{c}_0 + \alpha_0(1 - \alpha_1)\mathbf{c}_1 + \alpha_0\alpha_1(1 - \alpha_2)\mathbf{c}_2 + \alpha_0\alpha_1\alpha_2(1 - \alpha_3)\mathbf{c}_3 + \alpha_0\alpha_1\alpha_2\alpha_3\mathbf{c}^{4}$$

From here, we start to recognize a pattern forming :
$$\mathbf{c}_b = (1 - \alpha_0)(\prod_{k = 0}^{-1}\alpha_k) \mathbf{c}_0 + (1 - \alpha_1)(\prod_{k = 0}^{0}\alpha_k)\mathbf{c}_1 + (1 - \alpha_2)(\prod_{k = 0}^{1}\alpha_k)\mathbf{c}_2 + (1 - \alpha_3)(\prod_{k = 0}^{2}\alpha_k)\mathbf{c}_3 + \alpha_0\alpha_1\alpha_2\alpha_3\mathbf{c}^{4}$$

*We define $\prod_{k=0}^{-1}$ here as equal to the identity element of
the product which is $1$, since it is not possible to get from $0$ to
$-1$ by incrementing i by a positive integer.*

This goes on indefinitely so we can conclude that :

$$\mathbf{c_b} = \sum_{i=0}^{+\infty}(1-\alpha_i)(\prod_{k=0}^{i-1} \alpha_k)\mathbf{c}_i$$

### Simplification for $N$ Reflections

Since i represents the i-th reflection, if we consider a maximum of $N$
reflections then wme get the following formula:

$$\mathbf{c_b} = \sum_{i=0}^{N}(1-\alpha_i)(\prod_{k=0}^{i-1} \alpha_k)\mathbf{c}_i$$
