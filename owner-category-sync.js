// ISSHO CAFE Owner: category catalog must match Customer exactly.
(function(){
  const SUPA='https://xvhimyflrqrdudijwjdn.supabase.co';
  const KEY='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  async function sync(frame){
    try{
      const doc=frame.contentWindow.document;
      const host=doc.getElementById('cats');
      if(!host)return;
      const cats=await fetch(SUPA+'/rest/v1/categories?select=id,name,active,sort_order&active=eq.true&order=sort_order,name',{cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY}}).then(r=>{if(!r.ok)throw Error('Kategori HTTP '+r.status);return r.json()});
      const products=await fetch(SUPA+'/rest/v1/products?select=id,category_id,name,description,price,image_url,active&order=name',{cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY}}).then(r=>{if(!r.ok)throw Error('Menu HTTP '+r.status);return r.json()});
      const map=Object.fromEntries(cats.map(c=>[c.id,c.name]));
      frame.contentWindow.__OWNER_CATEGORY_CATALOG=cats;
      frame.contentWindow.__OWNER_CATEGORY_MAP=map;
      frame.contentWindow.__OWNER_ALL_PRODUCTS=products;
      const current=(()=>{try{return frame.contentWindow.eval('typeof CAT!==\"undefined\"?CAT:\"Semua\"')}catch(e){return 'Semua'}})();
      host.innerHTML='';
      const all=[['Semua',null],...cats.map(c=>[c.name,c.id])];
      for(const [name,id] of all){
        const b=doc.createElement('button');
        b.type='button'; b.textContent=name; b.dataset.category=name; b.className=name===current?'gold':'dark';
        b.style.cssText='cursor:pointer;pointer-events:auto;position:relative;z-index:50;';
        b.addEventListener('click',function(e){
          e.preventDefault(); e.stopPropagation();
          try{frame.contentWindow.eval('CAT='+JSON.stringify(name)); frame.contentWindow.renderProducts();}catch(err){console.error('category click',err)}
          [...host.querySelectorAll('button')].forEach(x=>x.className=x===b?'gold':'dark');
        });
        host.appendChild(b);
      }
      host.style.pointerEvents='auto';
      host.dataset.categoryCount=String(cats.length);
      if(typeof frame.contentWindow.renderProducts==='function' && !frame.contentWindow.__OWNER_RENDER_PATCHED){
        const original=frame.contentWindow.renderProducts;
        frame.contentWindow.__OWNER_ORIGINAL_RENDER_PRODUCTS=original;
        frame.contentWindow.renderProducts=function(){
          const q=(doc.getElementById('menuSearch')?.value||'').trim().toLowerCase();
          const cat=(()=>{try{return frame.contentWindow.eval('typeof CAT!==\"undefined\"?CAT:\"Semua\"')}catch(e){return 'Semua'}})();
          if(cat==='Semua' && !q){return original.apply(this,arguments)}
          const list=products.filter(p=>{
            const cn=map[p.category_id]||'Tanpa Kategori';
            return (cat==='Semua'||cn===cat) && (!q || (String(p.name)+' '+String(p.description||'')+' '+cn).toLowerCase().includes(q));
          });
          const pe=doc.getElementById('products');
          if(!pe){return original.apply(this,arguments)}
          const old=frame.contentWindow.PS; frame.contentWindow.PS=list; frame.contentWindow.eval('CAT=\"Semua\"');
          try{original.apply(this,arguments)}finally{frame.contentWindow.PS=old}
          frame.contentWindow.eval('CAT='+JSON.stringify(cat));
        };
        frame.contentWindow.__OWNER_RENDER_PATCHED=true;
      }
      patchOrderDateTime(frame);
      console.info('[ISSHO] Owner categories synced:',cats.length);
    }catch(e){console.error('[ISSHO] category sync failed',e)}
  }
  function formatDateTime(v){
    const d=new Date(v);
    if(isNaN(d.getTime()))return '';
    return d.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Jakarta'})+' • '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'Asia/Jakarta'})+' WIB';
  }
  async function addOrderDateTime(frame){
    try{
      const w=frame.contentWindow,doc=w.document,pin=doc.getElementById('pin')?.value?.trim();
      const list=doc.getElementById('orderList');
      if(!pin||!list)return;
      const orders=await fetch(SUPA+'/rest/v1/rpc/staff_get_orders',{method:'POST',cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({p_pin:pin})}).then(r=>{if(!r.ok)throw Error('Order HTTP '+r.status);return r.json()});
      const cards=[...list.children].filter(el=>el.classList.contains('order'));
      orders.forEach((o,i)=>{
        const card=cards[i];
        if(!card)return;
        let el=card.querySelector('.issho-order-date');
        if(!el){el=doc.createElement('div');el.className='issho-order-date';const first=card.querySelector('.row');if(first)first.parentNode.insertBefore(el,first.nextSibling);else card.prepend(el)}
        const dt=o.created_at||o.order_created_at||o.created||'';
        el.textContent=dt?'📅 '+formatDateTime(dt):'📅 Waktu order tidak tersedia';
      });
    }catch(e){console.error('[ISSHO] order date/time patch failed',e)}
  }
  function patchOrderDateTime(frame){
    const w=frame.contentWindow;
    if(!w||w.__OWNER_ORDER_DATETIME_PATCHED)return;
    if(typeof w.loadOrders!=='function')return;
    const original=w.loadOrders;
    w.__OWNER_ORIGINAL_LOAD_ORDERS=original;
    w.loadOrders=async function(){
      const result=await original.apply(this,arguments);
      await addOrderDateTime(frame);
      return result;
    };
    w.__OWNER_ORDER_DATETIME_PATCHED=true;
    addOrderDateTime(frame);
  }
  function boot(){
    const frame=document.getElementById('app'); if(!frame)return;
    const run=()=>sync(frame);
    frame.addEventListener('load',()=>{setTimeout(run,300);setTimeout(run,1200);setTimeout(run,2500)});
    setInterval(run,5000);
    setTimeout(run,500);
  }
  boot();
})();
