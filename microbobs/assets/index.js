(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function i(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(e){if(e.ep)return;e.ep=!0;const n=i(e);fetch(e.href,n)}})();const l=class l{};l.sizeGrowth=.1,l.feedbackDeathDelay=1,l.feedbackDeathBlinkDelay=.05,l.minRadius=10,l.maxRadius=50,l.minVelocity=60,l.maxVelocity=200,l.divideDelay=3,l.divideAnimDuration=1,l.chainDelay=.5,l.deadDelay=1.5,l.minInfluence=10,l.maxInfluence=160,l.rotationRate=.04,l.minOffset=2,l.maxOffset=4,l.minAlpha=76,l.maxAlpha=13,l.minAngle=10,l.maxAngle=70,l.colorRight=[0,255,229],l.colorLeft=[255,255,0],l.colorDivideFill=[255,255,255],l.colorDivideLine=[255,255,0,255],l.colorDirectionLine=[255,255,255,51],l.colorChainInfluence=[0,128,0,76],l.colorDeadInfluence=[255,0,0,76];let o=l;const u=class u{static resize(t,i){u.currentViewWidth=t,u.currentViewHeight=i,u.currentScale=t/u.refWidth,u.currentWorldWidth=u.refWidth,u.currentWorldHeight=i/u.currentScale,u.aspect=u.currentWorldWidth/u.currentWorldHeight}};u.currentViewWidth=0,u.currentViewHeight=0,u.currentScale=1,u.currentWorldWidth=0,u.currentWorldHeight=0,u.aspect=1,u.refWidth=1024,u.numBackgroundPoints=2e3,u.cameraStiffness=.05;let h=u;class d{static halton(t,i){let s=0,e=1/i;for(;t>0;){let n=t%i;s+=n*e,t=(t-n)/i,e/=i}return s}static lerp(t,i,s){return t+(i-t)*s}static clamp(t,i,s){return t<i?i:t>s?s:t}static ease(t){return t=t-1,t*t*t*t}static rad(t){return t*Math.PI/180}}class r{constructor(t=0,i=0){this.x=0,this.y=0,this.set(t,i)}copy(){return new r(this.x,this.y)}set(t,i){this.x=t,this.y=i}setFrom(t){this.x=t.x,this.y=t.y}add(t){return this.x+=t.x,this.y+=t.y,this}mul(t){return this.x*=t.x,this.y*=t.y,this}scale(t){return this.x*=t,this.y*=t,this}sub(t){return this.x-=t.x,this.y-=t.y,this}static sub(t,i){return new r(t.x-i.x,t.y-i.y)}rotated(t){let i=Math.cos(t),s=Math.sin(t);return new r(i*this.x-s*this.y,s*this.x+i*this.y)}normalize(){let t=Math.sqrt(this.x*this.x+this.y*this.y);this.x/=t,this.y/=t}static mul(t,i){return new r(t.x*i.x,t.y*i.y)}static scale(t,i){return new r(t.x*i,t.y*i)}static dot(t,i){return t.x*i.x+t.y*i.y}static distance(t,i){return Math.sqrt(r.squaredDistance(t,i))}static squaredDistance(t,i){let s=i.x-t.x,e=i.y-t.y;return s*s+e*e}}class k{constructor(t,i,s){this.x=0,this.y=0,this.z=0,this.x=t,this.y=i,this.z=s}set(t,i,s){this.x=t,this.y=i,this.z=s}}class R{constructor(t,i,s,e){this.x=0,this.y=0,this.z=0,this.w=0,this.x=t,this.y=i,this.z=s,this.w=e}set(t,i,s,e){this.x=t,this.y=i,this.z=s,this.w=e}}class D{constructor(){this.position=new r(0,0),this.direction=new r(0,-1),this.size=0,this.timerDivide=0,this.timerChain=0,this.timerDead=0,this.dead=!1,this.rotation=0,this.blinking=!1,this.blinkShow=!0,this.blinkTimer=0,this.radius=0,this.influence=0,this.chainInfluence=0,this.deadInfluence=0,this.updateValues()}updateValues(){this.radius=d.lerp(o.minRadius,o.maxRadius,this.size),this.influence=this.radius+d.lerp(o.minInfluence,o.maxInfluence,this.size),this.chainInfluence=d.lerp(0,this.influence,d.clamp(this.timerChain/o.chainDelay,0,1)),this.deadInfluence=d.lerp(0,this.influence,d.clamp(this.timerDead/o.deadDelay,0,1)),!this.dead&&this.size>=1&&(this.dead=!0)}setInitialValues(){this.timerDivide=o.divideDelay,this.timerChain=o.chainDelay,this.size=.5}canChain(){return this.timerChain<o.chainDelay}dying(){return this.dead&&this.timerDead<o.deadDelay}die(){this.dead=!0,this.timerChain=o.chainDelay}canDivide(){return!this.isDead()&&!this.dying()&&this.timerDivide>=o.divideDelay}divide(){this.timerDivide=0,this.timerChain=0}isDividing(){return this.timerDivide<o.divideDelay}isDead(){return this.dead&&this.timerDead>=o.deadDelay}update(t,i){i||(this.dead?this.timerDead+=t:(this.size=d.clamp(this.size+o.sizeGrowth*t,0,1),this.position.add(this.direction.copy().scale(d.lerp(o.minVelocity,o.maxVelocity,d.ease(this.size))*t)),this.timerDivide+=t,this.timerChain+=t)),(1-this.size)/o.sizeGrowth<o.feedbackDeathDelay?(this.blinking||(this.blinking=!0),this.blinkTimer-=t,this.blinkTimer<0&&(this.blinkShow=!this.blinkShow,this.blinkTimer=o.feedbackDeathBlinkDelay)):this.blinkShow=!0,this.rotation+=o.rotationRate,this.updateValues()}}class B{constructor(){this.position=new r}reset(){this.position.set(0,0)}cameraCoords(t){return new r((t.x-this.position.x)*h.currentScale+h.currentViewWidth*.5,(t.y-this.position.y)*h.currentScale+h.currentViewHeight*.5)}worldCoords(t){return new r((t.x-h.currentViewWidth*.5)/h.currentScale+this.position.x,(t.y-h.currentViewHeight*.5)/h.currentScale+this.position.y)}}class I{constructor(){this.points=new Array,this.camera=new B,this.lookAt=new r,this.cells=new Array,this.cellsToDivide=new Array;for(let t=0;t<h.numBackgroundPoints;t++){const i={pos:new r(d.halton(t,2)-.5,d.halton(t,3)-.5),alpha:d.halton(t,5)};this.points.push(i)}}clear(){this.camera.reset(),this.lookAt.set(0,0),this.cells=[],this.cellsToDivide=[]}generate(){this.clear();let t=new D;t.setInitialValues(),t.updateValues(),this.cells.push(t)}getClosestAt(t){let i=Number.MAX_VALUE,s=null;for(let e of this.cells)if(!e.dead){let n=r.squaredDistance(e.position,t);(!i||n<i)&&(i=n,s=e)}return s}divideCell(t){if(!t.canDivide())return!1;for(let c=0;c<this.cells.length;c++)if(this.cells[c]===t){this.cells.splice(c,1);break}let i=d.lerp(o.minAngle,o.maxAngle,t.size),s=d.lerp(o.minRadius,o.maxRadius,t.size/2)+1,e=new r(-t.direction.y*s,t.direction.x*s),n=new D;n.size=t.size/2,n.position=t.position.copy().sub(e),n.direction=t.direction.rotated(d.rad(-i)),this.cells.push(n);let a=new D;return a.size=t.size/2,a.position=t.position.copy().add(e),a.direction=t.direction.rotated(d.rad(i)),this.cells.push(a),!0}processCellsToDivide(){for(;this.cellsToDivide.length>0;)this.divideCell(this.cellsToDivide[0]),this.cellsToDivide.splice(0,1)}updateCellCollisions(){for(let s=0;s<this.cells.length;s++)for(let e=s+1;e<this.cells.length;e++){let n=this.cells[s],a=this.cells[e],c=r.squaredDistance(n.position,a.position),m=n.radius+a.radius;if(c<m*m){let g=r.sub(a.position,n.position);g.normalize();let x=m-Math.sqrt(c),v=1/n.radius,w=1/a.radius,y=v/(v+w),f=w/(v+w);n.position.sub(r.scale(g,x*y)),a.position.add(r.scale(g,x*f));let A=r.sub(a.direction,n.direction);r.dot(A,g)<0&&(n.direction.sub(r.scale(g,y)),n.direction.normalize(),a.direction.add(r.scale(g,f)),a.direction.normalize())}}let t=-h.refWidth/2,i=h.refWidth/2;for(let s=0;s<this.cells.length;s++){let e=this.cells[s],n=!1;e.position.x-e.radius<t&&(e.position.x=t+e.radius,e.direction.x<0&&(n=!0)),e.position.x+e.radius>i&&(e.position.x=i-e.radius,e.direction.x>0&&(n=!0)),n&&(e.direction.x=-e.direction.x)}}updateCellInteractions(){for(let t=0;t<this.cells.length;t++)for(let i=0;i<this.cells.length;i++){if(t==i)continue;let s=this.cells[t],e=this.cells[i];if(s.dying()){let n=r.distance(s.position,e.position);s.deadInfluence+e.radius>n&&e.die()}else if(s.canChain()&&e.canDivide()){let n=r.distance(s.position,e.position);if(s.chainInfluence+e.radius>n){let a=!1;for(let c=0;c<this.cellsToDivide.length;c++){let m=this.cellsToDivide[c];if(e===m){a=!0;break}}a||this.cellsToDivide.push(e)}}}}updateCamera(){let t=0;for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t=Math.min(t,s.position.y)}this.lookAt.y+=(t-this.lookAt.y)*h.cameraStiffness,this.camera.position.setFrom(this.lookAt)}update(t){let i=[];for(let s=0;s<this.cells.length;s++){let e=this.cells[s];e.update(t,!1),e.isDead()&&i.push(s)}for(let s=i.length-1;s>=0;s--)this.cells.splice(i[s],1);this.updateCellCollisions(),this.updateCellInteractions(),this.processCellsToDivide(),this.updateCamera()}draw(t){t.programs.background.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.background.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5),t.blendOff(),t.drawBuffer("screen","background"),t.blendPremul(),t.programs.cell.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.cell.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5);for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t.programs.cell.uniforms.u_position.value.setFrom(s.position),t.programs.cell.uniforms.u_size.value.set(s.radius*2,s.radius*2),t.programs.cell.uniforms.u_direction.value.setFrom(s.direction),t.programs.cell.uniforms.u_split.value=d.clamp((s.timerDivide-o.divideDelay)/o.divideAnimDuration,0,1),t.programs.cell.uniforms.u_radius.value=o.maxRadius,s.blinkShow&&!s.dying()&&t.drawBuffer("quad","cell")}for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t.programs.debug_circle.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.debug_circle.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5),t.programs.debug_circle.uniforms.u_position.value.setFrom(s.position),s.chainInfluence<s.influence&&(t.programs.debug_circle.uniforms.u_size.value.set(s.chainInfluence*2,s.chainInfluence*2),t.programs.debug_circle.uniforms.u_thickness.value=1,t.programs.debug_circle.uniforms.u_color.value.set(0,.5,0,1),t.drawBuffer("quad","debug_circle")),s.dying()&&(t.programs.debug_circle.uniforms.u_size.value.set(s.deadInfluence*2,s.deadInfluence*2),t.programs.debug_circle.uniforms.u_thickness.value=1,t.programs.debug_circle.uniforms.u_color.value.set(1,0,0,1),t.drawBuffer("quad","debug_circle"))}t.drawText("debug",0,0,"microbobs")}}const W="sperry-pc",P=8,G=16,S=[null,0,13,1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,160,161,162,163,165,167,170,171,172,176,177,178,181,182,183,186,187,188,189,191,196,197,198,199,201,209,214,220,223,224,225,226,228,229,230,231,232,233,234,235,236,237,238,239,241,242,243,244,246,247,249,250,251,252,255,402,915,920,931,934,937,945,948,949,960,963,964,966,8226,8252,8319,8359,8592,8593,8594,8595,8596,8597,8616,8729,8730,8734,8735,8745,8776,8801,8804,8805,8962,8976,8992,8993,9472,9474,9484,9488,9492,9496,9500,9508,9516,9524,9532,9552,9553,9554,9555,9556,9557,9558,9559,9560,9561,9562,9563,9564,9565,9566,9567,9568,9569,9570,9571,9572,9573,9574,9575,9576,9577,9578,9579,9580,9600,9604,9608,9612,9616,9617,9618,9619,9632,9644,9650,9658,9660,9668,9675,9688,9689,9786,9787,9788,9792,9794,9824,9827,9829,9830,9834,9835],_="data:image/png;base64,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",j={name:W,width:P,height:G,glyphs:S,data:_},N=`#version 300 es
precision highp float;

`,L=`#version 300 es
precision highp float;

const float PI = 3.1415926535897932384626433832795;
const float PI_2 = 1.57079632679489661923;

float smoothEdge(float v, float p) {
    return 1.0 - pow(1.0 - v, p);
}

float stayPositive(float v) {
    return v * 0.5 + 0.5;
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdCell(vec2 p, float time, float r, vec2 d, float sr) {
    p = vec2(p.x * d.x - p.y * d.y, p.x * d.y + p.y * d.x);
    float a = atan(p.y, p.x);
    float wave0 = stayPositive(cos(a * 3.0 + time * 0.001)) * -0.009765625;
    float wave1 = stayPositive(sin(a * 4.0 - time * 0.002)) * -0.009765625;
    float aSplit = mod(abs(a) / PI_2, PI);
    float waveSplit = smoothEdge(aSplit, 4.0) * r * 0.3;
    return length(p) - (mix(r, r * 0.7, sr) + wave0 + wave1 + waveSplit * sr);
}

vec3 sampleBackground(vec2 uv, float offset) {
    float waveH = 0.5 + 0.5 * cos(uv.y * 4.0 + offset * 0.1);
    float waveCx = -0.5 + uv.x + 0.5 * sin(offset * 0.01) * 0.5;
    float waveCy = -0.5 + uv.y + 0.5 * cos(offset * 0.03) * 0.5;
    float waveC = sin(sqrt(16.0 * (waveCx * waveCx + waveCy * waveCy) + 1.0) + offset * 0.01);
    float wave = mix(waveH, waveC, 0.3);
    vec3 color0 = vec3(0.58, 0.38, 0.18);
    vec3 color1 = vec3(0.73, 0.63, 0.32);
    vec3 color2 = vec3(0.78, 0.86, 0.86);
    return mix(color0, mix(color1, color2, (clamp(wave, 0.5, 1.0) - 0.5) * 2.0), clamp(wave, 0.0, 0.5) * 2.0);
}`,F=`#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

out vec2 v_uv;

void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position.x, -a_position.y, 0, 1);
}`,z=`#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform vec2 u_camera_position;
uniform vec2 u_camera_scale;
uniform vec2 u_position;
uniform vec2 u_size;

out vec2 v_uv;

void main() {
    v_uv = a_uv;
    vec2 pos = (a_position * u_size + u_position - u_camera_position) / u_camera_scale;
    gl_Position = vec4(pos.x, -pos.y, 0, 1);
}`,V=`#version 300 es
precision highp float;

uniform vec2 u_camera_position;
uniform vec2 u_camera_scale;
uniform float u_time;

in vec2 v_uv;

vec3 sampleBackground(vec2, float);

out vec4 color;
void main() {
    color.rgb = sampleBackground(v_uv, u_camera_position.y * 0.1);
    color.a = 1.0;
}`,q=`#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_camera_position;
uniform float u_time;
uniform vec2 u_direction;
uniform float u_split;
uniform float u_radius;

in vec2 v_uv;

float smoothEdge(float, float);
float sdCell(vec2, float, float, vec2, float);
vec3 sampleBackground(vec2, float);

out vec4 color;
void main() {
    const float radius = 0.5;
    vec2 background_uv = gl_FragCoord.xy / u_resolution;

    float dist = -sdCell(v_uv - vec2(0.5), u_time, radius, vec2(u_direction.x, -u_direction.y), u_split);
    float aaf = fwidth(dist);
    float alpha = smoothstep(0.0, aaf, dist);
    vec3 background_color = sampleBackground(background_uv, u_camera_position.y * 0.1);

    float size = dist * u_radius;
    float grad0 = smoothEdge(clamp(size / 40.0, 0.0, 1.0), 4.0);
    float grad1 = smoothEdge(clamp(size / 8.0, 0.0, 1.0), 4.0);
    vec2 disp = vec2(dFdx(dist), dFdy(dist));
    vec3 bubble = sampleBackground(background_uv * 5.0 + disp * (1.0 - grad0) * 40.0, u_camera_position.y * 0.1) * mix(0.4, 1.0, grad1);
    color = mix(vec4(0.0), vec4(bubble, 1.0), alpha);
}`,M=`#version 300 es
precision highp float;

uniform float u_thickness;
uniform vec4 u_color;
uniform vec2 u_size;

in vec2 v_uv;

float sdCircle(vec2, float);

out vec4 color;
void main() {
    const float radius = 0.5;
    float dist = sdCircle(v_uv - vec2(0.5), radius);
    float thickness = u_thickness / max(u_size.x, u_size.y);    
    float alpha = 1.0 - step(thickness, abs(dist + thickness));
    color = mix(vec4(0.0), u_color, alpha);
}`,U=`#version 300 es
precision highp float;

uniform sampler2D u_font;
uniform vec2 u_char_pos;
uniform vec2 u_char_size;

in vec2 v_uv;

out vec4 color;
void main() {
    ivec2 char_coord = ivec2(u_char_pos + v_uv * u_char_size);
    color = texelFetch(u_font, char_coord, 0);
}`;class O{constructor(t,i){this.map={},this.id=t,this.spec=i;let s=Math.ceil(Math.sqrt(i.glyphs.length));this.width=s*i.width,this.height=s*i.height;for(let e=0;e<i.glyphs.length;e++){let n=e%s,a=Math.floor(e/s);this.map[i.glyphs[e]]=new r(n*i.width,a*i.height)}}}class T{constructor(t=0){this.index=t}}class Y{constructor(t,i){this.location=t,this.value=i}}class X{constructor(t){this.uniforms={},this.id=t}}class H{constructor(t,i,s,e){this.index=t,this.size=i,this.stride=s,this.offset=e}}class Z{constructor(t){this.attribs=[],this.num=0,this.id=t}}class C{constructor(t){this.fonts={},this.programs={},this.buffers={},this.gl=t,this.createProgram("background",F,V,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_time:0}),this.createProgram("cell",z,q,{u_resolution:new r(0,0),u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(1,1),u_time:0,u_direction:new r(0,-1),u_split:0,u_radius:0}),this.createProgram("debug_circle",z,M,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(1,1),u_thickness:0,u_color:new R(0,0,0,0)}),this.createProgram("font",z,U,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(1,1),u_font:new T(0),u_char_pos:new r(0,0),u_char_size:new r(0,0)}),this.createBuffer("screen",[[2,16,0],[2,16,8]],[-1,-1,0,0,3,-1,2,0,-1,3,0,2]),this.createBuffer("quad",[[2,16,0],[2,16,8]],[-.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,-.5,0,0,.5,.5,1,1,-.5,.5,0,1]),this.loadFont("debug",j)}createProgram(t,i,s,e){const n=new X(this.gl.createProgram());if(n.id===null)throw"createProgram";let a=(v,w)=>{const y=this.gl.createShader(v);if(y===null)throw"createShader";if(this.gl.shaderSource(y,w),this.gl.compileShader(y),!this.gl.getShaderParameter(y,this.gl.COMPILE_STATUS))throw`compileShader:${this.gl.getShaderInfoLog(y)}:${w}`;return y};const c=N+i.replace(`#version 300 es
precision highp float;
`,""),m=a(this.gl.VERTEX_SHADER,c),g=L+s.replace(`#version 300 es
precision highp float;
`,""),x=a(this.gl.FRAGMENT_SHADER,g);if(this.gl.attachShader(n.id,m),this.gl.attachShader(n.id,x),this.gl.linkProgram(n.id),!this.gl.getProgramParameter(n.id,this.gl.LINK_STATUS))throw`linkProgram:${this.gl.getProgramInfoLog(n.id)}`;for(let v in e){const w=this.gl.getUniformLocation(n.id,v);w===null&&console.warn(`getUniformLocation:${t}:${v}`),n.uniforms[v]=new Y(w,e[v])}this.programs[t]=n}createBuffer(t,i,s){const e=new Z(this.gl.createBuffer());if(e.id===null)throw"createBuffer";this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.id),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(s),this.gl.STATIC_DRAW);let n=0;for(let a=0;a<i.length;a++){const c=i[a];n+=c[0],e.attribs.push(new H(a,c[0],c[1],c[2]))}e.num=s.length/n,this.buffers[t]=e}loadFont(t,i){const s=new O(this.gl.createTexture(),i);if(s.id===null)throw"createTexture";fetch(s.spec.data).then(e=>{e.blob().then(n=>{createImageBitmap(n).then(a=>{this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,s.id),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA8,this.gl.RGBA,this.gl.UNSIGNED_BYTE,a),this.fonts[t]=s})})})}bindProgram(t){const i=this.programs[t];this.gl.useProgram(i.id);for(let s in i.uniforms){const e=i.uniforms[s];e.location!==null&&(typeof e.value=="number"&&this.gl.uniform1f(e.location,e.value),e.value instanceof r&&this.gl.uniform2f(e.location,e.value.x,e.value.y),e.value instanceof k&&this.gl.uniform3f(e.location,e.value.x,e.value.y,e.value.z),e.value instanceof R&&this.gl.uniform4f(e.location,e.value.x,e.value.y,e.value.z,e.value.w),e.value instanceof T&&this.gl.uniform1i(e.location,e.value.index))}}bindBuffer(t){const i=this.buffers[t];this.gl.bindBuffer(this.gl.ARRAY_BUFFER,i.id);for(let s=0;s<i.attribs.length;s++){const e=i.attribs[s];this.gl.enableVertexAttribArray(s),this.gl.vertexAttribPointer(s,e.size,this.gl.FLOAT,!1,e.stride,e.offset)}}drawBuffer(t,i){this.bindProgram(i),this.bindBuffer(t),this.gl.drawArrays(this.gl.TRIANGLES,0,this.buffers[t].num)}blendOff(){this.gl.disable(this.gl.BLEND)}blendPremul(){this.gl.enable(this.gl.BLEND),this.gl.blendFunc(this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA)}drawText(t,i,s,e){const n=this.fonts[t];if(n!==void 0){this.programs.font.uniforms.u_camera_position.value.set(h.currentViewWidth*.5,h.currentViewHeight*.5),this.programs.font.uniforms.u_camera_scale.value.set(h.currentViewWidth*.5,h.currentViewHeight*.5),this.programs.font.uniforms.u_size.value.set(n.spec.width,n.spec.height),this.programs.font.uniforms.u_char_size.value.set(n.spec.width,n.spec.height),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,n.id),i+=n.spec.width>>1,s+=n.spec.height>>1;for(let a of e){if(a==`
`){i=n.spec.width>>1,s+=n.spec.height;continue}const c=a.codePointAt(0);if(c!==void 0){const m=n.map[c];m!==void 0&&(this.programs.font.uniforms.u_position.value.set(i,s),this.programs.font.uniforms.u_char_pos.value.setFrom(m),this.drawBuffer("quad","font"))}i+=n.spec.width}}}}{let p=function(f,A){let E=g.camera.worldCoords(new r(f,A)),b=g.getClosestAt(E);b!==null&&r.distance(E,b.position)<=b.radius&&g.divideCell(b)&&(x=!0)},t=function(){m=[window.innerWidth,window.innerHeight],n.width=m[0],n.height=m[1],h.resize(m[0],m[1])},i=function(f){p(f.pageX,f.pageY),f.preventDefault()},s=function(f){f.preventDefault()},e=function(f){for(requestAnimationFrame(e),y+=(f-v)/1e3,v=f;y>=w;)x&&g.update(w),y-=w;c.programs.background.uniforms.u_time.value=f,c.programs.cell.uniforms.u_resolution.value.set(n.width,n.height),c.programs.cell.uniforms.u_time.value=f,a.viewport(0,0,n.width,n.height),a.clear(a.COLOR_BUFFER_BIT),g.draw(c)};const n=document.createElement("canvas");document.body.appendChild(n);const a=n.getContext("webgl2");a.clearColor(1,1,0,1);const c=new C(a);let m=[1,1],g=new I;g.generate();let x=!1;window.addEventListener("resize",t,!1),window.addEventListener("pointerdown",i),window.addEventListener("touchstart",s,{passive:!1}),t();let v=performance.now();const w=1/30;let y=0;requestAnimationFrame(e)}
