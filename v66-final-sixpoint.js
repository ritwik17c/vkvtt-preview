// VKVTT v66.3 preview runtime corrections
(async function(){
  'use strict';

  if(location.pathname.startsWith('/vkvtt-preview/')){
    try{
      const flag='vkvttPreviewCacheResetV663RoleIdentity2';
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
        const u=new URL(location.href);u.searchParams.set('fresh','663roleidentity2');location.replace(u.toString());return;
      }
    }catch(e){console.warn('Preview cache reset:',e)}
  }

  const cfg={apiKey:'AIzaSyDheZpyXghd1aQ9_RLhwpacVriG__wNZW4',authDomain:'vkv-nalbari-timetable.firebaseapp.com',projectId:'vkv-nalbari-timetable',storageBucket:'vkv-nalbari-timetable.firebasestorage.app',messagingSenderId:'791432856951',appId:'1:791432856951:web:61324065a54bef30f98d72'};
  let sharedApp=null,sharedAuth=null;
  try{
    const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js');
    const authMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js');
    sharedApp=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);
    sharedAuth=authMod.getAuth(sharedApp);
    await authMod.setPersistence(sharedAuth,authMod.browserLocalPersistence);
  }catch(e){console.warn('Auth persistence:',e)}

  document.addEventListener('click',e=>{
    const b=e.target.closest('.myGrid button,.nav button,.opsGrid button,.homebar button,.adminDashboardPage .tile');
    if(!b)return;
    b.classList.remove('v662-click-nudge');void b.offsetWidth;b.classList.add('v662-click-nudge');
    setTimeout(()=>b.classList.remove('v662-click-nudge'),220);
  },true);

  // User Access & Roles: explicitly link privileged accounts to Teaching or Non-Teaching staff.
  if(/admin-users\.html$/i.test(location.pathname)){
    try{
      const fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
      const db=fs.getFirestore(sharedApp);
      const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      let master={};
      async function loadIdentityMaster(){
        const snap=await fs.getDoc(fs.doc(db,'master','current'));
        const raw=snap.exists()?snap.data():{};master=raw.data||raw||{};
      }
      function staffOptions(selected=''){
        const teachers=(master.teachers||[]).map(t=>({code:String(t.code||''),name:t.name||t.code||'',temporary:false}));
        const seen=new Set(teachers.map(t=>t.code));
        for(const r of (master.temporaryReplacements||[]))if(r&&r.tempCode&&!seen.has(String(r.tempCode))){teachers.push({code:String(r.tempCode),name:(r.tempName||r.tempCode)+' — Temporary',temporary:true});seen.add(String(r.tempCode))}
        teachers.sort((a,b)=>a.name.localeCompare(b.name));
        const nts=(master.nonTeachingStaff||[]).filter(x=>x&&x.active!==false).map(x=>({code:String(x.code||''),name:x.name||x.code||'',designation:x.designation||'Staff'})).sort((a,b)=>a.name.localeCompare(b.name));
        return '<option value="">Not linked / general account</option><optgroup label="Teaching Staff">'+teachers.map(t=>`<option value="${esc(t.code)}" ${t.code===String(selected)?'selected':''}>${esc(t.name)} (${esc(t.code)})${t.temporary?' · Temporary':''}</option>`).join('')+'</optgroup><optgroup label="Non-Teaching Staff">'+nts.map(t=>`<option value="${esc(t.code)}" ${t.code===String(selected)?'selected':''}>${esc(t.name)} (${esc(t.code)}) · ${esc(t.designation)}</option>`).join('')+'</optgroup>';
      }
      const isNonTeaching=code=>(master.nonTeachingStaff||[]).some(x=>String(x&&x.code||'')===String(code||''));
      async function savePrivLink(uid,code){
        const nt=isNonTeaching(code);
        await fs.setDoc(fs.doc(db,'authorizedUsers',uid),{teacherCode:code&&!nt?String(code):'',staffCode:code&&nt?String(code):'',staffType:code?(nt?'non_teaching':'teaching'):'general'},{merge:true});
      }
      async function buildPrivilegedLinks(){
        const app=document.getElementById('app');if(!app||app.style.display==='none')return;
        await loadIdentityMaster();
        let card=document.getElementById('v663PrivilegedStaffLinks');
        if(!card){
          card=document.createElement('div');card.id='v663PrivilegedStaffLinks';card.className='card';
          card.innerHTML='<h2>Privileged Account · Staff Identity</h2><div class="help">Delegated role and staff category are independent. Link each privileged account explicitly to Teaching Staff or Non-Teaching Staff. My Area is available only to Teaching Staff links.</div><div id="v663PrivLinkMsg" class="status" style="display:none"></div><div class="tablewrap"><table><thead><tr><th>Name / Email</th><th>Role</th><th>Linked Staff Member</th><th>Action</th></tr></thead><tbody id="v663PrivLinkRows"><tr><td colspan="4">Loading…</td></tr></tbody></table></div>';
          app.appendChild(card);
        }
        const qs=await fs.getDocs(fs.collection(db,'authorizedUsers')),rows=[];qs.forEach(d=>rows.push({id:d.id,...d.data()}));rows.sort((a,b)=>String(a.name||a.email||a.id).localeCompare(String(b.name||b.email||b.id)));
        const host=document.getElementById('v663PrivLinkRows');
        host.innerHTML=rows.map((x,i)=>{const linked=String(x.teacherCode||x.staffCode||'');return `<tr><td><b>${esc(x.name||'')}</b><br><span class="small">${esc(x.email||'')}</span></td><td>${esc(x.role||'staff')}</td><td><select id="v663PrivStaff_${i}">${staffOptions(linked)}</select></td><td><button data-v663-save-link="${esc(x.id)}" data-select="v663PrivStaff_${i}">Save Staff Link</button></td></tr>`}).join('')||'<tr><td colspan="4">No privileged accounts found.</td></tr>';
      }
      document.addEventListener('click',async e=>{
        const b=e.target.closest('[data-v663-save-link]');if(!b)return;
        const sel=document.getElementById(b.dataset.select),msg=document.getElementById('v663PrivLinkMsg');
        b.disabled=true;try{await savePrivLink(b.dataset.v663SaveLink,sel?sel.value:'');if(msg){msg.style.display='block';msg.className='status ok';msg.textContent='Staff identity link saved.'}await buildPrivilegedLinks()}catch(err){if(msg){msg.style.display='block';msg.className='status warn';msg.textContent='Could not save staff identity: '+(err.message||err)}}finally{b.disabled=false}
      });
      const saveBtn=document.getElementById('savePriv');
      if(saveBtn){
        const roleField=document.getElementById('privRole');
        const holder=document.createElement('div');holder.innerHTML='<label>Linked Staff Member</label><select id="v663NewPrivStaff"><option value="">Loading staff…</option></select>';
        roleField?.closest('div')?.insertAdjacentElement('afterend',holder);
        loadIdentityMaster().then(()=>{const s=document.getElementById('v663NewPrivStaff');if(s)s.innerHTML=staffOptions('')}).catch(()=>{});
        saveBtn.addEventListener('click',()=>{
          const uid=String(document.getElementById('privUid')?.value||'').trim(),sel=document.getElementById('v663NewPrivStaff'),code=sel?sel.value:'';
          if(!uid)return;setTimeout(()=>savePrivLink(uid,code).then(buildPrivilegedLinks).catch(e=>console.warn('Privileged staff link:',e)),450);
        },true);
      }
      const appWatch=new MutationObserver(()=>buildPrivilegedLinks().catch(()=>{}));
      const app=document.getElementById('app');if(app)appWatch.observe(app,{attributes:true,attributeFilter:['style']});
      setTimeout(()=>buildPrivilegedLinks().catch(()=>{}),900);
      const viewerLabel=document.querySelector('label[for="viewerInput"]')||[...document.querySelectorAll('label')].find(x=>/Teacher Google emails/i.test(x.textContent||''));if(viewerLabel)viewerLabel.textContent='Staff Google emails';
    }catch(e){console.warn('Privileged staff identity UI:',e)}
  }

  // Preview homepage: staff category and delegated role are separate dimensions.
  if(/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname)){
    let explicitProfile=null;
    async function loadExplicitProfile(){
      if(!sharedAuth?.currentUser)return null;
      try{const fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');const db=fs.getFirestore(sharedApp);const s=await fs.getDoc(fs.doc(db,'authorizedUsers',sharedAuth.currentUser.uid));explicitProfile=s.exists()?s.data():null;return explicitProfile}catch(e){return null}
    }
    function teacherFromFallback(){
      const D=window.DATA||{},code=String(window.__vkvMyTeacherCode||'').trim();
      if(!code)return false;
      if((D.nonTeachingStaff||[]).some(x=>String(x&&x.code||'')===code))return false;
      return (D.teachers||[]).some(t=>String(t&&t.code||'')===code)||(D.temporaryReplacements||[]).some(r=>String(r&&r.tempCode||'')===code);
    }
    function isTeacherLinked(){
      if(explicitProfile){if(String(explicitProfile.staffCode||'').trim())return false;if(String(explicitProfile.teacherCode||'').trim())return true;if(explicitProfile.staffType==='non_teaching')return false;if(explicitProfile.staffType==='teaching')return true}
      return teacherFromFallback();
    }
    function ensureRoleButton(id,text,url){
      let b=document.getElementById(id);const grid=document.querySelector('.opsGrid');if(!grid)return null;
      if(!b){b=document.createElement('button');b.id=id;grid.appendChild(b)}b.textContent=text;b.onclick=()=>{location.href=url};b.style.display='';b.disabled=false;return b;
    }
    function enforceHomeRoleUx(){
      const role=String(window.__vkvRole||explicitProfile?.role||'teacher').trim();
      const teacherLinked=isTeacherLinked(),nonTeachingLinked=!!(explicitProfile&&String(explicitProfile.staffCode||'').trim());
      const title=document.getElementById('myAreaTitle'),grid=document.getElementById('myAreaGrid');if(title)title.style.display=teacherLinked?'block':'none';if(grid)grid.style.display=teacherLinked?'grid':'none';
      const leaveBtn=document.getElementById('leaveOpsBtn'),proxyBtn=document.getElementById('proxyWorkBtn'),published=document.getElementById('publishedProxyBtn');
      if(leaveBtn){
        if(role==='leave_editor'){leaveBtn.textContent='📝 Leave / Duty Leave Editor';leaveBtn.onclick=()=>{location.href='leave-editor-phase2.html?v=66.3-phase2'};leaveBtn.style.display='';leaveBtn.disabled=false}
        else if(['admin','manager'].includes(role)){leaveBtn.textContent='📝 Leave / Duty Leave / Vacant';leaveBtn.setAttribute('onclick',"show('leave',this)");leaveBtn.style.display='';leaveBtn.disabled=false}
        else leaveBtn.style.display='none';
      }
      if(proxyBtn)proxyBtn.style.display=['admin','manager','proxy_manager'].includes(role)?'':'none';
      if(role==='attendance_manager')ensureRoleButton('v663AttendanceAdminBtn','📍 Attendance Administration','admin-attendance.html?v=66.3');
      else document.getElementById('v663AttendanceAdminBtn')?.remove();
      if(explicitProfile?.permissions?.timetableStudio===true&&role!=='admin')ensureRoleButton('v663StudioBtn','📘 Timetable Studio','admin-timetable-studio.html?v=66.0');
      else document.getElementById('v663StudioBtn')?.remove();
      if(nonTeachingLinked){
        if(published)published.style.display='none';
        ['free','now'].forEach(viewId=>{const btn=[...document.querySelectorAll('.opsGrid button')].find(b=>String(b.getAttribute('onclick')||'').includes(`'${viewId}'`));if(btn)btn.style.display='none'});
      }
    }
    loadExplicitProfile().finally(()=>setTimeout(enforceHomeRoleUx,80));
    let tries=0;const roleUxTimer=setInterval(()=>{if(!explicitProfile&&sharedAuth?.currentUser)loadExplicitProfile().catch(()=>{});enforceHomeRoleUx();tries++;if((window.DATA&&window.__vkvRole&&explicitProfile)||tries>50)clearInterval(roleUxTimer)},350);
    window.addEventListener('focus',()=>{loadExplicitProfile().finally(()=>setTimeout(enforceHomeRoleUx,80))});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadExplicitProfile().finally(()=>setTimeout(enforceHomeRoleUx,80))});
  }

  // Leave Master Editor: group consecutive records from one saved transaction.
  if(document.getElementById('recordList') && /admin-leave-editor\.html$/i.test(location.pathname)){
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const parsePlanKey=key=>{const m=String(key||'').match(/^le_(.+)_(\d{8})_(\d+)_(\d+)$/);if(!m)return null;const y=m[2].slice(0,4),mo=m[2].slice(4,6),d=m[2].slice(6,8);return{code:m[1],date:`${y}-${mo}-${d}`,stamp:m[3],index:Number(m[4])}};
    const ddmmyyyy=iso=>{const m=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:iso};
    const nextDay=iso=>{const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
    const statusLine=card=>{const meta=card.querySelector('.meta');if(!meta)return'';const html=meta.innerHTML||'',first=html.split(/<br\s*\/?>/i)[0]||'',tmp=document.createElement('div');tmp.innerHTML=first;return(tmp.textContent||'').replace(/\s+/g,' ').trim()};
    const totalUnits=(line,count)=>{const m=String(line||'').match(/·\s*([0-9]+(?:\.[0-9]+)?)\s+leave unit/i);if(!m)return'';const n=Math.round(Number(m[1])*count*2)/2;return Number.isFinite(n)?n:''};
    const cleanStatus=line=>String(line||'').replace(/\s*·\s*[0-9]+(?:\.[0-9]+)?\s+leave units?\s*$/i,'').trim();
    const host=document.getElementById('recordList');let observer=null;
    function groupApprovedCards(){if(!host||host.dataset.groupingBusy==='1')return;host.dataset.groupingBusy='1';if(observer)observer.disconnect();try{host.querySelectorAll('.v663-consecutive-summary').forEach(x=>x.remove());host.querySelectorAll('.recordCard[data-v663-grouped="1"]').forEach(x=>{x.style.display='';delete x.dataset.v663Grouped});const cards=[...host.children].filter(x=>x.classList&&x.classList.contains('recordCard')),buckets=new Map();for(const card of cards){const edit=card.querySelector('[data-edit-kind="plan"][data-edit-key]');if(!edit)continue;const p=parsePlanKey(edit.dataset.editKey);if(!p)continue;const line=statusLine(card),key=[p.code,p.stamp,line].join('|');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push({card,p,line})}for(const items0 of buckets.values()){const items=[...items0].sort((a,b)=>a.p.date.localeCompare(b.p.date)||a.p.index-b.p.index),runs=[];let run=[];for(const item of items){if(!run.length||item.p.date===nextDay(run[run.length-1].p.date))run.push(item);else{runs.push(run);run=[item]}}if(run.length)runs.push(run);for(const r of runs){if(r.length<2)continue;const first=r[0],last=r[r.length-1],firstCard=first.card,title=firstCard.querySelector('.cardTitle')?.innerHTML||'',meta=firstCard.querySelector('.meta'),source=(meta?.textContent||'').match(/Source:\s*(.+)$/im)?.[1]?.trim()||'Scheduled / approved',core=cleanStatus(first.line),units=totalUnits(first.line,r.length),summary=document.createElement('div');summary.className='recordCard v663-consecutive-summary';summary.style.borderLeftWidth='6px';summary.innerHTML=`<div class="cardTop"><div><div class="cardTitle">${title}</div><div class="meta">${esc(core)}${units!==''?` · <b>${esc(units)}</b> leave unit${Number(units)===1?'':'s'}`:''}<br><b>${esc(ddmmyyyy(first.p.date))} → ${esc(ddmmyyyy(last.p.date))}</b> · ${r.length} consecutive day${r.length===1?'':'s'}<br><span class="small">Source: ${esc(source)} · grouped display</span></div></div><div><span class="pill">${last.p.date < new Date().toISOString().slice(0,10)?'Past':'Consecutive'}</span></div></div><div class="actions"><button type="button" class="primary v663-show-dates">Show ${r.length} individual records for edit / archive</button></div>`;firstCard.parentNode.insertBefore(summary,firstCard);r.forEach(x=>{x.card.dataset.v663Grouped='1';x.card.style.display='none'});const btn=summary.querySelector('.v663-show-dates');btn.onclick=()=>{const opening=r[0].card.style.display==='none';r.forEach(x=>x.card.style.display=opening?'':'none');btn.textContent=opening?'Hide individual records':`Show ${r.length} individual records for edit / archive`}}}}catch(e){console.warn('Consecutive leave grouping:',e)}finally{host.dataset.groupingBusy='0';if(observer)observer.observe(host,{childList:true})}}
    observer=new MutationObserver(()=>setTimeout(groupApprovedCards,0));observer.observe(host,{childList:true});setTimeout(groupApprovedCards,250);
  }

  // Homepage Daily History: supplement the old snapshot with authoritative dated records.
  if(!document.getElementById('historyResult'))return;
  try{
    const appMod=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js'),fs=await import('https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js');
    const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),db=fs.getFirestore(app);
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),toIso=v=>{const m=String(v||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:''},covers=(p,date)=>{if(!p||p.active===false||p.archived===true||p.deleted===true)return false;if(p.mode==='multiple')return Array.isArray(p.dates)&&p.dates.includes(date);const a=String(p.startDate||p.date||''),b=String(p.endDate||a);return!!a&&date>=a&&date<=b},teacherName=code=>{const D=window.DATA||{},all=[...(D.teachers||[]),...(D.nonTeachingStaff||[]),...(D.temporaryReplacements||[])],t=all.find(x=>String(x.code||x.tempCode||'')===String(code||''));return t?(t.name||t.tempName||code):(code||'Staff')},kind=x=>String(x.type||x.kind||'').toLowerCase(),label=x=>{const k=kind(x),cat=x.category||x.leaveCategory||'';if(k==='full')return'Full Leave'+(cat?' · '+cat:'');if(k==='half')return'Half Leave'+(cat?' · '+cat:'');if(k==='od')return'On Duty';if(k==='special')return'Special Assignment';if(k==='vacant')return'Vacant Position';return x.label||x.status||k||'Status'},group=x=>{const k=kind(x);return(k==='full'||k==='half')?'leave':(k==='od'||k==='special')?'duty':k==='vacant'?'vacant':'other'},dedupe=arr=>{const seen=new Set();return arr.filter(x=>{const key=[x.code,kind(x),x.category||'',x.note||x.remarks||'',x.startDate||'',x.endDate||''].join('|');if(seen.has(key))return false;seen.add(key);return true})};
    async function authoritativeSummary(){const input=document.getElementById('historyDate'),date=toIso(input&&input.value);if(!date)return;const[daySnap,plansSnap]=await Promise.all([fs.getDoc(fs.doc(db,'dailyRecords',date)),fs.getDoc(fs.doc(db,'dailyRecords','__leavePlans'))]),rows=[];if(daySnap.exists()){const d=daySnap.data()||{};(d.statuses||[]).forEach(x=>{if(x&&x.active!==false&&x.deleted!==true)rows.push({...x,_source:'daily'})})}if(plansSnap.exists()){const d=plansSnap.data()||{};Object.values(d.plans||{}).forEach(p=>{if(covers(p,date))rows.push({...p,_source:'scheduled'})})}const clean=dedupe(rows),leave=clean.filter(x=>group(x)==='leave'),duty=clean.filter(x=>group(x)==='duty'),vacant=clean.filter(x=>group(x)==='vacant'),fmt=a=>a.length?a.map(x=>`<div class="v662-history-item"><b>${esc(teacherName(x.code))}</b> <span>${esc(x.code||'')}</span> · ${esc(label(x))}${x.note||x.remarks?` · ${esc(x.note||x.remarks)}`:''}</div>`).join(''):'<div class="v662-none">None</div>',block=`<div class="v662-authoritative-history"><h3>Regular Leave</h3>${fmt(leave)}<h3>Duty Leave · OD / Special Assignment</h3>${fmt(duty)}<h3>Operational Status · Vacant Position</h3>${fmt(vacant)}</div>`,host=document.getElementById('historyResult');if(!host)return;let heading=[...host.querySelectorAll('h2,h3,h4,strong')].find(n=>/Leave\s*\/\s*OD\s*\/\s*Special Assignment\s*\/\s*Vacant/i.test(n.textContent||''));if(heading){const next=heading.nextElementSibling;heading.insertAdjacentHTML('beforebegin',block);heading.style.display='none';if(next&&/^None$/i.test((next.textContent||'').trim()))next.style.display='none'}else if(!host.querySelector('.v662-authoritative-history'))host.insertAdjacentHTML('afterbegin',block)}
    const wait=()=>{if(typeof window.renderHistory!=='function')return setTimeout(wait,120);if(window.renderHistory.__v662Wrapped)return;const orig=window.renderHistory,wrapped=function(...args){const r=orig.apply(this,args);Promise.resolve(r).finally(()=>setTimeout(()=>authoritativeSummary().catch(e=>console.warn('Daily History summary:',e)),40));return r};wrapped.__v662Wrapped=true;window.renderHistory=wrapped;const input=document.getElementById('historyDate');if(input)input.addEventListener('change',()=>setTimeout(()=>authoritativeSummary().catch(()=>{}),80))};wait();
  }catch(e){console.warn('Daily History enhancer:',e)}
})();
