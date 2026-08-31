/* ISSHO CAFE — UI Standard v1.3 */
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
    @media(max-width:700px){body{overflow-x:hidden}button{min-height:42px}input,select,textarea{min-height:42px}}
    .proof{max-width:180px!important;width:auto!important;height:120px!important;object-fit:contain!important;border-radius:8px;cursor:zoom-in}
    .issho-restore-panel{margin:10px 0;padding:11px;border:1px solid #444;border-radius:11px;background:#151515;color:#fff}
    .issho-restore-select{display:flex!important;align-items:center;gap:9px;margin:8px 0;padding:9px 10px;border:1px solid #444;border-radius:9px;background:#202020;color:#fff}
    .issho-restore-select input{width:22px!important;height:22px!important;margin:0!important;accent-color:#2f7d50}
    .issho-restore-select b{font-size:13px}
    .issho-restore-ready{outline:2px solid #2f7d50!important}
  `;
  (document.head||document.documentElement).appendChild(css);

  function ownerDocs(){
    const out=[document];
    try{const f=document.getElementById('owner');if(f&&f.contentDocument)out.push(f.contentDocument)}catch(e){}
    return [...new Set(out)];
  }
  function ownerFrame(){return document.getElementById('owner')||null}
  function inner(){const f=ownerFrame();try{return f&&f.contentDocument}catch(e){return null}}
  function restoreButton(){
    const d=document;
    return d.getElementById('restore') || [...d.querySelectorAll('button')].find(b=>/PULIHKAN MENU|PULIHKAN/i.test(String(b.textContent||''))) || null;
  }
  function count(d){return d?[...d.querySelectorAll('.issho-restore-check:checked')].length:0}
  function selected(d){return d?[...d.querySelectorAll('.issho-restore-check:checked')].map(x=>x.dataset.productId).filter(Boolean):[]}
  function setButtonText(){
    const b=restoreButton(); if(!b)return;
    const d=inner(); const n=count(d);
    b.textContent='🟢 PULIHKAN MENU TERPILIH ('+n+')';
    b.dataset.restoreCount=String(n);
    b.disabled=false;
    b.style.opacity='1';
    b.style.cursor='pointer';
    b.title=n?'Pulihkan hanya '+n+' menu yang dipilih':'Pilih menu stok kosong terlebih dahulu';
  }
  async function rpc(path,body){
    const r=await fetch(U+path,{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const t=await r.text();
    if(!r.ok)throw Error(t||('HTTP '+r.status));
    return t?JSON.parse(t):null;
  }
  function openMenuAndShowEmpty(){
    const d=inner(); if(!d)return;
    try{
      const menu=d.getElementById('menu');
      const tabs=d.querySelectorAll('.tab');
      tabs.forEach(x=>x.classList.add('hidden'));
      if(menu)menu.classList.remove('hidden');
      const fOff=d.getElementById('fOff');
      if(fOff)fOff.click();
      else if(typeof d.defaultView?.renderProducts==='function'){
        d.defaultView.MENU_FILTER='off'; d.defaultView.renderProducts();
      }
      setTimeout(()=>{installSelectedRestore();setButtonText();},150);
    }catch(e){}
  }
  function installSelectedRestore(){
    const d=inner(); if(!d)return;
    const products=d.getElementById('products'); if(!products)return;
    [...products.querySelectorAll('.card')].forEach(card=>{
      if(card.dataset.isshoRestoreReady)return;
      const checkbox=card.querySelector('input[type="checkbox"][id^="a-"]');
      const status=card.querySelector('.badge-off');
      if(!checkbox||!status)return;
      const id=checkbox.id.slice(2);
      const panel=d.createElement('label');
      panel.className='issho-restore-select';
      panel.dataset.productId=id;
      const input=d.createElement('input');
      input.type='checkbox';
      input.className='issho-restore-check';
      input.dataset.productId=id;
      const text=d.createElement('b');
      text.textContent='Pilih menu ini untuk dipulihkan';
      panel.appendChild(input);panel.appendChild(text);
      const actions=card.querySelector('.actions');
      if(actions)card.insertBefore(panel,actions);else card.appendChild(panel);
      input.addEventListener('change',()=>{card.classList.toggle('issho-restore-ready',input.checked);setButtonText()});
      card.dataset.isshoRestoreReady='1';
    });
    setButtonText();
  }
  function bindRestore(){
    const b=restoreButton(); if(!b||b.dataset.isshoRestoreBound)return;
    b.dataset.isshoRestoreBound='1';
    b.onclick=async function(e){
      if(e){e.preventDefault();e.stopPropagation()}
      const d=inner(); if(!d)return;
      installSelectedRestore();
      const ids=selected(d);
      if(!ids.length){openMenuAndShowEmpty();return}
      const pin=d.getElementById('pin')?.value?.trim()||'';
      if(!pin){alert('Login Owner terlebih dahulu.');return}
      b.disabled=true;
      try{
        await rpc('/rest/v1/rpc/owner_restore_selected_products',{p_owner_pin:pin,p_product_ids:ids});
        if(typeof d.defaultView?.loadProducts==='function')await d.defaultView.loadProducts();
        else d.defaultView?.location.reload();
      }catch(err){alert('Gagal memulihkan menu: '+err.message)}
      finally{setTimeout(()=>{installSelectedRestore();setButtonText();b.disabled=false},250)}
    };
    setButtonText();
  }
  function addOrderDateTime(){
    try{
      const d=inner();if(!d)return;
      d.querySelectorAll('#orderList .order').forEach(card=>{
        if(card.dataset.isshoOrderDatetime)return;
        const b=card.querySelector('.row b');
        const m=String(b?.textContent||'').trim().match(/^ISS-(\d{6})-(\d{6})-/i);if(!m)return;
        const date=m[1].slice(4,6)+'/'+m[1].slice(2,4)+'/20'+m[1].slice(0,2);
        const time=m[2].slice(0,2)+':'+m[2].slice(2,4)+':'+m[2].slice(4,6);
        const target=card.querySelector('.row>div');if(!target)return;
        const el=d.createElement('span');el.className='issho-order-date';el.innerHTML='📅 Tanggal Order: <b>'+date+'</b><br>🕐 Jam Order: <b>'+time+' WIB</b>';target.appendChild(el);card.dataset.isshoOrderDatetime='1';
      });
    }catch(e){}
  }
  function start(){
    bindRestore();installSelectedRestore();addOrderDateTime();setButtonText();
    const f=ownerFrame();
    if(f&&!f.dataset.isshoFrameBound){
      f.dataset.isshoFrameBound='1';
      f.addEventListener('load',()=>setTimeout(()=>{bindRestore();installSelectedRestore();addOrderDateTime();setButtonText()},250));
    }
  }
  start();
  setInterval(start,500);
})();
