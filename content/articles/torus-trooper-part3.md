+++
date = "2020-07-26T21:36:11Z"
title = "Torus Trooper - Rebooting a 15 year-old game written in D - Part 3 WebAssembly"
+++

See also

* [Part 1 - Compiling a new executable](/articles/torus-trooper-part1)
* [Part 2 - Running the game for the first time](/articles/torus-trooper-part2)
* [Part 3 - Porting to WebAssembly](/articles/torus-trooper-part3)

## Removing GLU dependency

GLU is the OpenGL Utility library from SGI. It's an API with helpful functions that work along with OpenGL. In our project, it's used to create a view matrix using `gluLookAt`. So the fix here is just to copy the code for that method from the original SGI code which has a permissive licence, i.e. the SGI licence.

## Some Windows specific code

It seems Windows wasn't supported as well in the past in DMD so there was a specific `main` function that did the right plumbing:

```d
version (Win32_release) {
  // Boot as the Windows executable.
  import std.c.windows.windows;
  import std.string;

  extern (C) void gc_init();
  extern (C) void gc_term();
  extern (C) void _minit();
  extern (C) void _moduleCtor();

  extern (Windows)
  public int WinMain(HINSTANCE hInstance,
             HINSTANCE hPrevInstance,
             LPSTR lpCmdLine,
             int nCmdShow) {
    int result;
    gc_init();
    _minit();
    try {
      _moduleCtor();
      char[4096] exe;
      GetModuleFileNameA(null, exe, 4096);
      char[][1] prog;
      prog[0] = std.string.toString(exe);
      result = boot(prog ~ std.string.split(std.string.toString(lpCmdLine)));
    } catch (Object o) {
      Logger.error("Exception: " ~ o.toString());
      result = EXIT_FAILURE;
    }
    gc_term();
    return result;
  }
} else {
  // Boot as the general executable.
  public int main(string[] args) {
    return boot(args);
  }
}
```

This isn't necessary anymore and was just removed.

## BulletML

BulletML is a code library used by Kenta Cho, the original developer of the project. It's used in a lot of his projects and handles the behaviour of bullets. It's based on XML and is written in C++ and compiled to .dll/.lib for linking into the final executable.

### Finding the original code

The main website for libBulletML has a download for a C++ library and a D port of it. I first tried the C++ library, it looked the closest from the imported API called from the game's D code.

I could even open the original Visual C++ project in Visual Studio 2019 without issues. I then modified it to export a similar C API and compiled it to a DLL. I could now swap the original `bulletml.dll` with my own and it worked exactly as expected at runtime so I knew the C++ implementation was the one used in the original game code.

### Reading the original code

The original C++ BulletML code was an interesting read. It used TinyXML to parse XML, which is an old C++ library that came as a .cpp/.h files for easy integration. The BulletML data also allows expressions that specify the behaviour of the bullets. This expression parser was written using a YACC grammar, most likely the example grammar from YACC modified to allow for defining variables.

The main part of the original code is actually the runner code. The runner is what evaluates the behaviours defined in XML (and parsed into runtime structures).

### Porting to D

Even though there was a D port of BulletML, it seemed like I would have an easier just porting the original behaviour of the C++ library as I had no way of knowing if the D port of BulletML would behave the same in the game itself.

Most of the code would easily be ported without issues but getting the expression parsing and XML parsing parts were the most challenging.

#### Expression Parsing

Instead of reusing the YACC grammar which mixes C code with the grammar, and creates some messy generated code, I decided to look into what's recommended nowadays for parsing. I ended up with a simpler lexer inspired by [Lexical Scanning in Go](https://talks.golang.org/2011/lex.slide) and mixed it with a simple Pratt parser inspired by [Pratt Parsers: Expression Parsing Made Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/).

That worked quite well and the whole parser was smaller and clearer than the original C++ code.

#### XML Parsing

At first, I just used [dxml](https://code.dlang.org/packages/dxml) and it was fine. However, my final goal is to port the game to WebAssembly and that didn't play well at all with a custom runtime. I also tried `std.xml` but it was similar. For example, implementing exceptions would have been quite difficult.

Finally, I decided I would just reuse the lexer base code from the expression parser and made it output XML events like SAX parser but all at once. I only needed parsing XML files, and they were quite simple anyway so it worked out perfectly.

I was finally able to load the BulletML XML files without any dependencies, no DUB package or .dll/.lib from the original code.

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

Using this, all OpenGL calls now go through these methods. From here, you'll need to:

* Record what `glBegin`/`glVertex`/`glEnd` receive
* Record the matrix stack
* Draw the primitives with a shader that takes the current model-view/projection matrix

Doing it this way works but has some drawbacks:

* It's **SLOW**, this is because it relies on uploading the primitives to the GPU every time `glEnd` is called
* Creating a more recent OpenGL context than 1.1 will not support the `GL_QUADS` primitive and skip it

However, it's not too difficult once this is in place:

* Apply the model-view matrix from the stack when you record the calls to `glVertex`, that's so one buffer can store vertices from multiple `glBegin`/`glEnd` pairs
* When recording vertices, map the primitive type to triangles and lines only, that helps with performance as we can push more of the same data into the buffers. We map GL_TRIANGLE_STRIP to normal triangles, and we can also support GL_QUADS quite easily
* Render the primitives recorded so far whenever the state changes like `glBlendFunc` or the projection matrix changes

It's now a lot faster as we don't have to upload to the GPU as often and the number of draw calls is significantly lower. However, we now have to do some matrix math CPU side in our own code. We're back to the steady 60 FPS we had back in immediate mode but the code now conforms to a more recent OpenGL API closer to what WebGL would expect.

Note that to simplify the porting effort, it's usually good to skip parts that will be an issue. Removing some code paths with less used features helps to reduce the amount of code that needs porting. For example, the title screen has a logo of the game loaded from a `.bmp` file. However, it also features text displayed as LCD style letters so I replaced the image with those letters and now nothing has to load images, removing OpenGL, SDL and IO code.

## Abstracting platform dependencies

One of the things that helps with cross platform development is some kind of abstraction layer to isolate the game code from low level code like rendering, input, audio, etc.