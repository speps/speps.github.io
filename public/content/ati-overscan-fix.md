+++
date = "2016-01-14T19:22:06Z"
title = "ATI Overscan Fix"

+++

# ATI Overscan Fix

## What is overscan ?

ATI (recently AMD) has an option called "Overscan", it allows you to adjust the scaling of the content of the screen to compensate the cropping done on some screens (TV screens mostly).

## What's the problem ?

Unfortunately, the driver setting for this is by default set at 15% which means everytime you install a new driver it gets reset and you need to go to the settings and "fix" it by hand.

## Why is it so hard ?

The thing is, in the Windows registry, the settings get saved for every new resolution set by the driver. For example, if you launch a game and it sets the resolution to something like 1920x1080 @ 50 Hz but your desktop was at 60 Hz, this new resolution will have the default 15% overscan. 

It gets annoying because some games don't let you choose the refresh rate and you have to find the particular resolution it was in, set it as your desktop and then go the driver settings and set the overscan to 0%.

## "So what? I never had this problem"

How lucky you are :)

## License

Public domain ! Come on it's just one CPP file written in an hour !

## Downloading

Here is the latest executable (requires administrator rights because it changes the registry) : {{< download "ATIOverscanFix.exe" >}}

Launch it from anywhere or from the command line, it will tell you which resolutions were fixed or nothing if none were wrong.

You can download the sources here (if you don't trust me you can compile it yourself) : {{< download "ati-overscan-fix-096c7980e00e.zip" >}}

## Notes

* I compiled it with Visual Studio 2010 (the solution file is with the sources) but as it is only one CPP file, you can use GCC or anything you want and feel comfortable with.
