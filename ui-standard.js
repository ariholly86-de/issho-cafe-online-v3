/* ISSHO CAFE — UI Standard v2.1 — Stock minus cashier sales equals remaining stock */
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

/* Stock: one clear concept: STOK - PENJUALAN KASIR = SISA STOK. */
if(isStock){
  const U='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const num=x=>Number(x||0).toLocaleString('id-ID',{maximumFractionDigits:3});
  async function rpc(fn,body){const r=await fetch(U+'/rest/v1/rpc/'+fn,{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify(body)});const t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null}
  function pin(){try{if(typeof PIN!=='undefined'&&String(PIN).trim())return String(PIN).trim()}catch(e){}return String(document.getElementById('pin')?.value||'').trim()}
  function installStockStyles(){
    if(document.getElementById('issho-stock-balance-style'))return;
    const s=document.createElement('style');s.id='issho-stock-balance-style';s.textContent=`.issho-stock-balance-btn{background:#242424!important;border:1px solid #555!important}.issho-stock-balance-card{background:#151515;border:1px solid #3b3b3b;border-radius:16px;padding:16px;margin:12px 0}.issho-stock-balance-card .balance-title{font-size:20px;font-weight:900}.issho-stock-balance-card .balance-sub{color:#aaa;margin-top:5px}.issho-stock-balance-card .balance-formula{margin-top:14px;padding:13px;border:1px solid #444;border-radius:12px;background:#0e0e0e;font-size:16px;font-weight:900}.issho-stock-balance-card .balance-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.issho-stock-balance-card table{width:100%;border-collapse:collapse;min-width:820px}.issho-stock-balance-card th,.issho-stock-balance-card td{padding:9px 8px;border-bottom:1px solid #303030;text-align:left}.issho-stock-balance-card th{font-size:11px;color:#aaa;text-transform:uppercase}.issho-stock-balance-card .r{text-align:right}.issho-stock-balance-card .status{font-weight:900}.issho-stock-balance-card .empty{padding:20px;text-align:center;color:#aaa}@media(max-width:760px){.issho-stock-balance-card .balance-title{font-size:18px}}`;(document.head||document.documentElement).appendChild(s);
  }
  function getContainer(){return document.getElementById('content')||document.querySelector('main#app')||document.body}
  function ensureButton(){
    const nav=document.querySelector('.secondary'); if(!nav)return null;
    document.querySelectorAll('.secondary button').forEach(x=>{if(x!==document.getElementById('isshoStockBalanceButton')&&/Detail Barang Laku/i.test((x.textContent||'')))x.remove()});
    let b=document.getElementById('isshoStockBalanceButton');
    if(!b){b=document.createElement('button');b.id='isshoStockBalanceButton';b.className='ghost issho-stock-balance-btn';b.type='button';nav.appendChild(b)}
    b.textContent='📊 Stok - Penjualan Kasir = Sisa Stok';
    return b;
  }
  function renderShell(){
    installStockStyles();
    let box=document.getElementById('isshoStockBalance');
    if(!box){box=document.createElement('div');box.id='isshoStockBalance';box.className='issho-stock-balance-card hide';getContainer().appendChild(box)}
    box.innerHTML=`<div class="balance-title">📊 Stok - Penjualan Barang di Kasir = Sisa Stok</div><div class="balance-sub">Stok tersedia sebelum penjualan dikurangi otomatis oleh barang yang terjual di kasir. Jadi angka Sisa Stok adalah stok yang benar-benar masih tersedia.</div><div class="balance-formula">STOK SEBELUM PENJUALAN − PENJUALAN KASIR = SISA STOK</div><div class="balance-tools"><button class="primary" id="isshoStockBalanceLoad">🔄 Hitung Sisa Stok</button></div><div id="isshoStockBalanceOut" style="margin-top:14px"><div class="empty">Tekan Hitung Sisa Stok.</div></div>`;
    box.querySelector('#isshoStockBalanceLoad').addEventListener('click',loadBalance);
  }
  async function loadBalance(){
    const out=document.getElementById('isshoStockBalanceOut'),p=pin();if(!out)return;
    if(!p){out.innerHTML='<div class="empty">Silakan login Owner terlebih dahulu.</div>';return}
    out.innerHTML='<div class="empty">⏳ Menghitung stok...</div>';
    try{
      const r=await rpc('inventory_dashboard',{p_owner_pin:p,p_from:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'}),p_to:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'})});
      const list=Array.isArray(r?.items)?r.items:[];
      if(!list.length){out.innerHTML='<div class="empty">Belum ada master barang.</div>';return}
      const rows=list.map(x=>{const before=Number(x.stock_before_sales||0),sales=Number(x.sales_cashier||0),remain=Number(x.stock_now||0),min=Number(x.min_stock||0);const cls=remain<=0?'out':remain<=min?'low':'ok';const label=remain<=0?'HABIS':remain<=min?'MENIPIS':'AMAN';return `<tr><td><b>${esc(x.name||'-')}</b></td><td>${esc(x.category||'Lainnya')}</td><td>${esc(x.unit||'pcs')}</td><td class="r">${num(before)}</td><td class="r">${num(sales)}</td><td class="r"><b>${num(remain)}</b></td><td><span class="status ${cls}">${label}</span></td></tr>`}).join('');
      const totalBefore=list.reduce((s,x)=>s+Number(x.stock_before_sales||0),0),totalSales=list.reduce((s,x)=>s+Number(x.sales_cashier||0),0),totalRemain=list.reduce((s,x)=>s+Number(x.stock_now||0),0);
      out.innerHTML=`<div class="stats"><div class="stat"><span>STOK SEBELUM PENJUALAN</span><b>${num(totalBefore)}</b></div><div class="stat"><span>PENJUALAN KASIR</span><b>${num(totalSales)}</b></div><div class="stat"><span>SISA STOK</span><b>${num(totalRemain)}</b></div><div class="stat"><span>OUT KASIR HARI INI</span><b>${num(r.outgoing_auto)}</b></div></div><div style="margin-top:16px" class="tableWrap"><table><thead><tr><th>Barang</th><th>Kategori</th><th>Satuan</th><th class="r">Stok Sebelum Penjualan</th><th class="r">Penjualan Kasir</th><th class="r">Sisa Stok</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }catch(e){out.innerHTML='<div class="empty">Gagal menghitung sisa stok: '+esc(e.message)+'</div>'}
  }
  function toggle(){const b=ensureButton();if(!b)return;renderShell();const box=document.getElementById('isshoStockBalance');box.classList.toggle('hide');if(!box.classList.contains('hide'))loadBalance()}
  function boot(){const b=ensureButton();if(b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',toggle)}}
  boot();setInterval(boot,1000);return;
}

/* Cashier: only add the requested expense detail to the existing daily report.
   No cashier buttons, order flow, payment flow, login, or existing report totals are changed. */
if(isKasir){
  const U='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  async function api(path,opt={}){const h=Object.assign({apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},opt.headers||{}),r=await fetch(U+path,Object.assign({cache:'no-store'},opt,{headers:h})),t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null}
  function findKasirWindow(){
    try{let w=window;for(let i=0;i<6;i++){const d=w.document;if(d&&d.getElementById('reportOut')&&d.getElementById('date'))return w;const f=d&&d.querySelector('iframe');if(!f||!f.contentWindow)break;w=f.contentWindow}}catch(e){}return null;
  }
  function installExpenseStyles(d){
    if(!d||d.getElementById('issho-expense-detail-style'))return;
    const s=d.createElement('style');s.id='issho-expense-detail-style';s.textContent=`.issho-expense-detail{margin-top:14px;padding:14px;border:1px solid #383838;border-radius:10px;background:#171717}.issho-expense-detail h3{margin:0 0 10px}.issho-expense-table{width:100%;border-collapse:collapse}.issho-expense-table th,.issho-expense-table td{padding:9px 8px;border-bottom:1px solid #333;text-align:left}.issho-expense-table th:last-child,.issho-expense-table td:last-child{text-align:right}.issho-expense-total{font-weight:900;font-size:18px}.issho-expense-empty{color:#aaa;padding:8px 0}@media print{.issho-expense-detail{border:1px solid #000;background:#fff;color:#000;break-inside:avoid}.issho-expense-table th,.issho-expense-table td{border-bottom:1px solid #999;color:#000}}`;(d.head||d.documentElement).appendChild(s);
  }
  async function renderExpenseDetail(){
    const w=findKasirWindow();if(!w)return;const d=w.document,out=d.getElementById('reportOut'),date=d.getElementById('date');if(!out||!date||!date.value)return;installExpenseStyles(d);
    const pin=String(w.P||'').trim()||(()=>{try{return w.sessionStorage.getItem('issho_staff_pin')||w.localStorage.getItem('issho_staff_pin')||''}catch(e){return''}})();if(!pin)return;
    const day=date.value,from=day+'T00:00:00+07:00',end=new Date(day+'T00:00:00+07:00');end.setDate(end.getDate()+1);
    try{const rows=await api('/rest/v1/rpc/staff_expense_details',{method:'POST',body:JSON.stringify({p_pin:pin,p_from:from,p_to:end.toISOString()})});const list=Array.isArray(rows)?rows:[];let box=d.getElementById('isshoExpenseDetail');if(!box){box=d.createElement('div');box.id='isshoExpenseDetail';box.className='issho-expense-detail';out.appendChild(box)}if(!list.length){box.innerHTML='<h3>💸 Detail Pengeluaran</h3><div class="issho-expense-empty">Tidak ada pengeluaran pada tanggal '+esc(day)+'.</div>';return}const total=list.reduce((s,x)=>s+(Number(x.amount)||0),0);box.innerHTML='<h3>💸 Detail Pengeluaran</h3><table class="issho-expense-table"><thead><tr><th>No.</th><th>Kategori</th><th>Keterangan</th><th>Nominal</th></tr></thead><tbody>'+list.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.category||'Operasional')+'</td><td>'+esc(x.description||'-')+'</td><td>'+money(x.amount)+'</td></tr>').join('')+'</tbody><tfoot><tr class="issho-expense-total"><td colspan="3">TOTAL PENGELUARAN</td><td>'+money(total)+'</td></tr></tfoot></table>'}
    catch(e){let box=d.getElementById('isshoExpenseDetail');if(!box){box=d.createElement('div');box.id='isshoExpenseDetail';box.className='issho-expense-detail';out.appendChild(box)}box.innerHTML='<h3>💸 Detail Pengeluaran</h3><div class="issho-expense-empty">Detail pengeluaran tidak dapat dimuat: '+esc(e.message)+'</div>'}
  }
  let timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(renderExpenseDetail,120)}
  const boot=()=>{schedule();const w=findKasirWindow();if(w){const r=w.report;if(typeof r==='function'&&!r.__expenseDetailWrapped){const orig=r;w.report=async function(){const v=await orig.apply(this,arguments);schedule();return v};w.report.__expenseDetailWrapped=true}}};
  boot();setInterval(boot,1200);setInterval(schedule,5000);return;
}

if(!isOwner){
  removeRestoreControls();setInterval(removeRestoreControls,500);return;
}

const U='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
const css=document.createElement('style');css.id='issho-ui-standard';css.textContent=`*,*::before,*::after{box-sizing:border-box}img,video,canvas{max-width:100%;height:auto}.proof{width:60px!important;max-width:60px!important;height:45px!important;max-height:45px!important;object-fit:contain!important;border-radius:6px;cursor:zoom-in;display:block!important}.issho-restore-select{display:flex!important;align-items:center;gap:9px;margin:8px 0;padding:9px 10px;border:1px solid #444;border-radius:9px;background:#202020;color:#fff}.issho-restore-select input{width:22px!important;height:22px!important;margin:0!important;accent-color:#2f7d50}.issho-restore-ready{outline:2px solid #2f7d50!important}#isshoRestoreButton{position:fixed;right:14px;top:14px;z-index:2147483647;border:2px solid #fff;border-radius:12px;padding:12px 16px;background:#2f7d50;color:#fff;font-weight:900;box-shadow:0 4px 18px #000;cursor:pointer}@media(max-width:700px){#isshoRestoreButton{right:8px;top:8px;padding:10px 12px;font-size:13px}}`;(document.head||document.documentElement).appendChild(css);
function findDoc(start){let d=start||document;for(let i=0;i<6;i++){if(d.querySelector('#products')||d.querySelector('#pin'))return d;const f=d.querySelector('iframe');if(!f||!f.contentDocument)break;d=f.contentDocument}return d}
function ownerDoc(){try{const f=document.getElementById('owner');return findDoc(f?.contentDocument||document)}catch(e){return document}}
function ensureButton(){let b=document.getElementById('restore')||document.getElementById('isshoRestoreButton');if(!b){b=document.createElement('button');b.id='isshoRestoreButton';b.type='button';document.body.appendChild(b)}return b}
function selected(d){return[...d.querySelectorAll('.issho-restore-check:checked')].map(x=>x.dataset.productId).filter(Boolean)}
function setText(){const b=ensureButton(),n=selected(ownerDoc()).length;b.textContent='🟢 PULIHKAN MENU TERPILIH ('+n+')';b.title=n?'Pulihkan hanya '+n+' menu yang dipilih':'Klik untuk membuka menu stok kosong';b.disabled=false}
async function rpc(ids,pin){const r=await fetch(U+'/rest/v1/rpc/owner_restore_selected_products',{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify({p_owner_pin:pin,p_product_ids:ids})});const t=await r.text();if(!r.ok)throw Error(t||('HTTP '+r.status));return t?JSON.parse(t):null}
function installChecks(){const d=ownerDoc(),products=d.getElementById('products');if(!products)return;products.querySelectorAll('.card').forEach(card=>{if(card.dataset.isshoRestoreReady)return;const cb=card.querySelector('input[type="checkbox"][id^="a-"]'),off=card.querySelector('.badge-off');if(!cb||!off)return;const id=cb.id.slice(2),label=d.createElement('label'),input=d.createElement('input'),text=d.createElement('b');label.className='issho-restore-select';input.type='checkbox';input.className='issho-restore-check';input.dataset.productId=id;text.textContent='Pilih menu ini untuk dipulihkan';label.append(input,text);const actions=card.querySelector('.actions');if(actions)card.insertBefore(label,actions);else card.appendChild(label);input.addEventListener('change',()=>{card.classList.toggle('issho-restore-ready',input.checked);setText()});card.dataset.isshoRestoreReady='1'});setText()}
function openEmpty(){const d=ownerDoc();try{const menu=d.getElementById('menu');if(menu){d.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));menu.classList.remove('hidden')}const off=d.getElementById('fOff');if(off)off.click();else{d.defaultView.MENU_FILTER='off';d.defaultView.renderProducts?.()}setTimeout(()=>{installChecks();setText()},200)}catch(e){}}
async function restore(){const d=ownerDoc();installChecks();const ids=selected(d);if(!ids.length){openEmpty();return}const pin=d.getElementById('pin')?.value?.trim()||'';if(!pin){alert('Login Owner terlebih dahulu.');return}const b=ensureButton();b.disabled=true;b.textContent='⏳ Memulihkan '+ids.length+' menu...';try{await rpc(ids,pin);if(typeof d.defaultView?.loadProducts==='function')await d.defaultView.loadProducts();else d.defaultView?.location.reload()}catch(e){alert('Gagal memulihkan menu: '+e.message)}finally{setTimeout(()=>{installChecks();setText()},300)}}
function bind(){const b=ensureButton();if(!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();restore()})}installChecks();setText()}
bind();const f=document.getElementById('owner');if(f)f.addEventListener('load',()=>setTimeout(bind,300));setInterval(bind,600);
})();