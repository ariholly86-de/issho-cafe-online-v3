(()=>{
'use strict';
const remove=()=>{try{const f=document.getElementById('owner');const d=f&&(f.contentDocument||f.contentWindow.document);const el=d&&d.getElementById('mr-clock');if(el)el.remove();}catch(e){}};
remove();
const f=document.getElementById('owner');
if(f)f.addEventListener('load',()=>{remove();setTimeout(remove,200);setTimeout(remove,1000)});
setInterval(remove,500);
})();
