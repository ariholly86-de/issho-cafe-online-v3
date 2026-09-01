(()=>{
'use strict';
const S='https://xvhimyflrqrdudijwjdn.supabase.co',K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
const F=()=>document.getElementById('owner');
const D=()=>{const f=F();try{return f&&(f.contentDocument||f.contentWindow.document)}catch(e){return null}};
const W=()=>{const f=F();try{return f&&f.contentWindow}catch(e){return null}};
const $=id=>{const d=D();return d&&d.getElementById(id)};
const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function removeFavorite(){
  const d=D(); if(!d||!d.body)return;
  try{
    const nodes=[...d.querySelectorAll('h1,h2,h3,h4,h5,h6,div,p,strong,b,span')];
    nodes.forEach(el=>{
      const text=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!/^⭐?\s*Menu Favorit$/i.test(text))return;
      let target=el.closest('.card,section');
      if(!target||target.id==='reports'||target.id==='reportBox') target=el.parentElement;
      if(target&&target!==d.body&&target.id!=='reports'&&target.id!=='reportBox') target.remove();
      else el.remove();
    });
  }catch(e){}
}

function hideOldPrint(){
  const d=D(); if(!d)return;
  try{
    const reports=d.getElementById('reports'); if(!reports)return;
    reports.querySelectorAll('button').forEach(b=>{
      const tx=String(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      const oc=String(b.getAttribute('onclick')||'').toLowerCase();
      if(tx.includes('print')||oc.includes('printreport')) b.style.display='none';
    });
  }catch(e){}
}

function printDetail(){
  const d=D();
  const result=d&&d.getElementById('mr-result');
  if(!result||!result.innerHTML.trim())return;
  const periodText=(result.querySelector('div')&&result.querySelector('div').textContent)||'';
  const w=window.open('','_blank','width=1100,height=800');
  if(!w){alert('Popup print diblokir browser. Izinkan popup untuk halaman Owner.');return;}
  w.document.open();
  w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Rekapan Detail ISSHO CAFE</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;background:#fff}h1{margin:0 0 5px;font-size:22px}.print-head{border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}.print-note{font-size:12px;color:#555}.mr-print table{width:100%;min-width:0!important;border-collapse:collapse}.mr-print th,.mr-print td{padding:7px;border:1px solid #ccc}.mr-print th{background:#eee}.mr-print>div{break-inside:avoid}.mr-print [style*="background:#202020"],.mr-print [style*="background:#222"]{background:#f3f3f3!important;color:#111!important}.mr-print [style*="color:#aaa"]{color:#555!important}@media print{body{margin:12mm}}</style></head><body><div class="print-head"><h1>ISSHO CAFE — Rekapan Detail Sesuai Kategori</h1><div class="print-note">'+esc(periodText)+' • Dicetak: '+new Date().toLocaleString('id-ID')+'</div></div><div class="mr-print">'+result.innerHTML+'</div><script>window.onload=()=>{setTimeout(()=>window.print(),250)}<\/script></body></html>');
  w.document.close();
}

function boot(){
  const d=D(),w=W();if(!d||!w)return;if(!d.getElementById('reports'))return;
  hideOldPrint();
  const s=d.getElementById('session');if(s){s.innerHTML='<option value="day">Pagi 07:00–24:00 Malam</option>';s.value='day'}
  const rb=d.getElementById('reportBox');if(!rb)return;
  let box=d.getElementById('master-rekap-detail');
  if(!box){
    box=d.createElement('section');box.id='master-rekap-detail';box.style.cssText='display:block!important;visibility:visible!important;margin-top:16px;padding:16px;background:#151515;border:1px solid #444;border-radius:15px;color:#f3f3f3';
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap"><div><h2 style="margin:0 0 6px">📊 Rekapan Detail Sesuai Kategori</h2><div style="color:#aaa;font-size:13px;margin-bottom:12px">Laporan detail penjualan berdasarkan kategori dan menu.</div></div><button id="mr-print" type="button" style="border:0;border-radius:9px;padding:11px 18px;background:#315b9a;color:#fff;font-weight:900;cursor:pointer;font-size:16px">🖨️ Print</button></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="mr-daily" type="button" style="border:0;border-radius:9px;padding:11px 14px;background:#b68142;color:#fff;font-weight:900;cursor:pointer">📅 Harian</button><button id="mr-weekly" type="button" style="border:0;border-radius:9px;padding:11px 14px;background:#315b9a;color:#fff;font-weight:900;cursor:pointer">📆 Mingguan</button><button id="mr-monthly" type="button" style="border:0;border-radius:9px;padding:11px 14px;background:#2f7d50;color:#fff;font-weight:900;cursor:pointer">🗓️ Bulanan</button></div><div id="mr-result" style="margin-top:12px"></div>';
    rb.parentNode.insertBefore(box,rb.nextSibling);
  }else{box.style.display='block';box.style.visibility='visible'}
  const result=d.getElementById('mr-result');
  const period=mode=>{const el=d.getElementById('date'),v=el&&el.value?el.value:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'}),a=v.split('-').map(Number),base=new Date(a[0],a[1]-1,a[2]);if(mode==='weekly'){const n=base.getDay()||7,f=new Date(base);f.setDate(base.getDate()-n+1);f.setHours(7,0,0,0);const t=new Date(f);t.setDate(t.getDate()+7);return[f,t,'Mingguan','Senin–Minggu']}if(mode==='monthly'){const f=new Date(base.getFullYear(),base.getMonth(),1,7,0,0),t=new Date(base.getFullYear(),base.getMonth()+1,1,7,0,0);return[f,t,'Bulanan',f.toLocaleDateString('id-ID',{month:'long',year:'numeric'})]}const f=new Date(base);f.setHours(7,0,0,0);const t=new Date(base);t.setDate(t.getDate()+1);t.setHours(0,0,0,0);return[f,t,'Harian','07:00–24:00']};
  async function run(mode){if(!result)return;const p=w.P||(d.getElementById('pin')&&d.getElementById('pin').value)||'';if(!p){result.innerHTML='<div style="color:#aaa">Silakan login Owner terlebih dahulu.</div>';return}const z=period(mode);result.innerHTML='<div style="color:#aaa">⏳ Memuat rekapan '+z[2]+'...</div>';try{const q=await fetch(S+'/rest/v1/rpc/owner_sales_detail_report',{method:'POST',cache:'no-store',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify({p_owner_pin:p,p_from:z[0].toISOString(),p_to:z[1].toISOString()})});const t=await q.text();if(!q.ok)throw Error(t||'Gagal memuat rekapan detail');const data=t?JSON.parse(t):{},cats=Array.isArray(data.categories)?data.categories:[];let h='<div style="color:#aaa;font-size:13px">'+z[2]+' • '+z[3]+' • transaksi PAID • realtime</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:10px 0">';[['Pesanan Lunas',data.orders||0],['Total Qty',data.total_qty||0],['Total Omzet',money(data.omzet||0)],['Tunai',money(data.cash||0)],['QRIS',money(data.qris||0)]].forEach(v=>h+='<div style="background:#202020;border:1px solid #383838;border-radius:9px;padding:9px"><small style="color:#aaa">'+v[0]+'</small><br><b>'+v[1]+'</b></div>');h+='</div>';cats.forEach(c=>{h+='<div style="border:1px solid #444;border-radius:10px;overflow:auto;margin-top:10px"><div style="background:#222;padding:10px;font-weight:900">🍽️ '+esc(c.category||'Tanpa Kategori')+' <span style="float:right">'+Number(c.quantity||0)+' • '+money(c.total||0)+'</span></div><table style="width:100%;min-width:560px;border-collapse:collapse"><tr><th style="padding:8px;text-align:left">Nama Menu</th><th style="padding:8px;text-align:right">Harga</th><th style="padding:8px;text-align:right">Qty</th><th style="padding:8px;text-align:right">Total</th></tr>';(c.items||[]).forEach(i=>h+='<tr><td style="padding:8px;border-top:1px solid #333">'+esc(i.name||'')+'</td><td style="padding:8px;text-align:right;border-top:1px solid #333">'+money(i.unit_price||0)+'</td><td style="padding:8px;text-align:right;border-top:1px solid #333">'+Number(i.quantity||0)+'</td><td style="padding:8px;text-align:right;border-top:1px solid #333">'+money(i.total||0)+'</td></tr>');h+='</table></div>'});if(!cats.length)h+='<div style="padding:12px;color:#aaa">Belum ada transaksi PAID pada periode ini.</div>';result.innerHTML=h}catch(e){result.innerHTML='<div style="background:#4a1d1a;color:#ffd9d5;padding:10px;border-radius:9px">Gagal memuat rekapan detail: '+esc(e.message)+'</div>'}}
  const a=d.getElementById('mr-daily'),b=d.getElementById('mr-weekly'),c=d.getElementById('mr-monthly'),pr=d.getElementById('mr-print');if(a)a.onclick=()=>run('daily');if(b)b.onclick=()=>run('weekly');if(c)c.onclick=()=>run('monthly');if(pr)pr.onclick=printDetail;
  removeFavorite();
}
const f=F();if(f)f.addEventListener('load',()=>setTimeout(boot,100));boot();setInterval(boot,1000);setInterval(removeFavorite,500);
})();/* MASTER OWNER REKAP LOCK — MENU FAVORIT REMOVED + DETAIL PRINT + OLD PRINT MOVED */