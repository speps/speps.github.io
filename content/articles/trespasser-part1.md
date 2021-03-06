+++
tags = ["articles"]
date = "2021-01-21T13:31:42Z"
title = "Trespasser - C++ archeology and oxidization - Part 1 Loading Scene Data"
+++

This series will be about the video game Jurassic Park Trespasser. My goal is to be able to play the game by rewriting its source code in Rust based on the original C++ code base. Hopefully discovering interesting things along the way.

## Why this project?

Not sure why I like this game, I only played it properly once, never finished it but I was amazed by the technical aspects of it. Even with all the technical issues, I'm sure all the fans will agree that being chased by a clumsy raptor while trying to wrangle a rifle with one hand is an experience that only this game can give.

For this project, I decided to go back to Rust after trying it for Advent of Code a few years ago and failing to grasp its concepts in the short allocated time for the puzzles. This time around, I have time to read the documentation and understand what I'm doing wrong. It also helps that the tools have immensily improved like the LSP server for VS Code which is great for writing in a language you don't know well enough yet. The game was developed with compilers that didn't understand the standard very well yet and lots of workarounds had to be added.

For more background on the game, I would recommend these links:

* Fabien Sanglard's Source Code Review: https://fabiensanglard.net/trespasser/
* Joueur du Grenier: https://www.youtube.com/watch?v=WVE_yU38YVI
* Angry Video Game Nerd: https://www.youtube.com/watch?v=15pi8vrUx9c

In this part, we're going to explore some file formats with the goal of trying to display some of the geometry data from the game.

![](/media/articles/jpt1.png)

## Scenes

### SCN files

The `BE.SCN` file is the one we're going to start with. It's a natural start as it's the one referenced from the "New Game" menu in the game:

```cpp {hl_lines=[1,17]}
#define FIRST_LEVEL_NAME "BE.SCN"

// ...

    switch (pbutton->GetID())
    {
        case 1000:
            {
                int     iRet;

                g_CTPassGlobals.FreeMenuAudio();

                CVideoWnd   video(m_pUIMgr);

                video.Play("menu\\newgame");

                iRet = g_CTPassGlobals.LoadLevel(FIRST_LEVEL_NAME);

                if (iRet >= 0)
                {
                    EndUIWnd(2);
                }
                else
                {
                    DisplayLoadingFileError(iRet);
                }
            }
            break;
```

Following the `LoadLevel` call, we can find an interesting piece of code:

```cpp
			// Open a save file for reading.
			CSaveFile sf(str_filename, true, false);
			if (!sf.bValidFile)
				return -1;
```

A `CSaveFile` instance reads the header of a `.SCN` file and extracts the header which contains the list of `.GRF` files to load.

```cpp {hl_lines=[12]}
//*********************************************************************************************
//
struct SSaveHeader
//
// Data that every save game needs.
//
// Prefix: sh
//
{
public:
	int		iVersion;			// The version number of the save game.
	char	strGROFF[iNUM_GROFFS][iGROFF_STRLEN];		// The GROFF file for the level used in the saved game.
	bool	bBrief;				// Was this file saved as a brief save file?
	TSec	sCurrentTime;
	int		iAnimalVersion;		// Another version number, used for determining which animal and brain save formats to use
	TSec	sCurrentRealTime;	
	char	acSLOP[iSLOP_BYTES];
};
```

Note that we've actually been dealing with what's called a GROFF file structure in `.SCN` files. A GROFF structure is organized like this:

```cpp
// Definition of the file header structure.
struct SFileHeader
// Prefix: fh
{
	uint uMagicNumber;	// Magic number to identify a GROFF file.
	uint uFileSize;		// The actual size of the file.
	uint uSectionCount;	// Number of sections in the file.
	uint uSymtabEntries;	// Size of the symbol table.
	uint uSymtabSize;		// The size of the symbol table.
	uint uSymtabOffset;	// Offset to the start of the symbol table.
	uint uTimeStamp;		// Encoded date and time of GROFF file.
	uint uFlags;			// Field providing general file information.
	uint uVersionNumber;	// Version number of this file.

	uint uReserved[2];	// Reserved for future use. (Assume = 0)

	uint uCRC;			// CRC of the header.
} ;
```

We can see from this that we have a magic number (always `0x0ACEBABE`), a list of sections and a list of symbols. Each section has a symbol handle and data. To read the header `SSaveHeader` above, we need to read the `.SCN` file with the GROFF parser and then read the section named `Header` which contains the byte stream we're interested in. Replicating this in Rust gives us this output:

```plaintext
SaveFile {
    header: SaveHeader {
        version: 22,
        groff: [
            "M:\\Island\\Beach\\Candidate\\be.grf",
            "",
            "",
            "",
            "",
        ],
        brief: true,
        current_time: TSec(
            0.0,
        ),
        animal_version: 10,
        current_real_time: TSec(
            0.0,
        ),
        slop: [
            ...
        ],
    },
}
```

The number of GROFF files and the length of their names is hardcoded, in this case we'll just need to load `BE.GRF`. It is stored as a full path here, but the code looks for the base name in a few folders so it just works.

### GRF files

As expected `BE.GRF` is a GROFF file. However, when opening it in a hex editor, it doesn't start with `BE BA CE 0A`, but it starts with `SZDD` in ASCII. A quick search shows that it's the compression format used by the DOS utility named `COMPRESS.EXE` as well as the `LZOpen`/`LZRead` Windows APIs which is what the game used at runtime.

I used [this page](https://www.cabextract.org.uk/libmspack/doc/szdd_kwaj_format.html) as a reference to implement my own decompressor which implements the Rust `Read` trait and can be chained with the other parsers if needed. Here is the decompressor pseudo-code from the page:

```cpp
char window[4096];
int pos = 4096 - 16;
memset(window, 0x20, 4096); /* window initially full of spaces */
for (;;) {
    int control = GETBYTE();
    if (control == EOF) break; /* exit if no more to read */
    for (int cbit = 0x01; cbit & 0xFF; cbit <<= 1) {
        if (control & cbit) {
            /* literal */
            PUTBYTE(window[pos++] = GETBYTE());
        }
        else {
            /* match */
            int matchpos = GETBYTE();
            int matchlen = GETBYTE();
            matchpos |= (matchlen & 0xF0) << 4;
            matchlen = (matchlen & 0x0F) + 3;
            while (matchlen--) {
                PUTBYTE(window[pos++] = window[matchpos++]);
                pos &= 4095; matchpos &= 4095;
            }
        }
    }
}
```

The Rust code I've written follows the pseudo-code from the link above very closely and works perfectly to be able to decompress `.GRF` files:

```rust
    fn decompress(&mut self) -> io::Result<usize> {
        self.output_pos = 0;
        self.output_size = 0;
        if self.control_bit == 0 {
            self.control = match self.get_byte()? {
                Some(c) => c,
                None => return Ok(0),
            };
            self.control_bit = 0x1;
        }
        if self.control & self.control_bit != 0 {
            match self.get_byte()? {
                Some(byte) => {
                    self.window_buf[self.window_pos] = byte;
                    self.window_pos = (self.window_pos + 1) & (WINDOW_SIZE - 1);
                    self.output_byte(byte);
                },
                None => return Ok(0),
            }
        } else {
            let mut match_pos = match self.get_byte()? {
                Some(p) => p as usize,
                None => return Ok(0),
            };
            let mut match_len = match self.get_byte()? {
                Some(l) => l as usize,
                None => return Ok(0),
            };
            match_pos |= (match_len & 0xF0) << 4;
            match_len = (match_len & 0x0F) + 3;
            while match_len > 0 {
                let byte = self.window_buf[match_pos];
                self.window_buf[self.window_pos] = byte;
                self.window_pos = (self.window_pos + 1) & (WINDOW_SIZE - 1);
                self.output_byte(byte);
                match_pos = (match_pos + 1) & (WINDOW_SIZE - 1);
                match_len -= 1;
            }
        }
        self.control_bit <<= 1;
        return Ok(self.output_size);
    }
```

Because we already had GROFF parsing done for the `.SCN` files, we can now load compressed `.GRF` files using the same code because we implemented the `Read` trait.

`.GRF` files follow the GROFF structure but also contain additional info that points us to the right sections to read for example. We have a list of `CGroffObjectConfig` for example:

```cpp
//**********************************************************************************************
//
class CGroffObjectConfig
//
// Define a struct which specifies the position, rotation and scale of an object.
//
// Prefix: goc
//
//**************************************
{
public:
    TSectionHandle sehObject;           // The object definition section handle.
    TSymbolHandle  syhObjectName;       // The object symbol name handle.

    fvector3       fv3Position;         // The location of the object in the world.
    fvector3       fv3Rotation;         // The object orientation in Euler angles.
    float          fScale;              // The scaling factor for the object.

    /* Version 12 - GROFF file format changes. */
    CHandle        hAttributeHandle;    // A handle to the object value container.

    //******************************************************************************************
    //
    // Constructors and destructor.
    //

    CGroffObjectConfig();

    ~CGroffObjectConfig();
};
```

We can then look up an object by its name, load the data from its section and look up attributes in the value table. At this point, I had enough to be able to write this in Rust:

```rust
    let mut file = File::open("data/be.grf")?;
    let s = WorldLoader::from_reader(&mut file)?;
    for object in s.objects().iter() {
        if let Some(class_name) = s.lookup_attr(&object.name, Symbol::Class) {
            println!("{} {}", object.name, class_name.as_str());
        } else {
            println!("{} NULL", object.name);
        }
    }
```

Which outputs this:

```plaintext
TrnPlacement-00 TerrainPlacement
PSpasFrame03-00 CGun
Pdeserteagle-00 CGun
PS&W686-00 CGun
Trig_Amb_bbjg CLocationTrigger
Trig_Amb_bbkm CLocationTrigger
AnchorBrach-00 NULL
MLumberNatural-00 CMagnet
MLumberHoldNatural-00 CMagnet
SToolShackLumber-00 CInstance
FPTruck16-00 CInstance
AIBridgepiece-00 NULL
Trig_Start_DriftWood-00 CStartTrigger
TrnObj_OceanSound-00 CTerrainObj
...
```

I thought that each CTerrainObj would contain a mesh for each part of the terrain. However, that was before I remembered the part of Fabien Sanglard's article where he describes the terrain as using a wavelet transform to store heightfield data. I still wrote the code to load meshes so here is an example of a mesh:

![](/media/articles/jpt2.png)

I found while parsing meshes that they are polygonal meshes, some of them mostly composed of polygons instead of triangles. For example, this truck:

{{< figure src="/media/articles/jpt3.png" title="Triangles only" >}}

{{< figure src="/media/articles/jpt4.png" title="All polygons" >}}

## Textures

### PID files

These files are an "image directory". It contains just a list of descriptors for each of the textures used in a level. It looks like this from C++:

```cpp
//**********************************************************************************************
//
struct SDirectoryFileHeader
{
    uint32  u4Version;
    uint32  u4BumpMapBitDepth;          // number of bits in the bump maps ithin the swap file
    uint32  u4RasterChunkOffset;        // file offset from start of file to first Raster chunk
    uint32  u4RasterChunkCount;         // number of raster chunks
    uint32  u4PaletteOffset;            // offset to the palettes
    uint32  u4PaletteCount;             // number of palettes
    uint32  u4PageableOffset;           // Offset of the first byte that can be dynamically paged
    uint32  u4NonPageableCount;         // Number of bytes from the start of the swap file that 
                                        // cannot be paged. This can be less than u4PageableOffset
};

//**********************************************************************************************
//
struct SDirectoryFileChunk
{
    uint32  u4Size;                     // size of this chunk (offset to next chunk)
    uint32  u4VMOffset;                 // Pack file (Virtual memory block) offset
    uint32  u4Width;
    uint32  u4Height;                   // dimensions of the raster
    uint32  u4Stride;
    uint32  u4Bits;                     // bits per pixel pf the raster
    CColour clrConstCol;                // constant colour of the surface
    int     iTransparent;               // true for transparent
    int     iBumpMap;                   // texture is a bump map
    int     iOcclusion;                 // texture is an occlusion map
    uint32  u4Palette;                  // index into palette array of 0xffffffff for no palette
    uint64  u8HashValue;                // ID of the raster
};

//**********************************************************************************************
//
struct SDirectoryPaletteChunk
{
    uint32  u4Size;                     // size of this chunk (offset to next chunk)
    uint32  u4ColoursUsed;              // number of colours used in this palette
    uint32  u4HashValue;                // unique hash value for this palette
    CColour clr[1];                     // binary colour data in CColour format
    //
    // followed by u4ColoursUsed entries, this data must be reflected in the u4Size parameter.
    //
};
```

Some members point to offsets into the next file format we'll investigate. You'll also notice that textures can be paletted which is quite common for space saving in games back then. 

### SPZ files

These files contain the actual data for the textures. They're the biggest files in a level as you can see here:

![](/media/articles/jpt5.png)

And that's also a compressed format! The uncompressed size is about 54.5MB. However, the format is slightly different than the `SZDD` one used for `.GRF` files. First, the header is custom and only consists of the uncompressed size as a `u32`. Second, the algorithm is the same with just a few setup parameters that are different:

* The start position inside the decompression window is different
* The window buffer is initialized to 0 instead of space characters

Looking at the `SDirectoryFileChunk` structure above, the value in `u4VMOffset` is actually an offset from the beginning of the uncompressed data from the `.SPZ` files. Because compressed data can't be addressed this way, the original game would decompress the `.SPZ` files on demand and write out a `.SWP` file with the uncompressed data to the hard disk, and it's that one that would be read for each texture.

However, for us, it's now just easier to load and decompress the whole file in memory. We can then fetch the data using the `u4VMOffset` value into a `[u8]` in Rust.

The game supports [mipmaps](https://en.wikipedia.org/wiki/Mipmap) for textures. Each mipmap is hashed into a `u64` value and the bottom 32 bits are shared between all the mips.

{{< figure src="/media/articles/jpt9.png" title="Example of a mipmap chain extracted from the game (256x256 to 8x8, zoomed 4x)" >}}

## Terrain

The terrain data is constructed from a point cloud to start with, during authoring time exported to a `.TRR` file from 3DSMax. This is then compressed into a quad-tree with wavelet transform coefficients at each vertex. Vertices are shared between the quad tree nodes. For runtime, this data is saved into a `.WTD` file which has a small header and a list of every node, for each descendant node (a node is always subdivided into 4 at a time when required) a bit is stored to know if it has data and children to read.

The way this file is read is slightly different than other ones in that it loads the file data as an array of `u32`. Reads are done by specifying how many bits are needed, the twist is that these bits are read higher to lower from each `u32`. So, when looking at the file in a hex editor it doesn't make much sense as you are mixing little-endian `u32` values but their bytes are reversed. For example, writing 8 bytes from 0 to 7 gives `03 02 01 00 07 06 05 04` instead of the usual `00 01 02 03 04 05 06 07`. With more complicated data, it was confusing at first.

From the C++ code, here are some interesting bits regarding the quad-tree code:

```cpp
    //**********************************************************************************************
    //
    template<class TD, class TVT> class CQuadNodeBaseT
    //
    // Base class definition of a single node in the wavelet quad tree.
    //
    // Prefix: qnb
    //
    // Notes:
    //      This class is the base class for all quad node types. Note that even though this is a
    //      base class, none of the member functions are declared virtual. This is deliberate, so to
    //      avoid the vtbl size overhead. By passing the derived class' type as a template parameter
    //      and casting the 'this' pointer type to that of the derived class, it is still possible to
    //      overide certain functions in the derived class and get the expected behaviour.
    //
    //      Template type 'TD' defines the type of the derived class. The template type 'TVT'
    //      defines the vertex type.
    //
    //      The corner vertices and descendants of a node are maintained and numbered in a counter-
    //      clockwise order, starting with the bottom left corner. Similarly, the eight neighbours of
    //      a node are numbered in a counter-clockwise order, starting at the neighbouring node
    //      directly below.
    //
    //      Vertex 0 and descendant 0 are referred to as the 'base vertex' and 'base descendant' of
    //      a quad node, respectively. The odd numbered neighbours are referred to as the 'diagnonal'
    //      neigbours and the even numbered neighbours are referred to as the 'transverse' neighbours.
    //
    //      Within each quad node, there are three wavelet coefficients, located at the base vertex of
    //      descendants 1, 2 and 3. Therefore, a quad node can only have wavelet coeficients if it
    //      also has descendants.
    //                                      +-----+-----+-----+
    //          vt3           vt2           |     |     |     |
    //            +-----+-----+             |nghbr|nghbr|nghbr|
    //            |     |     |             |  5  |  4  |  3  |
    //            | dsc | dsc |             +-----+-----+-----+
    //            |  3  |  2  |             |     |     |     |
    //           wt2---wt1----+             |nghbr|     |nghbr|
    //            |     |     |             |  6  |     |  2  |
    //            | dsc | dsc |             +-----+-----+-----+
    //            |  0  |  1  |             |     |     |     |
    //            +----wt0----+             |nghbr|nghbr|nghbr|
    //          vt0           vt1           |  7  |  0  |  1  |
    //                                      +-----+-----+-----+
    //
    //**************************************
```

Here is a description of the wavelet coefficients:

```cpp
    //**********************************************************************************************
    //
    class CCoef
    //
    // Defines the coeficient type (used to represent wavelet and scaling coeficients) and the
    // integer 2D transform type (e.g. filter) for the wavelet transform.
    //
    // Prefix: cf
    //
    // Notes:
    //      This class implements a 0-disc 2D variation of the 1D 2-2 biorthogonal wavelet transform
    //      of Cohen, Daubechies and Feauveau using the lifting scheme.
    //
    //      This class defines an integer, perfect reconstruction wavelet transform. Conversions to
    //      and from this type require an appropriate (uniform) quantisation scalar.
    //
    //**************************************
    {
        //  ...
    };
```

To understand what this means, a look at Wikipedia gives us some clues:

From https://en.wikipedia.org/wiki/Cohen-Daubechies-Feauveau_wavelet#Numbering

> The same wavelet may therefore be referred to as "CDF 9/7" (based on the filter sizes) or "biorthogonal 4, 4" (based on the vanishing moments). Similarly, the same wavelet may therefore be referred to as "CDF 5/3" (based on the filter sizes) or "biorthogonal 2, 2" (based on the vanishing moments).

In our case, the transform is also called "CDF 5/3", and from the same Wikipedia page, we can confirm that it's a lossless transform:

> The JPEG 2000 compression standard uses the biorthogonal LeGall-Tabatabai (LGT) 5/3 wavelet (developed by D. Le Gall and Ali J. Tabatabai) for lossless compression and a CDF 9/7 wavelet for lossy compression.

I found a very interesting article and it helped me a lot to understand the basic theory. From https://georgemdallas.wordpress.com/2014/05/14/wavelets-4-dummies-signal-processing-fourier-transforms-and-heisenberg/

> These waves are limited in time, whereas sin() and cos() are not because they continue forever. When a signal is deconstructed into wavelets rather than sin() and cos() it is called a Wavelet Transform. The graph that can be analysed after the transform is in the wavelet domain, rather than the frequency domain.

> So when you use a Wavelet Transform the signal is deconstructed using the same wavelet at different scales, rather than the same sin() wave at different frequencies. As there are hundreds of different wavelets, there are hundreds of different transforms that are possible and therefore hundreds of different domains. However each domain has ‘scale’ on the x-axis rather than ‘frequency’, and provides better resolution in the time domain by being limited.

When searching for examples of a Discrete Wavelet Transform online, one of the reference materials often found is the [`dwt53.c` example from Grégoire Pau](https://gist.github.com/speps/572469989ac552df3d844a18a895bb15). I ported it to JavaScript to make this visualization below.

{{< canvas id="wavelet" w="1026" h="1282" src="/media/articles/jpt_wavelet.js" >}}

The main take away I got from this is that with each transform, the original signal gets compressed into approximation coefficients and detail coefficients. The approximation coefficients once the transform is applied enough times, will have only one value left. The detail coefficients end up with values that make them more compressible and you're able to compress the data more efficiently. For the terrain quad-tree nodes, that property is used to use less and less bits to store the wavelet coefficients depending on the subdivision level.

The Wikipedia example with an image shows that quite clearly:

[![](/media/articles/jpt6.png)](https://commons.wikimedia.org/wiki/File:Jpeg2000_2-level_wavelet_transform-lichtenstein.png)

After this interlude on wavelets, we can dig into parsing the `BE.WTD` file. Here is its header after parsing the file in Rust:

```plaintext {hl_lines=[5,6,7]}
TransformedDataHeader {
    version: 1001,
    num_quad_nodes: 17365,
    num_quad_vertices: 14490,
    coef_root: Coef(
        15898,
    ),
    conversions: Mapping {
        quad_extents: IRectangle {
            start: IVector2 {
                x: 0,
                y: 0,
            },
            size: IVector2 {
                x: 8192,
                y: 8192,
            },
        },
        world_extents: FRectangle {
            start: FVector2 {
                x: -2816.0,
                y: -1792.0,
            },
            size: FVector2 {
                x: 2048.0,
                y: 2048.0,
            },
        },
        quad_to_world: FTransLinear2 {
            x: FTransLinear {
                scale: 0.25,
                offset: -2816.0,
            },
            y: FTransLinear {
                scale: 0.25,
                offset: -1792.0,
            },
        },
        world_to_quad: FTransLinear2 {
            x: FTransLinear {
                scale: 4.0,
                offset: 11264.0,
            },
            y: FTransLinear {
                scale: 4.0,
                offset: 7168.0,
            },
        },
        world_to_coef: 292.69296,
        coef_to_world: 0.0034165496,
        coef_to_quad: 0.013666199,
    },
}
```

As you can see in the highlighted lines above, it contains the root coefficient, which is the one wavelet coefficient I was talking about. It also contains scales to transform to/from quad-tree coordinates and also to/from wavelet coefficients and world coordinates. That's how the world Z value of each terrain vertex is obtained mesh from the integer wavelet coefficients.

For ease of porting for now, I decided to subdivide the quad-tree to the maximum possible to get the full resolution of the tree. In the original code, it would compute the best subdivision factor for each quad depending on the desired pixel density. Once I get to porting gameplay features, I'll be able to reproduce that behaviour and query the player position, camera position, etc. to compute the original parameters to subdivide.

Finally, we can obtain a mesh of the fully subdivided terrain from the Rust code.

![](/media/articles/jpt7.png)
![](/media/articles/jpt8.png)

## Conclusion

We have been able to read all the scene files that were available to us:

* `BE.SCN`: references the `.GRF` files and contains some other basic scene information
* `BE.GRF`: contains most of the scene data like entities, meshes, animations, triggers, etc.
* `BE.PID`+`BE.SPZ`: contains all the texture data, used as streaming format that would be temporarily expanded on the hard disk
* `BE.WTD`: wavelet compressed terrain data stored as quad-tree

Just from these files, we are able to reproduce a lot of the scene data. Glueing this data together to produce textured meshes placed on the terrain will be the next step in this series. See you soon!