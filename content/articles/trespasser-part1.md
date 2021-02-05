+++
date = "2021-01-21T13:31:42Z"
title = "Trespasser - C++ archeology and oxidisation - Part 1 Loading Data"
draft = true
+++

This series will be about the video game Jurassic Park Trespasser. My goal is to be able to play the game by rewriting its source code in Rust from the original C++ code base. Hopefully discovering interesting things along the way which will be detailed in this series of posts.

## Why this project?

Not sure why I like this game, I only played it properly once, never finished it but I was amazed by the technical aspects of it. Even with all the technical issues, I'm sure all the fans will agree that being chased by a clumsy raptor while trying to wrangle a rifle with one hand is an experience that only this game can give.

For this project, I decided to go back to Rust after trying it for Advent of Code a few years ago and failing to grasp its concepts in the short allocated time for the puzzles. This time around, I have time to read the documentation and understand what I'm doing wrong. It also helps that the tools have immensily improved like the LSP server for VS Code which I'm using exclusively. It also seemed like an appropriate language, being in its infancy (relatively speaking), similar to what C++ was like when the game was created originally.

For more background on the game, I can recommend these links:

* https://fabiensanglard.net/trespasser/
* JDG video
* AVGN video

## Loading scenes

SCN/GRF(SZDD)
https://www.cabextract.org.uk/libmspack/doc/szdd_kwaj_format.html

PID/SPZ
Same algorithm with just a different window buffer init value and different starting value

WTD
Surprisingly recursive template

## First rendering


