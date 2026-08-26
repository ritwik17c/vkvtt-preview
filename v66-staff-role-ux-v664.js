/* VKVTT v66.4 — staff-category UX and non-teaching workspace */
(function(){
  'use strict';
  if(!/\/vkvtt-preview\/(?:index\.html)?$/i.test(location.pathname))return;
  const $=id=>document.getElementById(id);
  function periodTexts(){const sel=$('freePeriod');if(!sel)return[];return [...sel.options].map(o=>(o.textContent||'').trim()).filter(x=>x&& !/^Select/i.test(x))}
  function ensureStaffCommonPanel(){
    let p=$('v664StaffCommonPanel');if(p)return p;
    const banner=$('activeScheduleBanner');if(!banner)return null;
    p=document.createElement('section');p.id='v664StaffCommonPanel';p.style.cssText='display:none;background:#fff;border:1px solid #cadbe4;border-radius:16px;padding:14px 16px;margin:12px 0;box-shadow:0 4px 16px #17324d0f';
    p.innerHTML='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b style="color:#17364f">School Day</b><div id="v664ActiveScheduleText" style="font-size:.86rem;color:#617685;margin-top:4px"></div></div><button id="v664PeriodTimingsBtn" type="button" style="border:1px solid #b8cdd8;border-radius:11px;padding:9px 12px;background:#e7f2f7;color:#17364f;font-weight:750;cursor:pointer">🕐 Period Timings</button></div><div id="v664PeriodTimings" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid #e0e9ee"></div>';
    banner.insertAdjacentElement('afterend',p);
    $('v664PeriodTimingsBtn').onclick=()=>{const box=$('v664PeriodTimings'),open=box.style.display!=='none';if(open){box.style.display='none';return}const rows=periodTexts();box.innerHTML=rows.length?'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px">'+rows.map(x=>'<div style="padding:8px 10px;border:1px solid #e0e9ee;border-radius:10px;background:#f8fbfc">'+x.replace(/</g,'&lt;')+'</div>').join('')+'</div>':'<span style="color:#617685">Period timings are not available in the current schedule.</span>';box.style.display='block'};
    return p;
  }
  function role(){return String(window.__vkvRole||'').trim()}
  function enforce(){
    const cat=String(window.__vkvStaffCategory||'general');
    const title=$('myAreaTitle'),grid=$('myAreaGrid'),isTeacher=cat==='teaching',isStaff=isTeacher||cat==='non_teaching'||cat==='administrative';
    if(title){title.style.setProperty('display',isStaff?'block':'none','important');title.textContent=isTeacher?'My Area':'My Area · Staff'}
    if(grid)grid.style.setProperty('display',isStaff?'grid':'none','important');
    ['myTimetableBtn','myProxyTodayBtn','myProxyHistoryBtn'].forEach(id=>{const b=$(id);if(b)b.style.setProperty('display',isTeacher?'':'none','important')});
    ['myStatusBtn','myAttendanceBtn'].forEach(id=>{const b=$(id);if(b)b.style.setProperty('display',isStaff?'':'none','important')});
    const nav=document.querySelector('.nav');if(nav)nav.style.setProperty('display',isTeacher?'':'none','important');
    const panel=ensureStaffCommonPanel();if(panel){panel.style.display=!isTeacher&&isStaff?'block':'none';const s=$('v664ActiveScheduleText'),banner=$('activeScheduleBanner');if(s&&banner)s.textContent=(banner.textContent||'').replace(/^\s*🗓\s*/,'')}
    if(!isTeacher&&isStaff){
      const pub=$('publishedProxyBtn'),proxy=$('proxyWorkBtn');if(pub)pub.style.setProperty('display','none','important');if(proxy&& !['admin','manager','proxy_manager'].includes(role()))proxy.style.setProperty('display','none','important');
      [...document.querySelectorAll('.opsGrid button')].forEach(b=>{const oc=String(b.getAttribute('onclick')||'');if(oc.includes("'free'")||oc.includes("'now'"))b.style.setProperty('display','none','important')});
    }
  }
  let n=0;const t=setInterval(()=>{enforce();if(++n>40)clearInterval(t)},300);window.addEventListener('load',enforce);window.addEventListener('focus',()=>setTimeout(enforce,80));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(enforce,80)});
  window.v664RefreshStaffUx=enforce;
})();
