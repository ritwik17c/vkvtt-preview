/* VKVTT v66.5 — authoritative staff-category home controller. Loaded last. */
(async function(){
'use strict';
if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
const $=id=>document.getElementById(id),norm=v=>String(v||'').trim().toLowerCase(),nameNorm=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '),codeNorm=v=>String(v||'').trim().replace(/\s+/g,'').toUpperCase();
let identity={category:'general',role:'',record:null,teacherCode:''},busy=false;
function show(el,yes,display=''){if(el)el.style.setProperty('display',yes?display:'none','important')}
function roleAction(){
 const role=identity.role;
 const leave=$('leaveOpsBtn'),proxy=$('proxyWorkBtn'),published=$('publishedProxyBtn');
 if(leave){if(role==='leave_editor'){leave.textContent='📝 Leave / Duty Leave Editor';leave.onclick=()=>location.href='leave-editor-phase2.html?v=66.3-phase2';show(leave,true)}else if(['admin','manager'].includes(role)){leave.textContent='📝 Leave / Duty Leave / Vacant';leave.onclick=function(){window.show?.('leave',this)};show(leave,true)}else show(leave,false)}
 if(proxy)show(proxy,['admin','manager','proxy_manager'].includes(role));
 if(published)show(published,identity.category==='teaching'&&['admin','manager','proxy_manager','teacher','staff','viewer'].includes(role||'teacher'));
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
 </div><div id="v665PeriodPanel" style="display:none;margin-top:12px;padding:14px;background:#fff;border:1px solid #cbdce5;border-radius:14px"></div>`;
 banner.insertAdjacentElement('afterend',box);
 $('v665Leave').onclick=()=>$('myStatusBtn')?.click();$('v665Attendance').onclick=()=>location.href='attendance.html?v=66.0';$('v665Calendar').onclick=()=>location.href='annual-calendar-2026-27.html?v=66.0';
 $('v665Periods').onclick=()=>{const p=$('v665PeriodPanel');if(!p)return;if(p.style.display!=='none'){p.style.display='none';return}const sel=$('freePeriod'),rows=sel?[...sel.options].map(o=>String(o.textContent||'').trim()).filter(x=>x&&!/^Select/i.test(x)):[];p.innerHTML='<b style="color:#17364f">Current Period Timings</b><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px;margin-top:10px">'+(rows.length?rows.map(x=>`<div style="padding:8px 10px;background:#f8fbfc;border:1px solid #e0e9ee;border-radius:9px">${x.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>`).join(''):'<div>Period timings are not available in the current schedule.</div>')+'</div>';p.style.display='block'};
 return box;
}
function apply(){
 const cat=identity.category,isTeacher=cat==='teaching',isNT=cat==='non_teaching'||cat==='administrative',isStaff=isTeacher||isNT;
 window.__vkvStaffCategory=cat;window.__vkvStaffRecord=identity.record||null;window.__vkvMyTeacherCode=isTeacher?identity.teacherCode:'';window.__vkvMyTeacherShortCode=isTeacher?identity.teacherCode:'';window.__vkvTimetableCode=isTeacher?identity.teacherCode:'';
 const title=$('myAreaTitle'),grid=$('myAreaGrid');
 if(isTeacher){show(title,true,'block');if(title)title.textContent='My Area';show(grid,true,'grid');['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn','myStatusBtn','myAttendanceBtn'].forEach(id=>show($(id),true));}
 else if(isNT){show(title,false);show(grid,false);['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn'].forEach(id=>show($(id),false));const ws=ensureNonTeachingWorkspace();show(ws,true,'block');}
 else{show(title,false);show(grid,false);show($('v665NonTeachingWorkspace'),false)}
 const nav=document.querySelector('.nav');show(nav,!isNT,isTeacher?'flex':'');
 if(isNT){document.querySelectorAll('.opsGrid button').forEach(b=>{const oc=String(b.getAttribute('onclick')||''),id=b.id;if(id==='leaveOpsBtn')return;if(id==='proxyWorkBtn'||id==='publishedProxyBtn'||oc.includes("'free'")||oc.includes("'now'"))show(b,false)});}
 roleAction();
}
async function resolve(){if(busy)return;busy=true;try{
 const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js'),authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js'),fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});const u=auth.currentUser;if(!u)return;const db=fs.getFirestore(app),[ps,ms]=await Promise.all([fs.getDoc(fs.doc(db,'authorizedUsers',u.uid)).catch(()=>null),fs.getDoc(fs.doc(db,'master','current')).catch(()=>null)]),p=ps&&ps.exists()?ps.data():{},raw=ms&&ms.exists()?ms.data():{},M=raw.data||raw||{},staff=(M.staffDirectory||[]).filter(x=>x&&x.active!==false),teachers=(M.teachers||[]).filter(Boolean),nts=(M.nonTeachingStaff||[]).filter(x=>x&&x.active!==false),email=norm(u.email||p.email),names=[p.name,p.teacherName,u.displayName].map(nameNorm).filter(Boolean),rid=String(p.staffRecordId||p.staffDirectoryId||p.linkedStaffId||'').trim(),emp=[p.employeeCode,p.staffCode].map(codeNorm).filter(Boolean),tt=[p.teacherShortCode,p.timetableCode,p.teacherCode].map(codeNorm).filter(Boolean);let r=null;
 if(rid)r=staff.find(x=>String(x.id||'')===rid)||null;
 if(!r&&email)r=staff.find(x=>norm(x.email)===email)||null;
 if(!r&&emp.length)r=staff.find(x=>emp.includes(codeNorm(x.employeeCode)))||null;
 if(!r&&tt.length)r=staff.find(x=>String(x.category||'')==='teaching'&&tt.includes(codeNorm(x.shortCode||x.teacherShortCode||x.timetableCode)))||null;
 if(!r&&names.length)for(const n of names){const m=staff.filter(x=>nameNorm(x.name)===n);if(m.length===1){r=m[0];break}}
 if(!r&&email){const map=M.teacherEmailMap||{},entry=Object.entries(map).find(([,e])=>norm(e)===email);if(entry){const t=teachers.find(x=>codeNorm(x.code)===codeNorm(entry[0]));if(t)r={...t,category:'teaching',shortCode:t.code}}}
 if(!r&&tt.length){const t=teachers.find(x=>tt.includes(codeNorm(x.code)));if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&emp.length){const n=nts.find(x=>emp.includes(codeNorm(x.employeeCode||x.staffCode||x.code)));if(n)r={...n,category:String(n.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'}}
 if(!r&&names.length){for(const n of names){let m=teachers.filter(x=>nameNorm(x.name)===n);if(m.length===1){r={...m[0],category:'teaching',shortCode:m[0].code};break}m=nts.filter(x=>nameNorm(x.name)===n);if(m.length===1){r={...m[0],category:String(m[0].staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'};break}}}
 let cat='general',tc='';if(r){const c=String(r.category||r.staffCategory||'').toLowerCase();cat=c==='teaching'?'teaching':c==='administrative'?'administrative':'non_teaching';if(cat==='teaching')tc=String(r.shortCode||r.teacherShortCode||r.timetableCode||r.code||'').trim()}
 identity={category:cat,role:String(p.role||window.__vkvRole||'').trim(),record:r,teacherCode:tc};apply();
 }catch(e){console.warn('v66.5 staff-home resolver:',e)}finally{busy=false}}
let ticks=0;const t=setInterval(()=>{resolve();apply();if(++ticks>120)clearInterval(t)},250);setTimeout(resolve,20);window.addEventListener('focus',resolve);document.addEventListener('visibilitychange',()=>{if(!document.hidden)resolve()});
})();
