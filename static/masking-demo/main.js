const cubeDefs = [
  { x: 2.5, z: -2.0, rotSpeed: 0.4, bobSpeed: 0.8, bobAmplitude: 1.5 },
  { x: 2.5, z: 1.5, rotSpeed: 0.6, bobSpeed: 1.2, bobAmplitude: 1.0 },
  { x: -2.0, z: -2.0, rotSpeed: -0.3, bobSpeed: 0.5, bobAmplitude: 2.0 },
  { x: -1.5, z: 1.5, rotSpeed: 0.5, bobSpeed: 0.9, bobAmplitude: 0.4 },
];
const CUBE_COUNT = cubeDefs.length;

const WAVE_FREQ = 1.333;
const WAVE_AMP = 0.3;
const WAVE_Q = 2.0;
const WAVE_SPEED = 0.8;
const WAVE_DIR = [-1.0 / Math.SQRT2, 1.0 / Math.SQRT2];

const settings = { showWireframe: true, showBoatMesh: true, showBoatMask: true };

document.getElementById("toggleWireframe").addEventListener("change", (e) => settings.showWireframe = e.target.checked);
document.getElementById("toggleBoatMesh").addEventListener("change", (e) => settings.showBoatMesh = e.target.checked);
document.getElementById("toggleBoatMask").addEventListener("change", (e) => settings.showBoatMask = e.target.checked);

function mat4Identity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function vec3Cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vec3Normalize(a) {
  const length = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / length, a[1] / length, a[2] / length];
}

function vec3Dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vec3Sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function mat4Multiply(a, b) {
  const result = new Float32Array(16);
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[column * 4 + k];
      }
      result[column * 4 + row] = sum;
    }
  }
  return result;
}

function mat4Perspective(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov * 0.5);
  const result = mat4Identity();
  result[0] = f / aspect;
  result[5] = f;
  result[10] = far / (near - far);
  result[11] = -1.0;
  result[14] = (near * far) / (near - far);
  result[15] = 0.0;
  return result;
}

function mat4LookAt(eye, center, up) {
  const forward = vec3Normalize(vec3Sub(center, eye));
  const right = vec3Normalize(vec3Cross(forward, up));
  const newUp = vec3Cross(right, forward);
  const result = mat4Identity();
  result[0] = right[0];   result[4] = right[1];   result[8]  = right[2];   result[12] = -vec3Dot(right, eye);
  result[1] = newUp[0];   result[5] = newUp[1];   result[9]  = newUp[2];   result[13] = -vec3Dot(newUp, eye);
  result[2] = -forward[0]; result[6] = -forward[1]; result[10] = -forward[2]; result[14] = vec3Dot(forward, eye);
  return result;
}

function mat4Translate(matrix, translation) {
  const t = mat4Identity();
  t[12] = translation[0];
  t[13] = translation[1];
  t[14] = translation[2];
  return mat4Multiply(matrix, t);
}

function mat4RotateY(matrix, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const r = mat4Identity();
  r[0] = c;  r[8]  = -s;
  r[2] = s;  r[10] = c;
  return mat4Multiply(matrix, r);
}

function mat4RotateX(matrix, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const r = mat4Identity();
  r[5] = c;  r[9]  = s;
  r[6] = -s; r[10] = c;
  return mat4Multiply(matrix, r);
}

function createCubeGeometry() {
  const positions = [];
  const normals = [];
  for (let face = 0; face < 6; face++) {
    const axis = Math.floor(face / 2);
    const direction = (face % 2 === 0) ? 1 : -1;
    const u = (axis + 1) % 3;
    const v = (axis + 2) % 3;
    for (let i = 0; i < 4; i++) {
      const p = [0, 0, 0];
      p[axis] = direction * 0.5;
      p[u] = (i === 1 || i === 2) ? 0.5 : -0.5;
      p[v] = (i === 2 || i === 3) ? 0.5 : -0.5;
      positions.push(p[0], p[1], p[2]);
      const n = [0, 0, 0];
      n[axis] = direction;
      normals.push(n[0], n[1], n[2]);
    }
  }
  const indices = [];
  for (let face = 0; face < 6; face++) {
    const base = face * 4;
    if (face % 2 === 0) {
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    } else {
      indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  }
  const wireIndices = [
    0, 1, 1, 2, 2, 3, 3, 0,
    4, 5, 5, 6, 6, 7, 7, 4,
    0, 4, 1, 5, 2, 6, 3, 7,
  ];
  const vertices = new Float32Array(24 * 6);
  for (let i = 0; i < 24; i++) {
    vertices[i * 6]     = positions[i * 3];
    vertices[i * 6 + 1] = positions[i * 3 + 1];
    vertices[i * 6 + 2] = positions[i * 3 + 2];
    vertices[i * 6 + 3] = normals[i * 3];
    vertices[i * 6 + 4] = normals[i * 3 + 1];
    vertices[i * 6 + 5] = normals[i * 3 + 2];
  }
  return {
    vertices: vertices,
    indices: new Uint32Array(indices),
    wireIndices: new Uint32Array(wireIndices),
  };
}

function createWaterGeometry(subdivisions) {
  const halfSize = 5.0;
  const vertices = [];
  for (let y = 0; y <= subdivisions; y++) {
    for (let x = 0; x <= subdivisions; x++) {
      vertices.push(
        -halfSize + (x / subdivisions) * 10.0,
        0.0,
        -halfSize + (y / subdivisions) * 10.0,
        0.0, 1.0, 0.0,
        x / subdivisions, y / subdivisions
      );
    }
  }
  const indices = [];
  for (let y = 0; y < subdivisions; y++) {
    for (let x = 0; x < subdivisions; x++) {
      const a = y * (subdivisions + 1) + x;
      indices.push(a, a + 1, a + subdivisions + 1, a + 1, a + subdivisions + 2, a + subdivisions + 1);
    }
  }
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    indexCount: subdivisions * subdivisions * 6,
  };
}

const cubeGeometry = createCubeGeometry();
const waterGeometry = createWaterGeometry(128);

const maskShaderCode = `
struct Uniforms { mvp: mat4x4f, maskWidth: i32, maskHeight: i32 }
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(0) @binding(1) var<storage, read_write> counter: array<atomic<u32>>;
@group(0) @binding(2) var<storage, read_write> maskBuffer: array<f32>;

struct VertexInput { @location(0) position: vec3f }
struct VertexOutput { @builtin(position) position: vec4f }

@vertex fn vertex(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = uniforms.mvp * vec4f(input.position, 1.0);
  return output;
}

@fragment fn fragment(@builtin(position) position: vec4f, @builtin(front_facing) frontFacing: bool) -> @location(0) vec4f {
  let mx = i32(position.x);
  let my = i32(position.y);
  if (mx < uniforms.maskWidth && my < uniforms.maskHeight && mx >= 0 && my >= 0) {
    let index = my * uniforms.maskWidth + mx;
    let slot = atomicAdd(&counter[index], 1u);
    if (slot < 16u) {
      maskBuffer[index * 16 + i32(slot)] = select(-position.z, position.z, frontFacing);
    }
  }
  return vec4f(0.0);
}
`;

const sortShaderCode = `
@group(0) @binding(0) var<uniform> dimensions: vec2i;
@group(0) @binding(1) var<storage> counter: array<u32>;
@group(0) @binding(2) var<storage, read_write> maskBuffer: array<f32>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  if (x >= dimensions.x || y >= dimensions.y) { return; }
  let index = y * dimensions.x + x;
  let count = min(16u, counter[index]);
  var values: array<f32, 16>;
  for (var i = 0u; i < 16u; i = i + 1u) {
    if (i < count) {
      values[i] = maskBuffer[index * 16 + i32(i)];
    } else {
      values[i] = 1e10;
    }
  }
  var k = 2u;
  while (k <= 16u) {
    var j = k >> 1u;
    while (j > 0u) {
      for (var i = 0u; i < 16u; i = i + 1u) {
        let ij = i ^ j;
        if (ij > i) {
          let ascending = (i & k) == 0u;
          let a = abs(values[i]);
          let b = abs(values[ij]);
          let condition = select(a < b, (a > b), ascending);
          if (condition) {
            let temp = values[i];
            values[i] = values[ij];
            values[ij] = temp;
          }
        }
      }
      j = j >> 1u;
    }
    k = k << 1u;
  }
  for (var i = 0u; i < 16u; i = i + 1u) {
    maskBuffer[index * 16 + i32(i)] = values[i];
  }
}
`;

const waterShaderCode = `
struct Uniforms {
  mvp: mat4x4f,
  maskWidth: i32,
  maskHeight: i32,
  screenWidth: i32,
  screenHeight: i32,
  time: f32,
  waveFrequency: f32,
  waveAmplitude: f32,
  waveSteepness: f32,
  waveSpeed: f32,
  waveDirection: vec2f,
}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@group(0) @binding(1) var<storage> counter: array<u32>;
@group(0) @binding(2) var<storage> maskBuffer: array<f32>;

struct VertexInput { @location(0) position: vec3f, @location(1) normal: vec3f }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) worldPosition: vec3f, @location(1) worldNormal: vec3f }

@vertex fn vertex(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  let direction = uniforms.waveDirection;
  let frequency = uniforms.waveFrequency;
  let amplitude = uniforms.waveAmplitude;
  let steepness = uniforms.waveSteepness;
  let phase = frequency * (direction.x * input.position.x + direction.y * input.position.z) + uniforms.time * uniforms.waveSpeed;
  let s = sin(phase);
  let c = cos(phase);
  let displacement = vec3f(steepness * amplitude * direction.x * c, amplitude * s, steepness * amplitude * direction.y * c);
  let worldPosition = input.position + displacement;
  output.position = uniforms.mvp * vec4f(worldPosition, 1.0);
  output.worldPosition = worldPosition;
  let wa = frequency * amplitude;
  let worldNormal = normalize(vec3f(-wa * direction.x * c, 1.0, -wa * direction.y * c));
  output.worldNormal = worldNormal;
  return output;
}

@fragment fn fragment(@builtin(position) position: vec4f, @location(0) worldPosition: vec3f, @location(1) worldNormal: vec3f) -> @location(0) vec4f {
  let mx = i32(position.x) / 4;
  let my = i32(position.y) / 4;
  if (mx < uniforms.maskWidth && my < uniforms.maskHeight) {
    let index = my * uniforms.maskWidth + mx;
    let count = counter[index];
    // Camera inside a volume: the first stored surface is a back face.
    // Discard any fragment behind that back face.
    if (count > 0u) {
      let firstValue = maskBuffer[index * 16];
      if (firstValue < 0.0 && position.z > abs(firstValue)) {
        discard;
      }
    }
    // Camera outside: use depth counter to detect fragments inside volumes
    var depth = 0i;
    for (var i = 0u; i < count; i = i + 1u) {
      let v = maskBuffer[index * 16 + i32(i)];
      if (abs(v) > position.z) { break; }
      if (v >= 0.0) { depth = depth + 1; }
      else { depth = depth - 1; }
    }
    if (depth > 0) { discard; }
  }
  let lightDirection = normalize(vec3f(0.5, 1.0, 0.3));
  let diffuse = clamp(dot(normalize(worldNormal), lightDirection), 0.0, 1.0);
  let color = mix(vec3f(0.2, 0.35, 0.6), vec3f(0.5, 0.7, 1.0), smoothstep(-1.0, 1.0, worldPosition.x * 0.5));
  return vec4f(color * (diffuse * 0.8 + 0.2), 1.0);
}
`;

const wireframeShaderCode = `
@group(0) @binding(0) var<uniform> transform: mat4x4f;

struct VertexInput { @location(0) position: vec3f }
struct VertexOutput { @builtin(position) position: vec4f }

@vertex fn vertex(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = transform * vec4f(input.position, 1.0);
  return output;
}

@fragment fn fragment() -> @location(0) vec4f {
  return vec4f(0.9, 0.35, 0.25, 1.0);
}
`;

const boatShaderCode = `
struct Uniforms { mvp: mat4x4f, model: mat4x4f }
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

struct VertexInput { @location(0) position: vec3f, @location(1) normal: vec3f, @location(2) uv: vec2f }
struct VertexOutput { @builtin(position) position: vec4f, @location(0) worldNormal: vec3f, @location(1) uv: vec2f, @location(2) worldPosition: vec3f }

@vertex fn vertex(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = uniforms.mvp * vec4f(input.position, 1.0);
  output.worldPosition = (uniforms.model * vec4f(input.position, 1.0)).xyz;
  output.worldNormal = (uniforms.model * vec4f(input.normal, 0.0)).xyz;
  output.uv = input.uv;
  return output;
}

@fragment fn fragment(@location(0) worldNormal: vec3f, @location(1) uv: vec2f, @location(2) worldPosition: vec3f) -> @location(0) vec4f {
  let lightDirection = normalize(vec3f(0.5, 1.0, 0.3));
  let diffuse = clamp(dot(normalize(worldNormal), lightDirection), 0.0, 1.0);
  let color = textureSample(texture, samp, uv).rgb;
  return vec4f(color * (diffuse * 0.8 + 0.2), 1.0);
}
`;

function parseObj(text, includeUV) {
  const positions = [];
  const texcoords = [];
  const normals = [];
  const keyToIndex = new Map();
  const interleaved = [];
  const triangles = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const parts = trimmed.split(/\s+/);
    if (trimmed.startsWith("v ")) {
      positions.push(+parts[1], +parts[2], +parts[3]);
    } else if (includeUV && trimmed.startsWith("vt")) {
      texcoords.push(+parts[1], +parts[2]);
    } else if (includeUV && trimmed.startsWith("vn")) {
      normals.push(+parts[1], +parts[2], +parts[3]);
    } else if (trimmed.startsWith("f ")) {
      for (let i = 1; i <= 3; i++) {
        if (includeUV) {
          const key = parts[i];
          if (!keyToIndex.has(key)) {
            const vi = key.split("/").map(x => +x - 1);
            const newIndex = keyToIndex.size;
            keyToIndex.set(key, newIndex);
            interleaved.push(
              positions[vi[0] * 3], positions[vi[0] * 3 + 1], positions[vi[0] * 3 + 2],
              normals[vi[2] * 3], normals[vi[2] * 3 + 1], normals[vi[2] * 3 + 2],
              texcoords[vi[1] * 2], texcoords[vi[1] * 2 + 1],
            );
          }
          triangles.push(keyToIndex.get(key));
        } else {
          triangles.push(+parts[i] - 1);
        }
      }
    }
  }

  const floatsPerVertex = includeUV ? 8 : 6;
  const vertexCount = includeUV ? interleaved.length / 8 : positions.length / 3;
  const vertices = new Float32Array(vertexCount * floatsPerVertex);
  if (includeUV) {
    vertices.set(interleaved);
  } else {
    for (let i = 0; i < vertexCount; i++) {
      vertices[i * 6]     = positions[i * 3];
      vertices[i * 6 + 1] = positions[i * 3 + 1];
      vertices[i * 6 + 2] = positions[i * 3 + 2];
      vertices[i * 6 + 3] = 0.0;
      vertices[i * 6 + 4] = 0.0;
      vertices[i * 6 + 5] = 0.0;
    }
  }

  const edgeSet = new Set();
  const edges = [];
  for (let i = 0; i < triangles.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const a = triangles[i + j];
      const b = triangles[i + (j + 1) % 3];
      const key = a < b ? a + "," + b : b + "," + a;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push(a, b);
      }
    }
  }

  const triArray = new Uint32Array(triangles);
  return {
    vertices: vertices,
    edgeIndices: new Uint32Array(edges),
    triangleIndices: triArray,
    indices: triArray,
    indexCount: triangles.length,
  };
}

(async function main() {
  const canvas = document.getElementById("gpuCanvas");
  const context = canvas.getContext("webgpu");
  if (!context) {
    document.body.innerHTML = '<p style="color:white;padding:1em;font-family:sans-serif;">WebGPU not supported</p>';
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    document.body.innerHTML = '<p style="color:white;padding:1em;font-family:sans-serif;">No WebGPU adapter</p>';
    return;
  }

  const device = await adapter.requestDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();

  let screenWidth, screenHeight, maskWidth, maskHeight;
  let depthTexture = null;
  let maskTexture = null;
  let counterBuffer = null;
  let depthStorageBuffer = null;
  let zeroArray = null;

  const sortBindGroup = { current: null };
  const waterBindGroup = { current: null };
  const boatMaskBindGroup = { current: null };
  const maskBindGroups = [];
  const wireBindGroups = [];

  const shaderModules = {};

  function createBindGroupLayout(entries) {
    return device.createBindGroupLayout({ entries: entries });
  }

  const bindGroupLayouts = {
    mask: createBindGroupLayout([
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "storage" } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "storage" } },
    ]),
    sort: createBindGroupLayout([
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
    ]),
    water: createBindGroupLayout([
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "read-only-storage" } },
    ]),
    wire: createBindGroupLayout([
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "uniform" } },
    ]),
  };

  const uniformBuffers = {
    cubeMask: [],
    cubeWire: [],
    sort: device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
    water: device.createBuffer({ size: 128, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
  };
  for (let i = 0; i < CUBE_COUNT; i++) {
    uniformBuffers.cubeMask.push(device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }));
    uniformBuffers.cubeWire.push(device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }));
  }

  shaderModules.mask = device.createShaderModule({ code: maskShaderCode });
  shaderModules.sort = device.createShaderModule({ code: sortShaderCode });
  shaderModules.water = device.createShaderModule({ code: waterShaderCode });
  shaderModules.wire = device.createShaderModule({ code: wireframeShaderCode });

  function makeBuffers() {
    const pixelCount = maskWidth * maskHeight;
    if (counterBuffer) counterBuffer.destroy();
    if (depthStorageBuffer) depthStorageBuffer.destroy();
    counterBuffer = device.createBuffer({ size: pixelCount * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    depthStorageBuffer = device.createBuffer({ size: pixelCount * 16 * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    zeroArray = new Uint32Array(pixelCount);
    const initialDepth = new Float32Array(pixelCount * 16);
    initialDepth.fill(1e10);
    device.queue.writeBuffer(depthStorageBuffer, 0, initialDepth);
  }

  function makeTextures() {
    if (depthTexture) depthTexture.destroy();
    if (maskTexture) maskTexture.destroy();
    depthTexture = device.createTexture({ size: [screenWidth, screenHeight, 1], format: "depth24plus", usage: GPUTextureUsage.RENDER_ATTACHMENT });
    maskTexture = device.createTexture({ size: [maskWidth, maskHeight, 1], format: format, usage: GPUTextureUsage.RENDER_ATTACHMENT });
  }

  function resize() {
    screenWidth = canvas.width = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;
    maskWidth = Math.ceil(screenWidth / 4);
    maskHeight = Math.ceil(screenHeight / 4);
    context.configure({ device: device, format: format, alphaMode: "opaque" });
    makeTextures();
    makeBuffers();

    maskBindGroups.length = 0;
    wireBindGroups.length = 0;

    for (let i = 0; i < CUBE_COUNT; i++) {
      maskBindGroups.push(device.createBindGroup({
        layout: bindGroupLayouts.mask,
        entries: [
          { binding: 0, resource: { buffer: uniformBuffers.cubeMask[i] } },
          { binding: 1, resource: { buffer: counterBuffer } },
          { binding: 2, resource: { buffer: depthStorageBuffer } },
        ],
      }));
      wireBindGroups.push(device.createBindGroup({
        layout: bindGroupLayouts.wire,
        entries: [
          { binding: 0, resource: { buffer: uniformBuffers.cubeWire[i] } },
        ],
      }));
    }

    sortBindGroup.current = device.createBindGroup({
      layout: bindGroupLayouts.sort,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffers.sort } },
        { binding: 1, resource: { buffer: counterBuffer } },
        { binding: 2, resource: { buffer: depthStorageBuffer } },
      ],
    });

    waterBindGroup.current = device.createBindGroup({
      layout: bindGroupLayouts.water,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffers.water } },
        { binding: 1, resource: { buffer: counterBuffer } },
        { binding: 2, resource: { buffer: depthStorageBuffer } },
      ],
    });

    boatMaskBindGroup.current = device.createBindGroup({
      layout: bindGroupLayouts.mask,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffers.boatMask } },
        { binding: 1, resource: { buffer: counterBuffer } },
        { binding: 2, resource: { buffer: depthStorageBuffer } },
      ],
    });
  }

  const geometryBuffers = {};
  geometryBuffers.cube = {
    vertex: device.createBuffer({ size: cubeGeometry.vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }),
    index: device.createBuffer({ size: cubeGeometry.indices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST }),
    wire: device.createBuffer({ size: cubeGeometry.wireIndices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST }),
  };
  device.queue.writeBuffer(geometryBuffers.cube.vertex, 0, cubeGeometry.vertices);
  device.queue.writeBuffer(geometryBuffers.cube.index, 0, cubeGeometry.indices);
  device.queue.writeBuffer(geometryBuffers.cube.wire, 0, cubeGeometry.wireIndices);

  geometryBuffers.water = {
    vertex: device.createBuffer({ size: waterGeometry.vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }),
    index: device.createBuffer({ size: waterGeometry.indices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST }),
  };
  device.queue.writeBuffer(geometryBuffers.water.vertex, 0, waterGeometry.vertices);
  device.queue.writeBuffer(geometryBuffers.water.index, 0, waterGeometry.indices);

  const pipelines = {};

  pipelines.mask = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayouts.mask] }),
    vertex: { module: shaderModules.mask, entryPoint: "vertex", buffers: [{ arrayStride: 24, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] }] },
    fragment: { module: shaderModules.mask, entryPoint: "fragment", targets: [{ format: format }] },
    primitive: { topology: "triangle-list", cullMode: "none" },
  });

  pipelines.sort = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayouts.sort] }),
    compute: { module: shaderModules.sort, entryPoint: "main" },
  });

  pipelines.water = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayouts.water] }),
    vertex: {
      module: shaderModules.water, entryPoint: "vertex",
      buffers: [{ arrayStride: 32, attributes: [
        { shaderLocation: 0, offset: 0, format: "float32x3" },
        { shaderLocation: 1, offset: 12, format: "float32x3" },
      ]}],
    },
    fragment: { module: shaderModules.water, entryPoint: "fragment", targets: [{ format: format }] },
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: { depthWriteEnabled: true, depthCompare: "less", format: "depth24plus" },
  });

  pipelines.wire = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayouts.wire] }),
    vertex: { module: shaderModules.wire, entryPoint: "vertex", buffers: [{ arrayStride: 24, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] }] },
    fragment: { module: shaderModules.wire, entryPoint: "fragment", targets: [{ format: format }] },
    primitive: { topology: "line-list", cullMode: "none" },
    depthStencil: { depthWriteEnabled: false, depthCompare: "always", format: "depth24plus" },
  });

  const boatGeometry = parseObj(await (await fetch("boat.obj")).text(), true);
  geometryBuffers.boat = {
    vertex: device.createBuffer({ size: boatGeometry.vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }),
    index: device.createBuffer({ size: boatGeometry.indices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST }),
  };
  device.queue.writeBuffer(geometryBuffers.boat.vertex, 0, boatGeometry.vertices);
  device.queue.writeBuffer(geometryBuffers.boat.index, 0, boatGeometry.indices);

  const boatImageBlob = await (await fetch("boat_tex.png")).blob();
  const boatBitmap = await createImageBitmap(boatImageBlob);
  const boatTexture = device.createTexture({ size: [boatBitmap.width, boatBitmap.height, 1], format: "rgba8unorm", usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
  device.queue.copyExternalImageToTexture({ source: boatBitmap, flipY: true }, { texture: boatTexture }, [boatBitmap.width, boatBitmap.height, 1]);

  const boatSampler = device.createSampler({ magFilter: "linear", minFilter: "linear" });
  const boatShaderModule = device.createShaderModule({ code: boatShaderCode });

  const boatBindGroupLayout = createBindGroupLayout([
    { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
    { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
    { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
  ]);

  pipelines.boat = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [boatBindGroupLayout] }),
    vertex: {
      module: boatShaderModule, entryPoint: "vertex",
      buffers: [{ arrayStride: 32, attributes: [
        { shaderLocation: 0, offset: 0, format: "float32x3" },
        { shaderLocation: 1, offset: 12, format: "float32x3" },
        { shaderLocation: 2, offset: 24, format: "float32x2" },
      ]}],
    },
    fragment: { module: boatShaderModule, entryPoint: "fragment", targets: [{ format: format }] },
    primitive: { topology: "triangle-list", cullMode: "none" },
    depthStencil: { depthWriteEnabled: true, depthCompare: "less", format: "depth24plus" },
  });

  uniformBuffers.boat = device.createBuffer({ size: 128, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const boatBindGroup = device.createBindGroup({
    layout: boatBindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffers.boat } },
      { binding: 1, resource: boatTexture.createView() },
      { binding: 2, resource: boatSampler },
    ],
  });

  const boatMaskGeometry = parseObj(await (await fetch("boat_mask.obj")).text(), false);
  geometryBuffers.boatMask = {
    vertex: device.createBuffer({ size: boatMaskGeometry.vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }),
    wire: device.createBuffer({ size: boatMaskGeometry.edgeIndices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST }),
    index: device.createBuffer({ size: boatMaskGeometry.triangleIndices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST }),
  };
  device.queue.writeBuffer(geometryBuffers.boatMask.vertex, 0, boatMaskGeometry.vertices);
  device.queue.writeBuffer(geometryBuffers.boatMask.wire, 0, boatMaskGeometry.edgeIndices);
  device.queue.writeBuffer(geometryBuffers.boatMask.index, 0, boatMaskGeometry.triangleIndices);
  uniformBuffers.boatMaskWire = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const boatMaskWireBindGroup = device.createBindGroup({
    layout: bindGroupLayouts.wire,
    entries: [{ binding: 0, resource: { buffer: uniformBuffers.boatMaskWire } }],
  });
  uniformBuffers.boatMask = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

  resize();
  window.addEventListener("resize", resize);

  function computeBoatModel(time) {
    const boatScale = 0.6;
    const bottomOffset = boatScale * 0.631 - 0.3;
    const invSqrt2 = 1.0 / Math.SQRT2;

    const phase = time * WAVE_SPEED;
    const cosPhase = Math.cos(phase);
    const sinPhase = Math.sin(phase);
    const displacementX = WAVE_Q * WAVE_AMP * invSqrt2 * cosPhase;
    const displacementY = WAVE_AMP * sinPhase;

    const boatX = -displacementX;
    const boatZ = displacementX;

    const waveDirX = WAVE_DIR[0];
    const waveDirY = WAVE_DIR[1];
    const forwardX = waveDirX;
    const forwardZ = waveDirY;
    const leftX = -forwardZ;
    const leftZ = forwardX;

    const offset = 0.3;
    const waveHeight = (x, z) => WAVE_AMP * Math.sin(WAVE_FREQ * (waveDirX * x + waveDirY * z) + WAVE_SPEED * time);

    const frontHeight = waveHeight(boatX + forwardX * offset, boatZ + forwardZ * offset);
    const backHeight = waveHeight(boatX - forwardX * offset, boatZ - forwardZ * offset);
    const leftHeight = waveHeight(boatX + leftX * offset, boatZ + leftZ * offset);
    const rightHeight = waveHeight(boatX - leftX * offset, boatZ - leftZ * offset);

    const forwardSlope = (frontHeight - backHeight) / (2.0 * offset);
    const leftSlope = (leftHeight - rightHeight) / (2.0 * offset);

    const tangentForward = [forwardX, forwardSlope, forwardZ];
    const tangentLeft = [leftX, leftSlope, leftZ];

    let normal = [
      tangentLeft[1] * tangentForward[2] - tangentLeft[2] * tangentForward[1],
      tangentLeft[2] * tangentForward[0] - tangentLeft[0] * tangentForward[2],
      tangentLeft[0] * tangentForward[1] - tangentLeft[1] * tangentForward[0],
    ];
    const normalLength = Math.hypot(normal[0], normal[1], normal[2]);
    normal[0] /= normalLength;
    normal[1] /= normalLength;
    normal[2] /= normalLength;

    const forwardHorizontal = [forwardX, 0.0, forwardZ];
    const fhLength = Math.hypot(forwardHorizontal[0], forwardHorizontal[1], forwardHorizontal[2]);
    forwardHorizontal[0] /= fhLength;
    forwardHorizontal[1] /= fhLength;
    forwardHorizontal[2] /= fhLength;

    let right = [
      normal[1] * forwardHorizontal[2] - normal[2] * forwardHorizontal[1],
      normal[2] * forwardHorizontal[0] - normal[0] * forwardHorizontal[2],
      normal[0] * forwardHorizontal[1] - normal[1] * forwardHorizontal[0],
    ];
    const rightLength = Math.hypot(right[0], right[1], right[2]);
    right[0] /= rightLength;
    right[1] /= rightLength;
    right[2] /= rightLength;

    const newForward = [
      right[1] * normal[2] - right[2] * normal[1],
      right[2] * normal[0] - right[0] * normal[2],
      right[0] * normal[1] - right[1] * normal[0],
    ];

    const model = new Float32Array(16);
    model[0]  = right[0] * boatScale;
    model[1]  = right[1] * boatScale;
    model[2]  = right[2] * boatScale;
    model[4]  = normal[0] * boatScale;
    model[5]  = normal[1] * boatScale;
    model[6]  = normal[2] * boatScale;
    model[8]  = newForward[0] * boatScale;
    model[9]  = newForward[1] * boatScale;
    model[10] = newForward[2] * boatScale;
    model[12] = boatX;
    model[13] = displacementY + bottomOffset;
    model[14] = boatZ;
    model[15] = 1.0;

    return model;
  }

  function frame(timestamp) {
    const time = timestamp / 1000;
    device.queue.writeBuffer(counterBuffer, 0, zeroArray);

    const viewMatrix = mat4LookAt([4.0, 3.0, 4.0], [0.0, 0.75, 0.0], [0.0, 1.0, 0.0]);
    const projectionMatrix = mat4Perspective(Math.PI / 3.0, screenWidth / screenHeight, 0.1, 30.0);
    const viewProjection = mat4Multiply(projectionMatrix, viewMatrix);

    const cubeMVPList = [];
    for (let i = 0; i < CUBE_COUNT; i++) {
      const def = cubeDefs[i];
      const bob = Math.sin(time * def.bobSpeed) * def.bobAmplitude;
      let model = mat4Translate(mat4Identity(), [def.x, bob, def.z]);
      model = mat4RotateY(model, time * def.rotSpeed);
      model = mat4RotateX(model, Math.sin(time * def.bobSpeed * 0.5) * 0.3);
      cubeMVPList.push(mat4Multiply(viewProjection, model));
    }

    const boatModel = computeBoatModel(time);
    const boatMVP = mat4Multiply(viewProjection, boatModel);

    const encoder = device.createCommandEncoder();

    // Mask pass
    {
      const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
          view: maskTexture.createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      renderPass.setPipeline(pipelines.mask);
      renderPass.setVertexBuffer(0, geometryBuffers.cube.vertex);
      renderPass.setIndexBuffer(geometryBuffers.cube.index, "uint32");
      renderPass.setViewport(0, 0, maskWidth, maskHeight, 0, 1);

      for (let i = 0; i < CUBE_COUNT; i++) {
        const uniformData = new Float32Array(20);
        uniformData.set(cubeMVPList[i], 0);
        const uniformInts = new Uint32Array(uniformData.buffer);
        uniformInts[16] = maskWidth;
        uniformInts[17] = maskHeight;
        device.queue.writeBuffer(uniformBuffers.cubeMask[i], 0, uniformData);
        renderPass.setBindGroup(0, maskBindGroups[i]);
        renderPass.drawIndexed(36);
      }

      if (settings.showBoatMask) {
        const uniformData = new Float32Array(20);
        uniformData.set(boatMVP, 0);
        const uniformInts = new Uint32Array(uniformData.buffer);
        uniformInts[16] = maskWidth;
        uniformInts[17] = maskHeight;
        device.queue.writeBuffer(uniformBuffers.boatMask, 0, uniformData);
        renderPass.setBindGroup(0, boatMaskBindGroup.current);
        renderPass.setVertexBuffer(0, geometryBuffers.boatMask.vertex);
        renderPass.setIndexBuffer(geometryBuffers.boatMask.index, "uint32");
        renderPass.drawIndexed(boatMaskGeometry.triangleIndices.length);
      }

      renderPass.end();
    }

    // Sort pass
    {
      const sortUniformData = new Uint32Array(4);
      sortUniformData[0] = maskWidth;
      sortUniformData[1] = maskHeight;
      device.queue.writeBuffer(uniformBuffers.sort, 0, new Uint8Array(sortUniformData.buffer, 0, 8));

      const computePass = encoder.beginComputePass();
      computePass.setPipeline(pipelines.sort);
      computePass.setBindGroup(0, sortBindGroup.current);
      computePass.dispatchWorkgroups(Math.ceil(maskWidth / 8), Math.ceil(maskHeight / 8));
      computePass.end();
    }

    // Scene pass
    {
      const sceneUniformData = new Float32Array(32);
      sceneUniformData.set(viewProjection, 0);
      const sceneUniformInts = new Uint32Array(sceneUniformData.buffer);
      sceneUniformInts[16] = maskWidth;
      sceneUniformInts[17] = maskHeight;
      sceneUniformInts[18] = screenWidth;
      sceneUniformInts[19] = screenHeight;
      sceneUniformData[20] = time;
      sceneUniformData[21] = WAVE_FREQ;
      sceneUniformData[22] = WAVE_AMP;
      sceneUniformData[23] = WAVE_Q;
      sceneUniformData[24] = WAVE_SPEED;
      sceneUniformData[26] = WAVE_DIR[0];
      sceneUniformData[27] = WAVE_DIR[1];
      device.queue.writeBuffer(uniformBuffers.water, 0, sceneUniformData);

      const textureView = context.getCurrentTexture().createView();
      const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.08, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        }],
        depthStencilAttachment: {
          view: depthTexture.createView(),
          depthClearValue: 1.0,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      });

      // Water
      renderPass.setPipeline(pipelines.water);
      renderPass.setBindGroup(0, waterBindGroup.current);
      renderPass.setVertexBuffer(0, geometryBuffers.water.vertex);
      renderPass.setIndexBuffer(geometryBuffers.water.index, "uint32");
      renderPass.setViewport(0, 0, screenWidth, screenHeight, 0, 1);
      renderPass.drawIndexed(waterGeometry.indexCount);

      // Boat mesh
      if (settings.showBoatMesh) {
        const boatUniformData = new Float32Array(32);
        boatUniformData.set(boatMVP, 0);
        boatUniformData.set(boatModel, 16);
        device.queue.writeBuffer(uniformBuffers.boat, 0, boatUniformData);
        renderPass.setPipeline(pipelines.boat);
        renderPass.setBindGroup(0, boatBindGroup);
        renderPass.setVertexBuffer(0, geometryBuffers.boat.vertex);
        renderPass.setIndexBuffer(geometryBuffers.boat.index, "uint32");
        renderPass.drawIndexed(boatGeometry.indexCount);
      }

      if (settings.showWireframe) {
        // Cube wireframes
        renderPass.setPipeline(pipelines.wire);
        renderPass.setVertexBuffer(0, geometryBuffers.cube.vertex);
        renderPass.setIndexBuffer(geometryBuffers.cube.wire, "uint32");
        for (let i = 0; i < CUBE_COUNT; i++) {
          const wireUniformData = new Float32Array(cubeMVPList[i]);
          device.queue.writeBuffer(uniformBuffers.cubeWire[i], 0, wireUniformData);
          renderPass.setBindGroup(0, wireBindGroups[i]);
          renderPass.drawIndexed(24);
        }
        if (settings.showBoatMask) {
          // Boat mask wireframe
          renderPass.setPipeline(pipelines.wire);
          renderPass.setBindGroup(0, boatMaskWireBindGroup);
          renderPass.setVertexBuffer(0, geometryBuffers.boatMask.vertex);
          renderPass.setIndexBuffer(geometryBuffers.boatMask.wire, "uint32");
          device.queue.writeBuffer(uniformBuffers.boatMaskWire, 0, new Float32Array(boatMVP));
          renderPass.drawIndexed(boatMaskGeometry.edgeIndices.length);
        }
      }

      renderPass.end();
    }

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
