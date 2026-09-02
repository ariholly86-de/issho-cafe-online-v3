(()=>{
'use strict';
function clean(){
  const f=document.getElementById('owner');
  let d;
  try{d=f?(f.contentDocument||f.contentWindow.document):document}catch(e){d=document}
  if(!d)return;
  const root=d.getElementById('app')||d.body;
  [...root.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,b,div,section')].forEach(el=>{
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(!/^⭐?\s*Menu Favorit$/i.test(t))return;
    let target=el;
    for(let i=0;i<5&&target.parentElement;i++){
      const p=target.parentElement;
      if(p.classList.contains('card')||p.tagName==='SECTION'||p.querySelectorAll('li,tr,.item').length>0){target=p;break}
      target=p;
    }
    target.remove();
  });
}
clean();
const f=document.getElementById('owner');
if(f)f.addEventListener('load',()=>setTimeout(clean,100));
setInterval(clean,500);
})();
