+++
date = "2016-01-14T19:22:04Z"
title = "Awesomium.NET"

+++

# Awesomium.NET

## Disclaimer

**This project is not supported anymore**, it's only provided now as an example on how to interface C++ and .NET code together (a lot of Marshal inside).

In the meantime, you can see an alternative to Awesomium here : [EA STL](http://gpl.ea.com/). It also contains the famous <http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2007/n2271.html> which is a C++ STL which aims for performance and video games.

## What is Awesomium?

[Awesomium](http://princeofcode.com/awesomium.php) (by Adam Simmons) is a C++ library which uses the Windows port of [WebKit](http://webkit.org/) created by the Google Chrome team also known as [Chromium](http://code.google.com/chromium/). It allows the rendering of webpages in a memory buffer (an image) and the interaction required by injecting mouse/keyboard events. You can communicate with the internal browser using JavaScript and callbacks to/from your C++ code.

## What is Awesomium.NET?

<img src="/media/awesomiumdotnet-ss.jpg" alt="Puddle" style="float:right;padding-left:20px;"/>Awesomium.NET is a .NET library which wraps all of Awesomium to use it inside any .NET application.

It is bundled with 2 demos : Windows Forms and [XNA](http://www.xna.com/).

## License

This software is under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

## Downloading

The latest binaries for Awesomium.NET (~ 8.1 MB) :
{{< download "Awesomium.NET-1.08-20091220.zip" >}}

The version is **1.08** (same version as Awesomium). It was lastly updated on 2009-12-20.

You can download the latest sources here : {{< download "awesomium-net-3ac724d57e97.zip" >}}
