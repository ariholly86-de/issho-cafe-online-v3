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
    if(!box||!d.body.contains(box)){
      box=d.createElement('div');
      box.id='issho-qris-control-inner';
      box.style.cssText='margin-top:12px;padding:10px;border:1px solid #444;border-radius:12px;background:#101010;display:flex;flex-direction:column;gap:5px';
      button=d.createElement('button');
      button.type='button';
      button.style.cssText='width:100%;border:0;border-radius:9px;padding:11px 14px;font-weight:900;color:#fff;cursor:pointer;font-size:13px';
      button.textContent='💳 QRIS: MEMUAT...';
      status=d.createElement('div');
      status.style.cssText='font:800 11px Arial;color:#bbb;text-align:center';
      button.onclick=toggle;
      box.appendChild(button);box.appendChild(status);
    }
    const login=d.getElementById('login'),app=d.getElementById('app');
    const target=logged()?app:login;
    if(target&&box.parentNode!==target){
      target.appendChild(box);
    }
    return true;
  }
  function paint(){if(!ensureUI()||!button)return;button.disabled=busy;button.style.opacity=busy?'.7':'1';button.textContent=enabled?'🟢 QRIS: AKTIF':'🔴 QRIS: NONAKTIF';button.style.background=enabled?'#2f7d50':'#a73d35';status.textContent=enabled?'Pelanggan dapat memilih QRIS':'QRIS disembunyikan di pelanggan';}
  async function read(){try{const r=await api('/rest/v1/rpc/get_qris_status');enabled=!!(r&&((typeof r==='boolean')?r:r.value));}catch(e){console.warn('QRIS status read failed',e)}paint()}
  async function toggle(){if(busy||!logged())return;const p=pin();if(!/^\d{4,8}$/.test(p)){alert('Login Owner terlebih dahulu.');return}busy=true;paint();try{const next=!enabled;const r=await api('/rest/v1/rpc/owner_set_qris_status',{body:JSON.stringify({p_owner_pin:p,p_enabled:next})});enabled=!!(r&&((typeof r==='boolean')?r:r.value));paint()}catch(e){alert('Gagal mengubah status QRIS: '+e.message);await read()}finally{busy=false;paint()}}
  function sync(){if(!ensureUI())return;if(logged())read();else{button.disabled=false;button.textContent='💳 QRIS: LOGIN OWNER';button.style.background='#315b9a';status.textContent='Login Owner untuk mengubah';}}
  setInterval(sync,3000);setTimeout(sync,300);sync();
  if(ownerFrame())ownerFrame().addEventListener('load',()=>setTimeout(sync,300));
})();
