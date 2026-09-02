(()=>{
'use strict';
function getDoc(){
  const f=document.getElementById('owner');
  try{return f?(f.contentDocument||f.contentWindow.document):document}catch(e){return null}
}
function clean(d){
  if(!d)return;
  try{
    const root=d.getElementById('app')||d.body;
    [...root.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,b,div,section')].forEach(el=>{
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!/^⭐?\s*Menu Favorit$/i.test(t))return;
      let target=el;
      for(let i=0;i<5&&target.parentElement;i++){
        const p=target.parentElement;
        if(p.classList.contains('card')||p.tagName==='SECTION'||p.querySelectorAll('li,tr,.item').length>0){target=p;break}
        target=p;
      }
      if(target&&target!==d.body)target.remove();
    });
  }catch(e){}
}
function stabilize(d){
  if(!d||d.__ownerStabilityFixed)return;
  d.__ownerStabilityFixed=true;
  try{
    const st=d.createElement('style');
    st.id='owner-no-flicker-fix';
    st.textContent='html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important}#master-rekap-detail{contain:layout paint!important;backface-visibility:hidden!important;transform:translateZ(0)!important}#mr-result{min-height:120px!important}';
    (d.head||d.documentElement).appendChild(st);
  }catch(e){}
  const result=d.getElementById('mr-result');
  if(result){
    let stableHTML=result.innerHTML;
    let restoring=false;
    const ob=new MutationObserver(()=>{
      if(restoring)return;
      const txt=(result.textContent||'').trim();
      if(/^⏳\s*Mencari detail penjualan/.test(txt)&&stableHTML.trim()){
        restoring=true;
        result.innerHTML=stableHTML;
        restoring=false;
        return;
      }
      if(txt&&!/^⏳\s*Mencari detail penjualan/.test(txt))stableHTML=result.innerHTML;
    });
    ob.observe(result,{childList:true,subtree:true,characterData:true});
    d.__ownerResultObserver=ob;
  }
}
function setup(){
  const d=getDoc();
  if(!d)return;
  stabilize(d);
  clean(d);
  const app=d.getElementById('app')||d.body;
  if(app&&!d.__ownerFavoriteObserver){
    const ob=new MutationObserver(()=>clean(d));
    ob.observe(app,{childList:true,subtree:true});
    d.__ownerFavoriteObserver=ob;
  }
}
setup();
const f=document.getElementById('owner');
if(f)f.addEventListener('load',()=>setTimeout(setup,100));
if(!document.getElementById('owner-realtime-sync-loader')){
  const s=document.createElement('script');
  s.id='owner-realtime-sync-loader';
  s.src='/owner-realtime-sync.js?v=20260902-realtime-v1';
  document.head.appendChild(s);
}
})();
