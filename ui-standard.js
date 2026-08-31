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
  window.ISSHO_UI.formatTime=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:TZ)};

  function addOwnerOrderDateTime(){
    try{
      const frame=document.getElementById('owner');
      const d=frame&&(frame.contentDocument||frame.contentWindow.document);
      if(!d)return;
      d.querySelectorAll('#orderList .order').forEach(card=>{
        if(card.dataset.isshoOrderDatetime)return;
        const b=card.querySelector('.row b');
        const m=String(b&&b.textContent||'').trim().match(/^ISS-(\d{6})-(\d{6})-/i);
        if(!m)return;
        const ds=m[1],ts=m[2];
        const date=ds.slice(4,6)+'/'+ds.slice(2,4)+'/20'+ds.slice(0,2);
        const time=ts.slice(0,2)+':'+ts.slice(2,4)+':'+ts.slice(4,6);
        const target=card.querySelector('.row>div');
        if(!target)return;
        const el=d.createElement('span');
        el.className='issho-order-date';
        el.innerHTML='📅 Tanggal Order: <b>'+date+'</b><br>🕐 Jam Order: <b>'+time+' WIB</b>';
        target.appendChild(el);
        card.dataset.isshoOrderDatetime='1';
      });
    }catch(e){}
  }

  function allDocs(){
    const out=[document];
    try{const f=document.getElementById('owner');if(f&&f.contentDocument)out.push(f.contentDocument)}catch(e){}
    return out;
  }
  function findRestoreButton(d){
    return [...d.querySelectorAll('button')].find(b=>/PULIHKAN MENU TERPILIH/i.test(String(b.textContent||'')))||null;
  }
  function restoreItemCount(d,button){
    // Prefer the actual restore list if it is present in the page.
    const candidates=[
      ...d.querySelectorAll('[data-restore-item],.restore-item,[data-restore-list] > *,#restoreList > *,#restoreModal input[type="checkbox"]')
    ];
    if(candidates.length){
      const checked=candidates.filter(x=>x.matches&&x.matches('input[type="checkbox"]')).length;
      return checked||candidates.length;
    }
    // If the restore UI exposes its count through a hidden/list container, use it.
    const list=[...d.querySelectorAll('[id*="restore" i],[class*="restore" i]')].filter(x=>x!==button&&!button.contains(x));
    for(const x of list){
      const n=[...x.children].filter(ch=>{const t=String(ch.textContent||'').trim();return t&&t.length<500&&!/PULIHKAN MENU TERPILIH/i.test(t)}).length;
      if(n>0&&n<1000)return n;
    }
    return null;
  }
  function updateRestoreCount(){
    try{
      for(const d of allDocs()){
        const b=findRestoreButton(d);if(!b)continue;
        const n=restoreItemCount(d,b);
        if(n!==null){
          const base='PULIHKAN MENU TERPILIH';
          b.textContent='🟢 '+base+' ('+n+')';
          b.dataset.restoreCount=String(n);
        }
      }
    }catch(e){}
  }
  function startRestoreCounter(){
    updateRestoreCount();
    const mo=new MutationObserver(()=>updateRestoreCount());
    try{mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','checked']})}catch(e){}
    setInterval(updateRestoreCount,700);
  }

  const ownerFrame=document.getElementById('owner');
  if(ownerFrame){
    ownerFrame.addEventListener('load',()=>{setTimeout(addOwnerOrderDateTime,500);setTimeout(startRestoreCounter,600)});
    setInterval(addOwnerOrderDateTime,1200);
    startRestoreCounter();
  }
})();
