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
          const cs=all.filter(c=>c.active===true&&(c.name===PROMO||prods.some(p=>p.category_id===c.id)));
          if(!cs.some(c=>c.name===win.activeCat))win.activeCat=cs[0]?.name||'';
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
    const root=document.getElementById('app');
    if(root){
      const go=()=>{try{walk(root.contentDocument,root.contentWindow)}catch(e){}};
      root.addEventListener('load',go);
      go();
    }
  }
  start();
})();
