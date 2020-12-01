+++
date = "2020-11-26T22:07:27Z"
title = "Torus Trooper - Rebooting a 15 year-old game written in D - Part 4 Final steps"
+++

See also

* [Part 1 - Compiling a new executable](/articles/torus-trooper-part1)
* [Part 2 - Running the game for the first time](/articles/torus-trooper-part2)
* [Part 3 - Porting to WebAssembly](/articles/torus-trooper-part3)
* [Part 4 - Final steps](/articles/torus-trooper-part4)

## Hooking up keyboard input

Remember the interface we made earlier:

```d
public interface InputBackend {
  public void update();
  public int getDirState();
  public int getButtonState();
  public bool getExitState();
  public bool getPauseState();
}
```

Here is the implementation for WebAssembly:

```d
public class InputBackendWASM : InputBackend {
  uint state = 0;

  public override void update() {
    import wasm;
    state = wasm.inputState();
  }
  public override int getDirState() { return state & 0xF; }
  public override int getButtonState() { return state & 0x30; }
  public override bool getExitState() { return (state & 0x40) != 0; }
  public override bool getPauseState() { return (state & 0x80) != 0; }
}
```

Very simple, the good thing is that the original code already used masks for gameplay inputs. I just had to add another bit for exit and another one for pause.

From the JS side, we have `keydown`/`keyup` events that map the masks to the final value:

```js
function maskInput(code, enable) {
  const masks = {
    ArrowUp: 0x1,
    ArrowDown: 0x2,
    ArrowLeft: 0x4,
    ArrowRight: 0x8,
    ControlLeft: 0x10,
    ShiftLeft: 0x20,
    Escape: 0x40,
    KeyP: 0x80
  };
  if (code in masks) {
    const mask = masks[code];
    if (enable) {
      inputState |= mask;
    } else {
      inputState &= ~mask;
    }
  }
}

window.addEventListener("keydown", function(event) {
  if (!event.defaultPrevented) {
    maskInput(event.code, true);
  }
  event.preventDefault();
}, true);

window.addEventListener("keyup", function(event) {
  if (!event.defaultPrevented) {
    maskInput(event.code, false);
  }
  event.preventDefault();
}, true);
```

This works well enough, we can extend it later with more keys that map to the same input or make it customisable.

## fmodf

While doing the custom runtime, and because we're not using any C runtime stuff, it complained about an undefined `fmod` symbol at link time. It's a math function to compute the floating-point remainder of the operation x/y.

Unfortunately this doesn't have a JS `Math` equivalent like the other ones, but it works in JS with the `%` operator, so I just ended up using that:

```js
wasm_fmodf: function(x, y) { return x % y; }
```

## Tackling memory allocation

In the title screen, I found that approximately every 4800 frame there was an increase of the WASM memory buffer. It came from a `Vector3` allocation in `createTorusShape` used to draw multiple parts of the menu. I solved this one by using the [`scope` keyword in D](https://dlang.org/spec/attribute.html#scope), it means the allocation is limited to the scope:

```d
private void createTorusShape(int n) {
  scope Vector3 cp = new Vector3;
  cp.z = 0;
  scope Vector3 ringOfs = new Vector3;
  ...
}
```

However, during gameplay there are class instances that will live beyond the scope of a method and will need cleaning up once ununsed (eg. bullets or enemies). Ideally, we'd want the GC to take care of that for us but D doesn't really have a GC unless you use the `druntime` code. Best we can do do here is reuse memory as much as we can and identify which parts still need allocations.

This is an area that probably needs more attention as it currently leaks memory but it's still possible to play through the game multiple times before it's an issue. Help would be appreciated on a solution, possibly making a very basic GC would be good but an easier way would just be to make a pool of most things that can be reused (some classes already did that but only for game stuff).

## Resizing the game

I did the whole series so far using a fixed resolution of 800 x 600 but all the code to support resizing is available so let's try to handle that correctly.

I exposed a D method to WASM that will be called whenever the game needs to be resized, that tells the game what size the GL viewport is.

```js
function onResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  const ratio = 4.0 / 3.0;
  if (w < (h * ratio)) {
    h = Math.round(w / ratio);
  } else {
    w = Math.round(h * ratio);
  }
  canvas.style.left = (window.innerWidth / 2 - w / 2) + "px";
  canvas.style.top = (window.innerHeight / 2 - h / 2) + "px";
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = w;
  canvas.height = h;
  exports._resized(w, h);
}
window.addEventListener("resize", onResize, true);
```

That allows the game to retain its original 4:3 ratio. I found using a wider viewport results in camera issues that I'm not willing to fix at this point, it also stretches the text and doesn't look as good.

## Playing audio

Playing music and sound effects is an important part of the game's character. However, supporting SDL_Mixer in WebAssembly wasn't realistic. The best solution I found is to embed the sound files as `ubyte[]` and create bridge between JS and WASM that then uses the WebAudio API to play sounds.

```d
ubyte[] read(string path) {
  if (path == "sounds/chunks/boss_dest.wav") return cast(ubyte[]) import("sounds/chunks/boss_dest.wav");
  if (path == "sounds/chunks/charge.wav") return cast(ubyte[]) import("sounds/chunks/charge.wav");
  if (path == "sounds/chunks/charge_shot.wav") return cast(ubyte[]) import("sounds/chunks/charge_shot.wav");
  if (path == "sounds/chunks/extend.wav") return cast(ubyte[]) import("sounds/chunks/extend.wav");
  if (path == "sounds/chunks/hit.wav") return cast(ubyte[]) import("sounds/chunks/hit.wav");
  if (path == "sounds/chunks/middle_dest.wav") return cast(ubyte[]) import("sounds/chunks/middle_dest.wav");
  if (path == "sounds/chunks/myship_dest.wav") return cast(ubyte[]) import("sounds/chunks/myship_dest.wav");
  if (path == "sounds/chunks/shot.wav") return cast(ubyte[]) import("sounds/chunks/shot.wav");
  if (path == "sounds/chunks/small_dest.wav") return cast(ubyte[]) import("sounds/chunks/small_dest.wav");
  if (path == "sounds/chunks/timeup_beep.wav") return cast(ubyte[]) import("sounds/chunks/timeup_beep.wav");
  if (path == "sounds/musics/tt1.ogg") return cast(ubyte[]) import("sounds/musics/tt1.ogg");
  if (path == "sounds/musics/tt2.ogg") return cast(ubyte[]) import("sounds/musics/tt2.ogg");
  if (path == "sounds/musics/tt3.ogg") return cast(ubyte[]) import("sounds/musics/tt3.ogg");
  if (path == "sounds/musics/tt4.ogg") return cast(ubyte[]) import("sounds/musics/tt4.ogg");
  return null;
}
```

Then we add a few new WASM exposed methods:

```d
extern (C) {
  uint wasm_sound_load(const(char*) nameptr, size_t namelen, const(ubyte*) bufptr, size_t buflen);
  void wasm_sound_play(const(char*) nameptr, size_t namelen);
  void wasm_sound_fadeMusic(uint ms);
  void wasm_sound_haltMusic();
}
```

The main trick here was to make sure of 2 things:

1. We can play the same sound effect multiple times in a row
2. The music system needs to behave the same way as SDL_Mixer: only one music at once an, in a loop, and some way to fade before the next music is played

For 1, I found some StackOverflow answers that weren't satisfying until I discovered that `AudioContext.createBufferSource` can just be called every time we need to play a sound and we only need the `AudioBuffer` instances for each sound to be preloaded.

For 2, we can reuse the same flow for preloading but we also need to connect a `GainNode` to control the volume and store the sound instance so we can stop it when the next music starts. Conveniently, the `gain` property is an `AudioParam` instance which has a `linearRampToValueAtTime` method which we'll use to fade out the music.

```js
    // ...
    wasm_sound_play: function(nameptr, namelen) {
      const name = decoder.decode(new Uint8Array(memory.buffer, nameptr, namelen));
      const isMusic = name.startsWith("sounds/musics");
      const src = ac.createBufferSource();
      src.buffer = acData[name];
      if (isMusic) {
        if (acMusic) {
          acMusic.node.stop();
          acMusic.gain.disconnect();
          acMusic = null;
        }
        const gain = ac.createGain();
        src.connect(gain);
        src.loop = true;
        gain.connect(ac.destination);
        acMusic = { node: src, gain: gain };
      } else {
        src.connect(ac.destination);
      }
      src.start();
    },
    wasm_sound_fadeMusic: function(ms) {
      if (acMusic) {
        acMusic.gain.linearRampToValueAtTime(0, ac.currentTime + ms * 0.001);
      }
    },
    // ...
```

## Fix game/draw loop

On platforms where the game runs a bit slower, it looks a bit jarring as the whole gameplay slows down to a crawl. The usual way I fix this is by using the method from [Glenn Fiedler](https://gafferongames.com/post/fix_your_timestep/). It's similar to what the original game did but original had a sleep timer which isn't very practical and doesn't really accomodate for slow platforms.

The big change is splitting the update loop from the draw method. We can even do the game loop in JS to avoid having to pass frame times back and forth across the JS/WASM boundary.

It looks something like this:

```js
const targetFrameRate = 1000.0 / 60.0;
var frameAccumulator = 0.0;
var previousTimestamp = null;
function loop(timestamp) {
  if (previousTimestamp == null) {
    previousTimestamp = timestamp;
  } else {
    const diff = timestamp - previousTimestamp;
    previousTimestamp = timestamp;
    frameAccumulator += diff;
  }
  var numUpdates = 0;
  while (frameAccumulator >= targetFrameRate) {
    frameAccumulator -= targetFrameRate;
    if (!exports._update()) {
      numUpdates++;
    } else {
      break;
    }
  }
  if (numUpdates > 0) {
    exports._draw();
    numUpdates = 0;
  }
  requestAnimationFrame(loop);
}
```
## Loading screen

With adding the audio, the transfer of `tt.wasm` is becoming a problem on first visit (it's cached afterwards). Before embedding the audio, the automatic compression in HTTP was doing an amazing job. However, with `.ogg` files it's not as efficient as those are already compressed. At the time of writing, it's a 5.49 MB transferred for a 7.66 MB total file size once decompressed. We'll need to find a solution and show a progress bar during loading.

For this, I had the idea of using an embedded SVG document inside the index page to avoid multiple transfers and have a way of displaying the controls while it's loading. To get the SVG, I did a debug output of some of the vector art from the game into a SVG path syntax (for `d` attribute of a `path` element) and included that into the index page. That means the title is now visible even before we finish loading the WASM binary.

With this, because all the static content is included in the index page, we can still show something if JavaScript is disabled. Then, if it's enabled, we can test for browser features we need and for optional ones. A message is displayed accordingly.

If everything works, we can use the Fetch API to have an accurate progress bar of how the WASM download is doing. If compression is enabled server side the `Content-Length` header from the HTTP request isn't accurate is it's the compressed size. The solution I used here is to hardcode the WASM size in the JS code as it's unlikely to change drastically anyway.

{{< video src="/media/articles/tt_loading.mp4" >}}

## Saving local scores/replays

## Mobile support

### Fullscreen mode

### On screen controls

## Wrapping up the series


