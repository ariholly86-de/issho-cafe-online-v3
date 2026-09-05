/* ISSHO CAFE - isolated customer QRIS visibility control. Does not alter existing customer functions. */
(function(){
  'use strict';
  const U='https://xvhimyflrqrdudijwjdn.supabase.co';
  const K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  async function status(){
    const r=await fetch(U+'/rest/v1/rpc/get_qris_status',{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},cache:'no-store'});
    if(!r.ok)throw Error('QRIS status unavailable');
    const v=await r.json();
    return typeof v==='boolean'?v:!!(v&&v.value);
  }
  function all(d,n){
    if(!d||n>10)return[];
    let a=[d];
    d.querySelectorAll('iframe').forEach(f=>{try{if(f.contentDocument)a=a.concat(all(f.contentDocument,n+1))}catch(e){}});
    return a;
  }
  function apply(on){
    all(document,0).forEach(d=>{
      const b=d.getElementById('qrisBtn');
      if(!b)return;
      let m=d.getElementById('qrisOff');
      if(!m){
        m=d.createElement('div');
        m.id='qrisOff';
        m.textContent='QRIS sedang dinonaktifkan sementara. Silakan gunakan pembayaran tunai.';
        m.style.cssText='display:none;margin-top:8px;padding:10px;border-radius:10px;background:#4a1d1a;color:#ffd9d5;font:700 13px Arial;text-align:center';
        b.parentNode.insertBefore(m,b);
      }
      if(on){
        b.style.removeProperty('display');
        b.disabled=false;
        m.style.display='none';
        const q=d.getElementById('qrisbox');
        if(q&&q.dataset.isshoQrisHidden==='1'){
          if(q.dataset.isshoQrisClass!==undefined)q.className=q.dataset.isshoQrisClass;
          else q.classList.remove('hidden');
          delete q.dataset.isshoQrisHidden;
          delete q.dataset.isshoQrisClass;
        }
      }else{
        b.style.display='none';
        b.disabled=true;
        m.style.display='block';
        const q=d.getElementById('qrisbox');
        if(q&&!q.dataset.isshoQrisHidden){
          q.dataset.isshoQrisHidden='1';
          q.dataset.isshoQrisClass=q.className||'';
          q.classList.add('hidden');
        }
      }
    });
  }
  async function run(){try{apply(await status())}catch(e){console.warn('QRIS customer toggle:',e)}}
  setInterval(run,3000);
  setTimeout(run,300);
  window.addEventListener('focus',run);
})();
