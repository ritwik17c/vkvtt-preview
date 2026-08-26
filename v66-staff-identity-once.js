/* VKVTT three-layer access model: Common + Staff Category + Delegated Responsibility */
(async function(){
'use strict';
if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
const $=id=>document.getElementById(id),norm=v=>String(v||'').trim().toLowerCase(),nameNorm=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '),codeNorm=v=>String(v||'').trim().replace(/\s+/g,'').toUpperCase();
const text=e=>String(e&&e.textContent||'').replace(/\s+/g,' ').trim();
function allTiles(){return [...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null||e.closest('.myGrid,.nav,.opsGrid'))}
function tile(re){return allTiles().find(e=>re.test(text(e)))||null}
function setVisible(el,yes){if(el)el.style.setProperty('display',yes?'':'none','important')}
function addHeading(before,title,id){if(document.getElementById(id)||!before)return;const h=document.createElement('h3');h.id=id;h.textContent=title;h.style.cssText='margin:18px 0 9px;color:#17364f;font-size:1.05rem;font-weight:850';before.parentElement.insertBefore(h,before)}
function installCss(){if(document.getElementById('vkv3LayerCss'))return;const s=document.createElement('style');s.id='vkv3LayerCss';s.textContent=`#vkvOfficeDutyModal{position:fixed;inset:0;z-index:100000;background:#0007;display:none;align-items:center;justify-content:center;padding:16px}#vkvOfficeDutyModal.show{display:flex}#vkvOfficeDutyModal .box{width:min(760px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:18px;padding:18px;color:#17364f}#vkvOfficeDutyModal table{width:100%;border-collapse:collapse;margin:10px 0 18px}#vkvOfficeDutyModal th,#vkvOfficeDutyModal td{border:1px solid #cbdce5;padding:9px;text-align:left}#vkvOfficeDutyModal th{background:#edf5f9}.vkv-layer-card{min-height:82px;padding:16px;border:1px solid #cbdce5;border-left:5px solid #236d99;border-radius:15px;background:#fff;color:#17364f;font:inherit;font-weight:800;cursor:pointer;text-align:left}`;document.head.appendChild(s)}
function ensureOfficeDuty(){if($('vkvOfficeDutyBtn'))return;const host=$('myAreaGrid')||document.querySelector('.myGrid');if(!host)return;const b=document.createElement('button');b.id='vkvOfficeDutyBtn';b.className='vkv-layer-card';b.type='button';b.innerHTML='🏢 Office Duty Schedule';host.appendChild(b);const m=document.createElement('div');m.id='vkvOfficeDutyModal';m.innerHTML=`<div class="box"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h2 style="margin:0">Office Duty Schedule</h2><button id="vkvOfficeDutyClose" type="button">✕ Close</button></div><h3>Daily Office Sitting Duty</h3><table><thead><tr><th>Time</th><th>Assigned Staff</th></tr></thead><tbody><tr><td>7:30 am – 8:00 am</td><td>Parag Da</td></tr><tr><td>8:00 am – 9:00 am</td><td>Bikash Da</td></tr><tr><td>9:00 am – 10:30 am</td><td>Baba Da / Mahananda Da</td></tr><tr><td>10:30 am – 11:25 am</td><td>Aditya</td></tr><tr><td>11:25 am – 12:00 pm</td><td>Bikash Da</td></tr><tr><td>12:00 pm – 1:00 pm</td><td>Baba Da</td></tr><tr><td>1:00 pm – 1:40 pm</td><td>Parag Da</td></tr><tr><td>1:40 pm – 2:30 pm</td><td>Bikash Da</td></tr><tr><td>2:30 pm – 3:00 pm</td><td>Baba Da</td></tr></tbody></table><h3>Daily Stay Back After School · 3:00 pm – 4:00 pm</h3><table><thead><tr><th>Day</th><th>Assigned Staff</th></tr></thead><tbody><tr><td>Monday</td><td>Dipti Didi</td></tr><tr><td>Tuesday</td><td>Makan Didi</td></tr><tr><td>Wednesday</td><td>Baba Da</td></tr><tr><td>Thursday</td><td>Mahananda Da</td></tr><tr><td>Friday</td><td>Parag Da</td></tr><tr><td>Saturday</td><td>Binaya Didi</td></tr></tbody></table><div style="font-size:.86rem;color:#617786">Initial roster transcribed from the current office duty sheet. It can later be moved to an Admin-editable schedule.</div></div>`;document.body.appendChild(m);b.onclick=()=>m.classList.add('show');$('vkvOfficeDutyClose').onclick=()=>m.classList.remove('show');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')})}
function compose(category,profile){
 document.body.classList.toggle('vkv-teaching',category==='teaching');document.body.classList.toggle('vkv-nonteaching',category!=='teaching');
 // Layer 1: common school/personal information. Never hidden by staff category.
 const common=[/My Leave & Duty Leave/i,/My Attendance/i,/Annual Calendar/i,/Period Timings/i,/Teacher Wise/i,/Class Wise/i,/Day Wise/i,/Free Teachers/i,/Today.?s Finalised Proxy Allotment/i,/Today.?s Proxy Allotment \(All Teachers\)/i,/Notice/i,/Leave.*Duty.*Vacant/i];
 common.forEach(re=>{const e=tile(re);if(e)setVisible(e,true)});
 // Layer 2: category-only cards. Only personal teaching cards are suppressed for non-teaching staff.
 const teacherOnly=[/My Timetable/i,/My Proxy Today/i,/My Past Proxy History/i];
 teacherOnly.forEach(re=>setVisible(tile(re),category==='teaching'));
 const reminder=$('periodReminderControl');setVisible(reminder,category==='teaching');
 if(category!=='teaching')ensureOfficeDuty();else setVisible($('vkvOfficeDutyBtn'),false);
 // Layer 3: delegated responsibilities are additive; they never change staff category.
 const role=norm(profile.role),isAdmin=role==='admin',isProxy=role==='proxy_manager'||isAdmin,isLeave=role==='leave_editor'||isAdmin,isAttendance=role==='attendance_manager'||isAdmin,isManager=role==='manager'||isAdmin;
 const proxyManage=tile(/^Proxy Allotment$/i);setVisible(proxyManage,isProxy);
 const leaveManage=tile(/^Leave \/ Duty Leave \/ Vacant$/i);if(leaveManage)setVisible(leaveManage,isLeave||isAdmin);
 const whereNow=tile(/^Where Now\??$/i);if(whereNow)setVisible(whereNow,isAttendance||isAdmin||isManager);
 window.__vkvAccessLayers={common:true,staffCategory:category,delegatedRole:role||'staff',timetableStudio:profile.timetableStudio===true||profile.canUseTimetableStudio===true};
 window.dispatchEvent(new CustomEvent('vkv-access-layers-ready',{detail:window.__vkvAccessLayers}));
}
function findUnique(arr,pred){const m=arr.filter(pred);return m.length===1?m[0]:null}
installCss();
try{
 const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js'),authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js'),fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
 const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});const u=auth.currentUser;if(!u)return;const db=fs.getFirestore(app),emailKey=norm(u.email);
 const [ps,ms,vs]=await Promise.all([fs.getDoc(fs.doc(db,'authorizedUsers',u.uid)),fs.getDoc(fs.doc(db,'master','current')),emailKey?fs.getDoc(fs.doc(db,'viewerEmails',emailKey)):Promise.resolve(null)]);
 const p=ps.exists()?ps.data():{},raw=ms.exists()?ms.data():{},M=raw.data||raw||{},v=vs&&vs.exists()?vs.data():{},staff=(M.staffDirectory||[]).filter(x=>x&&x.active!==false),teachers=(M.teachers||[]).filter(Boolean),nts=(M.nonTeachingStaff||[]).filter(x=>x&&x.active!==false),email=norm(u.email||p.email),names=[p.name,p.fullName,p.teacherName,u.displayName].map(nameNorm).filter(Boolean),rid=String(p.staffRecordId||p.staffDirectoryId||p.linkedStaffId||'').trim(),explicitType=norm(p.staffType||p.staffCategory),explicitTT=codeNorm(p.teacherShortCode||p.timetableCode),explicitEmp=codeNorm(p.employeeCode),viewerTeacher=codeNorm(v.teacherCode),viewerStaff=codeNorm(v.staffCode);let r=null;
 if(rid)r=staff.find(x=>String(x.id||'')===rid)||null;
 if(!r&&explicitType==='teaching'&&explicitTT){const t=teachers.find(x=>codeNorm(x.code)===explicitTT);if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&['non_teaching','administrative'].includes(explicitType)&&explicitEmp){const n=staff.find(x=>codeNorm(x.employeeCode)===explicitEmp)||nts.find(x=>[x.employeeCode,x.staffCode,x.code].some(c=>codeNorm(c)===explicitEmp));if(n)r={...n,category:explicitType}}
 if(!r&&viewerTeacher){const t=teachers.find(x=>codeNorm(x.code)===viewerTeacher);if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&viewerStaff){const n=nts.find(x=>[x.employeeCode,x.staffCode,x.code].some(c=>codeNorm(c)===viewerStaff));if(n)r={...n,category:norm(n.staffCategory)==='administrative'?'administrative':'non_teaching'}}
 if(!r&&email)r=findUnique(staff,x=>norm(x.email)===email);
 if(!r&&names.length){for(const n of names){r=findUnique(staff,x=>nameNorm(x.name||x.fullName)===n);if(r)break}}
 if(!r&&email){const map=M.teacherEmailMap||{},entry=Object.entries(map).find(([,e])=>norm(e)===email);if(entry){const t=teachers.find(x=>codeNorm(x.code)===codeNorm(entry[0]));if(t)r={...t,category:'teaching',shortCode:t.code}}}
 if(!r&&email){const t=findUnique(teachers,x=>[x.email,x.gmail,x.googleEmail,x.google_email].some(e=>norm(e)===email));if(t)r={...t,category:'teaching',shortCode:t.code}}
 if(!r&&names.length){for(const n of names){const t=findUnique(teachers,x=>nameNorm(x.name)===n);if(t){r={...t,category:'teaching',shortCode:t.code};break}}}
 if(!r)return;
 const cat=norm(r.category||r.staffCategory||explicitType)==='teaching'?'teaching':(norm(r.category||r.staffCategory||explicitType)==='administrative'?'administrative':'non_teaching');
 window.__vkvStaffCategory=cat;window.__vkvStaffRecord=r;
 const tc=cat==='teaching'?String(r.shortCode||r.teacherShortCode||r.timetableCode||r.code||'').trim():'';window.__vkvMyTeacherCode=tc;window.__vkvMyTeacherShortCode=tc;window.__vkvTimetableCode=tc;
 compose(cat,p);
 window.dispatchEvent(new CustomEvent('vkv-staff-category-ready',{detail:{category:cat,record:r}}));
}catch(e){console.warn('Three-layer staff access unavailable:',e)}
})();
