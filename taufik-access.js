const TAUFIK_SUPABASE='https://xvhimyflrqrdudijwjdn.supabase.co';
const TAUFIK_KEY='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
async function requireTaufikAccess(){
  document.documentElement.style.visibility='hidden';
  try{
    const r=await fetch(TAUFIK_SUPABASE+'/rest/v1/rpc/check_cafe_subscription',{method:'POST',cache:'no-store',headers:{apikey:TAUFIK_KEY,Authorization:'Bearer '+TAUFIK_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_slug:'taufik-cafe'})});
    const rows=await r.json(); const x=rows&&rows[0];
    if(!r.ok||!x||!x.access_allowed) throw new Error('Akses Taufik Cafe terkunci. Silakan hubungi administrator.');
    document.documentElement.style.visibility='visible';
    return x;
  }catch(e){
    document.documentElement.style.visibility='visible';
    document.body.innerHTML='<div style="min-height:100vh;display:grid;place-items:center;background:#0b0b0b;color:#fff;font-family:Arial;padding:24px;text-align:center"><div style="max-width:520px;background:#151515;border:1px solid #444;border-radius:18px;padding:28px"><div style="font-size:42px">🔒</div><h2 style="margin:10px 0">AKSES TERKUNCI</h2><p style="color:#aaa;line-height:1.6">'+String(e.message||'Akses tidak tersedia.')+'</p><p style="color:#777;font-size:12px">Akses dikendalikan dari Admin Center.</p></div></div>';
    throw e;
  }
}
