+++
date = "2016-01-14T19:21:31Z"
title = "AttracTouch"

+++

# AttracTouch

<img src="/media/at-ss.jpg" alt="AttracTouch" style="float:right;padding-left:20px;"/>**Update :** This project has won the "Best Use of Technology" prize at [e-magiciens 2009]({{< relref "emagiciens2009.md" >}}).

AttracTouch is a project made during my first year at [ENJMIN](http://www.enjmin.fr). It involved a team of 6 persons during 3 months. I personally invested time and money for building myself a **multitouch screen** (see image on the side) using resources at [NUI Group](http://nuigroup.com).

The principle of the game is to use your fingers to lead particles from the launcher to the receiver. The fingers act as attraction points and make the particles change direction when they enter the radius of influence.

To make it easier for the player to make the particles go where they want, we decided to use a simple system of 45/90/135 degrees and 3 circles to give more control but still have some challenge.

It was developed in **C++** using the [SFML library](http://www.sfml-dev.org/) (and some **OpenGL**) for windowing and graphics. The [TUIO protocol](http://www.tuio.org/) was used for managing the multitouch interface and [OSC](http://opensoundcontrol.org/) was used in combination with [PureData](http://puredata.info/) for the sound.

The challenging part was to make a realistic smoke effect for the background which would react to the actions of the player. To achieve that, I took inspiration from [Jos Stam's Stable Fluids](http://www.multires.caltech.edu/teaching/demos/java/stablefluids.htm). In fact, without using proper **fluid simulation**, the particles did not behave correctly for a beliavable smoke.

## Video

{{< vimeo 6270765 >}}
