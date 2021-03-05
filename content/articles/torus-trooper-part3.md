+++
tags = ["articles"]
date = "2020-07-26T21:36:11Z"
title = "Torus Trooper - Rebooting a 15 year-old game written in D - Part 3 WebAssembly"
+++

See also

* [Part 1 - Compiling a new executable](/articles/torus-trooper-part1)
* [Part 2 - Running the game for the first time](/articles/torus-trooper-part2)
* [Part 3 - Porting to WebAssembly](/articles/torus-trooper-part3)
* [Part 4 - Final steps](/articles/torus-trooper-part4)

## Removing GLU dependency

GLU is the OpenGL Utility library from SGI. It's an API with helpful functions that work along with OpenGL. In our project, it's used to create a view matrix using `gluLookAt`. So the fix here is just to copy the code for that method from the original SGI code which has a permissive licence, i.e. the SGI licence.

## BulletML

BulletML is a code library used by Kenta Cho, the original developer of the project. It's used in a lot of his projects and handles the behaviour of bullets. It's based on XML and is written in C++ and compiled to .dll/.lib for linking into the final executable.

![](/media/articles/tt6.png)

### Finding the original code

The main website for libBulletML has a download for a C++ library and a D port of it. I first tried the C++ library, it looked the closest from the imported API called from the game's D code.

I could even open the original Visual C++ project in Visual Studio 2019 without issues. I then modified it to export a similar C API and compiled it to a DLL. I could now swap the original `bulletml.dll` with my own and it worked exactly as expected at runtime so I knew the C++ implementation was the one used in the original game code.

### Reading the original code

The original C++ BulletML code was an interesting read. It used TinyXML to parse XML, which is an old C++ library that came as a .h/.cpp files for easy integration. The BulletML data also allows expressions that specify the behaviour of the bullets. This expression parser was written using a YACC grammar, from what I could tell it's close to the example grammar from YACC modified to allow for defining variables.

The main part of the original code is actually the runner code. The runner is what evaluates the behaviours defined in XML (and parsed into runtime structures).

### Porting to D

Even though there was a D port of BulletML, it seemed like I would have an easier time just porting the original behaviour of the C++ library as I had no way of knowing if the D port of BulletML would behave the same in the game itself. The D port seemed overly complicated as well.

Most of the code would easily be ported without issues but getting the expression parsing and XML parsing parts were the most challenging.

#### Expression Parsing

Instead of reusing the YACC grammar which mixes C code with the grammar, and creates some messy generated code, I decided to look into what's recommended nowadays for parsing. I ended up with a simpler lexer inspired by [Lexical Scanning in Go](https://talks.golang.org/2011/lex.slide) and mixed it with a simple Pratt parser inspired by [Pratt Parsers: Expression Parsing Made Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/).

That worked quite well and the whole parser was smaller and clearer than the original C++ code.

#### XML Parsing

At first, I just used [dxml](https://code.dlang.org/packages/dxml) and it was fine. However, my goal is to port the game to WebAssembly and that didn't play well at all with a custom runtime. I also tried `std.xml` but it was similar and it's going to be deprecated soon.

Finally, I decided I would just reuse the lexer base code from the expression parser and made it output XML events like SAX parser but all at once as an array. I only needed to parse XML files, and they were quite simple anyway so it worked out perfectly.

I was finally able to load the BulletML XML files without any dependencies, no external DUB package or .dll/.lib from the original code.

## Modern OpenGL

The code base uses immediate mode OpenGL commands like `glBegin`/`glVertex`/`glEnd`. This needs modernizing as those APIs have been deprecated for some time now in favor of vertex/index buffers and a programmable pipeline.

### Emulated immediate mode

To avoid having to change a lot of the gameplay/rendering code, I decided to make a simple replacement interface for most of OpenGL deprecated calls. The way this works is by mirroring what the old API would do under the hood and map it to the more modern API.

Here is what the interface looks like:

```d
static class GL
{
  alias Matrix = float[16];
  static const Matrix Identity = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
  enum MatrixMode {
    ModelView,
    Projection,
  }

  static void normalize(ref float[3] v) {
    float r;

    r = sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    if (r == 0.0) return;

    v[0] /= r;
    v[1] /= r;
    v[2] /= r;
  }

  static void cross(float[3] v1, float[3] v2, out float[3] result) {
    result[0] = v1[1]*v2[2] - v1[2]*v2[1];
    result[1] = v1[2]*v2[0] - v1[0]*v2[2];
    result[2] = v1[0]*v2[1] - v1[1]*v2[0];
  }

  static void init() {}

  static void matrixMode(MatrixMode mode) {
    if (mode == MatrixMode.Projection) {
      glMatrixMode(GL_PROJECTION);
    } else if (mode == MatrixMode.ModelView) {
      glMatrixMode(GL_MODELVIEW);
    }
  }

  static void loadIdentity() {
    glLoadIdentity();
  }

  static void pushMatrix() {
    glPushMatrix();
  }

  static void popMatrix() {
    glPopMatrix();
  }

  static void multMatrix(Matrix m) {
    glMultMatrixf(m.ptr);
  }

  static void translate(float x, float y, float z) {
    glTranslatef(x, y, z);
  }

  static void translate(Vector3 v) {
    translate(v.x, v.y, v.z);
  }

  static void rotate(float angle, float x, float y, float z) {
    glRotatef(angle, x, y, z);
  }

  static void scale(float x, float y, float z) {
    glScalef(x, y, z);
  }

  static void ortho(float left, float right, float bottom, float top, float near, float far) {
    glOrtho(left, right, bottom, top, near, far);
  }

  static void frustum(float left, float right, float bottom, float top, float near, float far) {
    glFrustum(left, right, bottom, top, near, far);
  }

  static void lookAt(float eyex, float eyey, float eyez, float centerx, float centery, float centerz, float upx, float upy, float upz) {
    int i;
    float[3] forward, side, up;

    forward[0] = centerx - eyex;
    forward[1] = centery - eyey;
    forward[2] = centerz - eyez;

    up[0] = upx;
    up[1] = upy;
    up[2] = upz;

    normalize(forward);

    /* Side = forward x up */
    cross(forward, up, side);
    normalize(side);

    /* Recompute up as: up = side x forward */
    cross(side, forward, up);

    Matrix m = Identity[];

    m[0+4*0] = side[0];
    m[0+4*1] = side[1];
    m[0+4*2] = side[2];

    m[1+4*0] = up[0];
    m[1+4*1] = up[1];
    m[1+4*2] = up[2];

    m[2+4*0] = -forward[0];
    m[2+4*1] = -forward[1];
    m[2+4*2] = -forward[2];

    GL.multMatrix(m);
    GL.translate(-eyex, -eyey, -eyez);
  }

  static void vertex(float x, float y, float z) {
    glVertex3f(x, y, z);
  }

  static void vertex(Vector3 v) {
    vertex(v.x, v.y, v.z);
  }

  static void color(float r, float g, float b, float a) {
    glColor4f(r, g, b, a);
  }

  static void viewport(int left, int right, int width, int height) {
    glViewport(left, right, width, height);
  }

  static void clearColor(float r, float g, float b, float a) {
    glClearColor(r, g, b, a);
  }

  static void clear(GLbitfield flag) {
    glClear(flag);
  }

  static void blendFunc(GLenum src, GLenum dest) {
    glBlendFunc(src, dest);
  }

  static void enable(GLenum flag) {
    glEnable(flag);
  }

  static void disable(GLenum flag) {
    glDisable(flag);
  }

  static void lineWidth(float w) {
    glLineWidth(w);
  }

  static void frameStart() {}
  static void frameEnd() {}

  static void begin(int primitiveType) {
    glBegin(primitiveType);
  }

  static void end() {
    glEnd();
  }
}
```

Using this, all OpenGL calls now go through these methods. From here, I'll need to:

* Record what `glBegin`/`glVertex`/`glEnd` receive
* Record the matrix stack
* Draw the primitives with a shader that takes the current model-view/projection matrix

Doing it this way works but has some drawbacks:

* It's **SLOW**, this is because it relies on uploading the primitives to the GPU every time `glEnd` is called
* Creating a more recent OpenGL context than 1.1 will not support the `GL_QUADS` primitive and skip it

However, it's not too difficult once this is in place:

* Apply the model-view matrix from the stack when you record the calls to `glVertex`, that's so one buffer can store vertices from multiple `glBegin`/`glEnd` pairs
* When recording vertices, map the primitive type to triangles and lines buckets, that helps with performance as I can push more of the same data into the buffers. We map `GL_TRIANGLE_STRIP` to normal triangles, and we can also support `GL_QUADS` quite easily. I also map `GL_LINE_STRIP`/`GL_LINE_LOOP` to `GL_LINES`.
* Render the primitives recorded so far whenever the state changes like `glBlendFunc` or the projection matrix changes

It's now a lot faster as I don't have to upload to the GPU as often and the number of draw calls is significantly lower. However, I now have to do some matrix math CPU side in our own code. It's back to the steady 60 FPS we had back in immediate mode but the code now conforms to a more recent OpenGL API closer to what WebGL would expect.

Note that to simplify the porting effort, it's usually good to skip parts that will be an issue. Removing some code paths with less used features helps to reduce the amount of code that needs porting. For example, the title screen has a logo of the game loaded from a `.bmp` file. However, it also features text displayed as LCD style letters so I replaced the image with those letters and now nothing has to load images, removing some OpenGL, SDL and IO code.

## Abstracting platform dependencies

One of the things that helps with cross platform development is some kind of abstraction layer to isolate the game code from low level code like rendering, input, audio, etc.

### Input

The `Pad` class handles reading keyboard values using `SDL_GetKeyboardState`. It's also inherited by `RecordablePad` which handles doing the replays by recording the inputs. This design is okay but to be able to replace the backend of how inputs are fed into it, I modified `Pad` to receive a `InputBackend` interface like this:

```d
public interface InputBackend {
  public void update();
  public int getDirState();
  public int getButtonState();
  public bool getExitState();
  public bool getPauseState();
}
```

Then, the code from `Pad` can now be moved into `InputBackendSDL`:

```d
public class InputBackendSDL : InputBackend {
private:
  Uint8 *keys;

  public override void update() {
    keys = SDL_GetKeyboardState(null);
  }

  public override int getDirState() {
    int dir = 0;
    if (keys[SDL_SCANCODE_RIGHT] == SDL_PRESSED || keys[SDL_SCANCODE_KP_6] == SDL_PRESSED || keys[SDL_SCANCODE_D] == SDL_PRESSED)
      dir |= Input.Dir.RIGHT;
    if (keys[SDL_SCANCODE_LEFT] == SDL_PRESSED || keys[SDL_SCANCODE_KP_4] == SDL_PRESSED || keys[SDL_SCANCODE_A] == SDL_PRESSED)
      dir |= Input.Dir.LEFT;
    if (keys[SDL_SCANCODE_DOWN] == SDL_PRESSED || keys[SDL_SCANCODE_KP_2] == SDL_PRESSED || keys[SDL_SCANCODE_S] == SDL_PRESSED)
      dir |= Input.Dir.DOWN;
    if (keys[SDL_SCANCODE_UP] == SDL_PRESSED ||  keys[SDL_SCANCODE_KP_8] == SDL_PRESSED || keys[SDL_SCANCODE_W] == SDL_PRESSED)
      dir |= Input.Dir.UP;
    return dir;
  }

  public override int getButtonState() {
    int btn = 0;
    if (keys[SDL_SCANCODE_Z] == SDL_PRESSED || keys[SDL_SCANCODE_PERIOD] == SDL_PRESSED || keys[SDL_SCANCODE_LCTRL] == SDL_PRESSED)
      btn |= Input.Button.A;
    if (keys[SDL_SCANCODE_X] == SDL_PRESSED || keys[SDL_SCANCODE_SLASH] == SDL_PRESSED || keys[SDL_SCANCODE_LALT] == SDL_PRESSED || keys[SDL_SCANCODE_LSHIFT] == SDL_PRESSED)
      btn |= Input.Button.B;
    return btn;
  }

  public override bool getExitState() {
    return keys[SDL_SCANCODE_ESCAPE] == SDL_PRESSED;
  }

  public override bool getPauseState() {
    return keys[SDL_SCANCODE_P] == SDL_PRESSED;
  }
}
```

And an instance of `InputBackendSDL` passed where the `RecordablePad` instance is created.

Note again that I've simplified the code to not support reversing the buttons and removed joystick support. These can be added later in a better way. I feel like it's important to get some progress instead of being stuck on details for now.

### Window management

SDL is used for initializing the window and creating the OpenGL context. It's not difficult to isolate this the original code. Most of the SDL calls are done in the `Screen3D` class. For WebAssembly, there's no need for a window as render directly to a HTML5 canvas element, so we'll stub most methods here.

### File system

Given the small amount of files required by the game to be loaded on startup (and remember I removed images from that original list), it's possible to embed these files. D has a handy feature equivalent to C's `#include`. It's using the call `import(fileName)` to load a file to a byte array which is embedded into the executable.

```d
string readText(string path) {
  if (path == "barrage/basic/straight.xml") return import("barrage/basic/straight.xml");
  if (path == "barrage/middle/35way.xml") return import("barrage/middle/35way.xml");
  if (path == "barrage/middle/alt_nway.xml") return import("barrage/middle/alt_nway.xml");
  if (path == "barrage/middle/alt_sideshot.xml") return import("barrage/middle/alt_sideshot.xml");
  if (path == "barrage/middle/backword_spread.xml") return import("barrage/middle/backword_spread.xml");
  if (path == "barrage/middle/clow_rocket.xml") return import("barrage/middle/clow_rocket.xml");
  if (path == "barrage/middle/diamondnway.xml") return import("barrage/middle/diamondnway.xml");
  if (path == "barrage/middle/fast_aim.xml") return import("barrage/middle/fast_aim.xml");
  if (path == "barrage/middle/forward_1way.xml") return import("barrage/middle/forward_1way.xml");
  if (path == "barrage/middle/grow.xml") return import("barrage/middle/grow.xml");
  if (path == "barrage/middle/grow3way.xml") return import("barrage/middle/grow3way.xml");
  if (path == "barrage/middle/nway.xml") return import("barrage/middle/nway.xml");
  if (path == "barrage/middle/random_fire.xml") return import("barrage/middle/random_fire.xml");
  if (path == "barrage/middle/spread2blt.xml") return import("barrage/middle/spread2blt.xml");
  if (path == "barrage/middle/squirt.xml") return import("barrage/middle/squirt.xml");
  if (path == "barrage/morph/0to1.xml") return import("barrage/morph/0to1.xml");
  if (path == "barrage/morph/accel.xml") return import("barrage/morph/accel.xml");
  if (path == "barrage/morph/accelshot.xml") return import("barrage/morph/accelshot.xml");
  if (path == "barrage/morph/bar.xml") return import("barrage/morph/bar.xml");
  if (path == "barrage/morph/divide.xml") return import("barrage/morph/divide.xml");
  if (path == "barrage/morph/fast.xml") return import("barrage/morph/fast.xml");
  if (path == "barrage/morph/fire_slowshot.xml") return import("barrage/morph/fire_slowshot.xml");
  if (path == "barrage/morph/slide.xml") return import("barrage/morph/slide.xml");
  if (path == "barrage/morph/slowdown.xml") return import("barrage/morph/slowdown.xml");
  if (path == "barrage/morph/speed_rnd.xml") return import("barrage/morph/speed_rnd.xml");
  if (path == "barrage/morph/twin.xml") return import("barrage/morph/twin.xml");
  if (path == "barrage/morph/wedge_half.xml") return import("barrage/morph/wedge_half.xml");
  if (path == "barrage/morph/wide.xml") return import("barrage/morph/wide.xml");
  assert(false, "unknown file: " ~ path);
}
```

It's not clever in any way but it works!

For now, I'll skip file writing as it's only for replays and scores. However, I could extend this to save to local storage in JS and even possibly have online scoreboards for the game.

### Audio

The original code just used SDL_mixer, which has a D binding of course but I made it so no audio is loaded for the WebAssembly version. It'll probably have to handled partway between JS and WASM here as it would wasteful to send byte arrays to JS from WASM just to play audio when the browser could do the heavy lifting. As I don't know yet how to handle this I'll skip audio for WASM for now.

## D's Runtime and Phobos

There are options to compile the runtime to WebAssembly like [Spasm by Sebastian Koppe](https://github.com/skoppe/spasm). And there are WebAssembly examples which use a custom runtime like [WebAssembly example by Adam D. Ruppe](http://webassembly.arsdnet.net/). I tried the first option but couldn't every part running smoothly. Given that I had a small-ish codebase, I thought it would be possible to reuse some of the code from Adam and extend it until it works.

Here are some steps along the way:

* Figure out internals of the runtime by looking at LDC's source code
* Asking a lot of questions on the forums to understand some strange behaviours (like why `TypeInfo_Array`'s `base` member is null or finding out `_aaInX` has possibly a compiler bug in LDC)
* Understand the way array append/concat works internally
* Replace `std` methods with my own fake ones (like `std.file.read` or adapting `listdir` to return static list of folders)

While doing this I found it helpful to have a version of the game that ran with all the same code as what the WebAssembly build would be but as an x86 executable so I could debug it in Visual Studio with Visual D. That helped a lot, also because I would sometimes get different results between the two.

## WebGL / WebAssembly

After I got everything to compile, I had to sort out the WebAssembly/JavaScript side. That wasn't too hard but I only found at this point that I wasn't exporting symbols apart from `_start`. That was easily solved by adding `--export=dynamic`. I took care of only using WebGL 1.0 compatible calls in the new OpenGL code I wrote so the interface for this wasn't too difficult, the only issue I had was with converting IDs used by OpenGL to/from JS Objects used by WebGL. I got confused by `getUniformLocation` which returns an object but `getAttribLocation` returns an index.

I will also note that I didn't want to implement my own math functions so those are redirected to the JS Math ones and it works for now.

## Wrapping up part 3

After weeks of effort, the title screen finally showed up in a web browser!

{{< video src="/media/articles/tt_wasm_title.mp4" >}}

There are still lots of things that need to be done like hooking up the input, checking that the game mode works, playing the audio (the background music is great as well) and possibly saving the scores and replays, that'll be covered in [part 4](/articles/torus-trooper-part4).
