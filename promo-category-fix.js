(()=>{
  const PROMO='PROMO';
  function patch(doc,win){
    if(!doc||!win)return false;
    const cats=doc.getElementById('cats');
    if(!cats||typeof win.renderCats!=='function')return false;
    if(!win.__isshoPromoCategoryFixed){
      const original=win.renderCats;
      win.renderCats=function(){
        try{
          const all=Array.isArray(win.categories)?win.categories:[];
          const prods=Array.isArray(win.products)?win.products:[];
          /* Keep the original customer behavior: the first category with
             active menus remains selected. PROMO is additionally visible,
             even when it has no menu yet. */
          const cs=all.filter(c=>c.active===true&&(c.name===PROMO||prods.some(p=>p.category_id===c.id)));
          const current=cs.find(c=>c.name===win.activeCat);
          if(!current){
            const firstWithMenu=cs.find(c=>prods.some(p=>p.active===true&&p.category_id===c.id));
            win.activeCat=firstWithMenu?.name||cs[0]?.name||'';
          }
          cats.innerHTML=cs.map(c=>`<button type="button" class="cat ${win.activeCat===c.name?'active':''}" data-cat="${win.esc(c.name)}">${win.esc(c.name)}</button>`).join('');
          doc.querySelectorAll('#cats .cat').forEach(b=>b.onclick=()=>{win.activeCat=b.dataset.cat;win.renderCats();win.renderMenu()});
        }catch(e){original.call(win)}
      };
      win.__isshoPromoCategoryFixed=true;
    }
    try{win.renderCats()}catch(e){}
    return true;
  }
  function walk(doc,win,depth=0){
    if(!doc||!win||depth>8)return;
    try{
      patch(doc,win);
      doc.querySelectorAll('iframe').forEach(fr=>{
        try{
          if(fr.contentDocument)walk(fr.contentDocument,fr.contentWindow,depth+1);
          fr.addEventListener('load',()=>walk(fr.contentDocument,fr.contentWindow,depth+1),{once:true});
        }catch(e){}
      });
    }catch(e){}
  }
  function start(){
    /* The outer customer page intentionally hides its iframe while loading.
       Reveal it as soon as this stable customer layer is available so a
       catalog/image delay can never leave the customer page permanently blank. */
    try{
      const outer=window.parent&&window.parent.document&&window.parent.document.getElementById('app');
      if(outer)outer.style.visibility='visible';
    }catch(e){}
    const root=document.getElementById('app');
    if(root){
      const go=()=>{try{walk(root.contentDocument,root.contentWindow)}catch(e){}};
      root.addEventListener('load',go);
      go();
    }
  }
  start();
})();
