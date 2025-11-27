(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=i(e);fetch(e.href,r)}})();const u=class u{};u.sizeGrowth=.1,u.feedbackDeathDelay=1,u.feedbackDeathBlinkDelay=.05,u.minRadius=10,u.maxRadius=50,u.minVelocity=60,u.maxVelocity=200,u.divideDelay=3,u.divideAnimDuration=1,u.chainDelay=.5,u.deadDelay=1.5,u.minInfluence=10,u.maxInfluence=160,u.rotationRate=.04,u.minOffset=2,u.maxOffset=4,u.minAlpha=76,u.maxAlpha=13,u.minAngle=10,u.maxAngle=70,u.colorRight=[0,255,229],u.colorLeft=[255,255,0],u.colorDivideFill=[255,255,255],u.colorDivideLine=[255,255,0,255],u.colorDirectionLine=[255,255,255,51],u.colorChainInfluence=[0,128,0,76],u.colorDeadInfluence=[255,0,0,76];let l=u;const h=class h{static resize(t,i){h.aspect=9/16,t<i*h.aspect?i=Math.round(t/h.aspect):t=Math.round(i*h.aspect),h.currentViewWidth=t,h.currentViewHeight=i,h.currentScale=t/h.refWidth,h.currentWorldWidth=h.refWidth,h.currentWorldHeight=i/h.currentScale}};h.currentViewWidth=0,h.currentViewHeight=0,h.currentScale=1,h.currentWorldWidth=0,h.currentWorldHeight=0,h.aspect=1,h.refWidth=1024,h.numBackgroundPoints=2e3,h.cameraStiffness=.05;let a=h;class p{static halton(t,i){let s=0,e=1/i;for(;t>0;){let r=t%i;s+=r*e,t=(t-r)/i,e/=i}return s}static lerp(t,i,s){return t+(i-t)*s}static clamp(t,i,s){return t<i?i:t>s?s:t}static ease(t){return t=t-1,t*t*t*t}static rad(t){return t*Math.PI/180}}class n{constructor(t=0,i=0){this.x=0,this.y=0,this.set(t,i)}copy(){return new n(this.x,this.y)}set(t,i){this.x=t,this.y=i}setFrom(t){this.x=t.x,this.y=t.y}add(t){return this.x+=t.x,this.y+=t.y,this}mul(t){return this.x*=t.x,this.y*=t.y,this}scale(t){return this.x*=t,this.y*=t,this}sub(t){return this.x-=t.x,this.y-=t.y,this}static sub(t,i){return new n(t.x-i.x,t.y-i.y)}rotated(t){let i=Math.cos(t),s=Math.sin(t);return new n(i*this.x-s*this.y,s*this.x+i*this.y)}normalize(){let t=Math.sqrt(this.x*this.x+this.y*this.y);this.x/=t,this.y/=t}static mul(t,i){return new n(t.x*i.x,t.y*i.y)}static scale(t,i){return new n(t.x*i,t.y*i)}static dot(t,i){return t.x*i.x+t.y*i.y}static distance(t,i){return Math.sqrt(n.squaredDistance(t,i))}static normalize(t){let i=Math.sqrt(t.x*t.x+t.y*t.y);return new n(t.x/i,t.y/i)}static squaredDistance(t,i){let s=i.x-t.x,e=i.y-t.y;return s*s+e*e}}class T{constructor(t,i,s){this.x=0,this.y=0,this.z=0,this.x=t,this.y=i,this.z=s}set(t,i,s){this.x=t,this.y=i,this.z=s}}class E{constructor(t,i,s,e){this.x=0,this.y=0,this.z=0,this.w=0,this.x=t,this.y=i,this.z=s,this.w=e}set(t,i,s,e){this.x=t,this.y=i,this.z=s,this.w=e}}class D{constructor(){this.position=new n(0,0),this.direction=new n(0,-1),this.size=0,this.timerDivide=0,this.timerChain=0,this.timerDead=0,this.dead=!1,this.rotation=0,this.blinking=!1,this.blinkShow=!0,this.blinkTimer=0,this.radius=0,this.influence=0,this.chainInfluence=0,this.deadInfluence=0,this.updateValues()}updateValues(){this.radius=p.lerp(l.minRadius,l.maxRadius,this.size),this.influence=this.radius+p.lerp(l.minInfluence,l.maxInfluence,this.size),this.chainInfluence=p.lerp(0,this.influence,p.clamp(this.timerChain/l.chainDelay,0,1)),this.deadInfluence=p.lerp(0,this.influence,p.clamp(this.timerDead/l.deadDelay,0,1)),!this.dead&&this.size>=1&&(this.dead=!0)}setInitialValues(){this.timerDivide=l.divideDelay,this.timerChain=l.chainDelay,this.size=.5}canChain(){return this.timerChain<l.chainDelay}dying(){return this.dead&&this.timerDead<l.deadDelay}die(){this.dead=!0,this.timerChain=l.chainDelay}canDivide(){return!this.isDead()&&!this.dying()&&this.timerDivide>=l.divideDelay}divide(){this.timerDivide=0,this.timerChain=0}isDividing(){return this.timerDivide<l.divideDelay}isDead(){return this.dead&&this.timerDead>=l.deadDelay}update(t,i){i||(this.dead?this.timerDead+=t:(this.size=p.clamp(this.size+l.sizeGrowth*t,0,1),this.position.add(this.direction.copy().scale(p.lerp(l.minVelocity,l.maxVelocity,p.ease(this.size))*t)),this.timerDivide+=t,this.timerChain+=t)),(1-this.size)/l.sizeGrowth<l.feedbackDeathDelay?(this.blinking||(this.blinking=!0),this.blinkTimer-=t,this.blinkTimer<0&&(this.blinkShow=!this.blinkShow,this.blinkTimer=l.feedbackDeathBlinkDelay)):this.blinkShow=!0,this.rotation+=l.rotationRate,this.updateValues()}}class k{constructor(){this.position=new n}reset(){this.position.set(0,0)}cameraCoords(t){return new n((t.x-this.position.x)*a.currentScale+a.currentViewWidth*.5,(t.y-this.position.y)*a.currentScale+a.currentViewHeight*.5)}worldCoords(t){return new n((t.x-a.currentViewWidth*.5)/a.currentScale+this.position.x,(t.y-a.currentViewHeight*.5)/a.currentScale+this.position.y)}}class W{constructor(){this.points=new Array,this.camera=new k,this.lookAt=new n,this.cells=new Array,this.cellsToDivide=new Array,this.particles=new Array;for(let t=0;t<a.numBackgroundPoints;t++){const i={pos:new n(p.halton(t,2)-.5,p.halton(t,3)-.5),alpha:p.halton(t,5)};this.points.push(i)}}clear(){this.camera.reset(),this.lookAt.set(0,0),this.cells=[],this.cellsToDivide=[]}generate(){this.clear();let t=new D;t.setInitialValues(),t.updateValues(),this.cells.push(t)}getClosestAt(t){let i=Number.MAX_VALUE,s=null;for(let e of this.cells)if(!e.dead){let r=n.squaredDistance(e.position,t);(!i||r<i)&&(i=r,s=e)}return s}divideCell(t){if(!t.canDivide())return!1;for(let c=0;c<this.cells.length;c++)if(this.cells[c]===t){this.cells.splice(c,1);break}let i=p.lerp(l.minAngle,l.maxAngle,t.size),s=p.lerp(l.minRadius,l.maxRadius,t.size/2)+1,e=new n(-t.direction.y*s,t.direction.x*s),r=new D;r.size=t.size/2,r.position=t.position.copy().sub(e),r.direction=t.direction.rotated(p.rad(-i)),this.cells.push(r);let o=new D;return o.size=t.size/2,o.position=t.position.copy().add(e),o.direction=t.direction.rotated(p.rad(i)),this.cells.push(o),!0}processCellsToDivide(){for(;this.cellsToDivide.length>0;)this.divideCell(this.cellsToDivide[0]),this.cellsToDivide.splice(0,1)}updateCellCollisions(){for(let s=0;s<this.cells.length;s++)for(let e=s+1;e<this.cells.length;e++){let r=this.cells[s],o=this.cells[e],c=n.squaredDistance(r.position,o.position),m=r.radius+o.radius;if(c<m*m){let f=n.sub(o.position,r.position);f.normalize();let x=m-Math.sqrt(c),v=1/r.radius,w=1/o.radius,y=v/(v+w),d=w/(v+w);r.position.sub(n.scale(f,x*y)),o.position.add(n.scale(f,x*d));let b=n.sub(o.direction,r.direction);n.dot(b,f)<0&&(r.direction.sub(n.scale(f,y)),r.direction.normalize(),o.direction.add(n.scale(f,d)),o.direction.normalize())}}let t=-a.refWidth/2,i=a.refWidth/2;for(let s=0;s<this.cells.length;s++){let e=this.cells[s],r=!1;e.position.x-e.radius<t&&(e.position.x=t+e.radius,e.direction.x<0&&(r=!0)),e.position.x+e.radius>i&&(e.position.x=i-e.radius,e.direction.x>0&&(r=!0)),r&&(e.direction.x=-e.direction.x)}}updateCellInteractions(){for(let t=0;t<this.cells.length;t++)for(let i=0;i<this.cells.length;i++){if(t==i)continue;let s=this.cells[t],e=this.cells[i];if(s.dying()){let r=n.distance(s.position,e.position);s.deadInfluence+e.radius>r&&e.die()}else if(s.canChain()&&e.canDivide()){let r=n.distance(s.position,e.position);if(s.chainInfluence+e.radius>r){let o=!1;for(let c=0;c<this.cellsToDivide.length;c++){let m=this.cellsToDivide[c];if(e===m){o=!0;break}}o||this.cellsToDivide.push(e)}}}}updateCamera(){let t=0;for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t=Math.min(t,s.position.y)}this.lookAt.y+=(t-this.lookAt.y)*a.cameraStiffness,this.camera.position.setFrom(this.lookAt)}update(t){let i=[];for(let s=0;s<this.cells.length;s++){let e=this.cells[s];e.update(t,!1),e.isDead()&&i.push(s)}for(let s=i.length-1;s>=0;s--)this.cells.splice(i[s],1);this.updateCellCollisions(),this.updateCellInteractions(),this.processCellsToDivide(),this.updateCamera()}draw(t){t.programs.background.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.background.uniforms.u_camera_scale.value.set(a.currentWorldWidth*.5,a.currentWorldHeight*.5),t.blendOff(),t.drawBuffer("screen","background"),t.blendPremul(),t.programs.cell.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.cell.uniforms.u_camera_scale.value.set(a.currentWorldWidth*.5,a.currentWorldHeight*.5);for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t.programs.cell.uniforms.u_position.value.setFrom(s.position),t.programs.cell.uniforms.u_size.value.set(s.radius*2,s.radius*2),t.programs.cell.uniforms.u_direction.value.setFrom(s.direction),t.programs.cell.uniforms.u_split.value=p.clamp((s.timerDivide-l.divideDelay)/l.divideAnimDuration,0,1),t.programs.cell.uniforms.u_radius.value=l.maxRadius,s.blinkShow&&!s.dying()&&t.drawBuffer("quad","cell")}for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t.programs.debug_circle.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.debug_circle.uniforms.u_camera_scale.value.set(a.currentWorldWidth*.5,a.currentWorldHeight*.5),t.programs.debug_circle.uniforms.u_position.value.setFrom(s.position),s.chainInfluence<s.influence&&(t.programs.debug_circle.uniforms.u_size.value.set(s.chainInfluence*2,s.chainInfluence*2),t.programs.debug_circle.uniforms.u_thickness.value=1,t.programs.debug_circle.uniforms.u_color.value.set(0,.5,0,1),t.drawBuffer("quad","debug_circle")),s.dying()&&(t.programs.debug_circle.uniforms.u_size.value.set(s.deadInfluence*2,s.deadInfluence*2),t.programs.debug_circle.uniforms.u_thickness.value=1,t.programs.debug_circle.uniforms.u_color.value.set(1,0,0,1),t.drawBuffer("quad","debug_circle"))}for(let i=0;i<this.cells.length;i++){let s=this.cells[i];t.drawWorldText("debug",this.camera.position,s.position.x,s.position.y,i.toString())}t.blendPremul(),t.programs.particle.uniforms.u_camera_position.value.setFrom(this.camera.position),t.programs.particle.uniforms.u_camera_scale.value.set(a.currentWorldWidth*.5,a.currentWorldHeight*.5);for(let i=0;i<this.particles.length;i++){let s=this.particles[i];t.programs.particle.uniforms.u_position.value.setFrom(s.position),t.programs.particle.uniforms.u_size.value.set(5,5),t.programs.particle.uniforms.u_direction.value.setFrom(n.normalize(s.velocity)),t.programs.particle.uniforms.u_radius.value=10,t.drawBuffer("quad","particle")}t.drawScreenText("debug",0,0,"microbobs")}}const B="sperry-pc",P=8,I=16,S=[null,0,13,1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,160,161,162,163,165,167,170,171,172,176,177,178,181,182,183,186,187,188,189,191,196,197,198,199,201,209,214,220,223,224,225,226,228,229,230,231,232,233,234,235,236,237,238,239,241,242,243,244,246,247,249,250,251,252,255,402,915,920,931,934,937,945,948,949,960,963,964,966,8226,8252,8319,8359,8592,8593,8594,8595,8596,8597,8616,8729,8730,8734,8735,8745,8776,8801,8804,8805,8962,8976,8992,8993,9472,9474,9484,9488,9492,9496,9500,9508,9516,9524,9532,9552,9553,9554,9555,9556,9557,9558,9559,9560,9561,9562,9563,9564,9565,9566,9567,9568,9569,9570,9571,9572,9573,9574,9575,9576,9577,9578,9579,9580,9600,9604,9608,9612,9616,9617,9618,9619,9632,9644,9650,9658,9660,9668,9675,9688,9689,9786,9787,9788,9792,9794,9824,9827,9829,9830,9834,9835],G="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIgAAAEQCAYAAABr+DzIAAAABmJLR0QA/wD/AP+gvaeTAAAUyUlEQVR4nO1dS44rtw6VjV7JnWUL2cTdUia5yHaDjDJyBu+VQdP8i1Sp3DyA0XbpR1EUxY/svo0xHqMRxuMhs+92u5W2r8b91NEb2+Mrs7PH48FKPN4puJ5WPjv+p4DjE3xO8SDKm6+fP3+O33///TnAP//8M/788093R5AQTCRFHHxGqVmq/Ha7kf3DOhYhjZbvAIpneM4cDyzzx2Vfv/322/j169f4+++/xxhj/PXXX2kTOBaUIgguNgep3LsjJIZaymehaUhNo+Kyg38UrRzfrdoG4lI2CMc0/FwTPEu/3j4s/d9uN3GRjgWHz6i+ZoWXooP7WyYgWENw72F96n0mPdR7bafiz1J9yHjr+NRY0kbI5hPUNscLjrNMg2QwiIKmVY5Fxf1ri+2lr1rA8c6GY1GCzPHYqm2P56leTKMGmhGKhUTTYriuJPDLNAjctRxB8IUJpepbyrNQpQE1SEYoRZ9l3tgGgQYv/DxGoYBI56WXwZrFL4FiHHymleO+pLGlY6vqiMKbznt84rnivylHjDZh6ZnWD2xrdZktAqUtSKYGgjuU6h8aifCZtW/cD8SsNpsWEEsuIRIoO9pm4ew4SHRzUPyL0GcRPqrPrzHG+OOPP8a///47xhjjx48f7oE13106My3l0jPcR9QmqfA8smA1Qrm2EN5+bqOzuVOwaNDK9tW4VCS1sR6tQRoiLhEos3pJjXwsvQ+CgzOwjIJkeEYsea3NbPkn4j7jJ1PBn0gmlQpYZS+ERl+U/p3AZaW5lwV3rmMPMXBncbH9KLRcgQUafZX0Xx1PL8YqVVS9mVC4BThXEGk/89kDS6h9tl9OU1Bls7mqNzeXW4To4mQAHkO773BP+v0o06BlbyvBGqmrCNAmK2UzdzAYJY0B5xY9JqX2K3jACkh20keClpPZGZqHNSvMkVyWpnE8tLwdMVxKW0t1V8Grss+GpPGiwO1Xzv+pQawDnrHbpR2gXRE46sxmQ62IGIWW7Gr0vsgs7tEBpUXSztvoeFEjFdsCkQCb9HkGcF74FaGNex6NL91npJGKHUiRT+q9Bk7YIkIC/3rbzgjYlZEWat/Js4CQdr/3XsWO85u5G2JqMy6Qze1k3Xm4hIA0zkNfGGqIMAtI1Mjk+qjAFQNtu+NFQLIYHEn5SwkoWCeDRm2sT4GXf1RZyhGjMRcShomEiTguWpiZrOM8kYwE2E5C5uUfR3vpN+so4s7MyGpuqod5OwmDBGtciuOLWUC0SChWYbN3Kmaju5k4MxcSgXa9wHP/Je2bddb8CCYKMl/KY8D0eWRxrO24MSx07oBs4Z0WEO24sKSarYm0M3au93jxRmotycYsRPi35GsPlHbR7lFwz1cLiZX2o9xLW+ZcKnhTbqRicEYqFgJLcmyloch5W7tAE46o8KRpEC697CUMCwpG1Baw2i9UHfwsagtdwYbBeBGQqPGH20YCZWeq5shYZywyJ2BV2mOMhEiqNvCx2/Br1qaI0qoZmBn3Y6LlEVhiO942ECVGKudnWwijjpCs4wv2792FGagWQKld+B7MWJju3z3A1HhH3wdpiOj7IA0RLSANEU8jVTNirEaOZmBCcK6x1WW2tLeWZ8Nqb3nqHdDmJ9WhjHMMWOeLauj9jJ9biJUIh58tUdRM+i1jRoJtHCxBt8h8uDqWbC6sc9cyl1r5LGb7P5t+Cz0aJHoi89P69NCj2iDWyWa7sFWRQW1MLehURVeG0MIcFkeXd5yvaBQzmocYI9cGoNTmWdcCLLYBBKcZcN7HMlZmxhu2JyOpmjEzmwvw9q+NJUUKOQHKhDT/rEivZawoJJvxTUCkM02rQ0E6HzmJn8kAU58pAaq0oWaRmQ6QNhTnCLAaxEoAHCCDQRZVy9FnYQA1RgSUF2PZ8RwqtQRcH+9mgHN6iYNEidIMo6vA6sZiSEKSseM9NFBjem0jiOfPYEZ2wDE4fkGiqtxJKzLH1zycDC9EG0OC5mVFQMZB8KB44plW8mz/WntP/7Nu7IyQWOZM9S2NmUHLM5JKgWOyRzioCXi8kMgY2f172kXsstkNxwmJVWCl9bmNTveXwLrou9tqLSANEZ3ub4hoAWmIUO+DcMaPVA7rWQNFnKEk5Ti49hZvwNq/N41gbW+lX+N/dXvTfRAtemnxzyVkhJWzorqRsbVcz2yuSuNNZXv1PgiFjKAQR9zZWE3PLP+r27M2yNmLdsb4GWHuyILtiKcGOZmObbCbJlsFTXhTvlkXMWS9Z3wlMjPTHM60kbT2UqIvRUBmjVQIyprWrO5Z4JTCzDFTIWBaqiKjPfTq4Oft/m8uJvSTEBWiWaGzhiVg3YPOj7dBopdlPhXe+bEC8slMOhPVAujtW6t/99yXsJZ7wI2fBdy/hfboIs66yAdm7sNYjjFslErjf3GD4AZ4AKmcq2chmCNagzUOEVnE2flR7aT5RmwUr5Bo7Z/vR6f7PxYZmr4FpCHi472YxhxaQBoi7o/H+y8QHq8xeANtp3KJflifKrMYw1K/FE0ziPRR4TYffb58efuKCSvLZRyprtUthH1TyMjn7Mj/048YzQ+fjROsgEavt6+dsFRAVkw+muuI0vYp9z84bJGsg6pZYnhlxjQ7kRaNqnJYkdGlsIWAjJGTLt/t6MkCNS/8TBKASPsDaf9QyErQjvctVo4RgYUeTQCk+tx6jbGRBpkVoKyF3VVIzrJpthAQygvYbYHOhLTDq5HixUCrHU8GL3iFAGT390leyCxMP4NZGYfY1U3cgYZKWOdmOmIs9xXOOhqkkLyklj10ni0olLBifkteDNdeKn+WjU73l0ITrt1trRaQhojTczGNvdEC0hDhFhDtTgTXJqseVSez/8YrXAJyWM27G1YNGpENstURE8k5NGqxlYA09gP5G2VjzN83oPrQAlWWQJs1GOetB/9i+nAZRb+Wbsew5FY8NGjrhwOK1uw7+Rtl1LPIAFp/VceFt28qk6zRK9WlnknlFv5JkWrr+BGem48YmGzLvi2VicxbYd46OyGLXvaIuSK+6zUB7mjMwFNArs7Y6juruwMn7bJ48DFeDL5v8l1xmABZPGDT/Z6duNui7KhJoul2a98Rr5NrA2khfx/keObBWVfidoCFfxo/Z/hnXT/OVqHc52e9kZDut7hZWf3vphksyN7hK5H2M5izGsja/w5M+07oC0MNEVt87cGDiCb57tpnJg1yKTdXu27AXrxVXD/qjkuFka31aSnHtEpzOv4e84cv3AfH10sJSAUgc2YXsBJ4oVfR8u0FBOJgfJUHIWk+uOMtiy8FBiH9nDBZ53c5GyQb1nhFRijfEw7IFFLtqoKEu+UMqyw/3lOv7wzuqgXFGygAkhByxxPWnG+RVCuowald5ZV+bgfh995oJFUe9YKwyl7pEVnG5OpY14x7nxoo4wb2ChBH/OzC7BKdzITkfVnnKtkoXxka4OgwYwGyz/hPh7ZulvWVeGbWIDNGmqRhqDF2gpXpK8bl6nGfOU/GQ/dLNndm4lntvxssbqhk6Fs1f/SEMP8+iGSkWf3uFS5dBao9LBjFxBFNyJvIuNJaWPBy5TCyUFkq2BLMmfFCvG04GlYD8zJ6VITHH4uyubtriU/GTCR1iYC0cFwXfR/kQ1B19GyRrNshvD5LQ2UmWHJlj89SKH0Gack6iwRbQsFRQ5mCJ5I4Q0OWcESPYmucQ7JFqPzMGEkCMsPgDOHAofizciXeciudlDen1eHGsuZrjmd3/FD6XIldDdkZnkh1ufBAtD+pfCZ6fecqerUAPMMzYim4XPpcCUp9W8aPLIpFoDQh4OwTL16OGEk4NNVJvccEcp/hhFYHgCC0M9wSTYbIzjdFItlZPLw9Ho9HRHNUaAprO+rzgUobxKJlZ4TD059mb2kaB0Ki6S3df4aRNwtrroILuVsijV7h8B7ZlTy3bi6KnrdsLvX5U8DNx+oBcJ/xM8kOoI6yM3mtrTWbrPtUIfEiqjmgbSVplTH4K5dezRgFdRSRcRCP2zVjGUew0nOB0HgiCQCuH52/5vF4PSJpDDyH8q89WL0gqT21KLtoN8me0dzZqL1SCXxylAtIxUR3EAwKlkXmtMxKN98z1m1sns3dRVN4wWk+jB3mJtG1vYA0zsVbup+SpuPM1+o1Pg/qfZBDVR7nJDYQpUCLpfxKoDbKp+Mtm6u5acfrDFiTZLN9cO3gRqnA7PxmBJhr9yIgHn9aCvLA59HoZQWkjCdV90qQBHhmfnd4bOCXpzOqndSWqqftAG33WhNlES0Aj9jKnElkfvj5zPzenj8er9lcavCjA44oKdBjmdROgaLGK1z/WNkb+MlcZC5XsEM53ETShtqVflgHP9/qF4Ys2op6dmY5V28X+izlEp43yjBWaAVuTOpMtbQ7ozwzAbcjnvdBzoL1iJp1XyvLvQZ99vgZ5RxcR8wKLUKBU5E7lFsMcsucztaSHLawQT7da6FcyKvM1/3VSyo1TcU0pJgD57fD11UYyIESCC14KLVfXX7g9hBqckcK5W1goZEIisQ8KIZj9X5WucXNxXO5ipt7err/E7SFBVc9Yk4XkMbe2OLnHxr7ogWkIcJ0o8xSpuHwTqS+LP1r9GXS6BnbUmeWPguiY0APEsKsQbDFjsu0z4ebV+XG4jEkerhnlYjSx9HJteHGsNKG26o3yvBz7+BHG/ieEw6tbwt9URo12nagz4NoRPdo+3TXR3sxHwMtvoJjOlLq5Hgu/sIQ1ShSDtUld0biSOrqcu+8PPbUTLnniKGAtSI8TixYlovBkoqjlGfdh9AYfZWA1gwkHiwTkF0ZvStdB7irD1yagwv1S5tBSo1skc1tzMFz3cC7ITpQdgHA3b86d9UCArAikHU1tIAEUOXtSeVVt/m0+zpb2CDajavqcukZ1X71ZwkZQkON/3w/OlB2CViitCUaZrSAbA9t4TnXNgMtIA0RbaSeDEsa4kyol5bH4K1qCM7I8SCjj5XwnPmSraClITBm+OttS/7nbUyYZgRpE7bAes5CnClEKwNWUp7Jimig7X4QoLmBXHZRu09ghdQGZiDhayV2PQIsgGvkXRtTHCRDQ1gQCQZJk/Wof6m9lBzbBRLfqA1s7Uf9x8qShogsgIXpHt/em+2U2lrmr9kScI5ZsGj3rDExT95+qz1bO1iYaBXMrPFxlDUDnIBboO1wi20WtdG0Y/2LelgN73HlucdQidWZVAsNs5taczq+qIfeAaptlLMXZQz7UXe8r6IB/sWGZ4XGVQNllNXLSTFVdnVwVj9nm1XOHQqE5xiKjHGA/KeG+JmU7atGhV00Qwf87G0fbXsm7lbmQ2GBkIycKHYQCEojzsRgsBF7FbA/YgdBTU5yI/FO4z4fzNbcOE7NW/x5z85fYUfMYjWNnc1tiOhsbkNEC0jjCeoY3+JOqhW7ZXS/A1zfzdXgMXajODOjmwXJqF8xdno21zrw8ZcL30rlZ2JGM3mzyTPJz1neeZKgB1IE5BgM/7WWnwlJoCEzx6BzSJ55aCn5nfhywPULQ9T7MfzZyN2YIIGLp0T7kSCNATfXSoQuDO0m7XCH491ecVcC9m+lz1rfy1vvEWcpg1AFRLpvUHF3ZIw48yNnrAZN+1kWyLPo1rzYqtyOKiDc5FZpkB1C3xk2iEVIdtLKB0w2CD77qiZSmcaOIssGGcNmY+wGsxczo9IqLxRhu8CSTIRtZ8aKQPLyKMy4xRZo/ZD3QbyDa+0hYyMT03avJLyzTMywQbx9elCtdZ7/kixrAbn2u3k+WbAanlK7SPkqvKT7MyN18Bk7+ORRlQFLoOxToEW5yY09+j7It0FE6Dvd3xDhEpDqs3A2G1ydTV7VfxWfI0dma5CGiBaQhogWkIaIFpCGiBaQhohLXVq+IjSPxJvSyG6v9dcCUozsaGx2bgmC/NpDtYR7+6uOVVTX9/YXSTdw7a0axnWrfaWEZwpj1viZ1xBW5G+s91ot9TAo/rSR2hDRAtIQ0QLSENEC0hDRAtIQ0QLSEOESkCwXTrr6bymP9u/th2sX7T/rnod2S1+7LG29TD1Ga5CGghaQhogWkIaIFpCGiBaQhgjzzz9gSN8ltdSLjlvdz9Xon02Aau1NP//g6bQyIxtheuRrpLNYSX/l/ZAxhPsg8IdYPB1q9XEswfNVTct42mdvf9piz9638GqIWX5pwF+Uf7kPctwjgBU8XyKelfbIbsju0/ODMN7yii9xe+6zwPXV6DvK20htiGgBaYhoAWmIaAFpiGgBaYhoAWmIcP0ElcVNspRn9l8dSZztT/tVQzwn6i/uy0pLBlqDFMP6C5AR4Vjx43YtIMWQhOPxeKga5OjjDOEYowVkGThNommQlcJBfje3ZKTGC1bYIFlZaIzWIMW4ig3CXch+y+bOZm+9z7P73w2aDXLU2eWYwZj+dj/VXkqRZ2RXPRnmXVB1zFTj9rgKh/8Pbyyg4r6EZ7xVcZAZG0S6RpD++yAaIdn3FXZHtQ1SzYf2Yopxtg0i1bMIV3sxi7BrHERzAlqDLMAKG6TqqGkBKcbuNojWvgWkGGfbILMC1AKyCJeNg4xx7n+cmp3sVdzdq6K9mIaIjzlitEjibLbTGqSryqpaYA1Eesq+LJ1ysISdVzCIGgef8d420nNpXtqYsI61HBuzUh3rekqRalhG/mPlDGAGze4sL0Msxpxl3lQdzcWkjEv8XtJwmnBbaaeADWOu7MDTBnk8HmLSxvqc6gdKpjZxaSzYd5ZAQ0Gj/kb60463aP9a1HOmbwi4Tm9GKicoGrR2lqgfJIzqn3pvLefGh9oAh7694IJgUn2NvipY3WXWi7EKSlSgMGYZpLWX1D0F6tyHZdKR58HBP0yTh/+e5xZaIFgvRtoJ1GKsDN5kgttJ1vmP4TNidwa1lm8CEp3YrKBYDDOtPUUP9xkbuVS0kjuKOLq1uhFoAmwR8MiYY/xvbnf4MGtCHhWP63Bl2hESPWIgo6m/WN171D/VH36mlVPzyVgnqwB/WQf07grss2OmeiYJjUj4jBpT68eLjKMjItAerWQ5Arn+NZ6UXjnMtMwlzaKpfotWitJIje+Jc1jLo/BqOtzmY5J1mg2ilVugBcdm+s4AR58ndoTn8TEC0qhBZ3MbIv4D0ClkrjuNVG4AAAAASUVORK5CYII=",j={name:B,width:P,height:I,glyphs:S,data:G},N=`#version 300 es
precision highp float;

`,F=`#version 300 es
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
}`,q=`#version 300 es
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
}`,M=`#version 300 es
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
}`,V=`#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_camera_position;
uniform float u_time;
uniform vec2 u_direction;
uniform float u_radius;

in vec2 v_uv;

float sdCircle(vec2, float);

out vec4 color;
void main() {
    const float radius = 0.5;
    float dist = -sdCircle(v_uv - vec2(0.5), radius);
    float aaf = fwidth(dist);
    float alpha = smoothstep(0.0, aaf, dist);
    color = vec4(alpha);
}`,U=`#version 300 es
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
}`,O=`#version 300 es
precision highp float;

uniform sampler2D u_font;
uniform vec2 u_char_pos;
uniform vec2 u_char_size;

in vec2 v_uv;

out vec4 color;
void main() {
    ivec2 char_coord = ivec2(u_char_pos + v_uv * u_char_size);
    color = texelFetch(u_font, char_coord, 0);
}`;class Y{constructor(t,i){this.map={},this.id=t,this.spec=i;let s=Math.ceil(Math.sqrt(i.glyphs.length));this.width=s*i.width,this.height=s*i.height;for(let e=0;e<i.glyphs.length;e++){let r=e%s,o=Math.floor(e/s);this.map[i.glyphs[e]]=new n(r*i.width,o*i.height)}}}class R{constructor(t=0){this.index=t}}class H{constructor(t,i){this.location=t,this.value=i}}class X{constructor(t){this.uniforms={},this.id=t}}class Z{constructor(t,i,s,e){this.index=t,this.size=i,this.stride=s,this.offset=e}}class C{constructor(t){this.attribs=[],this.num=0,this.id=t}}class K{constructor(t){this.fonts={},this.programs={},this.buffers={},this.gl=t,this.createProgram("background",L,q,{u_camera_position:new n(0,0),u_camera_scale:new n(1,1),u_time:0}),this.createProgram("cell",z,M,{u_resolution:new n(0,0),u_camera_position:new n(0,0),u_camera_scale:new n(1,1),u_position:new n(0,0),u_size:new n(1,1),u_time:0,u_direction:new n(0,-1),u_split:0,u_radius:0}),this.createProgram("particle",z,V,{u_resolution:new n(0,0),u_camera_position:new n(0,0),u_camera_scale:new n(1,1),u_position:new n(0,0),u_size:new n(1,1),u_time:0,u_direction:new n(0,-1),u_radius:0}),this.createProgram("debug_circle",z,U,{u_camera_position:new n(0,0),u_camera_scale:new n(1,1),u_position:new n(0,0),u_size:new n(1,1),u_thickness:0,u_color:new E(0,0,0,0)}),this.createProgram("font",z,O,{u_camera_position:new n(0,0),u_camera_scale:new n(1,1),u_position:new n(0,0),u_size:new n(1,1),u_font:new R(0),u_char_pos:new n(0,0),u_char_size:new n(0,0)}),this.createBuffer("screen",[[2,16,0],[2,16,8]],[-1,-1,0,0,3,-1,2,0,-1,3,0,2]),this.createBuffer("quad",[[2,16,0],[2,16,8]],[-.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,-.5,0,0,.5,.5,1,1,-.5,.5,0,1]),this.loadFont("debug",j)}createProgram(t,i,s,e){const r=new X(this.gl.createProgram());if(r.id===null)throw"createProgram";let o=(v,w)=>{const y=this.gl.createShader(v);if(y===null)throw"createShader";if(this.gl.shaderSource(y,w),this.gl.compileShader(y),!this.gl.getShaderParameter(y,this.gl.COMPILE_STATUS))throw`compileShader:${this.gl.getShaderInfoLog(y)}:${w}`;return y};const c=N+i.replace(`#version 300 es
precision highp float;
`,""),m=o(this.gl.VERTEX_SHADER,c),f=F+s.replace(`#version 300 es
precision highp float;
`,""),x=o(this.gl.FRAGMENT_SHADER,f);if(this.gl.attachShader(r.id,m),this.gl.attachShader(r.id,x),this.gl.linkProgram(r.id),!this.gl.getProgramParameter(r.id,this.gl.LINK_STATUS))throw`linkProgram:${this.gl.getProgramInfoLog(r.id)}`;for(let v in e){const w=this.gl.getUniformLocation(r.id,v);w===null&&console.warn(`getUniformLocation:${t}:${v}`),r.uniforms[v]=new H(w,e[v])}this.programs[t]=r}createBuffer(t,i,s){const e=new C(this.gl.createBuffer());if(e.id===null)throw"createBuffer";this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e.id),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(s),this.gl.STATIC_DRAW);let r=0;for(let o=0;o<i.length;o++){const c=i[o];r+=c[0],e.attribs.push(new Z(o,c[0],c[1],c[2]))}e.num=s.length/r,this.buffers[t]=e}loadFont(t,i){const s=new Y(this.gl.createTexture(),i);if(s.id===null)throw"createTexture";fetch(s.spec.data).then(e=>{e.blob().then(r=>{createImageBitmap(r).then(o=>{this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,s.id),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA8,this.gl.RGBA,this.gl.UNSIGNED_BYTE,o),this.fonts[t]=s})})})}bindProgram(t){const i=this.programs[t];this.gl.useProgram(i.id);for(let s in i.uniforms){const e=i.uniforms[s];e.location!==null&&(typeof e.value=="number"&&this.gl.uniform1f(e.location,e.value),e.value instanceof n&&this.gl.uniform2f(e.location,e.value.x,e.value.y),e.value instanceof T&&this.gl.uniform3f(e.location,e.value.x,e.value.y,e.value.z),e.value instanceof E&&this.gl.uniform4f(e.location,e.value.x,e.value.y,e.value.z,e.value.w),e.value instanceof R&&this.gl.uniform1i(e.location,e.value.index))}}bindBuffer(t){const i=this.buffers[t];this.gl.bindBuffer(this.gl.ARRAY_BUFFER,i.id);for(let s=0;s<i.attribs.length;s++){const e=i.attribs[s];this.gl.enableVertexAttribArray(s),this.gl.vertexAttribPointer(s,e.size,this.gl.FLOAT,!1,e.stride,e.offset)}}drawBuffer(t,i){this.bindProgram(i),this.bindBuffer(t),this.gl.drawArrays(this.gl.TRIANGLES,0,this.buffers[t].num)}blendOff(){this.gl.disable(this.gl.BLEND)}blendPremul(){this.gl.enable(this.gl.BLEND),this.gl.blendFunc(this.gl.ONE,this.gl.ONE_MINUS_SRC_ALPHA)}drawScreenText(t,i,s,e){const r=this.fonts[t];r!==void 0&&(this.programs.font.uniforms.u_camera_position.value.set(a.currentViewWidth*.5,a.currentViewHeight*.5),this.programs.font.uniforms.u_camera_scale.value.set(a.currentViewWidth*.5,a.currentViewHeight*.5),this.programs.font.uniforms.u_size.value.set(r.spec.width,r.spec.height),this.programs.font.uniforms.u_char_size.value.set(r.spec.width,r.spec.height),this.drawText(r,i,s,r.spec.width,r.spec.height,e))}drawWorldText(t,i,s,e,r){const o=this.fonts[t];if(o===void 0)return;this.programs.font.uniforms.u_camera_position.value.setFrom(i),this.programs.font.uniforms.u_camera_scale.value.set(a.currentWorldWidth*.5,a.currentWorldHeight*.5);const c=o.spec.width/a.currentScale,m=o.spec.height/a.currentScale;this.programs.font.uniforms.u_size.value.set(c,m),this.programs.font.uniforms.u_char_size.value.set(o.spec.width,o.spec.height),this.drawText(o,s,e,c,m,r)}drawText(t,i,s,e,r,o){this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,t.id),i+=e*.5,s+=r*.5;for(let c of o){if(c==`
`){i=e*.5,s+=r;continue}const m=c.codePointAt(0);if(m!==void 0){const f=t.map[m];f!==void 0&&(this.programs.font.uniforms.u_position.value.set(i,s),this.programs.font.uniforms.u_char_pos.value.setFrom(f),this.drawBuffer("quad","font"))}i+=e}}}{let g=function(d,b){let _=f.camera.worldCoords(new n(d,b)),A=f.getClosestAt(_);A!==null&&n.distance(_,A.position)<=A.radius&&f.divideCell(A)&&(x=!0)},t=function(){m=[window.innerWidth,window.innerHeight],a.resize(m[0],m[1]);const d=a.currentViewWidth,b=a.currentViewHeight;r.style.left=m[0]/2-d/2+"px",r.style.top=m[1]/2-b/2+"px",r.style.width=d+"px",r.style.height=b+"px",r.width=d,r.height=b},i=function(d){g(d.offsetX,d.offsetY),d.preventDefault()},s=function(d){d.preventDefault()},e=function(d){for(requestAnimationFrame(e),y+=(d-v)/1e3,v=d;y>=w;)x&&f.update(w),y-=w;c.programs.background.uniforms.u_time.value=d,c.programs.cell.uniforms.u_resolution.value.set(r.width,r.height),c.programs.cell.uniforms.u_time.value=d,o.viewport(0,0,r.width,r.height),o.clear(o.COLOR_BUFFER_BIT),f.draw(c)};const r=document.createElement("canvas");document.body.appendChild(r);const o=r.getContext("webgl2");o.clearColor(1,1,0,1);const c=new K(o);let m=[1,1],f=new W;f.generate();let x=!1;window.addEventListener("resize",t,!1),window.addEventListener("pointerdown",i),window.addEventListener("touchstart",s,{passive:!1}),t();let v=performance.now();const w=1/30;let y=0;requestAnimationFrame(e)}
