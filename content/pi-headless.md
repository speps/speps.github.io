+++
date = "2016-09-15T10:20:17Z"
draft = true
title = "Pi - Headless Setup"
+++

# Pi - Headless Setup from Windows

Very simple tutorial on how to setup the WiFi on a Raspberry Pi that doesn't have an Ethernet port.

Requirements :

* Windows environment
* Install [Paragon ExtFS for Windows](http://dl.paragon-software.com/demo/extwin_trial_en.msi)
* WiFi dongle (I used the official one)

## Install Raspbian

Follow this guide for this step : https://www.raspberrypi.org/documentation/installation/installing-images/README.md

## Editing WiFi configuration

* Open Paragon ExtFS for Windows

## Add Samba share

    [global]
        wins support = yes
    [pi]
       path = /home/pi
       writeable = yes
       browseable = yes
       only guest = no
       read only = no
       public = yes
