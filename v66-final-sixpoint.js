// VKVTT v66.3 preview runtime corrections
(async function(){
  'use strict';

  // Preview only: clear stale service-worker/cache state once after this role-routing update.
  if(location.pathname.startsWith('/vkvtt-preview/')){
    try{
      const flag='vkvttPreviewCacheResetV663RoleUx1';
      if(!sessionStorage.getItem(flag)){
        sessionStorage.setItem(flag,'1');
        if('serviceWorker' in navigator){
          const regs=await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r=>r.unregister()));
        }
        if('caches' in window){
          const keys=await caches.keys();
          await Promise.all(keys.filter(k=>/vkvtt/i.test(k)).map(k=>caches.delete(k)));
        }
        const u=new URL(location.href);u.searchParams.set('fresh','663roleux1');location.replace(u.toString());return;
      }
    }catch(e){console.warn('Preview cache reset:',e)}
  }

  // Make Firebase auth persistence explicit on every page that loads this shared patch.
  try{
    const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js');
    const authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js');
    const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
    const auth=authMod.getAuth(app);
    await authMod.setPersistence(auth,authMod.browserLocalPersistence);
  }catch(e){console.warn('Auth persistence:',e)}

  // Retain the light click nudge without changing label/icon visibility.
  document.addEventListener('click',e=>{
    const b=e.target.closest('.myGrid button,.nav button,.opsGrid button,.homebar button,.adminDashboardPage .tile');
    if(!b)return;
    b.classList.remove('v662-click-nudge');void b.offsetWidth;b.classList.add('v662-click-nudge');
    setTimeout(()=>b.classList.remove('v662-click-nudge'),220);
  },true);

  // Preview homepage role UX:
  // - My Area is meaningful only for a teacher-linked user (permanent or temporary teacher).
  // - Leave Editor must use the provisional approval workflow, never the old direct approved-status editor.
  if(/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname)){
    function isTeacherLinked(){
      const D=window.DATA||{},code=String(window.__vkvMyTeacherCode||'').trim();
      if(!code)return false;
      if((D.teachers||[]).some(t=>String(t&&t.code||'')===code))return true;
      return (D.temporaryReplacements||[]).some(r=>String(r&&r.tempCode||'')===code);
    }
    function enforceHomeRoleUx(){
      const role=String(window.__vkvRole||'').trim();
      const title=document.getElementById('myAreaTitle'),grid=document.getElementById('myAreaGrid');
      if(window.DATA){
        const showTeacherArea=isTeacherLinked();
        if(title)title.style.display=showTeacherArea?'block':'none';
        if(grid)grid.style.display=showTeacherArea?'grid':'none';
      }
      const leaveBtn=document.getElementById('leaveOpsBtn');
      if(leaveBtn&&role==='leave_editor'){
        leaveBtn.textContent='📝 Leave / Duty Leave Editor';
        leaveBtn.setAttribute('title','Prepare provisional Leave, OD or Special Assignment for Principal approval');
        leaveBtn.setAttribute('onclick',"location.href='leave-editor-phase2.html?v=66.3-phase2';return false");
        leaveBtn.disabled=false;
        leaveBtn.style.display='';
        leaveBtn.classList.remove('disabled');
      }
    }
    let tries=0;
    const roleUxTimer=setInterval(()=>{
      enforceHomeRoleUx();
      tries++;
      if((window.DATA&&window.__vkvRole)||tries>40)clearInterval(roleUxTimer);
    },350);
    window.addEventListener('focus',()=>setTimeout(enforceHomeRoleUx,80));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(enforceHomeRoleUx,80)});
  }

  // Leave Master Editor: collapse dated records from one consecutive saved transaction
  // into a single visual card. Underlying dated records remain untouched for proxy,
  // balance, audit, editing and archival. Individual cards can be expanded on demand.
  if(document.getElementById('recordList') && /admin-leave-editor\.html$/i.test(location.pathname)){
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const parsePlanKey=key=>{
      const m=String(key||'').match(/^le_(.+)_(\d{8})_(\d+)_(\d+)$/);
      if(!m)return null;
      const y=m[2].slice(0,4),mo=m[2].slice(4,6),d=m[2].slice(6,8);
      return{code:m[1],date:`${y}-${mo}-${d}`,stamp:m[3],index:Number(m[4])};
    };
    const ddmmyyyy=iso=>{const m=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:iso};
    const nextDay=iso=>{const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
    const statusLine=card=>{
      const meta=card.querySelector('.meta');
      if(!meta)return'';
      const html=meta.innerHTML||'';
      const first=html.split(/<br\s*\/?>/i)[0]||'';
      const tmp=document.createElement('div');tmp.innerHTML=first;
      return (tmp.textContent||'').replace(/\s+/g,' ').trim();
    };
    const totalUnits=(line,count)=>{
      const m=String(line||'').match(/·\s*([0-9]+(?:\.[0-9]+)?)\s+leave unit/i);
      if(!m)return'';
      const n=Math.round(Number(m[1])*count*2)/2;
      return Number.isFinite(n)?n:'';
    };
    const cleanStatus=line=>String(line||'').replace(/\s*·\s*[0-9]+(?:\.[0-9]+)?\s+leave units?\s*$/i,'').trim();
    const host=document.getElementById('recordList');
    let observer=null;

    function groupApprovedCards(){
      if(!host||host.dataset.groupingBusy==='1')return;
      host.dataset.groupingBusy='1';
      if(observer)observer.disconnect();
      try{
        host.querySelectorAll('.v663-consecutive-summary').forEach(x=>x.remove());
        host.querySelectorAll('.recordCard[data-v663-grouped="1"]').forEach(x=>{x.style.display='';delete x.dataset.v663Grouped});
        const cards=[...host.children].filter(x=>x.classList&&x.classList.contains('recordCard'));
        const buckets=new Map();
        for(const card of cards){
          const edit=card.querySelector('[data-edit-kind="plan"][data-edit-key]');
          if(!edit)continue;
          const p=parsePlanKey(edit.dataset.editKey);if(!p)continue;
          const line=statusLine(card);
          const key=[p.code,p.stamp,line].join('|');
          if(!buckets.has(key))buckets.set(key,[]);
          buckets.get(key).push({card,p,line});
        }
        for(const items0 of buckets.values()){
          const items=[...items0].sort((a,b)=>a.p.date.localeCompare(b.p.date)||a.p.index-b.p.index);
          const runs=[];let run=[];
          for(const item of items){
            if(!run.length||item.p.date===nextDay(run[run.length-1].p.date))run.push(item);
            else{runs.push(run);run=[item]}
          }
          if(run.length)runs.push(run);
          for(const r of runs){
            if(r.length<2)continue;
            const first=r[0],last=r[r.length-1],firstCard=first.card;
            const title=firstCard.querySelector('.cardTitle')?.innerHTML||'';
            const meta=firstCard.querySelector('.meta');
            const source=(meta?.textContent||'').match(/Source:\s*(.+)$/im)?.[1]?.trim()||'Scheduled / approved';
            const core=cleanStatus(first.line),units=totalUnits(first.line,r.length);
            const summary=document.createElement('div');
            summary.className='recordCard v663-consecutive-summary';
            summary.style.borderLeftWidth='6px';
            summary.innerHTML=`<div class="cardTop"><div><div class="cardTitle">${title}</div><div class="meta">${esc(core)}${units!==''?` · <b>${esc(units)}</b> leave unit${Number(units)===1?'':'s'}`:''}<br><b>${esc(ddmmyyyy(first.p.date))} → ${esc(ddmmyyyy(last.p.date))}</b> · ${r.length} consecutive day${r.length===1?'':'s'}<br><span class="small">Source: ${esc(source)} · grouped display</span></div></div><div><span class="pill">${last.p.date < new Date().toISOString().slice(0,10)?'Past':'Consecutive'}</span></div></div><div class="actions"><button type="button" class="primary v663-show-dates">Show ${r.length} individual records for edit / archive</button></div>`;
            firstCard.parentNode.insertBefore(summary,firstCard);
            r.forEach(x=>{x.card.dataset.v663Grouped='1';x.card.style.display='none'});
            const btn=summary.querySelector('.v663-show-dates');
            btn.onclick=()=>{
              const opening=r[0].card.style.display==='none';
              r.forEach(x=>x.card.style.display=opening?'':'none');
              btn.textContent=opening?'Hide individual records':`Show ${r.length} individual records for edit / archive`;
            };
          }
        }
      }catch(e){console.warn('Consecutive leave grouping:',e)}
      finally{
        host.dataset.groupingBusy='0';
        if(observer)observer.observe(host,{childList:true});
      }
    }
    observer=new MutationObserver(()=>setTimeout(groupApprovedCards,0));
    observer.observe(host,{childList:true});
    setTimeout(groupApprovedCards,250);
  }

  // Homepage Daily History: supplement the old snapshot with authoritative dated records.
  if(!document.getElementById('historyResult'))return;
  try{
    const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js');
    const fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
    const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
    const db=fs.getFirestore(app);

    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const toIso=v=>{const m=String(v||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:''};
    const covers=(p,date)=>{
      if(!p||p.active===false||p.archived===true||p.deleted===true)return false;
      if(p.mode==='multiple')return Array.isArray(p.dates)&&p.dates.includes(date);
      const a=String(p.startDate||p.date||''),b=String(p.endDate||a);return !!a&&date>=a&&date<=b;
    };
    const teacherName=code=>{
      const D=window.DATA||{};
      const all=[...(D.teachers||[]),...(D.nonTeachingStaff||[]),...(D.temporaryReplacements||[])];
      const t=all.find(x=>String(x.code||x.tempCode||'')===String(code||''));
      return t?(t.name||t.tempName||code):(code||'Staff');
    };
    const kind=x=>String(x.type||x.kind||'').toLowerCase();
    const label=x=>{
      const k=kind(x),cat=x.category||x.leaveCategory||'';
      if(k==='full')return 'Full Leave'+(cat?' · '+cat:'');
      if(k==='half')return 'Half Leave'+(cat?' · '+cat:'');
      if(k==='od')return 'On Duty';
      if(k==='special')return 'Special Assignment';
      if(k==='vacant')return 'Vacant Position';
      return x.label||x.status||k||'Status';
    };
    const group=x=>{const k=kind(x);return (k==='full'||k==='half')?'leave':(k==='od'||k==='special')?'duty':k==='vacant'?'vacant':'other'};
    const dedupe=arr=>{
      const seen=new Set();return arr.filter(x=>{const key=[x.code,kind(x),x.category||'',x.note||x.remarks||'',x.startDate||'',x.endDate||''].join('|');if(seen.has(key))return false;seen.add(key);return true});
    };
    async function authoritativeSummary(){
      const input=document.getElementById('historyDate');const date=toIso(input&&input.value);if(!date)return;
      const [daySnap,plansSnap]=await Promise.all([
        fs.getDoc(fs.doc(db,'dailyRecords',date)),
        fs.getDoc(fs.doc(db,'dailyRecords','__leavePlans'))
      ]);
      const rows=[];
      if(daySnap.exists()){
        const d=daySnap.data()||{};(d.statuses||[]).forEach(x=>{if(x&&x.active!==false&&x.deleted!==true)rows.push({...x,_source:'daily'})});
      }
      if(plansSnap.exists()){
        const d=plansSnap.data()||{};Object.values(d.plans||{}).forEach(p=>{if(covers(p,date))rows.push({...p,_source:'scheduled'})});
      }
      const clean=dedupe(rows),leave=clean.filter(x=>group(x)==='leave'),duty=clean.filter(x=>group(x)==='duty'),vacant=clean.filter(x=>group(x)==='vacant');
      const fmt=a=>a.length?a.map(x=>`<div class="v662-history-item"><b>${esc(teacherName(x.code))}</b> <span>${esc(x.code||'')}</span> · ${esc(label(x))}${x.note||x.remarks?` · ${esc(x.note||x.remarks)}`:''}</div>`).join(''):'<div class="v662-none">None</div>';
      const block=`<div class="v662-authoritative-history"><h3>Regular Leave</h3>${fmt(leave)}<h3>Duty Leave · OD / Special Assignment</h3>${fmt(duty)}<h3>Operational Status · Vacant Position</h3>${fmt(vacant)}</div>`;
      const host=document.getElementById('historyResult');if(!host)return;
      let heading=[...host.querySelectorAll('h2,h3,h4,strong')].find(n=>/Leave\s*\/\s*OD\s*\/\s*Special Assignment\s*\/\s*Vacant/i.test(n.textContent||''));
      if(heading){
        const next=heading.nextElementSibling;heading.insertAdjacentHTML('beforebegin',block);heading.style.display='none';if(next&&/^None$/i.test((next.textContent||'').trim()))next.style.display='none';
      }else if(!host.querySelector('.v662-authoritative-history'))host.insertAdjacentHTML('afterbegin',block);
    }

    const wait=()=>{
      if(typeof window.renderHistory!=='function')return setTimeout(wait,120);
      if(window.renderHistory.__v662Wrapped)return;
      const orig=window.renderHistory;
      const wrapped=function(...args){const r=orig.apply(this,args);Promise.resolve(r).finally(()=>setTimeout(()=>authoritativeSummary().catch(e=>console.warn('Daily History summary:',e)),40));return r};
      wrapped.__v662Wrapped=true;window.renderHistory=wrapped;
      const input=document.getElementById('historyDate');if(input)input.addEventListener('change',()=>setTimeout(()=>authoritativeSummary().catch(()=>{}),80));
    };
    wait();
  }catch(e){console.warn('Daily History enhancer:',e)}
})();
