/* VKVTT v66.5.1 — authoritative staff-category home controller. Loaded last. */
(async function(){
'use strict';
if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
const $=id=>document.getElementById(id),norm=v=>String(v||'').trim().toLowerCase(),nameNorm=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '),codeNorm=v=>String(v||'').trim().replace(/\s+/g,'').toUpperCase();
let identity={category:'general',role:'',record:null,teacherCode:''},busy=false;
function show(el,yes,display=''){if(el)el.style.setProperty('display',yes?display:'none','important')}
function dailyHeading(){return [...document.querySelectorAll('h2,h3,h4,.sectionTitle,.groupTitle,div')].find(el=>el.children.length===0&&String(el.textContent||'').trim()==='Daily Management')||null}
function roleAction(){
 const role=identity.role,cat=identity.category,isNT=cat==='non_teaching'||cat==='administrative';
 const leave=$('leaveOpsBtn'),proxy=$('proxyWorkBtn'),published=$('publishedProxyBtn');
 if(isNT){show(leave,false);show(proxy,false);show(published,false);return;}
 if(leave){if(role==='leave_editor'){leave.textContent='📝 Leave / Duty Leave Editor';leave.onclick=()=>location.href='leave-editor-phase2.html?v=66.3-phase2';show(leave,true)}else if(['admin','manager'].includes(role)){leave.textContent='📝 Leave / Duty Leave / Vacant';leave.onclick=function(){window.show?.('leave',this)};show(leave,true)}else show(leave,false)}
 if(proxy)show(proxy,['admin','manager','proxy_manager'].includes(role));
 if(published)show(published,cat==='teaching');
}
function ensureNonTeachingWorkspace(){
 let box=$('v665NonTeachingWorkspace');if(box)return box;
 const banner=$('activeScheduleBanner');if(!banner)return null;
 box=document.createElement('section');box.id='v665NonTeachingWorkspace';box.style.cssText='display:none;margin:14px 0 18px';
 box.innerHTML=`<div style="font-weight:850;color:#17364f;font-size:1.08rem;margin:0 0 9px">My Area · Staff</div>
 <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px">
  <button id="v665Leave" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #236d99;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">🗂 My Leave &amp; Duty Leave<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Personal leave, OD and duty-leave record.</div></button>
  <button id="v665Attendance" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #2d7d46;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">📍 My Attendance<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Arrival, departure, late and attendance history.</div></button>
  <button id="v665Periods" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #c58a18;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">🕐 Period Timings<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Current school-day period and break timings.</div></button>
  <button id="v665Calendar" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #7a6aa5;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">🗓 Annual Calendar<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">School programmes, examinations, holidays and events.</div></button>
  <button id="v665PublishedProxy" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #3b8a70;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">✅ Today’s Finalised Proxy Allotment<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Read-only information after today’s proxy arrangement is finalised.</div></button>
 </div><div id="v665PeriodPanel" style="display:none;margin-top:12px;padding:14px;background:#fff;border:1px solid #cbdce5;border-radius:14px"></div>`;
 banner.insertAdjacentElement('afterend',box);
 $('v665Leave').onclick=()=>$('myStatusBtn')?.click();$('v665Attendance').onclick=()=>location.href='attendance.html?v=66.0';$('v665Calendar').onclick=()=>location.href='annual-calendar-2026-27.html?v=66.0';$('v665PublishedProxy').onclick=()=>{const b=$('publishedProxyBtn');if(b)b.click();else if(typeof window.openPublishedProxy==='function')window.openPublishedProxy()};
 $('v665Periods').onclick=()=>{const p=$('v665PeriodPanel');if(!p)return;if(p.style.display!=='none'){p.style.display='none';return}const sel=$('freePeriod'),rows=sel?[...sel.options].map(o=>String(o.textContent||'').trim()).filter(x=>x&&!/^Select/i.test(x)):[];p.innerHTML='<b style="color:#17364f">Current Period Timings</b><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px;margin-top:10px">'+(rows.length?rows.map(x=>`<div style="padding:8px 10px;background:#f8fbfc;border:1px solid #e0e9ee;border-radius:9px">${x.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>`).join(''):'<div>Period timings are not available in the current schedule.</div>')+'</div>';p.style.display='block'};
 return box;
}
function apply(){
 const cat=identity.category,isTeacher=cat==='teaching',isNT=cat==='non_teaching'||cat==='administrative',isStaff=isTeacher||isNT;
 window.__vkvStaffCategory=cat;window.__vkvStaffRecord=identity.record||null;window.__vkvMyTeacherCode=isTeacher?identity.teacherCode:'';window.__vkvMyTeacherShortCode=isTeacher?identity.teacherCode:'';window.__vkvTimetableCode=isTeacher?identity.teacherCode:'';
 const title=$('myAreaTitle'),grid=$('myAreaGrid');
 if(isTeacher){show($('v665NonTeachingWorkspace'),false);show(title,true,'block');if(title)title.textContent='My Area';show(grid,true,'grid');['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn','myStatusBtn','myAttendanceBtn'].forEach(id=>show($(id),true));}
 else if(isNT){show(title,false);show(grid,false);['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn'].forEach(id=>show($(id),false));const ws=ensureNonTeachingWorkspace();show(ws,true,'block');}
 else{show(title,false);show(grid,false);show($('v665NonTeachingWorkspace'),false)}
 const nav=document.querySelector('.nav');show(nav,!isNT,isTeacher?'flex':'');
 const ops=document.querySelector('.opsGrid'),dh=dailyHeading();if(isNT){show(ops,false);show(dh,false);show($('historyBtn'),false);show($('approvedLeaveBtn'),false);}else{show(ops,true,'grid');show(dh,true);show($('historyBtn'),true);}
 roleAction();
}
async function resolve(){if(busy)return;busy=true;try{
 const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js'),authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js'),fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});const u=auth.currentUser;if(!u)return;const db=fs.getFirestore(app),[ps,ms]=await Promise.all([fs.getDoc(fs.doc(db,'authorizedUsers',u.uid)).catch(()=>null),fs.getDoc(fs.doc(db,'master','current')).catch(()=>null)]),p=ps&&ps.exists()?ps.data():{},raw=ms&&ms.exists()?ms.data():{},M=raw.data||raw||{},staff=(M.staffDirectory||[]).filter(x=>x&&x.active!==false),teachers=(M.teachers||[]).filter(Boolean),nts=(M.nonTeachingStaff||[]).filter(x=>x&&x.active!==false),email=norm(u.email||p.email),names=[p.name,p.teacherName,u.displayName].map(nameNorm).filter(Boolean),rid=String(p.staffRecordId||p.staffDirectoryId||p.linkedStaffId||'').trim(),emp=[p.employeeCode,p.staffCode].map(codeNorm).filter(Boolean),tt=[p.teacherShortCode,p.timetableCode,p.teacherCode].map(codeNorm).filter(Boolean);let r=null;
 // Explicit record ID remains strongest when present.
 if(rid)r=staff.find(x=>String(x.id||'')===rid)||null;
 // Teacher identity must outrank legacy staffCode: timetable short name first.
 if(!r&&tt.length){const ts=staff.find(x=>String(x.category||'').toLowerCase()==='teaching'&&tt.includes(codeNorm(x.shortCode||x.teacherShortCode||x.timetableCode)));if(ts)r=ts;else{const t=teachers.find(x=>tt.includes(codeNorm(x.code)));if(t)r={...t,category:'teaching',shortCode:t.code}}}
 // Teacher email map/direct teacher email next, before any legacy staff-code match.
 if(!r&&email){const map=M.teacherEmailMap||{},entry=Object.entries(map).find(([,e])=>norm(e)===email);if(entry){const t=teachers.find(x=>codeNorm(x.code)===codeNorm(entry[0]));if(t)r={...t,category:'teaching',shortCode:t.code}}}
 if(!r&&email){const t=teachers.find(x=>norm(x.email||x.gmail||x.googleEmail)===email);if(t)r={...t,category:'teaching',shortCode:t.code}}
 // Staff Directory email can identify either staff category.
 if(!r&&email)r=staff.find(x=>norm(x.email)===email)||null;
 // Employee/staff code after teacher identity checks. It may belong to either category.
 if(!r&&emp.length)r=staff.find(x=>emp.includes(codeNorm(x.employeeCode)))||null;
 // Unique name: prefer master teacher match, then staff directory/non-teaching fallback.
 if(!r&&names.length){for(const n of names){const mt=teachers.filter(x=>nameNorm(x.name)===n);if(mt.length===1){r={...mt[0],category:'teaching',shortCode:mt[0].code};break}const ms=staff.filter(x=>nameNorm(x.name)===n);if(ms.length===1){r=ms[0];break}const mn=nts.filter(x=>nameNorm(x.name)===n);if(mn.length===1){r={...mn[0],category:String(mn[0].staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'};break}}}
 if(!r&&emp.length){const n=nts.find(x=>emp.includes(codeNorm(x.employeeCode||x.staffCode||x.code)));if(n)r={...n,category:String(n.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'}}
 let cat='general',tc='';if(r){const c=String(r.category||r.staffCategory||'').toLowerCase();cat=c==='teaching'?'teaching':c==='administrative'?'administrative':'non_teaching';if(cat==='teaching')tc=String(r.shortCode||r.teacherShortCode||r.timetableCode||r.code||'').trim()}
 identity={category:cat,role:String(p.role||window.__vkvRole||'').trim(),record:r,teacherCode:tc};apply();
 }catch(e){console.warn('v66.5.1 staff-home resolver:',e)}finally{busy=false}}
// Run continuously. Older legacy scripts stop after startup; this controller remains authoritative and prevents flicker.
const t=setInterval(()=>{resolve();apply()},220);setTimeout(resolve,20);window.addEventListener('focus',resolve);document.addEventListener('visibilitychange',()=>{if(!document.hidden)resolve()});window.__vkvStaffHomeController={resolve,apply,getIdentity:()=>identity};
})();
