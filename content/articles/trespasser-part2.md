+++
tags = ["articles"]
date = "2021-03-06T17:51:12Z"
title = "Trespasser - C++ archeology and oxidization - Part 2 Rendering Scene Data"
draft = true
+++

See also

* [Part 1 - Loading Scene Data](/articles/trespasser-part1)
* [Part 2 - Rendering Scene Data](/articles/trespasser-part2)

This series will be about the video game Jurassic Park Trespasser. My goal is to be able to play the game by rewriting its source code in Rust based on the original C++ code base. Hopefully discovering interesting things along the way.

Note about using VS for obj vis, Windows preview

Material hashing texname+bumpname, only hash first member of struct!?

Mesh attribute hack

Physics mesh loading

CTerrainObj: geometry to render terrain texture top down, uses rasterizer