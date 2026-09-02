(()=>{
'use strict';
const S='https://xvhimyflrqrdudijwjdn.supabase.co';
const K='sb_publishable_WHyroGN6czktqO5F8L4Xng_P7p5a3St';
const f=()=>document.getElementById('owner');
const D=()=>{const x=f();try{return x&&(x.contentDocument||x.contentWindow.document)}catch(e){return null}};
const W=()=>{const x=f();try{return x&&x.contentWindow}catch(e){return null}};
let client=null,channel=null,refreshTimer=null,lastRefresh=0;
function logged(){const d=D();try{return !!(d&&d.getElementById('login')?.classList.contains('hidden')&&!d.getElementById('app')?.classList.contains('hidden'))}catch(e){return false}}
function refresh(){if(!logged())return;const now=Date.now();if(now-lastRefresh<500)return;lastRefresh=now;const w=W(),d=D();try{if(typeof w.report==='function')w.report()}catch(e){}try{const b=d&&d.getElementById('mr-filter');if(b){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{try{b.click()}catch(e){}},120)}}catch(e){}}
async function loadRealtime(){try{if(!window.supabase){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}if(!window.supabase?.createClient)return;client=window.supabase.createClient(S,K);if(channel)try{await client.removeChannel(channel)}catch(e){}channel=client.channel('owner-sales-realtime').on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>refresh()).subscribe();}catch(e){}}
function start(){loadRealtime();setInterval(()=>{if(logged())refresh()},3000)}
const x=f();if(x)x.addEventListener('load',()=>setTimeout(refresh,500));start();
})();
