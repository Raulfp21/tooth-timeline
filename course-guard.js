/* Forensic Odontology controlled-course guard
   This is client-side learning control only. It is NOT secure anti-cheating software. */
(function(){
"use strict";
const modules=[
 ["learn.html","Age assessment"],["index.html","Tooth development & eruption"],
 ["fdinumbering.html","FDI numbering"],["tooth3d.html","3D tooth identification"],
 ["label3d.html","Tooth labelling"],["gustafson.html","Gustafson overview"],
 ["attrition.html","Attrition"],["periodontosis.html","Periodontosis"],
 ["secondary.html","Secondary dentin"],["resorption.html","Root resorption"],
 ["transparency.html","Root transparency"],["cementum.html","Cementum apposition"],
 ["viva.html","Viva & examination"]
];
const progressKey="foCourseProgressV2", eventKey="foIntegrityLogV2", facultyKey="foFacultyModeV2";
const current=location.pathname.split("/").pop()||"index.html";
const idx=modules.findIndex(m=>m[0]===current);
function read(){try{return JSON.parse(localStorage.getItem(progressKey)||"[]")}catch(e){return[]}}
function write(a){try{localStorage.setItem(progressKey,JSON.stringify(a))}catch(e){}}
function log(type,data){
 try{
  const a=JSON.parse(localStorage.getItem(eventKey)||"[]");
  a.push({type,at:new Date().toISOString(),page:current,data:data||{}});
  localStorage.setItem(eventKey,JSON.stringify(a.slice(-500)));
 }catch(e){}
}
function isFaculty(){return localStorage.getItem(facultyKey)==="1"}
function unlocked(i){return isFaculty()||i<=0||read().includes(i-1)}
function canOpen(url){const i=modules.findIndex(m=>m[0]===url);return i<0||unlocked(i)}
function complete(){
 if(idx<0)return;
 const a=read(); if(!a.includes(idx)){a.push(idx);a.sort((x,y)=>x-y);write(a);log("module_complete",{module:idx+1,name:modules[idx][1]})}
 const next=modules[idx+1];
 if(next) location.href=next[0]; else location.href="viva.html";
}
window.CourseGuard={canOpen,log,complete,unlocked,isFaculty,read,modules};

window.CourseIntegrity={log};
let last=Date.now(), hiddenAt=0, idleTimer=null;
const IDLE_MS=120000;
function idle(){ if(Date.now()-last>=IDLE_MS){log("inactivity",{seconds:Math.round((Date.now()-last)/1000)}); last=Date.now();}}
["pointerdown","keydown","touchstart","scroll"].forEach(e=>window.addEventListener(e,()=>{last=Date.now();}, {passive:true}));
document.addEventListener("visibilitychange",()=>{
 if(document.hidden){hiddenAt=Date.now();log("tab_hidden",{});}
 else {const s=Math.round((Date.now()-hiddenAt)/1000);log("tab_return",{hidden_seconds:s});last=Date.now();}
});
window.addEventListener("beforeunload",()=>log("page_exit",{}));
idleTimer=setInterval(idle,30000);

function addCompletion(){
 if(idx<0||document.getElementById("courseComplete"))return;
 const b=document.createElement("button"); b.id="courseComplete";
 b.textContent=idx===modules.length-1?"✓ Complete course":"✓ Mark module complete & continue";
 Object.assign(b.style,{position:"fixed",right:"12px",bottom:"14px",zIndex:"9999",padding:"10px 14px",borderRadius:"12px",border:"1px solid #58a6ff",background:"#1f6feb",color:"#fff",fontWeight:"700",fontSize:"12px",boxShadow:"0 8px 24px rgba(0,0,0,.3)"});
 b.onclick=()=>{if(confirm("Mark this module as completed?"))complete()};
 document.body.appendChild(b);
}
function gate(){
 if(idx<0)return;
 if(!unlocked(idx)){
   log("blocked_page",{module:idx+1});
   alert("This module is locked. Return to the course and complete the previous module first.");
   location.href="clinic.html"; return;
 }
 log("module_load",{module:idx+1,name:modules[idx][1]});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{gate();addCompletion()});
else {gate();addCompletion()}
})();