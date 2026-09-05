/* ISSHO CAFE - isolated QRIS ON/OFF control. Does not alter owner business logic. */
(function(){
  'use strict';
  const SUPABASE='https://xvhimyflrqrdudijwjdn.supabase.co';
  const KEY='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  const parentDoc=document;
  const ownerFrame=()=>parentDoc.getElementById('owner');
  const ownerDoc=()=>{const f=ownerFrame();return f&&(f.contentDocument||f.contentWindow&&f.contentWindow.document)};
  const api=async(path,opt={})=>{const r=await fetch(SUPABASE+path,Object.assign({method:'POST',cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'}},opt));const t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null};
  let enabled=true,busy=false,button=null,status=null;
  function logged(){try{const d=ownerDoc();return !!d&&d.getElementById('login')?.classList.contains('hidden')&&!d.getElementById('app')?.classList.contains('hidden')}catch(e){return false}}
  function pin(){try{return ownerDoc()?.getElementById('pin')?.value?.trim()||''}catch(e){return ''}}
  function ensureUI(){
    const tools=parentDoc.getElementById('tools'); if(!tools||button)return;
    const box=parentDoc.createElement('div');box.style.cssText='display:flex;align-items:center;gap:6px';
    button=parentDoc.createElement('button');button.type='button';button.className='btn';button.style.background='#315b9a';button.textContent='💳 QRIS: MEMUAT...';
    status=parentDoc.createElement('span');status.style.cssText='font:800 11px Arial;color:#bbb;white-space:nowrap';
    button.onclick=toggle;box.appendChild(button);box.appendChild(status);tools.appendChild(box);
  }
  function paint(){ensureUI();if(!button)return;button.disabled=busy;button.style.opacity=busy?'.7':'1';button.textContent=enabled?'🟢 QRIS: AKTIF':'🔴 QRIS: NONAKTIF';button.style.background=enabled?'#2f7d50':'#a73d35';if(status)status.textContent=enabled?'Pelanggan dapat memilih QRIS':'QRIS disembunyikan di pelanggan';}
  async function read(){try{enabled=!!(await api('/rest/v1/rpc/get_qris_status')).valueOf();}catch(e){console.warn('QRIS status read failed',e)}paint()}
  async function toggle(){if(busy||!logged())return;const p=pin();if(!/^\d{4,8}$/.test(p)){alert('Login Owner terlebih dahulu.');return}busy=true;paint();try{const next=!enabled;const r=await api('/rest/v1/rpc/owner_set_qris_status',{body:JSON.stringify({p_owner_pin:p,p_enabled:next})});enabled=!!r;paint();}catch(e){alert('Gagal mengubah status QRIS: '+e.message);await read()}finally{busy=false;paint()}}
  function sync(){ensureUI();if(logged())read();else if(button){button.textContent='💳 QRIS: LOGIN OWNER';button.style.background='#315b9a';if(status)status.textContent='';}}
  if(ownerFrame())ownerFrame().addEventListener('load',()=>setTimeout(sync,300));
  setInterval(sync,5000);setTimeout(sync,500);
})();
