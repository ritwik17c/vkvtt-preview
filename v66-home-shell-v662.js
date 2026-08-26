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

  function setMyArea(mode,teacherCode='',staffRecord=null){
    const title=document.getElementById('myAreaTitle'),grid=document.getElementById('myAreaGrid');
    const teacherOnly=['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn'];
    const common=['myStatusBtn','myAttendanceBtn'];
    const show=mode==='teaching'||mode==='non_teaching'||mode==='administrative';
    if(title){title.style.display=show?'block':'none';title.textContent=mode==='teaching'?'My Area':'My Area · Staff'}
    if(grid)grid.style.display=show?'grid':'none';
    teacherOnly.forEach(id=>{const b=document.getElementById(id);if(b)b.style.display=mode==='teaching'?'':'none'});
    common.forEach(id=>{const b=document.getElementById(id);if(b)b.style.display=show?'':'none'});
    window.__vkvStaffCategory=mode||'general';
    window.__vkvStaffRecord=staffRecord||null;
    window.__vkvMyTeacherCode=mode==='teaching'?teacherCode:'';
    window.__vkvMyTeacherShortCode=mode==='teaching'?teacherCode:'';
    window.__vkvTimetableCode=mode==='teaching'?teacherCode:'';
    if(mode!=='teaching')window.__vkvMyTeacherName='';
    if(typeof window.refreshMyAreaIdentity==='function')window.refreshMyAreaIdentity();
  }

  async function resolveStaffIdentity(){
    if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js');
      const authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js');
      const fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
      const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});const user=auth.currentUser;if(!user)return;
      const db=fs.getFirestore(app),[ps,ms]=await Promise.all([fs.getDoc(fs.doc(db,'authorizedUsers',user.uid)).catch(()=>null),fs.getDoc(fs.doc(db,'master','current')).catch(()=>null)]);
      const profile=ps&&ps.exists()?ps.data():{},raw=ms&&ms.exists()?ms.data():{},M=raw.data||raw||{},D=window.DATA||{};
      const staff=Array.isArray(M.staffDirectory)?M.staffDirectory.filter(x=>x&&x.active!==false):[];
      const teachers=Array.isArray(M.teachers)?M.teachers:(Array.isArray(D.teachers)?D.teachers:[]);
      const nts=Array.isArray(M.nonTeachingStaff)?M.nonTeachingStaff:(Array.isArray(D.nonTeachingStaff)?D.nonTeachingStaff:[]);
      const reps=Array.isArray(M.temporaryReplacements)?M.temporaryReplacements:(Array.isArray(D.temporaryReplacements)?D.temporaryReplacements:[]);
      const email=norm(user.email||profile.email),names=[profile.name,profile.teacherName,user.displayName].map(normName).filter(Boolean);
      const profileRecordId=String(profile.staffRecordId||profile.staffDirectoryId||profile.linkedStaffId||'').trim();
      const employeeCandidates=[profile.employeeCode,profile.staffCode].map(codeNorm).filter(Boolean);
      const timetableCandidates=[profile.teacherShortCode,profile.timetableCode,profile.teacherCode].map(codeNorm).filter(Boolean);
      let rec=null;
      if(profileRecordId)rec=staff.find(s=>String(s.id||'')===profileRecordId)||null;
      if(!rec&&employeeCandidates.length)rec=staff.find(s=>employeeCandidates.includes(codeNorm(s.employeeCode)))||null;
      if(!rec&&timetableCandidates.length)rec=staff.find(s=>String(s.category||'')==='teaching'&&timetableCandidates.includes(codeNorm(s.shortCode||s.teacherShortCode||s.timetableCode)))||null;
      if(!rec&&email)rec=staff.find(s=>norm(s.email)===email)||null;
      if(!rec&&names.length){for(const n of names){const m=staff.filter(s=>normName(s.name)===n);if(m.length===1){rec=m[0];break}}}
      if(rec){
        const cat=String(rec.category||'').toLowerCase()==='teaching'?'teaching':String(rec.category||'').toLowerCase()==='administrative'?'administrative':'non_teaching';
        const tc=cat==='teaching'?String(rec.shortCode||rec.teacherShortCode||rec.timetableCode||'').trim():'';
        if(cat==='teaching')window.__vkvMyTeacherName=String(rec.name||'');
        setMyArea(cat,tc,rec);return;
      }
      // Backward-compatible fallback for accounts not yet linked to staffDirectory.
      let t=null;
      if(timetableCandidates.length)t=teachers.find(x=>timetableCandidates.includes(codeNorm(x.code)))||null;
      if(!t&&email)t=teachers.find(x=>emails(x).includes(email))||null;
      if(!t&&names.length){for(const n of names){const m=teachers.filter(x=>normName(x.name)===n);if(m.length===1){t=m[0];break}}}
      if(t){window.__vkvMyTeacherName=String(t.name||'');setMyArea('teaching',String(t.code||''),t);return}
      let nt=null;
      if(employeeCandidates.length)nt=nts.find(x=>employeeCandidates.includes(codeNorm(x.employeeCode||x.staffCode||x.code)))||null;
      if(!nt&&email)nt=nts.find(x=>norm(x.email)===email)||null;
      if(!nt&&names.length){for(const n of names){const m=nts.filter(x=>normName(x.name)===n);if(m.length===1){nt=m[0];break}}}
      if(nt){setMyArea(String(nt.staffCategory||'').toLowerCase()==='administrative'?'administrative':'non_teaching','',nt);return}
      let temp=null;if(timetableCandidates.length)temp=reps.find(r=>timetableCandidates.includes(codeNorm(r.tempCode)))||null;if(temp){window.__vkvMyTeacherName=String(temp.tempName||'');setMyArea('teaching',String(temp.tempCode||''),temp);return}
      setMyArea('general','',null);
    }catch(e){console.warn('Staff My Area identity:',e)}
  }

  function startChecks(){let n=0;const timer=setInterval(()=>{resolveStaffIdentity();if(++n>=16)clearInterval(timer)},600);setTimeout(resolveStaffIdentity,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{applyPortrait();startChecks()});else{applyPortrait();startChecks()}
  window.addEventListener('resize',applyPortrait);window.addEventListener('focus',()=>setTimeout(resolveStaffIdentity,150));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(resolveStaffIdentity,150)});
})();
