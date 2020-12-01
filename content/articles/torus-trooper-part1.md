+++
date = "2020-07-12T19:46:57Z"
title = "Torus Trooper - Rebooting a 15 year-old game written in D - Part 1 Compiling"
+++

See also

* [Part 1 - Compiling a new executable](/articles/torus-trooper-part1)
* [Part 2 - Running the game for the first time](/articles/torus-trooper-part2)
* [Part 3 - Porting to WebAssembly](/articles/torus-trooper-part3)
* [Part 4 - Final steps](/articles/torus-trooper-part4)

While exploring D recently, I remembered a game I played while at university 15 years ago. For a long time, I couldn't remember the name at all, only that it was from a Japanese developer. After some search wrangling, I finally managed to find the name of the game: **Torus Trooper!**

You can find it there: http://www.asahi-net.or.jp/~cs8k-cyu/windows/tt_e.html

![](/media/articles/tt1.png)

Here is a copy of the tt0_22.zip file archived: https://github.com/speps/tt/archive/legacy.zip

What made me remember this game is that :

- It came with [source code](https://github.com/speps/tt/tree/legacy/src/abagames), quite unusual at the time for me
- Written in D, a language I didn't know at all while I was busy studying C++
- It's awfully addictive!

What better project than try to compile a **D v0.110** project in a modern version of D! So here we are...

## Switching from Ant to DUB

The game used Ant and its `build.xml` file to generate the executable, resources, etc. Since then, D added DUB as a build system / package manager so let's use that!

```json
{
	"authors": [
		"Kenta Cho",
		"Remi Gillig"
	],
	"copyright": "Copyright © 2004 - Kenta Cho, 2020 - Remi Gillig",
	"description": "Torus Trooper (Reboot)",
	"license": "BSD 2-clause",
	"name": "tt",
	"targetType": "executable",
	"sourcePaths": [
		"src"
	]
}
```

With this initial `dub.json` file, I was set to run the `dub` command...

```plaintext {linenos=false}
Performing "debug" build using C:\D\dmd2\windows\bin64\dmd.exe for x86.
tt ~master: building configuration "application"...
src\abagames\tt\barrage.d(95,33): Error: instead of C-style syntax, use D-style BulletMLParserTinyXML*[char[]][char[]] parser
src\abagames\tt\barrage.d(122,28): Error: instead of C-style syntax, use D-style BulletMLParserTinyXML*[] pl
src\abagames\tt\barrage.d(130,14): Error: instead of C-style syntax, use D-style BulletMLParserTinyXML*[char[]] pa
src\abagames\tt\boot.d(51,12): Error: instead of C-style syntax, use D-style char[4096] exe
src\abagames\tt\tunnel.d(300,14): Error: template argument expected following !
src\abagames\tt\tunnel.d(322,14): Error: template argument expected following !
src\abagames\util\rand.d(115,6): Error: instead of C-style syntax, use D-style uint[N] state
src\abagames\util\rand.d(140,20): Error: instead of C-style syntax, use D-style uint[] init_key
src\abagames\util\sdl\luminous.d(21,10): Error: instead of C-style syntax, use D-style GLuint[LUMINOUS_TEXTURE_WIDTH_MAX * LUMINOUS_TEXTURE_HEIGHT_MAX * 4 * (uint).sizeof] td
src\abagames\util\sdl\luminous.d(83,17): Error: instead of C-style syntax, use D-style float[2][2] lmOfs
C:\D\dmd2\windows\bin64\dmd.exe failed with exit code 1.
```

Alright let's start and get this to compile!

## C-style syntax errors

This is one is easy to fix, the suggestion from the compiler works, I just replaced every instance of this error with the suggestion.

Here is an example:

```diff
@@ -42,7 +43,7 @@ struct SDL_AudioSpec {
     Once the callback returns, the buffer will no longer be valid.
     Stereo samples are stored in a LRLRLR ordering.
  */
- void (*callback)(void *userdata, Uint8 *stream, int len);
+ void function(void *userdata, Uint8 *stream, int len) callback;
  void  *userdata;
 }
```

## Error: template argument expected following !

This is an interesting one, here is one of the files where this error triggers:

```d {hl_lines=[17]}
  private void calcIndex(in float z, out int idx, out float ofs) {
    idx = slice.length + 99999;
    for (int i = 1; i < slice.length; i++) {
      if (z < slice[i].depth) {
        idx = i - 1;
        ofs = (z - slice[idx].depth) / (slice[idx + 1].depth - slice[idx].depth);
        break;
      }
    }
    if (idx < 0) {
      idx = 0;
      ofs = 0;
    } else if (idx >= slice.length - 1) {
      idx = slice.length - 2;
      ofs = 0.99;
    }
    if (ofs !>= 0) // ERROR HERE
      ofs = 0;
    else if (ofs >= 1)
      ofs = 0.99;
  }
```

I did try a few searches without success so I asked on the D community forums and a few people guessed right, it's of course a `not >=`, equivalent to `<`. However, [thanks to Walter Bright](https://forum.dlang.org/post/rec3d1$toc$1@digitalmars.com), I got a link to the [original documentation from Digital Mars](https://www.digitalmars.com/ctg/ctgNumerics.html#comparisons). The subtle difference with `!>=` is that it will also return `true` if any operands are `NaN`. Suggested fix seems to have worked:

```d {linenostart=17}
    if (std.math.isNaN(ofs) || ofs < 0)
      ofs = 0;
```

## Replacing `char[]` with `string`

D1 used to have `char[]` as the string type, and functions in `std.string` in Phobos to manipulate this type. D2 added a dedidcated `string` type instead of an alias. As a result, a lot of the code needs updating to deal with this. That includes the code in the custom bindings.

Most of the changes here are similar to this

```diff
@@ -92,24 +91,24 @@ public class Barrage {
  */
 public class BarrageManager {
  private:
-  static BulletMLParserTinyXML *parser[char[]][char[]];
-  static const char[] BARRAGE_DIR_NAME = "barrage";
+  static BulletMLParserTinyXML*[string][string] parser;
+  static const string BARRAGE_DIR_NAME = "barrage";
 
   public static void load() {
-    char[][] dirs = listdir(BARRAGE_DIR_NAME);
-    foreach (char[] dirName; dirs) {
-      char[][] files = listdir(BARRAGE_DIR_NAME ~ "/" ~ dirName);
-      foreach (char[] fileName; files) {
-        if (getExt(fileName) != "xml")
+    string[] dirs = listdir(BARRAGE_DIR_NAME);
+    foreach (string dirName; dirs) {
+      string[] files = listdir(BARRAGE_DIR_NAME ~ "/" ~ dirName);
+      foreach (string fileName; files) {
+        if (fileName.extension != ".xml")
           continue;
         parser[dirName][fileName] = getInstance(dirName, fileName);
       }
     }
   }
```

## Converting value to string

D1 used to have `std.string.toString` to convert a value to a `char[]` value. This functionality was replaced by `std.conv.to!string`.

```diff
@@ -5,6 +5,7 @@
  */
 module abagames.tt.shot;
 
+private import std.conv;
 private import std.math;
 private import std.string;
 private import opengl;
@@ -179,7 +180,7 @@ public class Shot: Actor {
       else if (sc >= 2000)
         size = 0.7;
       size *= (1 + multiplier * 0.01f);
-      fl.set("X" ~ std.string.toString(multiplier), pos, size * pos.y,
+      fl.set("X" ~ to!string(multiplier), pos, size * pos.y,
              cast(int) (30 + multiplier * 0.3f));
     }
     if (chargeShot) {
```

## Passing strings to C

The usual way to pass strings to C seems to have been to just to use `std.string.toStringz`. However, back in D1 it used to return char* :

```
char* toStringz(char[] s);
```

This worked well for the C bindings but with D2, it now returns:

```
immutable(char)* toStringz(scope return string s) pure nothrow @trusted;
```

Again, the fix is quite straightforward. For example, the bindings weren't written with this in mind so they need fixing:

```diff
@@ -81,7 +81,7 @@ struct SDL_RWops {
 
 /* Functions to create SDL_RWops structures from various data sources */
 
-SDL_RWops * SDL_RWFromFile(char *file, char *mode);
+SDL_RWops * SDL_RWFromFile(const char *file, const char *mode);
```

## Simple substitution

* `typedef` → `alias`

```diff
@@ -28,10 +28,10 @@ import SDL_types;
 
 extern(C):
 
-typedef int (*_seek_func_t)(SDL_RWops *context, int offset, int whence);
-typedef int (*_read_func_t)(SDL_RWops *context, void *ptr, int size, int maxnum);
-typedef int (*_write_func_t)(SDL_RWops *context, void *ptr, int size, int num);
-typedef int (*_close_func_t)(SDL_RWops *context);
+alias int function(SDL_RWops *context, int offset, int whence) _seek_func_t;
+alias int function(SDL_RWops *context, void *ptr, int size, int maxnum) _read_func_t;
+alias int function(SDL_RWops *context, void *ptr, int size, int num) _write_func_t;
+alias int function(SDL_RWops *context) _close_func_t;
```

* `inout` → `ref`: this made sense for all instances where `inout` was used

```diff
@@ -59,7 +59,7 @@ public class PrefData {
 
   public this() {
     gradeData = new GradeData[Ship.GRADE_NUM];
-    foreach (inout GradeData gd; gradeData)
+    foreach (ref GradeData gd; gradeData)
       gd = new GradeData;
   }
```

* `auto T` → `auto`: it seems the original author specified auto along with the type which isn't allowed anymore

```diff
@@ -631,9 +631,9 @@ public class BulletShape: Drawable {
   }
 
   private void createSquareShape(bool wireShape) {
-    auto Vector3 cp = new Vector3;
-    auto Vector3[] p = new Vector3[4];
-    auto Vector3[] np = new Vector3[4];
+    auto cp = new Vector3;
+    auto p = new Vector3[4];
+    auto np = new Vector3[4];
     static const float[][][] POINT_DAT = [
       [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], ],
       [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], ],
@@ -642,9 +642,9 @@ public class BulletShape: Drawable {
       [[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1], ],
       [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1], ],
     ];
-    foreach (inout Vector3 ip; p)
+    foreach (ref Vector3 ip; p)
       ip = new Vector3;
-    foreach (inout Vector3 inp; np)
+    foreach (ref Vector3 inp; np)
       inp = new Vector3;
     for (int i = 0; i < 6; i++) {
       cp.x = cp.y = cp.z = 0;
```

* `getExt` → `.extension`: behaviour is different but it's easy enough to fix, it now includes the dot

```diff
@@ -44,10 +45,10 @@ public class SoundManager: abagames.util.sdl.sound.SoundManager {
 
   private static Music[] loadMusics() {
     Music[] musics;
-    char[][] files = listdir(Music.dir);
-    foreach (char[] fileName; files) {
-      char[] ext = getExt(fileName);
-      if (ext != "ogg" && ext != "wav")
+    string[] files = listdir(Music.dir);
+    foreach (string fileName; files) {
+      string ext = fileName.extension;
+      if (ext != ".ogg" && ext != ".wav")
         continue;
       Music music = new Music();
       music.load(fileName);
```

* `catch(Object)` → `catch(Throwable)`: you could throw any `Object` before, you have to use Throwable now

```diff
@@ -83,20 +84,20 @@ public int boot(char[][] args) {
   }
   try {
     mainLoop.loop();
-  } catch (Object o) {
+  } catch (Throwable t) {
     try {
       gameManager.saveErrorReplay();
-    } catch (Object o1) {}
-    throw o;
+    } catch (Throwable) {}
+    throw t;
   }
   return EXIT_SUCCESS;
 }
```

* `bit` → `SDL_bool`: the `bit` type was used back in D1, it behaved like a `bool` but used one bit instead so you could make bitfields easily, it was mostly used in the SDL bindings so I replaced it with `SDL_bool`

```diff
@@ -132,7 +133,7 @@ const uint SDL_SRCALPHA	= 0x00010000;	/* Blit uses source alpha blending */
 const uint SDL_PREALLOC	= 0x01000000;	/* Surface uses preallocated memory */
 
 /* Evaluates to true if the surface needs to be locked before access */
-bit SDL_MUSTLOCK(SDL_Surface *surface)
+SDL_bool SDL_MUSTLOCK(SDL_Surface *surface)
 {
 	return surface.offset || ((surface.flags &
 		(SDL_HWSURFACE | SDL_ASYNCBLIT | SDL_RLEACCEL)) != 0);
@@ -184,13 +185,7 @@ struct SDL_Overlay {
 	void /*private_yuvhwdata*/ *hwdata;
 
 	/* Special flags */
-	union
-	{
-		bit hw_overlay;
-		Uint32 _dummy;
-	}
-//		Uint32 hw_overlay :1;	/* Flag: This overlay hardware accelerated? */
-//		Uint32 UnusedBits :31;
+	Uint32 flags;
 }
```

## Phobos

The old code did use `std.stream`, from what I read this was deprecated in favor of splitting it into a more modular design. However, to transition old code someone rescued the deprecated code and made it into a DUB package called [`undead`](https://code.dlang.org/packages/undead).

This was very useful at the start to get the code to compile. However, I wanted to get rid of this dependency as it didn't feel right to keep old code instead of relying on the modern D equivalent. In D1, `std.stream.File.read` could read binary data into values. I've changed it to use `std.file.read` and `std.bitmanip.read`. It's also important to make sure you specify the endian, the D1 code was implementation-specific regarding the format of types other than byte sized ones. On Windows it was little-endian. That means replays and highscores saves are now compatible with the original executable!

```diff
@@ -5,7 +5,10 @@
  */
 module abagames.tt.replay;
 
-private import undead.stream;
+import std.file;
+import std.array;
+import std.bitmanip;
+
 private import abagames.util.sdl.recordablepad;
 
 /**
@@ -22,28 +25,24 @@ public class ReplayData {
  private:
 
   public void save(string fileName) {
-    auto fd = new File;
-    fd.create(dir ~ "/" ~ fileName);
-    fd.write(VERSION_NUM);
-    fd.write(level);
-    fd.write(grade);
-    fd.write(seed);
-    padRecord.save(fd);
-    fd.close();
+    auto buffer = appender!(ubyte[]);
+    buffer.append!(int, Endian.littleEndian)(VERSION_NUM);
+    buffer.append!(float, Endian.littleEndian)(level);
+    buffer.append!(int, Endian.littleEndian)(grade);
+    buffer.append!(long, Endian.littleEndian)(seed);
+    padRecord.save(buffer);
+    std.file.write(dir ~ "/" ~ fileName, buffer[]);
   }
 
   public void load(string fileName) {
-    auto fd = new File;
-    fd.open(dir ~ "/" ~ fileName);
-    int ver;
-    fd.read(ver);
+    auto buffer = cast(ubyte[])std.file.read(dir ~ "/" ~ fileName);
+    int ver = buffer.read!(int, Endian.littleEndian);
     if (ver != VERSION_NUM)
       throw new Error("Wrong version num");
-    fd.read(level);
-    fd.read(grade);
-    fd.read(seed);
+    level = buffer.read!(float, Endian.littleEndian);
+    grade = buffer.read!(int, Endian.littleEndian);
+    seed = buffer.read!(long, Endian.littleEndian);
     padRecord = new PadRecord;
-    padRecord.load(fd);
-    fd.close();
+    padRecord.load(buffer);
   }
 }
```

## Operator overloading

There is a `Vector` type in the codebase and naturally it used operator overloading. The syntax for this has changed though.

Before:

```d
  public void opAddAssign(Vector v) {
    x += v.x;
    y += v.y;
  }

  public void opSubAssign(Vector v) {
    x -= v.x;
    y -= v.y;
  }

  public void opMulAssign(float a) {
    x *= a;
    y *= a;
  }

  public void opDivAssign(float a) {
    x /= a;
    y /= a;
  }
```

After:

```d
  public void opOpAssign(string op)(Vector v) if (op == "+" || op == "-") {
    mixin("x" ~ op ~ "=v.x;");
    mixin("y" ~ op ~ "=v.y;");
  }

  public void opOpAssign(string op)(float a) if (op == "*" || op == "/") {
    mixin("x" ~ op ~ "=a;");
    mixin("y" ~ op ~ "=a;");
  }
```

This also shows the use of `mixin` to generate compile time code.

## Linking existing libraries

The game also came with import libraries for SDL, SDL_mixer, OpenGL and GLU and a static library for BulletML, a custom library used by the original developer to load bullet patterns from XML. Those came as .lib files but they couldn't be read by the Windows SDK tools I tried, `lib` or `dumpbin` couldn't read them. However, by luck those files are still supported by `dmd` and it managed to link with them.

The changes required are mostly related to how the extern code was defined. For now, because I was only trying to produce a Windows version, I replaced uses of `version(Win32)` (which is now `version(Windows)`) with just `extern(Windows)` unconditionally.

```diff
@@ -1,10 +1,4 @@
-version (Win32) {
-	private import std.c.windows.windows;
-	extern(Windows):
-}
-version (linux) {
-	extern(C):
-}
+extern(Windows):
 
 alias uint GLenum;
 alias ubyte GLboolean;
```

The BulletML binding used `extern(C)` and that worked the same so no changes were done.

## Wrapping up

With all of this, we've managed to compile a new Windows executable! What amazed me is how little language changes were necessary. The biggest change was related to Phobos and deprecated library features.

Running the game and seeing if it runs will be [part 2](/articles/torus-trooper-part2).
