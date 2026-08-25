/* VKVTT v66.3 — premium home shell + strict teacher-only My Area */
(function(){
  'use strict';
  const portraitUrl='https://raw.githubusercontent.com/ritwik17c/vkvtt-preview/main/Swami%20Vivekananda.png?v=swamiji-live-1';
  function applyPortrait(){
    const isMobile=window.matchMedia('(max-width:700px)').matches;
    const p=document.querySelector('.swamijiHomePortrait');
    if(p){
      p.src=portraitUrl;
      p.removeAttribute('srcset');
      const host=p.closest('.head')||p.parentElement;
      if(host){
        host.style.position='relative';
        host.style.setProperty('padding-right',isMobile?'86px':'132px','important');
      }
      p.style.setProperty('position','absolute','important');
      p.style.setProperty('right','0','important');
      p.style.setProperty('top','50%','important');
      p.style.setProperty('transform','translateY(-50%)','important');
      p.style.setProperty('margin','0','important');
      p.style.setProperty('width',isMobile?'68px':'108px','important');
      p.style.setProperty('height',isMobile?'68px':'108px','important');
      p.style.setProperty('object-fit','contain','important');
      p.style.setProperty('z-index','1','important');
      const title=document.querySelector('.homeTitleBlock');
      if(title){
        title.style.setProperty('position','relative','important');
        title.style.setProperty('z-index','2','important');
        title.style.setProperty('max-width',isMobile?'calc(100% - 92px)':'calc(100% - 170px)','important');
        if(isMobile){title.style.setProperty('padding-right','78px','important');}
      }
    }
    const lp=document.querySelector('#vkvSlowLoader .vkvLoaderPortrait img');
    if(lp){lp.src=portraitUrl;lp.removeAttribute('srcset');}
  }
  function tileHost(el){return el&&el.closest&&el.closest('.myGrid>button,.nav>button,.opsGrid>button')}
  document.addEventListener('click',e=>{const b=tileHost(e.target);if(!b)return;b.classList.remove('v662-click-nudge');void b.offsetWidth;b.classList.add('v662-click-nudge');setTimeout(()=>b.classList.remove('v662-click-nudge'),220)},true);

  const norm=v=>String(v||'').trim().toLowerCase();
  const normName=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const identifiers=x=>[x&&x.code,x&&x.teacherCode,x&&x.teacher_code,x&&x.employeeCode,x&&x.employee_code,x&&x.empCode,x&&x.staffCode,x&&x.teacherId,x&&x.id].map(v=>String(v||'').trim()).filter(Boolean);
  const emails=x=>[x&&x.email,x&&x.gmail,x&&x.googleEmail,x&&x.google_email].concat(Array.isArray(x&&x.emails)?x.emails:[]).map(norm).filter(Boolean);

  async function strictTeacherIdentity(){
    if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
    const D=window.DATA||{};
    const teachers=Array.isArray(D.teachers)?D.teachers.filter(Boolean):[];
    const reps=Array.isArray(D.temporaryReplacements)?D.temporaryReplacements.filter(r=>r&&r.active!==false):[];
    if(!teachers.length&&!reps.length)return;
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js');
      const authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js');
      const fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
      const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);
      if(typeof auth.authStateReady==='function')await auth.authStateReady().catch(()=>{});
      const user=auth.currentUser;if(!user)return;
      const db=fs.getFirestore(app),ps=await fs.getDoc(fs.doc(db,'authorizedUsers',user.uid)).catch(()=>null),profile=ps&&ps.exists()?ps.data():{};
      const explicit=identifiers(profile),email=norm(user.email||profile.email),names=[profile.teacherName,profile.name,user.displayName].map(normName).filter(Boolean);
      let teacher=null;

      // 1. Explicit identifier may be either the timetable short code or the employee code.
      if(explicit.length)teacher=teachers.find(t=>identifiers(t).some(v=>explicit.includes(v)))||null;
      // 2. Direct teacher email fields.
      if(!teacher&&email)teacher=teachers.find(t=>emails(t).includes(email))||null;
      // 3. Master teacherEmailMap maps timetable code -> Google email.
      if(!teacher&&email){
        const map=D.teacherEmailMap||{},mapped=Object.entries(map).find(([,e])=>norm(e)===email);
        if(mapped)teacher=teachers.find(t=>String(t.code||'')===String(mapped[0]))||null;
      }
      // 4. Exact name is a last-resort match, and only when unique among teachers.
      if(!teacher&&names.length){
        for(const n of names){const matches=teachers.filter(t=>normName(t.name)===n);if(matches.length===1){teacher=matches[0];break}}
      }

      // Temporary leave-vacancy teachers may also have My Area if explicitly linked by temp code/name.
      let temp=null;
      if(!teacher&&explicit.length)temp=reps.find(r=>explicit.includes(String(r.tempCode||'').trim()))||null;
      if(!teacher&&!temp&&names.length){for(const n of names){const m=reps.filter(r=>normName(r.tempName)===n);if(m.length===1){temp=m[0];break}}}

      const code=teacher?String(teacher.code||'').trim():(temp?String(temp.tempCode||'').trim():'');
      window.__vkvMyTeacherCode=code;
      window.__vkvMyTeacherName=teacher?String(teacher.name||''):(temp?String(temp.tempName||''):'');
      const title=document.getElementById('myAreaTitle'),grid=document.getElementById('myAreaGrid'),show=!!code;
      if(title)title.style.display=show?'block':'none';
      if(grid)grid.style.display=show?'grid':'none';
      if(typeof window.refreshMyAreaIdentity==='function')window.refreshMyAreaIdentity();
      // Re-assert after the older general staff resolver has had a chance to run.
      setTimeout(()=>{if(title)title.style.display=show?'block':'none';if(grid)grid.style.display=show?'grid':'none'},80);
    }catch(e){console.warn('Strict My Area teacher identity:',e)}
  }

  function startStrictMyAreaChecks(){
    let n=0;const timer=setInterval(()=>{strictTeacherIdentity();if(++n>=24)clearInterval(timer)},500);
    setTimeout(strictTeacherIdentity,80);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{applyPortrait();startStrictMyAreaChecks()});else{applyPortrait();startStrictMyAreaChecks()}
  window.addEventListener('resize',applyPortrait);
  window.addEventListener('focus',()=>setTimeout(strictTeacherIdentity,120));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(strictTeacherIdentity,120)});
})();
