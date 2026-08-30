/* ISSHO CAFE — UI Standard v1.0
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
  window.ISSHO_UI={locale:'id-ID',timezone:TZ,version:'1.0'};
  // Normalize common browser-generated date/time text where pages expose ISO dates.
  window.ISSHO_UI.formatDate=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:TZ})};
  window.ISSHO_UI.formatTime=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:TZ})};
})();
