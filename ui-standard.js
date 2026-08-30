/* ISSHO CAFE — UI Standard v1.1
   Shared browser/device normalization. Keep every public screen on one UI/language standard. */
(function(){
  'use strict';
  const TZ='Asia/Jakarta';
  document.documentElement.lang='id';
  document.documentElement.setAttribute('data-app-locale','id-ID');
  document.documentElement.setAttribute('data-app-timezone',TZ);
  const css=document.createElement('style');
  css.id='issho-ui-standard';
  css.textContent=`
    *,*::before,*::after{box-sizing:border-box}
    html{width:100%;min-width:320px;-webkit-text-size-adjust:100%;text-size-adjust:100%}
    body{max-width:100%;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    img,video,canvas{max-width:100%;height:auto}
    button,input,select,textarea{font:inherit;-webkit-tap-highlight-color:transparent}
    button,a,input,select,textarea{touch-action:manipulation}
    @media(max-width:700px){
      body{overflow-x:hidden}
      button{min-height:42px}
      input,select,textarea{min-height:42px}
    }
  `;
  (document.head||document.documentElement).appendChild(css);
  window.ISSHO_UI={locale:'id-ID',timezone:TZ,version:'1.1'};
  window.ISSHO_UI.formatDate=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:TZ})};
  window.ISSHO_UI.formatTime=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:TZ})};

  // Android/mobile Owner search: after filtering, bring the actual result cards
  // into the visible area. Do not change the search logic or the existing data.
  function enhanceOwnerSearch(){
    try{
      if(!/owner-rpp02n\.html$/i.test(location.pathname)) return;
      const frame=document.getElementById('owner');
      if(!frame) return;
      const attach=()=>{
        try{
          const w=frame.contentWindow;
          const search=w.document.getElementById('menuSearch');
          const products=w.document.getElementById('products');
          if(!search||!products||search.dataset.isshoMobileSearchFix==='1') return;
          search.dataset.isshoMobileSearchFix='1';
          search.addEventListener('input',()=>{
            window.setTimeout(()=>{
              try{
                if(String(search.value||'').trim()){
                  products.scrollIntoView({behavior:'smooth',block:'start'});
                }
              }catch(e){}
            },180);
          },{passive:true});
        }catch(e){}
      };
      frame.addEventListener('load',()=>{attach();setTimeout(attach,300)});
      let n=0;const t=setInterval(()=>{attach();if(++n>40)clearInterval(t)},250);
    }catch(e){}
  }
  enhanceOwnerSearch();
})();
