/* VKVTT v66.6.4 — authoritative ONE-TIME staff identity. No polling/listeners/retries. */
(async function(){
'use strict';
if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
const $=id=>document.getElementById(id),norm=v=>String(v||'').trim().toLowerCase(),nameNorm=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '),codeNorm=v=>String(v||'').trim().replace(/\s+/g,'').toUpperCase();
function installCss(){if(document.getElementById('v666IdentityCss'))return;const s=document.createElement('style');s.id='v666IdentityCss';s.textContent=`
body.vkv-nonteaching #myAreaTitle,body.vkv-nonteaching #myAreaGrid,body.vkv-nonteaching #periodReminderControl,body.vkv-nonteaching .nav,body.vkv-nonteaching .opsGrid{display:none!important}
body.vkv-nonteaching #v666SafeStaffArea{display:block!important}
body.vkv-teaching #v666SafeStaffArea{display:none!important}
body.vkv-teaching #myAreaTitle{display:block!important}
body.vkv-teaching #myAreaGrid{display:grid!important}
body.vkv-teaching #myAreaGrid>button{display:flex!important}
`;document.head.appendChild(s)}
function ensureStaffArea(){let box=$('v666SafeStaffArea');if(box)return box;const banner=$('activeScheduleBanner');if(!banner)return null;box=document.createElement('section');box.id='v666SafeStaffArea';box.style.cssText='display:none;margin:12px 0 16px';box.innerHTML=`<div style="font-weight:850;color:#17364f;font-size:1.08rem;margin-bottom:9px">My Area · Staff</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px"><button id="v666StaffLeave" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #236d99;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">🗂 My Leave &amp; Duty Leave<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Personal leave, OD and duty-leave record.</div></button><button id="v666StaffAttendance" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #2d7d46;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">📍 My Attendance<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Arrival, departure, late and attendance history.</div></button><button id="v666StaffPeriods" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #c58a18;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">🕐 Period Timings<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Current school-day period and break timings.</div></button><button id="v666StaffCalendar" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #7a6aa5;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">🗓 Annual Calendar<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">School programmes, examinations, holidays and events.</div></button><button id="v666StaffProxy" type="button" style="text-align:left;min-height:92px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #3b8a70;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer">✅ Today’s Finalised Proxy Allotment<div style="font-size:.8rem;font-weight:500;color:#617685;margin-top:6px">Read-only information after today’s proxy arrangement is finalised.</div></button></div><div id="v666StaffPeriodPanel" style="display:none;margin-top:10px;padding:12px;background:#fff;border:1px solid #cbdce5;border-radius:12px"></div>`;banner.insertAdjacentElement('afterend',box);
 $('v666StaffLeave').onclick=()=>$('myStatusBtn')?.click();$('v666StaffAttendance').onclick=()=>$('myAttendanceBtn')?.click();$('v666StaffCalendar').onclick=()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/Annual Calendar/i.test(x.textContent||'')&&x.id!=='v666StaffCalendar');if(b)b.click()};$('v666StaffProxy').onclick=()=>{const b=$('publishedProxyBtn')||[...document.querySelectorAll('button')].find(x=>/Proxy Allotment/i.test(x.textContent||''));if(b)b.click()};$('v666StaffPeriods').onclick=()=>{const p=$('v666StaffPeriodPanel');if(!p)return;if(p.style.display!=='none'){p.style.display='none';return}const sel=$('freePeriod'),rows=sel?[...sel.options].map(o=>String(o.textContent||'').trim()).filter(x=>x&&!/^Select/i.test(x)):[];p.innerHTML=rows.length?rows.map(x=>`<div style="padding:7px 9px;margin:5px 0;background:#f7fafb;border-radius:8px">${x.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>`).join(''):'Period timings are not available in the current schedule.';p.style.display='block'};return box}
function markDailyHeadingHidden(){[...document.querySelectorAll('h2,h3,h4,div')].forEach(el=>{if(el.children.length===0&&String(el.textContent||'').trim()==='Daily Management')el.style.setProperty('display','none','important')})}
function applyTeacher(r){document.body.classList.remove('vkv-nonteaching');document.body.classList.add('vkv-teaching');const tc=String(r.shortCode||r.teacherShortCode||r.timetableCode||r.code||'').trim();window.__vkvStaffCategory='teaching';window.__vkvStaffRecord=r;window.__vkvMyTeacherCode=tc;window.__vkvMyTeacherShortCode=tc;window.__vkvTimetableCode=tc;window.dispatchEvent(new CustomEvent('vkv-staff-category-ready',{detail:{category:'teaching',record:r}}))}
function applyNonTeaching(r){ensureStaffArea();document.body.classList.remove('vkv-teaching');document.body.classList.add('vkv-nonteaching');window.__vkvStaffCategory=String(r.category||r.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching';window.__vkvStaffRecord=r;window.__vkvMyTeacherCode='';window.__vkvMyTeacherShortCode='';window.__vkvTimetableCode='';markDailyHeadingHidden();const history=$('historyBtn');if(history)history.style.setProperty('display','none','important');window.dispatchEvent(new CustomEvent('vkv-staff-category-ready',{detail:{category:window.__vkvStaffCategory,record:r}}))}
function findUnique(arr,pred){const m=arr.filter(pred);return m.length===1?m[0]:null}
installCss();
try{
 const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js'),authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js'),fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
 const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});const u=auth.currentUser;if(!u)return;const db=fs.getFirestore(app);
 // Exactly three Firestore reads, once per page load. No repeating code follows.
 const emailKey=norm(u.email);
 const [ps,ms,vs]=await Promise.all([
   fs.getDoc(fs.doc(db,'authorizedUsers',u.uid)),
   fs.getDoc(fs.doc(db,'master','current')),
   emailKey?fs.getDoc(fs.doc(db,'viewerEmails',emailKey)):Promise.resolve(null)
 ]);
 const p=ps.exists()?ps.data():{},raw=ms.exists()?ms.data():{},M=raw.data||raw||{},v=vs&&vs.exists()?vs.data():{};
 const staff=(M.staffDirectory||[]).filter(x=>x&&x.active!==false),teachers=(M.teachers||[]).filter(Boolean),nts=(M.nonTeachingStaff||[]).filter(x=>x&&x.active!==false);
 const email=norm(u.email||p.email),names=[p.name,p.fullName,p.teacherName,u.displayName].map(nameNorm).filter(Boolean),rid=String(p.staffRecordId||p.staffDirectoryId||p.linkedStaffId||'').trim(),viewerTeacher=codeNorm(v.teacherCode),viewerStaff=codeNorm(v.staffCode),tt=[viewerTeacher,p.teacherShortCode,p.timetableCode,p.teacherCode].map(codeNorm).filter(Boolean),emp=[p.employeeCode,p.staffCode,viewerStaff].map(codeNorm).filter(Boolean);
 let r=null;
 // 1. Explicit Viewer/Staff link is strongest because it is the dedicated personal account linkage.
 if(viewerTeacher){const t=teachers.find(x=>codeNorm(x.code)===viewerTeacher);if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&viewerStaff){const n=nts.find(x=>[x.employeeCode,x.staffCode,x.code].some(c=>codeNorm(c)===viewerStaff));if(n)r={...n,category:String(n.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'}}
 // 2. Staff Directory is authoritative for staff category when explicitly linked by record/email/name.
 if(!r&&rid)r=staff.find(x=>String(x.id||'')===rid)||null;
 if(!r&&email)r=findUnique(staff,x=>norm(x.email)===email);
 if(!r&&names.length){for(const n of names){r=findUnique(staff,x=>nameNorm(x.name||x.fullName)===n);if(r)break}}
 // 3. Permanent teacher evidence can establish Teaching regardless of Manager/Leave Editor role.
 if(!r&&tt.length){const t=teachers.find(x=>tt.includes(codeNorm(x.code)));if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&email){const map=M.teacherEmailMap||{},entry=Object.entries(map).find(([,e])=>norm(e)===email);if(entry){const t=teachers.find(x=>codeNorm(x.code)===codeNorm(entry[0]));if(t)r={...t,category:'teaching',shortCode:t.code}}}
 if(!r&&email){const t=findUnique(teachers,x=>[x.email,x.gmail,x.googleEmail,x.google_email].some(e=>norm(e)===email));if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&names.length){for(const n of names){const t=findUnique(teachers,x=>nameNorm(x.name)===n);if(t){r={...t,category:'teaching',shortCode:t.code};break}}}
 // 4. Employee Code / legacy non-teaching roster fallback.
 if(!r&&emp.length)r=findUnique(staff,x=>emp.includes(codeNorm(x.employeeCode)));
 if(!r&&email){const n=findUnique(nts,x=>norm(x.email)===email);if(n)r={...n,category:String(n.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'}}
 if(!r&&emp.length){const n=findUnique(nts,x=>emp.includes(codeNorm(x.employeeCode||x.staffCode||x.code)));if(n)r={...n,category:String(n.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching'}}
 if(!r)return;
 const cat=String(r.category||r.staffCategory||'').toLowerCase();if(cat==='teaching')applyTeacher(r);else applyNonTeaching(r);
}catch(e){console.warn('One-time staff identity unavailable:',e)}
})();
