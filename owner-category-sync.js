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
      const current=(()=>{try{return frame.contentWindow.eval('typeof CAT!=="undefined"?CAT:"Semua"')}catch(e){return 'Semua'}})();
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
      // Ensure Owner rendering uses category_id from the same catalog.
      if(typeof frame.contentWindow.renderProducts==='function' && !frame.contentWindow.__OWNER_RENDER_PATCHED){
        const original=frame.contentWindow.renderProducts;
        frame.contentWindow.__OWNER_ORIGINAL_RENDER_PRODUCTS=original;
        frame.contentWindow.renderProducts=function(){
          const q=(doc.getElementById('menuSearch')?.value||'').trim().toLowerCase();
          const cat=(()=>{try{return frame.contentWindow.eval('typeof CAT!=="undefined"?CAT:"Semua"')}catch(e){return 'Semua'}})();
          if(cat==='Semua' && !q){return original.apply(this,arguments)}
          const list=products.filter(p=>{
            const cn=map[p.category_id]||'Tanpa Kategori';
            return (cat==='Semua'||cn===cat) && (!q || (String(p.name)+' '+String(p.description||'')+' '+cn).toLowerCase().includes(q));
          });
          const pe=doc.getElementById('products');
          if(!pe){return original.apply(this,arguments)}
          // Let the existing Owner renderer draw the selected category by temporarily filtering its source.
          const old=frame.contentWindow.PS; frame.contentWindow.PS=list; frame.contentWindow.eval('CAT="Semua"');
          try{original.apply(this,arguments)}finally{frame.contentWindow.PS=old}
          frame.contentWindow.eval('CAT='+JSON.stringify(cat));
        };
        frame.contentWindow.__OWNER_RENDER_PATCHED=true;
      }
      console.info('[ISSHO] Owner categories synced:',cats.length);
    }catch(e){console.error('[ISSHO] category sync failed',e)}
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
