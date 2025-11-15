(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(e){if(e.ep)return;e.ep=!0;const n=t(e);fetch(e.href,n)}})();const l=class l{};l.sizeGrowth=.1,l.feedbackDeathDelay=1,l.feedbackDeathBlinkDelay=.05,l.minRadius=10,l.maxRadius=50,l.minVelocity=60,l.maxVelocity=200,l.divideDelay=3,l.divideAnimDuration=1,l.chainDelay=.5,l.deadDelay=1.5,l.minInfluence=10,l.maxInfluence=160,l.rotationRate=.04,l.minOffset=2,l.maxOffset=4,l.minAlpha=76,l.maxAlpha=13,l.minAngle=10,l.maxAngle=70,l.colorRight=[0,255,229],l.colorLeft=[255,255,0],l.colorDivideFill=[255,255,255],l.colorDivideLine=[255,255,0,255],l.colorDirectionLine=[255,255,255,51],l.colorChainInfluence=[0,128,0,76],l.colorDeadInfluence=[255,0,0,76];let o=l;const u=class u{static resize(i,t){u.currentViewWidth=i,u.currentViewHeight=t,u.currentScale=i/u.refWidth,u.currentWorldWidth=u.refWidth,u.currentWorldHeight=t/u.currentScale,u.aspect=u.currentWorldWidth/u.currentWorldHeight}};u.currentViewWidth=0,u.currentViewHeight=0,u.currentScale=1,u.currentWorldWidth=0,u.currentWorldHeight=0,u.aspect=1,u.refWidth=1024,u.numBackgroundPoints=2e3,u.cameraStiffness=.05;let h=u;class f{static halton(i,t){let s=0,e=1/t;for(;i>0;){let n=i%t;s+=n*e,i=(i-n)/t,e/=t}return s}static lerp(i,t,s){return i+(t-i)*s}static clamp(i,t,s){return i<t?t:i>s?s:i}static ease(i){return i=i-1,i*i*i*i}static rad(i){return i*Math.PI/180}}class r{constructor(i=0,t=0){this.x=0,this.y=0,this.set(i,t)}copy(){return new r(this.x,this.y)}set(i,t){this.x=i,this.y=t}setFrom(i){this.x=i.x,this.y=i.y}add(i){return this.x+=i.x,this.y+=i.y,this}mul(i){return i instanceof r?(this.x-=i.x,this.y-=i.y):typeof i=="number"?(this.x*=i,this.y*=i):console.error("vec2","mul",i),this}sub(i){return this.x-=i.x,this.y-=i.y,this}static sub(i,t){return new r(i.x-t.x,i.y-t.y)}rotated(i){let t=Math.cos(i),s=Math.sin(i);return new r(t*this.x-s*this.y,s*this.x+t*this.y)}normalize(){let i=Math.sqrt(this.x*this.x+this.y*this.y);this.x/=i,this.y/=i}static dot(i,t){return i.x*t.x+i.y*t.y}static distance(i,t){return Math.sqrt(r.squaredDistance(i,t))}static squaredDistance(i,t){let s=t.x-i.x,e=t.y-i.y;return s*s+e*e}}class A{constructor(i,t,s){this.x=0,this.y=0,this.z=0,this.x=i,this.y=t,this.z=s}set(i,t,s){this.x=i,this.y=t,this.z=s}}class k{constructor(i,t,s,e){this.x=0,this.y=0,this.z=0,this.w=0,this.x=i,this.y=t,this.z=s,this.w=e}set(i,t,s,e){this.x=i,this.y=t,this.z=s,this.w=e}}class D{constructor(){this.position=new r(0,0),this.direction=new r(0,-1),this.size=0,this.timerDivide=0,this.timerChain=0,this.timerDead=0,this.dead=!1,this.rotation=0,this.blinking=!1,this.blinkShow=!0,this.blinkTimer=0,this.radius=0,this.influence=0,this.chainInfluence=0,this.deadInfluence=0,this.updateValues()}updateValues(){this.radius=f.lerp(o.minRadius,o.maxRadius,this.size),this.influence=this.radius+f.lerp(o.minInfluence,o.maxInfluence,this.size),this.chainInfluence=f.lerp(0,this.influence,f.clamp(this.timerChain/o.chainDelay,0,1)),this.deadInfluence=f.lerp(0,this.influence,f.clamp(this.timerDead/o.deadDelay,0,1)),!this.dead&&this.size>=1&&(this.dead=!0)}setInitialValues(){this.timerDivide=o.divideDelay,this.timerChain=o.chainDelay,this.size=.5}canChain(){return this.timerChain<o.chainDelay}dying(){return this.dead&&this.timerDead<o.deadDelay}die(){this.dead=!0,this.timerChain=o.chainDelay}canDivide(){return!this.isDead()&&!this.dying()&&this.timerDivide>=o.divideDelay}divide(){this.timerDivide=0,this.timerChain=0}isDividing(){return this.timerDivide<o.divideDelay}isDead(){return this.dead&&this.timerDead>=o.deadDelay}update(i,t){t||(this.dead?this.timerDead+=i:(this.size=f.clamp(this.size+o.sizeGrowth*i,0,1),this.position.add(this.direction.copy().mul(f.lerp(o.minVelocity,o.maxVelocity,f.ease(this.size))*i)),this.timerDivide+=i,this.timerChain+=i)),(1-this.size)/o.sizeGrowth<o.feedbackDeathDelay?(this.blinking||(this.blinking=!0),this.blinkTimer-=i,this.blinkTimer<0&&(this.blinkShow=!this.blinkShow,this.blinkTimer=o.feedbackDeathBlinkDelay)):this.blinkShow=!0,this.rotation+=o.rotationRate,this.updateValues()}}class S{constructor(){this.position=new r}reset(){this.position.set(0,0)}cameraCoords(i){return new r((i.x-this.position.x)*h.currentScale+h.currentViewWidth*.5,(i.y-this.position.y)*h.currentScale+h.currentViewHeight*.5)}worldCoords(i){return new r((i.x-h.currentViewWidth*.5)/h.currentScale+this.position.x,(i.y-h.currentViewHeight*.5)/h.currentScale+this.position.y)}}class P{constructor(){this.points=new Array,this.camera=new S,this.lookAt=new r,this.cells=new Array,this.cellsToDivide=new Array;for(let i=0;i<h.numBackgroundPoints;i++){const t={pos:new r(f.halton(i,2)-.5,f.halton(i,3)-.5),alpha:f.halton(i,5)};this.points.push(t)}}clear(){this.camera.reset(),this.lookAt.set(0,0),this.cells=[],this.cellsToDivide=[]}generate(){this.clear();let i=new D;i.setInitialValues(),i.updateValues(),this.cells.push(i)}getClosestAt(i){let t=Number.MAX_VALUE,s=null;for(let e of this.cells)if(!e.dead){let n=r.squaredDistance(e.position,i);(!t||n<t)&&(t=n,s=e)}return s}divideCell(i){if(!i.canDivide())return!1;for(let c=0;c<this.cells.length;c++)if(this.cells[c]===i){this.cells.splice(c,1);break}let t=f.lerp(o.minAngle,o.maxAngle,i.size),s=f.lerp(o.minRadius,o.maxRadius,i.size/2)+1,e=new r(-i.direction.y*s,i.direction.x*s),n=new D;n.size=i.size/2,n.position=i.position.copy().sub(e),n.direction=i.direction.rotated(f.rad(-t)),this.cells.push(n);let a=new D;return a.size=i.size/2,a.position=i.position.copy().add(e),a.direction=i.direction.rotated(f.rad(t)),this.cells.push(a),!0}processCellsToDivide(){for(;this.cellsToDivide.length>0;)this.divideCell(this.cellsToDivide[0]),this.cellsToDivide.splice(0,1)}updateCellCollisions(){for(let s=0;s<this.cells.length;s++)for(let e=s+1;e<this.cells.length;e++){let n=this.cells[s],a=this.cells[e],c=r.squaredDistance(n.position,a.position),p=n.radius+a.radius;if(c<p*p){let w=r.sub(a.position,n.position);w.normalize();let y=p-Math.sqrt(c),m=1/n.radius,g=1/a.radius,d=m/(m+g),_=g/(m+g);n.position.sub(w.copy().mul(y*d)),a.position.add(w.copy().mul(y*_));let b=r.sub(a.direction,n.direction);r.dot(b,w)<0&&(n.direction.sub(w.copy().mul(d)),n.direction.normalize(),a.direction.add(w.copy().mul(_)),a.direction.normalize())}}let i=-h.refWidth/2,t=h.refWidth/2;for(let s=0;s<this.cells.length;s++){let e=this.cells[s],n=!1;e.position.x-e.radius<i&&(e.position.x=i+e.radius,e.direction.x<0&&(n=!0)),e.position.x+e.radius>t&&(e.position.x=t-e.radius,e.direction.x>0&&(n=!0)),n&&(e.direction.x=-e.direction.x)}}updateCellInteractions(){for(let i=0;i<this.cells.length;i++)for(let t=0;t<this.cells.length;t++){if(i==t)continue;let s=this.cells[i],e=this.cells[t];if(s.dying()){let n=r.distance(s.position,e.position);s.deadInfluence+e.radius>n&&e.die()}else if(s.canChain()&&e.canDivide()){let n=r.distance(s.position,e.position);if(s.chainInfluence+e.radius>n){let a=!1;for(let c=0;c<this.cellsToDivide.length;c++){let p=this.cellsToDivide[c];if(e===p){a=!0;break}}a||this.cellsToDivide.push(e)}}}}updateCamera(){let i=0;for(let t=0;t<this.cells.length;t++){let s=this.cells[t];i=Math.min(i,s.position.y)}this.lookAt.y+=(i-this.lookAt.y)*h.cameraStiffness,this.camera.position.setFrom(this.lookAt)}update(i){let t=[];for(let s=0;s<this.cells.length;s++){let e=this.cells[s];e.update(i,!1),e.isDead()&&t.push(s)}for(let s=t.length-1;s>=0;s--)this.cells.splice(t[s],1);this.updateCellCollisions(),this.updateCellInteractions(),this.processCellsToDivide(),this.updateCamera()}draw(i){i.programs.background.uniforms.u_camera_position.value.setFrom(this.camera.position),i.programs.background.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5),i.blendOff(),i.drawBuffer("screen","background"),i.blendPremul(),i.programs.cell.uniforms.u_camera_position.value.setFrom(this.camera.position),i.programs.cell.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5);for(let t=0;t<this.cells.length;t++){let s=this.cells[t];i.programs.cell.uniforms.u_position.value.setFrom(s.position),i.programs.cell.uniforms.u_size.value.set(s.radius*2,s.radius*2),i.programs.cell.uniforms.u_direction.value.setFrom(s.direction),i.programs.cell.uniforms.u_split.value=f.clamp((s.timerDivide-o.divideDelay)/o.divideAnimDuration,0,1),i.programs.cell.uniforms.u_radius.value=o.maxRadius,s.blinkShow&&!s.dying()&&i.drawBuffer("quad","cell")}for(let t=0;t<this.cells.length;t++){let s=this.cells[t];i.programs.debug_circle.uniforms.u_camera_position.value.setFrom(this.camera.position),i.programs.debug_circle.uniforms.u_camera_scale.value.set(h.currentWorldWidth*.5,h.currentWorldHeight*.5),i.programs.debug_circle.uniforms.u_position.value.setFrom(s.position),s.chainInfluence<s.influence&&(i.programs.debug_circle.uniforms.u_size.value.set(s.chainInfluence*2,s.chainInfluence*2),i.programs.debug_circle.uniforms.u_thickness.value=1,i.programs.debug_circle.uniforms.u_color.value.set(0,.5,0,1),i.drawBuffer("quad","debug_circle")),s.dying()&&(i.programs.debug_circle.uniforms.u_size.value.set(s.deadInfluence*2,s.deadInfluence*2),i.programs.debug_circle.uniforms.u_thickness.value=1,i.programs.debug_circle.uniforms.u_color.value.set(1,0,0,1),i.drawBuffer("quad","debug_circle"))}}}const R=`#version 300 es
precision highp float;

`,B=`#version 300 es
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
}`,I=`#version 300 es
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
}`,F=`#version 300 es
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
}`,E=`#version 300 es
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
}`,L=`#version 300 es
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
}`;class T{constructor(i,t){this.location=i,this.value=t}}class V{constructor(i){this.uniforms={},this.id=i}}class W{constructor(i,t,s,e){this.index=i,this.size=t,this.stride=s,this.offset=e}}class H{constructor(i){this.attribs=[],this.num=0,this.id=i}}class O{constructor(i){this.programs={},this.buffers={},this.gl=i,this.createProgram("background",I,F,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_time:0}),this.createProgram("cell",z,E,{u_resolution:new r(0,0),u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(0,0),u_time:0,u_direction:new r(0,-1),u_split:0,u_radius:0}),this.createProgram("debug_circle",z,L,{u_camera_position:new r(0,0),u_camera_scale:new r(1,1),u_position:new r(0,0),u_size:new r(0,0),u_thickness:0,u_color:new k(0,0,0,0)}),this.createBuffer("screen",[[2,16,0],[2,16,8]],[-1,-1,0,0,3,-1,2,0,-1,3,0,2]),this.createBuffer("quad",[[2,16,0],[2,16,8]],[-.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,-.5,0,0,.5,.5,1,1,-.5,.5,0,1])}createProgram(i,t,s,e){const n=new V(this.gl.createProgram());if(n.id===null)throw"createProgram";let a=(m,g)=>{const d=this.gl.createShader(m);if(d===null)throw"createShader";if(this.gl.shaderSource(d,g),this.gl.compileShader(d),!this.gl.getShaderParameter(d,this.gl.COMPILE_STATUS))throw`compileShader:${this.gl.getShaderInfoLog(d)}:${g}`;return d};const c=R+t.replace(`#version 300 es
precision highp float;
`,""),p=a(this.gl.VERTEX_SHADER,c),w=B+s.replace(`#version 300 es
precision highp float;
`,""),y=a(this.gl.FRAGMENT_SHADER,w);if(this.gl.attachShader(n.id,p),this.gl.attachShader(n.id,y),this.gl.linkProgram(n.id),!this.gl.getProgramParameter(n.id,this.gl.LINK_STATUS))throw`linkProgram:${this.gl.getProgramInfoLog(n.id)}`;for(let m in e){const g=this.gl.getUniformLocation(n.id,m);g===null&&console.warn(`getUniformLocation:${i}:${m}`),n.uniforms[m]=new T(g,e[m])}this.programs[i]=n}createBuffer(i,t,s){const e=new H(this.gl.createBuffer());if(e.id===null)throw"createBuffer";this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.id),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(s),this.gl.STATIC_DRAW);let n=0;for(let a=0;a<t.length;a++){const c=t[a];n+=c[0],e.attribs.push(new W(a,c[0],c[1],c[2]))}e.num=s.length/n,this.buffers[i]=e}bindProgram(i){const t=this.programs[i];this.gl.useProgram(t.id);for(let s in t.uniforms){const e=t.uniforms[s];e.location!==null&&(typeof e.value=="number"&&this.gl.uniform1f(e.location,e.value),e.value instanceof r&&this.gl.uniform2f(e.location,e.value.x,e.value.y),e.value instanceof A&&this.gl.uniform3f(e.location,e.value.x,e.value.y,e.value.z),e.value instanceof k&&this.gl.uniform4f(e.location,e.value.x,e.value.y,e.value.z,e.value.w))}}bindBuffer(i){const t=this.buffers[i];this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t.id);for(let s=0;s<t.attribs.length;s++){const e=t.attribs[s];this.gl.enableVertexAttribArray(s),this.gl.vertexAttribPointer(s,e.size,this.gl.FLOAT,!1,e.stride,e.offset)}}drawBuffer(i,t){this.bindProgram(t),this.bindBuffer(i),this.gl.drawArrays(this.gl.TRIANGLES,0,this.buffers[i].num)}blendOff(){this.gl.disable(this.gl.BLEND)}blendPremul(){this.gl.enable(this.gl.BLEND),this.gl.blendFunc(this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA)}}{let v=function(d,_){let b=p.camera.worldCoords(new r(d,_)),x=p.getClosestAt(b);x!==null&&r.distance(b,x.position)<=x.radius&&p.divideCell(x)&&(w=!0)},i=function(){c=[window.innerWidth,window.innerHeight],e.width=c[0],e.height=c[1],h.resize(c[0],c[1])},t=function(d){v(d.pageX,d.pageY)},s=function(d){for(requestAnimationFrame(s),g+=(d-y)/1e3,y=d;g>=m;)w&&p.update(m),g-=m;a.programs.background.uniforms.u_time.value=d,a.programs.cell.uniforms.u_resolution.value.set(e.width,e.height),a.programs.cell.uniforms.u_time.value=d,n.viewport(0,0,e.width,e.height),n.clear(n.COLOR_BUFFER_BIT),p.draw(a)};const e=document.createElement("canvas");document.body.appendChild(e);const n=e.getContext("webgl2");n.clearColor(1,1,0,1);const a=new O(n);let c=[1,1],p=new P;p.generate();let w=!1;window.addEventListener("resize",i,!1),window.addEventListener("pointerdown",t),i();let y=performance.now();const m=1/30;let g=0;requestAnimationFrame(s)}
