/* ISSHO CAFE — UI Standard v1.2
   Shared browser/device normalization. Owner-only recovery UX is isolated below. */
(function(){
  'use strict';
  const TZ='Asia/Jakarta';
  const U='https://xvhimyflrqrdudijwjdn.supabase.co';
  const K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
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
    /* Requested change #1: payment proof is a compact thumbnail; its existing link still opens full size. */
    .proof{max-width:180px!important;width:auto!important;height:120px!important;object-fit:contain!important;cursor:zoom-in}
    /* Requested change #2: selection controls for stock-empty Owner menu cards. */
    .issho-restore-select{display:flex!important;align-items:center;gap:9px;margin:9px 0;padding:9px 10px;border:1px solid #444;border-radius:9px;background:#202020}
    .issho-restore-select input{width:22px!important;height:22px!important;margin:0!important;accent-color:#2f7d50}
    .issho-restore-select b{font-size:13px}
  `;
  (document.head||document.documentElement).appendChild(css);
  window.ISSHO_UI={locale:'id-ID',timezone:TZ,version:'1.2'};
  window.ISSHO_UI.formatDate=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:TZ})};
  window.ISSHO_UI.formatTime=function(v){const d=new Date(v);return isNaN(d)?'-':d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:TZ})};

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

  function restoreItemCount(d){
    return [...d.querySelectorAll('.issho-restore-check')].filter(x=>x.checked).length;
  }

  function updateRestoreCount(){
    try{
      for(const d of allDocs()){
        const b=findRestoreButton(d);if(!b)continue;
        const n=restoreItemCount(d);
        b.textContent='🟢 PULIHKAN MENU TERPILIH ('+n+')';
        b.dataset.restoreCount=String(n);
        b.disabled=n===0;
        b.style.opacity=n===0?'0.55':'1';
        b.style.cursor=n===0?'not-allowed':'pointer';
      }
    }catch(e){}
  }

  function selectedIds(d){
    return [...d.querySelectorAll('.issho-restore-check:checked')].map(x=>x.dataset.productId).filter(Boolean);
  }

  async function rpc(path,body){
    const r=await fetch(U+path,{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const t=await r.text();
    if(!r.ok)throw Error(t||('HTTP '+r.status));
    return t?JSON.parse(t):null;
  }

  function installSelectedRestore(){
    try{
      const frame=document.getElementById('owner');
      const d=frame&&(frame.contentDocument||frame.contentWindow.document);
      if(!d)return;
      const parentDoc=window.parent&&window.parent!==window?window.parent.document:null;
      const parentButton=parentDoc&&parentDoc.getElementById('restore');
      const buttons=[...(parentButton?[parentButton]:[]),...d.querySelectorAll('button')].filter((b,i,a)=>a.indexOf(b)===i && (b===parentButton || /PULIHKAN MENU TERPILIH/i.test(String(b.textContent||''))));
      const cards=[...d.querySelectorAll('#products .card')];
      for(const card of cards){
        if(card.dataset.isshoRestoreReady)return;
        const checkbox=card.querySelector('input[type="checkbox"][id^="a-"]');
        const status=card.querySelector('.badge-off');
        if(!checkbox||!status)continue;
        const id=checkbox.id.slice(2);
        const label=d.createElement('label');
        label.className='issho-restore-select';
        const input=d.createElement('input');
        input.type='checkbox';
        input.className='issho-restore-check';
        input.dataset.productId=id;
        const text=d.createElement('b');
        text.textContent='Pilih menu ini untuk dipulihkan';
        label.appendChild(input);label.appendChild(text);
        const actions=card.querySelector('.actions');
        if(actions)card.insertBefore(label,actions);else card.appendChild(label);
        input.addEventListener('change',updateRestoreCount);
        card.dataset.isshoRestoreReady='1';
      }
      for(const b of buttons){
        if(b.dataset.isshoSelectedRestoreBound)continue;
        b.textContent='🟢 PULIHKAN MENU TERPILIH (0)';
        b.dataset.isshoSelectedRestoreBound='1';
        b.onclick=async function(){
          const ids=selectedIds(d);
          if(!ids.length){updateRestoreCount();return;}
          const pin=d.getElementById('pin')?.value?.trim()||'';
          if(!pin){alert('Login Owner terlebih dahulu.');return;}
          b.disabled=true;
          try{
            await rpc('/rest/v1/rpc/owner_restore_selected_products',{p_owner_pin:pin,p_product_ids:ids});
            if(typeof frame.contentWindow.loadProducts==='function')await frame.contentWindow.loadProducts();
            else frame.contentWindow.location.reload();
          }catch(e){
            alert('Gagal memulihkan menu: '+e.message);
          }finally{b.disabled=false;updateRestoreCount();}
        };
      }
      updateRestoreCount();
    }catch(e){}
  }

  function startRestoreCounter(){
    installSelectedRestore();
    updateRestoreCount();
    const mo=new MutationObserver(()=>{installSelectedRestore();updateRestoreCount()});
    try{mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','checked']})}catch(e){}
    setInterval(()=>{installSelectedRestore();updateRestoreCount()},700);
  }

  const ownerFrame=document.getElementById('owner');
  if(ownerFrame){
    ownerFrame.addEventListener('load',()=>{setTimeout(addOwnerOrderDateTime,500);setTimeout(startRestoreCounter,600)});
    setInterval(addOwnerOrderDateTime,1200);
    startRestoreCounter();
  }
})();
