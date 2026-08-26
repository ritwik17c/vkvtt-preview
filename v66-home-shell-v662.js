/* VKVTT v66.4 — premium home shell + staff-category aware My Area */
(function(){
  'use strict';
  const portraitUrl='https://raw.githubusercontent.com/ritwik17c/vkvtt-preview/main/Swami%20Vivekananda.png?v=swamiji-live-1';
  function applyPortrait(){
    const isMobile=window.matchMedia('(max-width:700px)').matches;
    const p=document.querySelector('.swamijiHomePortrait');
    if(p){p.src=portraitUrl;p.removeAttribute('srcset');const host=p.closest('.head')||p.parentElement;if(host){host.style.position='relative';host.style.setProperty('padding-right',isMobile?'86px':'132px','important')}p.style.setProperty('position','absolute','important');p.style.setProperty('right','0','important');p.style.setProperty('top','50%','important');p.style.setProperty('transform','translateY(-50%)','important');p.style.setProperty('margin','0','important');p.style.setProperty('width',isMobile?'68px':'108px','important');p.style.setProperty('height',isMobile?'68px':'108px','important');p.style.setProperty('object-fit','contain','important');p.style.setProperty('z-index','1','important');const title=document.querySelector('.homeTitleBlock');if(title){title.style.setProperty('position','relative','important');title.style.setProperty('z-index','2','important');title.style.setProperty('max-width',isMobile?'calc(100% - 92px)':'calc(100% - 170px)','important');if(isMobile)title.style.setProperty('padding-right','78px','important')}}}
    const lp=document.querySelector('#vkvSlowLoader .vkvLoaderPortrait img');if(lp){lp.src=portraitUrl;lp.removeAttribute('srcset')}
  }
  function tileHost(el){return el&&el.closest&&el.closest('.myGrid>button,.nav>button,.opsGrid>button')}
  document.addEventListener('click',e=>{const b=tileHost(e.target);if(!b)return;b.classList.remove('v662-click-nudge');void b.offsetWidth;b.classList.add('v662-click-nudge');setTimeout(()=>b.classList.remove('v662-click-nudge'),220)},true);

  const norm=v=>String(v||'').trim().toLowerCase();
  const normName=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const codeNorm=v=>String(v||'').trim().replace(/\s+/g,'').toUpperCase();
  const emails=x=>[x&&x.email,x&&x.gmail,x&&x.googleEmail,x&&x.google_email].concat(Array.isArray(x&&x.emails)?x.emails:[]).map(norm).filter(Boolean);

  function periodTexts(){const sel=document.getElementById('freePeriod');if(!sel)return[];return[...sel.options].map(o=>(o.textContent||'').trim()).filter(x=>x&&!/^Select/i.test(x))}
  function ensureStaffCommonPanel(){
    let p=document.getElementById('v664StaffCommonPanel');if(p)return p;
    const banner=document.getElementById('activeScheduleBanner');if(!banner)return null;
    p=document.createElement('section');p.id='v664StaffCommonPanel';p.style.cssText='display:none;background:#fff;border:1px solid #cadbe4;border-radius:16px;padding:14px 16px;margin:12px 0;box-shadow:0 4px 16px #17324d0f';
    p.innerHTML='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b style="color:#17364f">School Day</b><div id="v664ActiveScheduleText" style="font-size:.86rem;color:#617685;margin-top:4px"></div></div><button id="v664PeriodTimingsBtn" type="button" style="border:1px solid #b8cdd8;border-radius:11px;padding:9px 12px;background:#e7f2f7;color:#17364f;font-weight:750;cursor:pointer">🕐 Period Timings</button></div><div id="v664PeriodTimings" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid #e0e9ee"></div>';
    banner.insertAdjacentElement('afterend',p);
    const btn=document.getElementById('v664PeriodTimingsBtn');if(btn)btn.onclick=()=>{const box=document.getElementById('v664PeriodTimings');if(!box)return;if(box.style.display!=='none'){box.style.display='none';return}const rows=periodTexts();box.innerHTML=rows.length?'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px">'+rows.map(x=>'<div style="padding:8px 10px;border:1px solid #e0e9ee;border-radius:10px;background:#f8fbfc">'+x.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</div>').join('')+'</div>':'<span style="color:#617685">Period timings are not available in the current schedule.</span>';box.style.display='block'};
    return p;
  }

  function setMyArea(mode,teacherCode='',staffRecord=null){
    const title=document.getElementById('myAreaTitle'),grid=document.getElementById('myAreaGrid');
    const teacherOnly=['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn'];
    const common=['myStatusBtn','myAttendanceBtn'];
    const show=mode==='teaching'||mode==='non_teaching'||mode==='administrative';
    if(title){title.style.setProperty('display',show?'block':'none','important');title.textContent=mode==='teaching'?'My Area':'My Area · Staff'}
    if(grid)grid.style.setProperty('display',show?'grid':'none','important');
    teacherOnly.forEach(id=>{const b=document.getElementById(id);if(b)b.style.setProperty('display',mode==='teaching'?'':'none','important')});
    common.forEach(id=>{const b=document.getElementById(id);if(b)b.style.setProperty('display',show?'':'none','important')});
    window.__vkvStaffCategory=mode||'general';window.__vkvStaffRecord=staffRecord||null;window.__vkvMyTeacherCode=mode==='teaching'?teacherCode:'';window.__vkvMyTeacherShortCode=mode==='teaching'?teacherCode:'';window.__vkvTimetableCode=mode==='teaching'?teacherCode:'';
    if(mode!=='teaching')window.__vkvMyTeacherName='';if(typeof window.refreshMyAreaIdentity==='function')window.refreshMyAreaIdentity();
    enforceStaffUx();
  }

  function enforceStaffUx(){
    const mode=String(window.__vkvStaffCategory||'general'),isTeacher=mode==='teaching',isStaff=isTeacher||mode==='non_teaching'||mode==='administrative';
    const title=document.getElementById('myAreaTitle'),grid=document.getElementById('myAreaGrid');
    if(title){title.style.setProperty('display',isStaff?'block':'none','important');title.textContent=isTeacher?'My Area':'My Area · Staff'}if(grid)grid.style.setProperty('display',isStaff?'grid':'none','important');
    ['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.style.setProperty('display',isTeacher?'':'none','important')});['myStatusBtn','myAttendanceBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.style.setProperty('display',isStaff?'':'none','important')});
    const nav=document.querySelector('.nav');if(nav)nav.style.setProperty('display',isTeacher?'':'none','important');
    const panel=ensureStaffCommonPanel();if(panel){panel.style.display=!isTeacher&&isStaff?'block':'none';const s=document.getElementById('v664ActiveScheduleText'),banner=document.getElementById('activeScheduleBanner');if(s&&banner)s.textContent=(banner.textContent||'').replace(/^\s*🗓\s*/,'')}
    if(!isTeacher&&isStaff){const published=document.getElementById('publishedProxyBtn');if(published)published.style.setProperty('display','none','important');[...document.querySelectorAll('.opsGrid button')].forEach(b=>{const oc=String(b.getAttribute('onclick')||'');if(oc.includes("'free'")||oc.includes("'now'"))b.style.setProperty('display','none','important')})}
  }

  async function resolveStaffIdentity(){
    if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js'),authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js'),fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
      const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});const user=auth.currentUser;if(!user)return;
      const db=fs.getFirestore(app),[ps,ms]=await Promise.all([fs.getDoc(fs.doc(db,'authorizedUsers',user.uid)).catch(()=>null),fs.getDoc(fs.doc(db,'master','current')).catch(()=>null)]),profile=ps&&ps.exists()?ps.data():{},raw=ms&&ms.exists()?ms.data():{},M=raw.data||raw||{},D=window.DATA||{};
      const staff=Array.isArray(M.staffDirectory)?M.staffDirectory.filter(x=>x&&x.active!==false):[],teachers=Array.isArray(M.teachers)?M.teachers:(Array.isArray(D.teachers)?D.teachers:[]),nts=Array.isArray(M.nonTeachingStaff)?M.nonTeachingStaff:(Array.isArray(D.nonTeachingStaff)?D.nonTeachingStaff:[]),reps=Array.isArray(M.temporaryReplacements)?M.temporaryReplacements:(Array.isArray(D.temporaryReplacements)?D.temporaryReplacements:[]);
      const email=norm(user.email||profile.email),names=[profile.name,profile.teacherName,user.displayName].map(normName).filter(Boolean),profileRecordId=String(profile.staffRecordId||profile.staffDirectoryId||profile.linkedStaffId||'').trim(),employeeCandidates=[profile.employeeCode,profile.staffCode].map(codeNorm).filter(Boolean),timetableCandidates=[profile.teacherShortCode,profile.timetableCode,profile.teacherCode].map(codeNorm).filter(Boolean);
      let rec=null;if(profileRecordId)rec=staff.find(s=>String(s.id||'')===profileRecordId)||null;if(!rec&&employeeCandidates.length)rec=staff.find(s=>employeeCandidates.includes(codeNorm(s.employeeCode)))||null;if(!rec&&timetableCandidates.length)rec=staff.find(s=>String(s.category||'')==='teaching'&&timetableCandidates.includes(codeNorm(s.shortCode||s.teacherShortCode||s.timetableCode)))||null;if(!rec&&email)rec=staff.find(s=>norm(s.email)===email)||null;if(!rec&&names.length){for(const n of names){const m=staff.filter(s=>normName(s.name)===n);if(m.length===1){rec=m[0];break}}}
      if(rec){const c=String(rec.category||'').toLowerCase(),cat=c==='teaching'?'teaching':c==='administrative'?'administrative':'non_teaching',tc=cat==='teaching'?String(rec.shortCode||rec.teacherShortCode||rec.timetableCode||'').trim():'';if(cat==='teaching')window.__vkvMyTeacherName=String(rec.name||'');setMyArea(cat,tc,rec);return}
      let t=null;if(timetableCandidates.length)t=teachers.find(x=>timetableCandidates.includes(codeNorm(x.code)))||null;if(!t&&email)t=teachers.find(x=>emails(x).includes(email))||null;if(!t&&names.length){for(const n of names){const m=teachers.filter(x=>normName(x.name)===n);if(m.length===1){t=m[0];break}}}if(t){window.__vkvMyTeacherName=String(t.name||'');setMyArea('teaching',String(t.code||''),t);return}
      let nt=null;if(employeeCandidates.length)nt=nts.find(x=>employeeCandidates.includes(codeNorm(x.employeeCode||x.staffCode||x.code)))||null;if(!nt&&email)nt=nts.find(x=>norm(x.email)===email)||null;if(!nt&&names.length){for(const n of names){const m=nts.filter(x=>normName(x.name)===n);if(m.length===1){nt=m[0];break}}}if(nt){setMyArea(String(nt.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching','',nt);return}
      let temp=null;if(timetableCandidates.length)temp=reps.find(r=>timetableCandidates.includes(codeNorm(r.tempCode)))||null;if(temp){window.__vkvMyTeacherName=String(temp.tempName||'');setMyArea('teaching',String(temp.tempCode||''),temp);return}setMyArea('general','',null);
    }catch(e){console.warn('Staff My Area identity:',e)}
  }

  function startChecks(){let n=0;const identityTimer=setInterval(()=>{resolveStaffIdentity();if(++n>=30)clearInterval(identityTimer)},600);let u=0;const uxTimer=setInterval(()=>{enforceStaffUx();if(++u>=90)clearInterval(uxTimer)},300);setTimeout(resolveStaffIdentity,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{applyPortrait();startChecks()});else{applyPortrait();startChecks()}
  window.addEventListener('resize',applyPortrait);window.addEventListener('focus',()=>setTimeout(()=>{resolveStaffIdentity();enforceStaffUx()},150));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{resolveStaffIdentity();enforceStaffUx()},150)});window.v664RefreshStaffUx=enforceStaffUx;
})();
