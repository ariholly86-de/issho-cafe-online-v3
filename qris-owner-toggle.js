/* ISSHO CAFE - isolated QRIS ON/OFF control. Does not alter owner business logic. */
(function(){
  'use strict';
  const SUPABASE='https://xvhimyflrqrdudijwjdn.supabase.co';
  const KEY='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  const parentDoc=document;
  const ownerFrame=()=>parentDoc.getElementById('owner');
  const ownerDoc=()=>{const f=ownerFrame();return f&&(f.contentDocument||f.contentWindow&&f.contentWindow.document)};
  const api=async(path,opt={})=>{const r=await fetch(SUPABASE+path,Object.assign({method:'POST',cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'}},opt));const t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null};
  let enabled=true,busy=false,box=null,button=null,status=null;
  function logged(){try{const d=ownerDoc();return !!d&&d.getElementById('login')?.classList.contains('hidden')&&!d.getElementById('app')?.classList.contains('hidden')}catch(e){return false}}
  function pin(){try{return ownerDoc()?.getElementById('pin')?.value?.trim()||''}catch(e){return ''}}
  function ensureUI(){
    const d=ownerDoc();
    if(!d||!d.body)return false;
    const login=d.getElementById('login'),app=d.getElementById('app');
    if(!logged()){
      if(box&&box.parentNode)box.parentNode.removeChild(box);
      return true;
    }
    if(!box||!d.body.contains(box)){
      box=d.createElement('div');
      box.id='issho-qris-control-inner';
      box.style.cssText='margin:0 0 12px 0;padding:8px 10px;border:1px solid #444;border-radius:10px;background:#101010;display:flex;flex-direction:column;align-items:flex-start;gap:4px;width:max-content;max-width:calc(100% - 20px);box-sizing:border-box';
      button=d.createElement('button');
      button.type='button';
      button.style.cssText='width:auto;min-width:0;border:0;border-radius:8px;padding:7px 11px;font-weight:900;color:#fff;cursor:pointer;font-size:12px;line-height:1.2;white-space:nowrap';
      button.textContent='💳 QRIS: MEMUAT...';
      status=d.createElement('div');
      status.style.cssText='font:800 10px Arial;color:#bbb;text-align:left;line-height:1.2';
      button.onclick=toggle;
      box.appendChild(button);box.appendChild(status);
    }
    if(app&&box.parentNode!==app){
      app.insertBefore(box,app.firstChild);
    }
    return true;
  }
  function paint(){if(!logged()){ensureUI();return}if(!ensureUI()||!button)return;button.disabled=busy;button.style.opacity=busy?'.7':'1';button.textContent=enabled?'🟢 QRIS: AKTIF':'🔴 QRIS: NONAKTIF';button.style.background=enabled?'#2f7d50':'#a73d35';status.textContent=enabled?'Pelanggan dapat memilih QRIS':'QRIS disembunyikan di pelanggan'}
  async function read(){try{const r=await api('/rest/v1/rpc/get_qris_status');enabled=!!(r&&((typeof r==='boolean')?r:r.value));}catch(e){console.warn('QRIS status read failed',e)}paint()}
  async function toggle(){if(busy||!logged())return;const p=pin();if(!/^\d{4,8}$/.test(p)){alert('Login Owner terlebih dahulu.');return}busy=true;paint();try{const next=!enabled;const r=await api('/rest/v1/rpc/owner_set_qris_status',{body:JSON.stringify({p_owner_pin:p,p_enabled:next})});enabled=!!(r&&((typeof r==='boolean')?r:r.value));paint()}catch(e){alert('Gagal mengubah status QRIS: '+e.message);await read()}finally{busy=false;paint()}}
  function sync(){if(!ensureUI())return;if(logged())read()}
  setInterval(sync,3000);setTimeout(sync,300);sync();
  if(ownerFrame())ownerFrame().addEventListener('load',()=>setTimeout(sync,300));
})();
