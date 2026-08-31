// Shared Owner category sync: use the same active category catalog as Customer.
// This file is intentionally dependency-free and can be loaded by Owner pages.
(function(){
  const SUPA='https://xvhimyflrqrdudijwjdn.supabase.co';
  const KEY='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
  window.ISSHO_OWNER_SYNC_CATEGORIES=async function(root){
    const cats=await fetch(SUPA+'/rest/v1/categories?select=id,name,active,sort_order&active=eq.true&order=sort_order,name',{cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY}}).then(r=>{if(!r.ok)throw Error('Kategori gagal dimuat ('+r.status+')');return r.json()});
    const products=await fetch(SUPA+'/rest/v1/products?select=id,category_id,name,description,price,image_url,active&order=name',{cache:'no-store',headers:{apikey:KEY,Authorization:'Bearer '+KEY}}).then(r=>{if(!r.ok)throw Error('Menu gagal dimuat ('+r.status+')');return r.json()});
    const host=(root||document).getElementById('cats');
    if(!host)return {categories:cats,products};
    const current=(()=>{try{return root.defaultView.eval('typeof CAT!=="undefined"?CAT:"Semua"')}catch(e){return 'Semua'}})();
    const map=Object.fromEntries(cats.map(c=>[c.id,c.name]));
    host.innerHTML='';
    [['Semua',null],...cats.map(c=>[c.name,c.id])].forEach(([name,id])=>{
      const b=(root||document).createElement('button'); b.type='button'; b.textContent=name;
      b.className=name===current?'gold':'dark'; b.dataset.category=name; b.style.cursor='pointer';
      b.onclick=function(e){e.preventDefault();e.stopPropagation();try{root.defaultView.eval('CAT='+JSON.stringify(name)+';renderProducts()')}catch(_){}};
      host.appendChild(b);
    });
    return {categories:cats,products,map};
  };
})();
