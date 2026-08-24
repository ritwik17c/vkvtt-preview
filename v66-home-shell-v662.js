/* VKVTT v66.2 — v60 premium tile feedback + local Swamiji portrait */
(function(){
  'use strict';
  const portraitUrl='./Swami%20Vivekananda.png?v=swamiji-local-2';
  function applyPortrait(){
    const p=document.querySelector('.swamijiHomePortrait');
    if(p){p.src=portraitUrl;p.removeAttribute('srcset');}
    const lp=document.querySelector('#vkvSlowLoader .vkvLoaderPortrait img');
    if(lp){lp.src=portraitUrl;lp.removeAttribute('srcset');}
  }
  function tileHost(el){return el&&el.closest&&el.closest('.myGrid>button,.nav>button,.opsGrid>button')}
  document.addEventListener('click',e=>{const b=tileHost(e.target);if(!b)return;b.classList.remove('v662-click-nudge');void b.offsetWidth;b.classList.add('v662-click-nudge');setTimeout(()=>b.classList.remove('v662-click-nudge'),220)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyPortrait);else applyPortrait();
})();
