+++
tags = ["articles"]
date = "2026-07-08T00:00:00Z"
title = "Water Masking in Sea of Thieves"
+++

While working on the Rendering Team at Rare Ltd between 2015 and 2019 on Sea of Thieves, I was tasked with finding a solution to carve holes in our infinite water mesh used for the ocean.

This was a very interesting task that ended up some uncommon GPU features in a creative way.

## Demo

{{< iframe src="/masking-demo/" width="800" height="600" >}}

Rowboat model: https://opengameart.org/content/low-poly-boat, mask mesh made manually in Blender

## Overview

The goal was to mask out parts of the ocean that were crossing the inside of the boats. This can be achieved using a stencil buffer depending on the viewpoint of the player. However, in Sea of Thieves, the players can climb onboard, and walk around the ship below decks (with multiple decks). Another use case was the addition of caves on islands, if a cave was going under the ocean level we would need to hide parts of the ocean mesh that crosses the cave. Note that this could possibly still be done using a stencil buffer with increment/decrement, but I think I remember trying and it wasn't suited because our water didn't write depth, and would have been quite expensive to re-render into the stencil to try and change the count. All in all, this meant that a more advanced solution was necessary.

### Render mask meshes

We first need to create the mask meshes, these are the meshes whose shape is going to be holes in the water mesh. In our case, we want to create one that is the inside of the hull of the ship for example. This is created manually as we want to have something that sits right in between the 2 walls of the hull so we don't see the edge of the hole.

Now for a bit of setup, we're going to use the `SV_IsFrontFace` (DirectX) or `@builtin(front_facing)` (WebGPU) semantic in the pixel shader, so we need to disable face culling. Then, we're going to store depth values, so ideally we should use a format that stays precise enough, for ease in this demo I used `float32`. The size of the render target for this is 1:4 scale from the main buffer, this is to allow for 16 (4x4) values per pixel, so the actual size in bytes will be the same of the main buffer (and matches exactly if it's 32 bits too) but the viewport is 1:4.

**The key insight here is that we can write a positive depth value for front faces, and a negative depth value for back faces.** Using an atomic counter per pixel, we can accumulate these values per pixel (up to 16 values).

At the end of this graphics pass, we have a bunch of unordered positive and negative depth values, multiple ones per pixel.

### Sort pass

This is an easy one. Because the values from the mask are unordered (it is the nature of fragment generation on GPUs), we need to sort them. We want them in depth order, closest to the camera first. So we need to sort by `abs(depth)` so we sort even the negative values interleaved with positive values from the previous pass. This demo uses a bitonic sort with a fixed loop count.

Here is an example of what it might look like for each pixel, with up to 16 values, and 5 mask objects (1 and 2 overlap):

{{< svg "masking-demo/sort.svg" >}}

### Usage

The mask is ready to be used. There are two cases we need to handle:

* Camera outside a mask shape (first entry is positive)
* Camera inside a mask shape (first entry is negative)

Here is the algorithm which can be done in a function in your shader and reused for all materials that need it:

```plaintext
if any mask surfaces stored at this pixel:
    let firstSurface = closest surface's signed depth
    if firstSurface < 0 (back face → camera is inside a volume):
        if fragment depth > abs(firstSurface) (fragment is behind this wall):
            discard
    depth = 0
    for each surface in order of absolute depth:
        if surface is at depth beyond fragment → break
        if front face → depth++
        if back face → depth--
    if depth > 0 (fragment is inside more volumes than camera started in):
        discard
```

### Extensions

* The "inside volume" case could also be handled by adding a value at near clip depth during sort, so the cost of sampling the first value is gone during the sampling.