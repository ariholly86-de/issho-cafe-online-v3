(()=>{
'use strict';
let ctx=null,loop=null,voice=null,armed=false,lastAlarm=false;
const frame=()=>document.getElementById('appFrame');
async function unlock(){
  try{
    ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();
    if(ctx.state!=='running') await ctx.resume();
    armed=ctx.state==='running';
    const b=document.getElementById('arm'); if(b&&armed)b.remove();
  }catch(e){ armed=false; }
}
function tone(start,freq,dur,vol=.32){
  if(!ctx||ctx.state!=='running')return;
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type='square';o.frequency.setValueAtTime(freq,start);
  g.gain.setValueAtTime(.0001,start);
  g.gain.exponentialRampToValueAtTime(vol,start+.018);
  g.gain.exponentialRampToValueAtTime(.0001,start+dur);
  o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+dur+.02);
}
function sound(){
  if(!armed)return;
  try{
    const n=ctx.currentTime;
    [0,0.18,0.36,0.54,0.72,0.90,1.08,1.26].forEach((t,i)=>tone(n+t,i%2?1320:760,.14,.34));
  }catch(e){}
}
function stop(){clearInterval(loop);loop=null;clearInterval(voice);voice=null;lastAlarm=false;document.body.classList.remove('alarm-flash');const b=document.querySelector('.big');if(b)b.classList.remove('show');try{speechSynthesis.cancel()}catch(e){}}
function speak(text){
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance('PERHATIAN. ORDER BARU MASUK. '+text);u.lang='id-ID';u.rate=.88;u.pitch=.8;u.volume=1;speechSynthesis.speak(u)}catch(e){}
}
function loud(text){
  document.body.classList.add('alarm-flash');
  sound();
  try{navigator.vibrate?.([800,120,800,120,800,120,1200])}catch(e){}
  if(armed)speak(text);
  clearInterval(loop);clearInterval(voice);
  loop=setInterval(()=>{sound();try{navigator.vibrate?.([500,100,500])}catch(e){}},3500);
  voice=setInterval(()=>{if(armed)speak(text)},8000);
}
const css=document.createElement('style');css.textContent=`body{margin:0;background:#000;overflow:hidden}.alarm-flash{animation:flash .5s steps(2,end) infinite}@keyframes flash{50%{filter:brightness(2)}}#appFrame{position:fixed;inset:0;width:100%;height:100%;border:0}.big{position:fixed;top:0;left:0;right:0;z-index:999999;background:#d71920;color:#fff;text-align:center;font:900 28px Arial;padding:18px;display:none;box-shadow:0 0 40px #f00}.big.show{display:block}.arm{position:fixed;inset:0;z-index:1000000;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:20px}.armbox{max-width:560px;width:92%;background:#171717;color:#fff;border:4px solid #d71920;border-radius:22px;padding:28px;text-align:center;box-shadow:0 0 45px #d71920}.armbox h2{font:900 30px Arial;margin:0 0 12px}.armbox p{font:18px Arial;line-height:1.5;color:#ddd}.armbox button{border:0;border-radius:14px;background:#d71920;color:#fff;padding:18px 28px;font:900 21px Arial;cursor:pointer}`;document.head.appendChild(css);
const bar=document.createElement('div');bar.className='big';bar.textContent='🔔 ORDER BARU — SEGERA DITANGANI';document.body.appendChild(bar);
const arm=document.createElement('div');arm.id='arm';arm.className='arm';arm.innerHTML='<div class="armbox"><h2>🔊 AKTIFKAN ALARM</h2><p>Tekan tombol satu kali agar suara alarm dan voice dapat bekerja penuh pada perangkat ini.</p><button id="armBtn">🔊 AKTIFKAN SUARA ALARM</button></div>';document.body.appendChild(arm);
arm.querySelector('#armBtn').addEventListener('click',async()=>{await unlock();if(armed){try{sound()}catch(e){}}});
function check(){try{const d=frame().contentDocument;if(!d)return;const a=d.getElementById('alarm');const visible=a&&getComputedStyle(a).display!=='none';if(visible&&!lastAlarm){lastAlarm=true;bar.classList.add('show');const info=d.getElementById('alarmInfo')?.innerText||'Ada order baru.';loud(info)}else if(!visible&&lastAlarm){stop()}}catch(e){}}
frame().addEventListener('load',()=>{setTimeout(check,700);setInterval(check,700)});
document.addEventListener('pointerdown',()=>{unlock()}, {passive:true});
})();
