/* ISSHO CAFE — UI Standard v2.0 — Stock sales-out detail + existing UI fixes */
(function(){
'use strict';
const isCanonicalOwner=!!document.getElementById('restore');
const isOwner=/owner-rpp02n|OWNER/i.test(location.pathname+' '+document.title)||!!document.getElementById('owner');
const isKasir=/staff-printer-universal|staff-v6|staff-alarm/i.test(location.pathname)||/KASIR/i.test(document.title)||!!document.getElementById('kasir');
const isStock=/stock-v2/i.test(location.pathname)||/STOK/i.test(document.title);

function removeRestoreControls(){
  document.querySelectorAll('button,a,[role="button"]').forEach(el=>{
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(/PULIHKAN MENU/i.test(t)) el.remove();
  });
  const s=document.getElementById('issho-ui-standard'); if(s) s.remove();
  const old=document.getElementById('isshoRestoreButton'); if(old) old.remove();
}

if(isCanonicalOwner){
  const safety=()=>{
    const b=document.getElementById('restore');
    if(!b) return;
    b.disabled=false;
    b.style.pointerEvents='auto';
    b.style.position='relative';
    b.style.zIndex='2147483647';
    b.setAttribute('type','button');
  };
  safety();
  setInterval(safety,500);
  return;
}

/* Stock: add a detailed, read-only recap of goods that left because of cashier sales. */
if(isStock){
  const U='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const num=x=>Number(x||0).toLocaleString('id-ID',{maximumFractionDigits:3});
  async function rpc(fn,body){const r=await fetch(U+'/rest/v1/rpc/'+fn,{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify(body)});const t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null}
  function pin(){try{if(typeof PIN!=='undefined'&&String(PIN).trim())return String(PIN).trim()}catch(e){}return String(document.getElementById('pin')?.value||'').trim()}
  function day(){return new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'})}
  function installStockStyles(){
    if(document.getElementById('issho-stock-detail-style'))return;
    const s=document.createElement('style');s.id='issho-stock-detail-style';s.textContent=`.issho-stock-detail-btn{background:#242424!important;border:1px solid #555!important}.issho-stock-detail-card{background:#151515;border:1px solid #3b3b3b;border-radius:16px;padding:16px;margin:12px 0}.issho-stock-detail-card .detail-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}.issho-stock-detail-card .detail-title{font-size:20px;font-weight:900}.issho-stock-detail-card .detail-sub{color:#aaa;margin-top:4px}.issho-stock-detail-card .detail-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-top:14px}.issho-stock-detail-card .detail-tools input{background:#0e0e0e;color:#fff;border:1px solid #444;border-radius:10px;padding:10px}.issho-stock-detail-card .detail-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.issho-stock-detail-card .detail-stat{background:#1d1d1d;border:1px solid #383838;border-radius:12px;padding:12px}.issho-stock-detail-card .detail-stat span{display:block;color:#aaa;font-size:11px;font-weight:800}.issho-stock-detail-card .detail-stat b{display:block;font-size:22px;margin-top:4px}.issho-stock-detail-card table{width:100%;border-collapse:collapse;min-width:780px}.issho-stock-detail-card th,.issho-stock-detail-card td{padding:9px 8px;border-bottom:1px solid #303030;text-align:left;vertical-align:top}.issho-stock-detail-card th{font-size:11px;color:#aaa;text-transform:uppercase}.issho-stock-detail-card .r{text-align:right}.issho-stock-detail-card .detail-loading,.issho-stock-detail-card .detail-empty{padding:20px;text-align:center;color:#aaa}@media(max-width:760px){.issho-stock-detail-card .detail-summary{grid-template-columns:1fr}.issho-stock-detail-card .detail-head{align-items:flex-start}}`;(document.head||document.documentElement).appendChild(s);
  }
  function getContainer(){return document.getElementById('content')||document.querySelector('main#app')||document.body}
  function ensureButton(){
    let b=document.getElementById('isshoStockDetailButton');
    const nav=document.querySelector('.secondary');
    if(!nav)return null;
    if(!b){b=document.createElement('button');b.id='isshoStockDetailButton';b.className='ghost issho-stock-detail-btn';b.type='button';b.textContent='📋 Detail Barang Laku';nav.appendChild(b)}
    return b;
  }
  function renderShell(){
    installStockStyles();
    let box=document.getElementById('isshoStockDetail');
    if(!box){box=document.createElement('div');box.id='isshoStockDetail';box.className='issho-stock-detail-card hide';const c=getContainer();c.appendChild(box)}
    box.innerHTML=`<div class="detail-head"><div><div class="detail-title">📋 Detail Barang Keluar dari Penjualan Kasir</div><div class="detail-sub">Rincian barang yang benar-benar keluar karena transaksi kasir. Data diambil otomatis dari penjualan yang sudah PAID.</div></div></div><div class="detail-tools"><div><label style="display:block;font-size:11px;color:#aaa;font-weight:800;margin-bottom:5px">DARI TANGGAL</label><input id="isshoStockFrom" type="date" value="${day()}"></div><div><label style="display:block;font-size:11px;color:#aaa;font-weight:800;margin-bottom:5px">SAMPAI TANGGAL</label><input id="isshoStockTo" type="date" value="${day()}"></div><button class="primary" id="isshoStockLoad">🔎 Tampilkan Rincian</button></div><div id="isshoStockDetailOut" style="margin-top:14px"><div class="detail-loading">Pilih tanggal lalu tekan Tampilkan Rincian.</div></div>`;
    box.querySelector('#isshoStockLoad').addEventListener('click',loadDetail);
  }
  async function loadDetail(){
    const out=document.getElementById('isshoStockDetailOut'),p=pin();
    if(!out)return;
    if(!p){out.innerHTML='<div class="detail-empty">Silakan login Owner terlebih dahulu.</div>';return}
    const from=document.getElementById('isshoStockFrom')?.value||day(),to=document.getElementById('isshoStockTo')?.value||from;
    if(from>to){out.innerHTML='<div class="detail-empty">Tanggal awal tidak boleh lebih besar dari tanggal akhir.</div>';return}
    out.innerHTML='<div class="detail-loading">⏳ Memuat rincian barang keluar...</div>';
    try{
      const r=await rpc('inventory_sales_detail',{p_owner_pin:p,p_from:from,p_to:to});
      const detail=Array.isArray(r?.detail)?r.detail:[],lines=Array.isArray(r?.lines)?r.lines:[];
      if(!detail.length){out.innerHTML='<div class="detail-empty">Tidak ada barang yang keluar dari penjualan kasir pada periode '+esc(from)+' s/d '+esc(to)+'.</div>';return}
      const totalQty=detail.reduce((s,x)=>s+(Number(x.quantity)||0),0),orderSet=new Set(lines.map(x=>String(x.order_number||x.order_id||''))).size;
      const grouped=detail.slice().sort((a,b)=>String(a.category||'').localeCompare(String(b.category||''),'id')||String(a.item_name||'').localeCompare(String(b.item_name||''),'id'));
      const rows=grouped.map(x=>`<tr><td><b>${esc(x.item_name||'-')}</b></td><td>${esc(x.category||'Lainnya')}</td><td>${esc(x.unit||'pcs')}</td><td class="r"><b>${num(x.quantity)}</b></td><td class="r">${num(x.order_count)}</td><td>${esc(Array.isArray(x.menu_names)?x.menu_names.join(', '):(x.menu_names||'-'))}</td></tr>`).join('');
      const lineRows=lines.slice().sort((a,b)=>String(a.sold_at||'').localeCompare(String(b.sold_at||''))).map(x=>`<tr><td>${esc(x.sold_at?new Date(x.sold_at).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'}):'-')}</td><td>${esc(x.order_number||'-')}</td><td>${esc(x.menu_name||'-')}</td><td><b>${esc(x.item_name||'-')}</b></td><td>${esc(x.category||'Lainnya')}</td><td>${esc(x.unit||'pcs')}</td><td class="r"><b>${num(x.quantity)}</b></td></tr>`).join('');
      out.innerHTML=`<div class="detail-summary"><div class="detail-stat"><span>TOTAL BARANG KELUAR</span><b>${num(totalQty)}</b></div><div class="detail-stat"><span>JENIS BARANG</span><b>${num(detail.length)}</b></div><div class="detail-stat"><span>TRANSAKSI PENJUALAN</span><b>${num(orderSet)}</b></div></div><div style="margin-top:16px"><div style="font-weight:900;margin-bottom:8px">📦 Rekap per Barang</div><div class="tableWrap"><table><thead><tr><th>Nama Barang</th><th>Kategori</th><th>Satuan</th><th class="r">Jumlah Keluar</th><th class="r">Jumlah Order</th><th>Menu yang Menjual</th></tr></thead><tbody>${rows}</tbody></table></div></div><div style="margin-top:18px"><div style="font-weight:900;margin-bottom:8px">🧾 Rincian Setiap Penjualan</div><div class="tableWrap"><table><thead><tr><th>Waktu</th><th>No. Order</th><th>Menu Kasir</th><th>Barang Keluar</th><th>Kategori</th><th>Satuan</th><th class="r">Qty</th></tr></thead><tbody>${lineRows||'<tr><td colspan="7" class="detail-empty">Tidak ada detail transaksi.</td></tr>'}</tbody></table></div></div>`;
    }catch(e){out.innerHTML='<div class="detail-empty">Gagal memuat rincian: '+esc(e.message)+'</div>'}
  }
  function toggle(){
    const b=ensureButton();if(!b)return;
    renderShell();const box=document.getElementById('isshoStockDetail');box.classList.toggle('hide');
    if(!box.classList.contains('hide'))loadDetail();
  }
  function boot(){const b=ensureButton();if(b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',toggle)}if(document.getElementById('isshoStockDetail')&&document.querySelector('[data-view="stock"]')?.classList.contains('on')){} }
  boot();setInterval(boot,1000);
  document.addEventListener('click',e=>{const t=e.target.closest('[data-view="stock"]');if(t)setTimeout(()=>{const b=ensureButton();if(b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',toggle)}},200)});
  return;
}

/* Cashier: only add the requested expense detail to the existing daily report.
   No cashier buttons, order flow, payment flow, login, or existing report totals are changed. */
if(isKasir){
  const U='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  async function api(path,opt={}){const h=Object.assign({apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},opt.headers||{}),r=await fetch(U+path,Object.assign({cache:'no-store'},opt,{headers:h})),t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null}
  function findKasirWindow(){
    try{
      let w=window;
      for(let i=0;i<6;i++){
        const d=w.document;
        if(d&&d.getElementById('reportOut')&&d.getElementById('date')) return w;
        const f=d&&d.querySelector('iframe');
        if(!f||!f.contentWindow) break;
        w=f.contentWindow;
      }
    }catch(e){}
    return null;
  }
  function installExpenseStyles(d){
    if(!d||d.getElementById('issho-expense-detail-style'))return;
    const s=d.createElement('style');s.id='issho-expense-detail-style';s.textContent=`.issho-expense-detail{margin-top:14px;padding:14px;border:1px solid #383838;border-radius:10px;background:#171717}.issho-expense-detail h3{margin:0 0 10px}.issho-expense-table{width:100%;border-collapse:collapse}.issho-expense-table th,.issho-expense-table td{padding:9px 8px;border-bottom:1px solid #333;text-align:left}.issho-expense-table th:last-child,.issho-expense-table td:last-child{text-align:right}.issho-expense-total{font-weight:900;font-size:18px}.issho-expense-empty{color:#aaa;padding:8px 0}@media print{.issho-expense-detail{border:1px solid #000;background:#fff;color:#000;break-inside:avoid}.issho-expense-table th,.issho-expense-table td{border-bottom:1px solid #999;color:#000}}`;(d.head||d.documentElement).appendChild(s);
  }
  async function renderExpenseDetail(){
    const w=findKasirWindow(); if(!w)return;
    const d=w.document, out=d.getElementById('reportOut'), date=d.getElementById('date'); if(!out||!date||!date.value)return;
    installExpenseStyles(d);
    const pin=String(w.P||'').trim() || (()=>{try{return w.sessionStorage.getItem('issho_staff_pin')||w.localStorage.getItem('issho_staff_pin')||''}catch(e){return''}})();
    if(!pin)return;
    const day=date.value,from=day+'T00:00:00+07:00',end=new Date(day+'T00:00:00+07:00');end.setDate(end.getDate()+1);
    try{
      const rows=await api('/rest/v1/rpc/staff_expense_details',{method:'POST',body:JSON.stringify({p_pin:pin,p_from:from,p_to:end.toISOString()})});
      const list=Array.isArray(rows)?rows:[];
      let box=d.getElementById('isshoExpenseDetail');
      if(!box){box=d.createElement('div');box.id='isshoExpenseDetail';box.className='issho-expense-detail';out.appendChild(box)}
      if(!list.length){box.innerHTML='<h3>💸 Detail Pengeluaran</h3><div class="issho-expense-empty">Tidak ada pengeluaran pada tanggal '+esc(day)+'.</div>';return}
      const total=list.reduce((s,x)=>s+(Number(x.amount)||0),0);
      box.innerHTML='<h3>💸 Detail Pengeluaran</h3><table class="issho-expense-table"><thead><tr><th>No.</th><th>Kategori</th><th>Keterangan</th><th>Nominal</th></tr></thead><tbody>'+list.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.category||'Operasional')+'</td><td>'+esc(x.description||'-')+'</td><td>'+money(x.amount)+'</td></tr>').join('')+'</tbody><tfoot><tr class="issho-expense-total"><td colspan="3">TOTAL PENGELUARAN</td><td>'+money(total)+'</td></tr></tfoot></table>';
    }catch(e){
      let box=d.getElementById('isshoExpenseDetail');
      if(!box){box=d.createElement('div');box.id='isshoExpenseDetail';box.className='issho-expense-detail';out.appendChild(box)}
      box.innerHTML='<h3>💸 Detail Pengeluaran</h3><div class="issho-expense-empty">Detail pengeluaran tidak dapat dimuat: '+esc(e.message)+'</div>';
    }
  }
  let timer=null;
  function schedule(){clearTimeout(timer);timer=setTimeout(renderExpenseDetail,120)}
  const boot=()=>{schedule();const w=findKasirWindow();if(w){const r=w.report;if(typeof r==='function'&&!r.__expenseDetailWrapped){const orig=r;w.report=async function(){const v=await orig.apply(this,arguments);schedule();return v};w.report.__expenseDetailWrapped=true}}};
  boot();setInterval(boot,1200);setInterval(schedule,5000);
  return;
}

if(!isOwner){
  removeRestoreControls();
  setInterval(removeRestoreControls,500);
  return;
}

const U='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
const css=document.createElement('style');
css.id='issho-ui-standard';
css.textContent=`*,*::before,*::after{box-sizing:border-box}img,video,canvas{max-width:100%;height:auto}.proof{width:60px!important;max-width:60px!important;height:45px!important;max-height:45px!important;object-fit:contain!important;border-radius:6px;cursor:zoom-in;display:block!important}.issho-restore-select{display:flex!important;align-items:center;gap:9px;margin:8px 0;padding:9px 10px;border:1px solid #444;border-radius:9px;background:#202020;color:#fff}.issho-restore-select input{width:22px!important;height:22px!important;margin:0!important;accent-color:#2f7d50}.issho-restore-ready{outline:2px solid #2f7d50!important}#isshoRestoreButton{position:fixed;right:14px;top:14px;z-index:2147483647;border:2px solid #fff;border-radius:12px;padding:12px 16px;background:#2f7d50;color:#fff;font-weight:900;box-shadow:0 4px 18px #000;cursor:pointer}@media(max-width:700px){#isshoRestoreButton{right:8px;top:8px;padding:10px 12px;font-size:13px}}`;
(document.head||document.documentElement).appendChild(css);

function findDoc(start){
  let d=start||document;
  for(let i=0;i<6;i++){
    if(d.querySelector('#products')||d.querySelector('#pin')) return d;
    const f=d.querySelector('iframe');
    if(!f||!f.contentDocument) break;
    d=f.contentDocument;
  }
  return d;
}
function ownerDoc(){
  try{const f=document.getElementById('owner');return findDoc(f?.contentDocument||document)}catch(e){return document}
}
function ensureButton(){
  let b=document.getElementById('restore')||document.getElementById('isshoRestoreButton');
  if(!b){b=document.createElement('button');b.id='isshoRestoreButton';b.type='button';document.body.appendChild(b)}
  return b;
}
function selected(d){return[...d.querySelectorAll('.issho-restore-check:checked')].map(x=>x.dataset.productId).filter(Boolean)}
function setText(){const b=ensureButton(),n=selected(ownerDoc()).length;b.textContent='🟢 PULIHKAN MENU TERPILIH ('+n+')';b.title=n?'Pulihkan hanya '+n+' menu yang dipilih':'Klik untuk membuka menu stok kosong';b.disabled=false}
async function rpc(ids,pin){
  const r=await fetch(U+'/rest/v1/rpc/owner_restore_selected_products',{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify({p_owner_pin:pin,p_product_ids:ids})});
  const t=await r.text(); if(!r.ok) throw Error(t||('HTTP '+r.status)); return t?JSON.parse(t):null;
}
function installChecks(){
  const d=ownerDoc(),products=d.getElementById('products'); if(!products)return;
  products.querySelectorAll('.card').forEach(card=>{
    if(card.dataset.isshoRestoreReady)return;
    const cb=card.querySelector('input[type="checkbox"][id^="a-"]'),off=card.querySelector('.badge-off'); if(!cb||!off)return;
    const id=cb.id.slice(2),label=d.createElement('label'),input=d.createElement('input'),text=d.createElement('b');
    label.className='issho-restore-select'; input.type='checkbox'; input.className='issho-restore-check'; input.dataset.productId=id; text.textContent='Pilih menu ini untuk dipulihkan';
    label.append(input,text); const actions=card.querySelector('.actions'); if(actions)card.insertBefore(label,actions);else card.appendChild(label);
    input.addEventListener('change',()=>{card.classList.toggle('issho-restore-ready',input.checked);setText()});
    card.dataset.isshoRestoreReady='1';
  });
  setText();
}
function openEmpty(){
  const d=ownerDoc();
  try{
    const menu=d.getElementById('menu');
    if(menu){d.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));menu.classList.remove('hidden')}
    const off=d.getElementById('fOff');
    if(off)off.click();else{d.defaultView.MENU_FILTER='off';d.defaultView.renderProducts?.()}
    setTimeout(()=>{installChecks();setText()},200)
  }catch(e){}
}
async function restore(){
  const d=ownerDoc(); installChecks(); const ids=selected(d);
  if(!ids.length){openEmpty();return}
  const pin=d.getElementById('pin')?.value?.trim()||'';
  if(!pin){alert('Login Owner terlebih dahulu.');return}
  const b=ensureButton(); b.disabled=true; b.textContent='⏳ Memulihkan '+ids.length+' menu...';
  try{await rpc(ids,pin);if(typeof d.defaultView?.loadProducts==='function')await d.defaultView.loadProducts();else d.defaultView?.location.reload()}
  catch(e){alert('Gagal memulihkan menu: '+e.message)}
  finally{setTimeout(()=>{installChecks();setText()},300)}
}
function bind(){const b=ensureButton();if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();restore()})}installChecks();setText()}
bind(); const f=document.getElementById('owner'); if(f)f.addEventListener('load',()=>setTimeout(bind,300)); setInterval(bind,600);
})();