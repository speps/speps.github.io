+++
tags = ["articles"]
date = "2020-07-19T22:23:30Z"
title = "Torus Trooper - Rebooting a 15 year-old game written in D - Part 2 Running"
+++

See also

* [Part 1 - Compiling a new executable](/articles/torus-trooper-part1)
* [Part 2 - Running the game for the first time](/articles/torus-trooper-part2)
* [Part 3 - Porting to WebAssembly](/articles/torus-trooper-part3)
* [Part 4 - Final steps](/articles/torus-trooper-part4)

From part 1, I stopped after successfully compiling a new executable, but will it run?

Answer is... NO!

Alright, let's dig into it!

## D1's `std.file.listdir`

```plaintext {linenos=false}
core.exception.RangeError@src\abagames\tt\barrage.d(110): Range violation
----------------
0x00448944 in _d_newarrayU
0x0041734B in void abagames.tt.barrage.Barrage.addBml(immutable(char)[], immutable(char)[], float, bool, float)
```

D1 used to have a function named `listdir` in Phobos. It can't be found in `undead` unfortunately. However, a quick search later here is what I found in the official docs:

![](/media/articles/tt3.png)

I thought "great!", thanks to the contributor who thought of exactly this case!

And then I found out that the crash above was because none of the XML files for BulletML were loading. A quick "debug print" session revealed that `listdir` only returned the list of files in a path. Is that the original behaviour? Let's check... it wasn't!

![](/media/articles/tt4.png)

Well the fix was easy at least:

```diff
@@ -8,7 +8,6 @@ string[] listdir(string pathname)
   import std.path;
 
   return std.file.dirEntries(pathname, SpanMode.shallow)
-    .filter!(a => a.isFile)
     .map!(a => std.path.baseName(a.name))
     .array;
 }
```

## Cyclic dependency between modules constructors/destructors

```plaintext {linenos=false}
object.Error@src\rt\minfo.d(371): Cyclic dependency between module constructors/destructors of abagames.tt.enemy and abagames.tt.barrage
abagames.tt.enemy* ->
abagames.tt.barrage* ->
abagames.tt.bulletactor ->
abagames.tt.enemy*
```

From what I could understand, this comes from the fact that when using static constructors in classes, the D runtime has no way of knowing if they have a dependency on each other. There are ways to disable the check if you're sure of your code ([see the thread I started there](https://forum.dlang.org/post/aizgmatfgcdmkckmpqzf@forum.dlang.org)). However, looking at the code, it seems like I could just replace the static constructors.

What it was used for before:

```d {hl_lines=["10-12"]}
public class Barrage {
 private:
  static Rand rand;
  ParserParam[] parserParam;
  Drawable shape, disapShape;
  bool longRange;
  int prevWait, postWait;
  bool noXReverse = false;

  public static this() {
    rand = new Rand;
  }

  public static void setRandSeed(long seed) {
    rand.setSeed(seed);
  }

  // ...
}
```

Because of the replay feature, none of the `Rand` instances were accessed without calling `setRandSeed`. So removing the constructor and initializing the static `rand` member on demand seemed appropriate:

```d {hl_lines=["11-13"]}
public class Barrage {
 private:
  static Rand rand;
  ParserParam[] parserParam;
  Drawable shape, disapShape;
  bool longRange;
  int prevWait, postWait;
  bool noXReverse = false;

  public static void setRandSeed(long seed) {
    if (!rand) {
      rand = new Rand;
    }
    rand.setSeed(seed);
  }

  // ...
}
```

No cyclic dependency error anymore!

## Code smell: using static state for non-static code

This isn't technically required to get the game to run but in my opinion it needed fixing to avoid problems later on. From investigating the previous item regarding `Rand`, I found that some code was setting the seed of a `static Rand rand` member in the constructor and then use it during the non-static call to `create` in that same class. This is usually a code smell as it means any future code would modify this behaviour. I agree it's unlikely in a single-threaded code that it has any impact but fixing it made me feel better about the state of the codebase.

Here is what I'm talking about:

```d {hl_lines=["16-18",49]}
public class ShipShape: Collidable, Drawable {
  mixin CollidableImpl;
 public:
  static enum Type {
    SMALL, MIDDLE, LARGE
  }
 private:
  static Rand rand;
  Structure[] structure;
  Vector _collision;
  DisplayList displayList;
  float[] rocketX;
  Vector rocketPos, fragmentPos;
  int color;
  
  public this(long randSeed) {
    rand.setSeed(randSeed);
  }

  public void close() {
    displayList.close();
  }

  public void setSeed(long n) {
    rand.setSeed(n);
  }

  public void create(int type, bool damaged = false) {
    switch (type) {
    case Type.SMALL:
      createSmallType(damaged);
      break;
    case Type.MIDDLE:
      createMiddleType(damaged);
      break;
    case Type.LARGE:
      createLargeType(damaged);
      break;
    }
    createDisplayList();
    rocketPos = new Vector;
    fragmentPos = new Vector;
  }

  // ...

  private void createSmallType(bool damaged = false) {
    _collision = new Vector;
    int shaftNum = 1 + rand.nextInt(2);
    // ...
  }

  // ...
}
```

And it's used like this:

```d
    long rs = rand.nextInt(99999);
    _shape = new ShipShape(rs);
    _shape.create(ShipShape.Type.SMALL);
    _damagedShape = new ShipShape(rs);
    _damagedShape.create(ShipShape.Type.SMALL, true);
```

I have fixed this by creating a local `Rand` instance inside `create` and pass that to the appropriate functions.

```d
  public void create(long seed, Type type, bool damaged = false) {
    auto localRand = new Rand;
    localRand.setSeed(seed);
    final switch (type) {
    case Type.SMALL:
      createSmallType(localRand, damaged);
      break;
      // ...
    }
    // ...
  }

  // ...

  private void createSmallType(Rand localRand, bool damaged = false) {
    _collision = new Vector;
    int shaftNum = 1 + localRand.nextInt(2);
    // ...
  }
```

```d
    long rs = rand.nextInt(99999);
    _shape = new ShipShape();
    _shape.create(rs, ShipShape.Type.SMALL);
    _damagedShape = new ShipShape();
    _damagedShape.create(rs, ShipShape.Type.SMALL, true);
```

## Associative arrays membership test

D1 had associative arrays that worked like C++'s `std::map` where you check for ownership by checking if there is a value. That got replaced with the `in` operator. It means a little more checking as you need to check both levels in case you have a multidimensional associative array but it's reasonable and probably clearer.

```diff
@@ -107,7 +107,7 @@ public class BarrageManager {
   }
 
   public static BulletMLParserTinyXML* getInstance(string dirName, string fileName) {
-    if (!parser[dirName][fileName]) {
+    if (!(dirName in parser) || !(fileName in parser[dirName])) {
       string barrageName = dirName ~ "/" ~ fileName;
       Logger.info("Load BulletML: " ~ barrageName);
       parser[dirName][fileName] = 
@@ -119,8 +119,10 @@ public class BarrageManager {
 
   public static BulletMLParserTinyXML*[] getInstanceList(string dirName) {
     BulletMLParserTinyXML*[] pl;
-    foreach (BulletMLParserTinyXML *p; parser[dirName]) {
-      pl ~= p;
+    if (dirName in parser) {
+      foreach (BulletMLParserTinyXML *p; parser[dirName]) {
+        pl ~= p;
+      }
     }
     return pl;
   }
```

## First gameplay!

I can now run the game! However, not for long, or at least it's not very entertaining.

{{< video src="/media/articles/tt_crash.mp4" >}}

Indeed it crashes whenever you destroy a big enemy... let's see the error:

```plaintext {linenos=false}
object.Error@(0): Access Violation
----------------
0x00425F9F in void abagames.tt.shape.ShipShape.addFragments(abagames.util.vector.Vector, abagames.tt.particle.ParticlePool) at src\abagames\tt\shape.d(317)
0x0041FFF5 in void abagames.tt.enemy.Enemy.destroyed() at src\abagames\tt\enemy.d(327)
0x0041FCE7 in void abagames.tt.enemy.Enemy.checkShotHit(abagames.util.vector.Vector, abagames.tt.shape.Collidable, abagames.tt.shot.Shot) at src\abagames\tt\enemy.d(297)
0x00420342 in void abagames.tt.enemy.EnemyPool.checkShotHit(abagames.util.vector.Vector, abagames.tt.shape.Collidable, abagames.tt.shot.Shot) at src\abagames\tt\enemy.d(394)
0x0042BF45 in void abagames.tt.shot.Shot.move()
```

Here is the fix:

```diff
--- a/src/abagames/tt/gamemanager.d
+++ b/src/abagames/tt/gamemanager.d
@@ -327,6 +327,7 @@ public class InGameState: GameState {
     Particle.setRandSeed(_seed);
     Shot.setRandSeed(_seed);
     SoundManager.setRandSeed(_seed);
+    ShipShape.setRandSeed(_seed);
     ship.start(_grade, _seed);
     stageManager.start(_level, _grade, _seed);
     initGameState();
@@ -592,6 +593,7 @@ public class TitleState: GameState {
     Particle.setRandSeed(_seed);
     Shot.setRandSeed(_seed);
     SoundManager.setRandSeed(_seed);
+    ShipShape.setRandSeed(_seed);
     ship.start(_grade, _seed);
     stageManager.start(_level, _grade, _seed);
     inGameState.initGameState();
diff --git a/src/abagames/tt/shape.d b/src/abagames/tt/shape.d
index b240208..95e8d33 100644
--- a/src/abagames/tt/shape.d
+++ b/src/abagames/tt/shape.d
@@ -70,7 +70,7 @@ public class ShipShape: Collidable, Drawable {
     displayList.close();
   }
 
-  public void setRandSeed(long n) {
+  public static void setRandSeed(long n) {
     if (!rand) {
       rand = new Rand;
     }
```

Of course, it's the [code smell I preemptively tried to fix earlier](#code-smell-using-static-state-for-non-static-code)...

I suspected my original fix might have had consequences down the line, at least this was easy to figure out. However, it shows you can't make assumptions about old code like this, everything has a purpose, don't fix it if it doesn't need fixing! My assumption here was that the `ShipShape` class had its `Rand` initialized the same way as the others but it hadn't...

## Wrapping up part 2

With this, the game is playable as far I could tell. Replays work, saves work and it behaves the same as the original executable!

However, the original only supplied a Windows executable. The original source code shows it might have worked on other systems but the libs for this weren't supplied. To be able to port the game to other platforms, the main issue I can think of would be the BulletML library which is a custom dynamic library.

I think I found the original C++ code for BulletML which I'll have a look at in [part 3](/articles/torus-trooper-part3) where I will try to make the codebase support multiple systems.
