(()=>{
'use strict';
const SUPABASE_URL='https://xvhimyflrqrdudijwjdn.supabase.co';
const SUPABASE_KEY='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
const BUCKET='catalog-images';
let booted=false;
const host=()=>document.getElementById('owner');
const inner=()=>{try{const f=host();return f?.contentDocument||f?.contentWindow?.document||null}catch(e){return null}};
const win=()=>host()?.contentWindow;
const pin=()=>inner()?.getElementById('pin')?.value?.trim()||'';
const esc=s=>String(s??'').replace(/[&<>\\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[m]));
async function rpc(path,body){
  const r=await fetch(SUPABASE_URL+path,{method:'POST',cache:'no-store',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const t=await r.text(); if(!r.ok) throw Error(t||('HTTP '+r.status)); return t?JSON.parse(t):null;
}
function style(d){
  if(d.getElementById('owner-image-upload-style'))return;
  const s=d.createElement('style');s.id='owner-image-upload-style';s.textContent=`
    .owner-img-tools{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px;align-items:center}
    .owner-img-tools button{font-size:12px;padding:9px 11px}
    .owner-img-tools .img-pick{background:#315b9a;color:#fff}
    .owner-img-tools .img-save{background:#2f7d50;color:#fff}
    .owner-img-tools .img-clear{background:#242424;color:#fff;border:1px solid #444}
    .owner-img-status{font-size:12px;color:#aaa;margin-top:5px;min-height:16px}
    .owner-img-preview{width:100%;max-height:210px;object-fit:contain;border-radius:10px;background:#090909;border:1px solid #315b9a;margin-top:7px;display:none}
  `;d.head.appendChild(s);
}
function controls(p){
  const d=inner(); if(!d)return;
  const card=d.getElementById('products')?.querySelector(`.card input[id="n-${CSS.escape(String(p.id))}"]`)?.closest('.card');
  if(!card||card.querySelector('.owner-img-tools'))return;
  const safe=esc(p.id);
  const tools=d.createElement('div');tools.className='owner-img-tools';
  tools.innerHTML=`<input id="img-file-${safe}" type="file" accept="image/jpeg,image/png,image/webp" style="display:none"><button type="button" class="img-pick">📷 Pilih / Upload Gambar</button><button type="button" class="img-save" disabled>💾 Simpan Gambar</button><button type="button" class="img-clear" style="display:none">✕ Batal</button>`;
  const preview=d.createElement('img');preview.className='owner-img-preview';preview.alt='Preview gambar';
  const status=d.createElement('div');status.className='owner-img-status';status.textContent=p.image_url?'Gambar tersimpan.':'Belum ada gambar.';
  card.appendChild(tools);card.appendChild(preview);card.appendChild(status);
  const file=tools.querySelector('input');const pick=tools.querySelector('.img-pick');const save=tools.querySelector('.img-save');const clear=tools.querySelector('.img-clear');
  let selected=null;
  pick.addEventListener('click',()=>file.click());
  file.addEventListener('change',()=>{selected=file.files?.[0]||null;if(!selected)return; if(!/^image\/(jpeg|png|webp)$/.test(selected.type)){status.textContent='Format harus JPG, PNG, atau WEBP.';selected=null;file.value='';return} if(selected.size>8*1024*1024){status.textContent='Ukuran gambar maksimal 8 MB.';selected=null;file.value='';return} preview.src=URL.createObjectURL(selected);preview.style.display='block';save.disabled=false;clear.style.display='inline-block';status.textContent='Siap disimpan: '+selected.name});
  clear.addEventListener('click',()=>{selected=null;file.value='';preview.removeAttribute('src');preview.style.display='none';save.disabled=true;clear.style.display='none';status.textContent=p.image_url?'Gambar tersimpan.':'Belum ada gambar.'});
  save.addEventListener('click',async()=>{
    if(!selected)return;
    const ownerPin=pin();if(!ownerPin){status.textContent='Login Owner terlebih dahulu.';return}
    save.disabled=true;pick.disabled=true;clear.disabled=true;status.textContent='⏳ Meng-upload dan menyimpan gambar...';
    try{
      const path='products/'+p.id;
      const r=await fetch(SUPABASE_URL+'/storage/v1/object/'+BUCKET+'/'+path,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':selected.type,'x-upsert':'true','cache-control':'3600'},body:selected});
      const txt=await r.text();if(!r.ok)throw Error(txt||('Upload HTTP '+r.status));
      const publicUrl=SUPABASE_URL+'/storage/v1/object/public/'+BUCKET+'/'+path+'?v='+Date.now();
      await rpc('/rest/v1/rpc/owner_update_product_image',{p_owner_pin:ownerPin,p_product_id:p.id,p_image_url:publicUrl});
      status.textContent='✓ Gambar berhasil disimpan.';p.image_url=publicUrl;selected=null;file.value='';clear.style.display='none';preview.style.display='block';preview.src=publicUrl;save.disabled=true;
      setTimeout(()=>{try{win().loadProducts()}catch(e){}},300);
    }catch(e){status.textContent='Gagal menyimpan: '+(e.message||e);save.disabled=false}
    finally{pick.disabled=false;clear.disabled=false}
  });
}
function decorate(){
  const d=inner(),w=win();if(!d||!w||typeof w.renderProducts!=='function')return false;
  style(d);
  if(!w.__imageUploadWrapped){
    const old=w.renderProducts;
    w.renderProducts=function(){old.apply(this,arguments);setTimeout(decorateCards,0)};
    w.__imageUploadWrapped=true;
  }
  decorateCards();return true;
}
function decorateCards(){
  const d=inner(),w=win();if(!d||!w)return;
  const products=Array.isArray(w.PS)?w.PS:[];
  products.forEach(p=>controls(p));
}
function boot(){if(booted)return;const f=host();if(!f)return;booted=true;f.addEventListener('load',()=>{setTimeout(decorate,150);setTimeout(decorate,700);setTimeout(decorate,1500)});setTimeout(decorate,300);setInterval(()=>{try{if(inner()?.getElementById('products'))decorate()}catch(e){}},2000)}
boot();
})();
