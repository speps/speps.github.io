(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();const l=class l{};l.sizeGrowth=.1,l.feedbackDeathDelay=1,l.feedbackDeathBlinkDelay=.05,l.minRadius=10,l.maxRadius=50,l.minVelocity=60,l.maxVelocity=200,l.divideDelay=3,l.divideAnimDuration=1,l.chainDelay=.5,l.deadDelay=1.5,l.minInfluence=10,l.maxInfluence=160,l.rotationRate=.04,l.minOffset=2,l.maxOffset=4,l.minAlpha=76,l.maxAlpha=13,l.minAngle=10,l.maxAngle=70,l.colorRight=[0,255,229],l.colorLeft=[255,255,0],l.colorDivideFill=[255,255,255],l.colorDivideLine=[255,255,0,255],l.colorDirectionLine=[255,255,255,51],l.colorChainInfluence=[0,128,0,76],l.colorDeadInfluence=[255,0,0,76];let o=l;const u=class u{static resize(e,t){u.currentViewWidth=e,u.currentViewHeight=t,u.currentScale=e/u.refWidth,u.currentWorldWidth=u.refWidth,u.currentWorldHeight=t/u.currentScale,u.aspect=u.currentWorldWidth/u.currentWorldHeight}};u.currentViewWidth=0,u.currentViewHeight=0,u.currentScale=1,u.currentWorldWidth=0,u.currentWorldHeight=0,u.aspect=1,u.refWidth=1024,u.numBackgroundPoints=2e3,u.cameraStiffness=.05;let h=u;class f{static halton(e,t){let s=0,i=1/t;for(;e>0;){let n=e%t;s+=n*i,e=(e-n)/t,i/=t}return s}static lerp(e,t,s){return e+(t-e)*s}static clamp(e,t,s){return e<t?t:e>s?s:e}static ease(e){return e=e-1,e*e*e*e}static rad(e){return e*Math.PI/180}}class r{constructor(e=0,t=0){this.x=0,this.y=0,this.set(e,t)}copy(){return new r(this.x,this.y)}set(e,t){this.x=e,this.y=t}setFrom(e){this.x=e.x,this.y=e.y}add(e){return this.x+=e.x,this.y+=e.y,this}mul(e){return e instanceof r?(this.x-=e.x,this.y-=e.y):typeof e=="number"?(this.x*=e,this.y*=e):console.error("vec2","mul",e),this}sub(e){return this.x-=e.x,this.y-=e.y,this}static sub(e,t){return new r(e.x-t.x,e.y-t.y)}rotated(e){let t=Math.cos(e),s=Math.sin(e);return new r(t*this.x-s*this.y,s*this.x+t*this.y)}normalize(){let e=Math.sqrt(this.x*this.x+this.y*this.y);this.x/=e,this.y/=e}static dot(e,t){return e.x*t.x+e.y*t.y}static distance(e,t){return Math.sqrt(r.squaredDistance(e,t))}static squaredDistance(e,t){let s=t.x-e.x,i=t.y-e.y;return s*s+i*i}}class R{constructor(e,t,s){this.x=0,this.y=0,this.z=0,this.x=e,this.y=t,this.z=s}set(e,t,s){this.x=e,this.y=t,this.z=s}}class S{constructor(e,t,s,i){this.x=0,this.y=0,this.z=0,this.w=0,this.x=e,this.y=t,this.z=s,this.w=i}set(e,t,s,i){this.x=e,this.y=t,this.z=s,this.w=i}}class A{constructor(){this.position=new r(0,0),this.direction=new r(0,-1),this.size=0,this.timerDivide=0,this.timerChain=0,this.timerDead=0,this.dead=!1,this.rotation=0,this.blinking=!1,this.blinkShow=!0,this.blinkTimer=0,this.radius=0,this.influence=0,this.chainInfluence=0,this.deadInfluence=0,this.updateValues()}updateValues(){this.radius=f.lerp(o.minRadius,o.maxRadius,this.size),this.influence=this.radius+f.lerp(o.minInfluence,o.maxInfluence,this.size),this.chainInfluence=f.lerp(0,this.influence,f.clamp(this.timerChain/o.chainDelay,0,1)),this.deadInfluence=f.lerp(0,this.influence,f.clamp(this.timerDead/o.deadDelay,0,1)),!this.dead&&this.size>=1&&(this.dead=!0)}setInitialValues(){this.timerDivide=o.divideDelay,this.timerChain=o.chainDelay,this.size=.5}canChain(){return this.timerChain<o.chainDelay}dying(){return this.dead&&this.timerDead<o.deadDelay}die(){this.dead=!0,this.timerChain=o.chainDelay}canDivide(){return!this.isDead()&&!this.dying()&&this.timerDivide>=o.divideDelay}divide(){this.timerDivide=0,this.timerChain=0}isDividing(){return this.timerDivide<o.divideDelay}isDead(){return this.dead&&this.timerDead>=o.deadDelay}update(e,t){t||(this.dead?this.timerDead+=e:(this.size=f.clamp(this.size+o.sizeGrowth*e,0,1),this.position.add(this.direction.copy().mul(f.lerp(o.minVelocity,o.maxVelocity,f.ease(this.size))*e)),this.timerDivide+=e,this.timerChain+=e)),(1-this.size)/o.sizeGrowth<o.feedbackDeathDelay?(this.blinking||(this.blinking=!0),this.blinkTimer-=e,this.blinkTimer<0&&(this.blinkShow=!this.blinkShow,this.blinkTimer=o.feedbackDeathBlinkDelay)):this.blinkShow=!0,this.rotation+=o.rotationRate,this.updateValues()}}class B{constructor(){this.position=new r}reset(){this.position.set(0,0)}cameraCoords(e){return new r((e.x-this.position.x)*h.currentScale+h.currentViewWidth*.5,(e.y-this.position.y)*h.currentScale+h.currentViewHeight*.5)}worldCoords(e){return new r((e.x-h.currentViewWidth*.5)/h.currentScale+this.position.x,(e.y-h.currentViewHeight*.5)/h.currentScale+this.position.y)}}class F{constructor(){this.points=new Array,this.camera=new B,this.lookAt=new r,this.cells=new Array,this.cellsToDivide=new Array;for(let e=0;e<h.numBackgroundPoints;e++){const t={pos:new r(f.halton(e,2)-.5,f.halton(e,3)-.5),alpha:f.halton(e,5)};this.points.push(t)}}clear(){this.camera.reset(),this.lookAt.set(0,0),this.cells=[],this.cellsToDivide=[]}generate(){this.clear();let e=new A;e.setInitialValues(),e.updateValues(),this.cells.push(e)}getClosestAt(e){let t=Number.MAX_VALUE,s=null;for(let i of this.cells)if(!i.dead){let n=r.squaredDistance(i.position,e);(!t||n<t)&&(t=n,s=i)}return s}divideCell(e){if(!e.canDivide())return!1;for(let c=0;c<this.cells.length;c++)if(this.cells[c]===e){this.cells.splice(c,1);break}let t=f.lerp(o.minAngle,o.maxAngle,e.size),s=f.lerp(o.minRadius,o.maxRadius,e.size/2)+1,i=new r(-e.direction.y*s,e.direction.x*s),n=new A;n.size=e.size/2,n.position=e.position.copy().sub(i),n.direction=e.direction.rotated(f.rad(-t)),this.cells.push(n);let a=new A;return a.size=e.size/2,a.position=e.position.copy().add(i),a.direction=e.direction.rotated(f.rad(t)),this.cells.push(a),!0}processCellsToDivide(){for(;this.cellsToDivide.length>0;)this.divideCell(this.cellsToDivide[0]),this.cellsToDivide.splice(0,1)}updateCellCollisions(){for(let s=0;s<this.cells.length;s++)for(let i=s+1;i<this.cells.length;i++){let n=this.cells[s],a=this.cells[i],c=r.squaredDistance(n.position,a.position),g=n.radius+a.radius;if(c<g*g){let v=r.sub(a.position,n.position);v.normalize();let _=g-Math.sqrt(c),d=1/n.radius,w=1/a.radius,y=d/(d+w),b=w/(d+w);n.position.sub(v.copy().mul(_*y)),a.position.add(v.copy().mul(_*b));let D=r.sub(a.direction,n.direction);r.dot(D,v)<0&&(n.direction.sub(v.copy().mul(y)),n.direction.normalize(),a.direction.add(v.copy().mul(b)),a.direction.normalize())}}let e=-h.refWidth/2,t=h.refWidth/2;for(let s=0;s<this.cells.length;s++){let i=this.cells[s],n=!1;i.position.x-i.radius<e&&(i.position.x=e+i.radius,i.direction.x<0&&(n=!0)),i.position.x+i.radius>t&&(i.position.x=t-i.radius,i.direction.x>0&&(n=!0)),n&&(i.direction.x=-i.direction.x)}}updateCellInteractions(){for(let e=0;e<this.cells.length;e++)for(let t=0;t<this.cells.length;t++){if(e==t)continue;let s=this.cells[e],i=this.cells[t];if(s.dying()){let n=r.distance(s.position,i.position);s.deadInfluence+i.radius>n&&i.die()}else if(s.canChain()&&i.canDivide()){let n=r.distance(s.position,i.position);if(s.chainInfluence+i.radius>n){let a=!1;for(let c=0;c<this.cellsToDivide.length;c++){let g=this.cellsToDivide[c];if(i===g){a=!0;break}}a||this.cellsToDivide.push(i)}}}}updateCamera(){let e=0;for(let t=0;t<this.cells.length;t++){let s=this.cells[t];e=Math.min(e,s.position.y)}this.lookAt.y+=(e-this.lookAt.y)*h.cameraStiffness,this.camera.position.setFrom(this.lookAt)}update(e){let t=[];for(let s=0;s<this.cells.length;s++){let i=this.cells[s];i.update(e,!1),i.isDead()&&t.push(s)}for(let s=t.length-1;s>=0;s--)this.cells.splice(t[s],1);this.updateCellCollisions(),this.updateCellInteractions(),this.processCellsToDivide(),this.updateCamera()}draw(e){e.programs.background.uniforms.u_camera_position.value.setFrom(this.camera.position),e.programs.background.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5),e.blendOff(),e.drawBuffer("screen","background"),e.blendPremul(),e.programs.cell.uniforms.u_camera_position.value.setFrom(this.camera.position),e.programs.cell.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5);for(let t=0;t<this.cells.length;t++){let s=this.cells[t];e.programs.cell.uniforms.u_position.value.setFrom(s.position),e.programs.cell.uniforms.u_size.value.set(s.radius*2,s.radius*2),e.programs.cell.uniforms.u_direction.value.setFrom(s.direction),e.programs.cell.uniforms.u_split.value=f.clamp((s.timerDivide-o.divideDelay)/o.divideAnimDuration,0,1),e.programs.cell.uniforms.u_radius.value=o.maxRadius,s.blinkShow&&!s.dying()&&e.drawBuffer("quad","cell")}for(let t=0;t<this.cells.length;t++){let s=this.cells[t];e.programs.debug_circle.uniforms.u_camera_position.value.setFrom(this.camera.position),e.programs.debug_circle.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5),e.programs.debug_circle.uniforms.u_position.value.setFrom(s.position),s.chainInfluence<s.influence&&(e.programs.debug_circle.uniforms.u_size.value.set(s.chainInfluence*2,s.chainInfluence*2),e.programs.debug_circle.uniforms.u_thickness.value=1,e.programs.debug_circle.uniforms.u_color.value.set(0,.5,0,1),e.drawBuffer("quad","debug_circle")),s.dying()&&(e.programs.debug_circle.uniforms.u_size.value.set(s.deadInfluence*2,s.deadInfluence*2),e.programs.debug_circle.uniforms.u_thickness.value=1,e.programs.debug_circle.uniforms.u_color.value.set(1,0,0,1),e.drawBuffer("quad","debug_circle"))}}}const I=`#version 300 es
precision highp float;

`,E=`#version 300 es
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
}`,L=`#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

out vec2 v_uv;

void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position.x, -a_position.y, 0, 1);
}`,P=`#version 300 es
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
}`,T=`#version 300 es
precision highp float;

uniform vec2 u_camera_position;
uniform vec2 u_camera_scale;
uniform float u_time;
uniform vec2 u_mouse;

in vec2 v_uv;

vec3 sampleBackground(vec2, float);

out vec4 color;
void main() {
    color.rgb = sampleBackground(v_uv, u_camera_position.y * 0.1);
    color.a = 1.0;
}`,V=`#version 300 es
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
}`,W=`#version 300 es
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
}`;class H{constructor(e,t){this.location=e,this.value=t}}class O{constructor(e){this.uniforms={},this.id=e}}class q{constructor(e,t,s,i){this.index=e,this.size=t,this.stride=s,this.offset=i}}class N{constructor(e){this.attribs=[],this.num=0,this.id=e}}class M{constructor(e){this.programs={},this.buffers={},this.gl=e,this.createProgram("background",L,T,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_time:0,u_mouse:new r(0,0)}),this.createProgram("cell",P,V,{u_resolution:new r(0,0),u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(0,0),u_time:0,u_direction:new r(0,-1),u_split:0,u_radius:0}),this.createProgram("debug_circle",P,W,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(0,0),u_thickness:0,u_color:new S(0,0,0,0)}),this.createBuffer("screen",[[2,16,0],[2,16,8]],[-1,-1,0,0,3,-1,2,0,-1,3,0,2]),this.createBuffer("quad",[[2,16,0],[2,16,8]],[-.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,-.5,0,0,.5,.5,1,1,-.5,.5,0,1])}createProgram(e,t,s,i){const n=new O(this.gl.createProgram());if(n.id===null)throw"createProgram";let a=(d,w)=>{const y=this.gl.createShader(d);if(y===null)throw"createShader";if(this.gl.shaderSource(y,w),this.gl.compileShader(y),!this.gl.getShaderParameter(y,this.gl.COMPILE_STATUS))throw`compileShader:${this.gl.getShaderInfoLog(y)}:${w}`;return y};const c=I+t.replace(`#version 300 es
precision highp float;
`,""),g=a(this.gl.VERTEX_SHADER,c),v=E+s.replace(`#version 300 es
precision highp float;
`,""),_=a(this.gl.FRAGMENT_SHADER,v);if(this.gl.attachShader(n.id,g),this.gl.attachShader(n.id,_),this.gl.linkProgram(n.id),!this.gl.getProgramParameter(n.id,this.gl.LINK_STATUS))throw`linkProgram:${this.gl.getProgramInfoLog(n.id)}`;for(let d in i){const w=this.gl.getUniformLocation(n.id,d);w===null&&console.warn(`getUniformLocation:${e}:${d}`),n.uniforms[d]=new H(w,i[d])}this.programs[e]=n}createBuffer(e,t,s){const i=new N(this.gl.createBuffer());if(i.id===null)throw"createBuffer";this.gl.bindBuffer(this.gl.ARRAY_BUFFER,i.id),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(s),this.gl.STATIC_DRAW);let n=0;for(let a=0;a<t.length;a++){const c=t[a];n+=c[0],i.attribs.push(new q(a,c[0],c[1],c[2]))}i.num=s.length/n,this.buffers[e]=i}bindProgram(e){const t=this.programs[e];this.gl.useProgram(t.id);for(let s in t.uniforms){const i=t.uniforms[s];i.location!==null&&(typeof i.value=="number"&&this.gl.uniform1f(i.location,i.value),i.value instanceof r&&this.gl.uniform2f(i.location,i.value.x,i.value.y),i.value instanceof R&&this.gl.uniform3f(i.location,i.value.x,i.value.y,i.value.z),i.value instanceof S&&this.gl.uniform4f(i.location,i.value.x,i.value.y,i.value.z,i.value.w))}}bindBuffer(e){const t=this.buffers[e];this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t.id);for(let s=0;s<t.attribs.length;s++){const i=t.attribs[s];this.gl.enableVertexAttribArray(s),this.gl.vertexAttribPointer(s,i.size,this.gl.FLOAT,!1,i.stride,i.offset)}}drawBuffer(e,t){this.bindProgram(t),this.bindBuffer(e),this.gl.drawArrays(this.gl.TRIANGLES,0,this.buffers[e].num)}blendOff(){this.gl.disable(this.gl.BLEND)}blendPremul(){this.gl.enable(this.gl.BLEND),this.gl.blendFunc(this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA)}}{let p=function(m,k){let x=d.camera.worldCoords(new r(m,k)),z=d.getClosestAt(x);z!==null&&r.distance(x,z.position)<=z.radius&&d.divideCell(z)&&(w=!0)},e=function(){v=[window.innerWidth,window.innerHeight],a.width=v[0],a.height=v[1],h.resize(v[0],v[1])},t=function(m){p(m.pageX,m.pageY)},s=function(m){for(let k=0;k<m.touches.length;k++){let x=m.touches.item(k);x&&p(x.pageX,x.pageY)}},i=function(m){_.set(m.pageX,window.innerHeight-m.pageY)},n=function(m){for(requestAnimationFrame(n),D+=(m-y)/1e3,y=m;D>=b;)w&&d.update(b),D-=b;g.programs.background.uniforms.u_time.value=m,g.programs.background.uniforms.u_mouse.value.setFrom(_),g.programs.cell.uniforms.u_resolution.value.set(a.width,a.height),g.programs.cell.uniforms.u_time.value=m,c.viewport(0,0,a.width,a.height),c.clear(c.COLOR_BUFFER_BIT),d.draw(g)};const a=document.createElement("canvas");document.body.appendChild(a);const c=a.getContext("webgl2");c.clearColor(1,1,0,1);const g=new M(c);let v=[1,1],_=new r(0,0),d=new F;d.generate();let w=!1;window.addEventListener("resize",e,!1),window.addEventListener("mouseup",t),window.addEventListener("touchend",s),window.addEventListener("mousemove",i),e();let y=performance.now();const b=1/30;let D=0;requestAnimationFrame(n)}
