/* terms-gate.js · แผ่นยอมรับข้อกำหนด/นโยบายรุ่นปัจจุบัน ของ MUEANG WARS
   วิธีใช้: ใส่ <script src="terms-gate.js" defer></script> ต่อท้ายสคริปต์ Supabase ของหน้านั้น
   ใส่ได้: index.html, play.html, profile.html, collection.html และหน้าอื่นที่ต้องล็อกอิน
   ห้ามใส่: terms.html, privacy.html, support.html (ต้องเปิดอ่าน/ติดต่อแอดมินได้เสมอ)
   ค่า V ต้องตรงกับ game_config.terms_current_version ทุกครั้งที่ออกรุ่นใหม่ (แก้ไฟล์นี้ + migration) */
(function(){'use strict';
var V='v1.2';window.MW_TERMS=V;
var SB_URL='https://tncbzfgdfxjrgrdgmzya.supabase.co',SB_KEY='sb_publishable_xrwJKdhhgt6i_I4pDvI79A_gucUyuVx';
var busy=false,waiters=[];
var CSS='#mwtg{visibility:visible;position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(10,1,7,.88);font-family:"Noto Sans Thai",system-ui,sans-serif;-webkit-user-select:none;user-select:none}'
+'#mwtg .mwtg-b{width:min(460px,100%);max-height:94dvh;overflow:auto;padding:20px 18px calc(18px + env(safe-area-inset-bottom,0px));border-radius:24px;color:#fff4f0;line-height:1.55;background:linear-gradient(180deg,#5d0b1f,#2b0613);border:1px solid rgba(255,200,87,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 14px 40px rgba(0,0,0,.7)}'
+'#mwtg h2{font:800 1.35rem/1.25 Kanit,sans-serif;color:#ffe08a;margin:0 0 8px;text-shadow:0 2px 0 #6d0618}'
+'#mwtg p,#mwtg li{font-size:.9rem;color:#f6dfe2}#mwtg ul{margin:6px 0 10px;padding-left:1.25em}#mwtg li{margin:3px 0}'
+'#mwtg .mwtg-l{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 4px}'
+'#mwtg .mwtg-l a{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:99px;border:1px solid rgba(255,130,130,.3);background:rgba(255,255,255,.1);color:#ffc857;font:600 .85rem Kanit,sans-serif;text-decoration:underline}'
+'#mwtg label{display:flex;gap:10px;align-items:flex-start;margin:12px 0 4px;font-size:.88rem;color:#f6dfe2}#mwtg input{width:24px;height:24px;flex:none;margin:2px 0 0;accent-color:#ffc857}'
+'#mwtg .mwtg-e{color:#ff9a9a;min-height:1.4em;margin:6px 0 0;font-size:.9rem}'
+'#mwtg .mwtg-n{display:flex;gap:10px;margin-top:10px}'
+'#mwtg button{flex:1;min-height:50px;padding:0 14px;border:0;border-radius:16px;font:800 1rem Kanit,sans-serif;color:#fff;cursor:pointer;touch-action:manipulation;text-shadow:0 2px 0 rgba(90,0,15,.7)}'
+'#mwtg button:disabled{opacity:.45;filter:grayscale(.5)}#mwtg button:active:not(:disabled){transform:translateY(3px)}'
+'#mwtg .mwtg-go{background:linear-gradient(180deg,#ff7a63,#ee2440 46%,#b50d26 50%,#d4142f);box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 5px 0 #5e0415}'
+'#mwtg .mwtg-lo{background:rgba(255,255,255,.12);border:1px solid rgba(255,130,130,.3);box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 4px 0 rgba(0,0,0,.35)}'
+'#mwtg .mwtg-h{margin-top:12px;font-size:.78rem;color:#e3b9c0}#mwtg .mwtg-h a{color:#ffc857;text-decoration:underline}'
+'#mwtg :focus-visible{outline:3px solid #ffc857;outline-offset:3px}';
var HTML='<div class="mwtg-b" role="dialog" aria-modal="true" aria-labelledby="mwtg-t">'
+'<h2 id="mwtg-t">ข้อกำหนดและนโยบายมีรุ่นใหม่ (v1.2)</h2>'
+'<p>เราปรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว สรุปสิ่งที่เปลี่ยน:</p>'
+'<ul><li>รูปโปรไฟล์ที่อัปโหลดเองได้ เมื่อแอดมินตรวจและอนุมัติแล้วผู้เล่นอื่นจะเห็น</li>'
+'<li>ข้อมูลที่ผู้เล่นอื่นเห็นในการ์ดโปรไฟล์ และรายชื่อคนโหวตธงภาคของภาคเดียวกัน</li>'
+'<li>ข้อความในแชตแอดมินหายอัตโนมัติ (ยกเว้นเรื่องที่แอดมินกดเก็บไว้)</li>'
+'<li>ใช้ Cloudflare Turnstile ตรวจว่าเป็นคนจริงตอนสมัครและเข้าสู่ระบบ</li></ul>'
+'<div class="mwtg-l"><a href="terms.html" target="_blank" rel="noopener">อ่านข้อกำหนดการใช้งาน</a><a href="privacy.html" target="_blank" rel="noopener">อ่านนโยบายความเป็นส่วนตัว</a></div>'
+'<label for="mwtg-ck"><input type="checkbox" id="mwtg-ck"><span>ฉันอ่านและยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวรุ่น v1.2 ถ้าฉันอายุต่ำกว่า 20 ปี ฉันยืนยันว่าผู้ปกครองรับทราบ</span></label>'
+'<div class="mwtg-e" id="mwtg-er" role="alert"></div>'
+'<div class="mwtg-n"><button type="button" class="mwtg-lo" id="mwtg-lo">ออกจากระบบ</button><button type="button" class="mwtg-go" id="mwtg-ok" disabled>ยอมรับและเล่นต่อ</button></div>'
+'<p class="mwtg-h">ไม่ยอมรับรุ่นนี้ ออกจากระบบได้ และขอลบบัญชีได้ที่ <a href="support.html">แชตแอดมิน</a></p></div>';

function client(){
 try{if(typeof sb!=='undefined'&&sb&&sb.auth)return sb}catch(e){}
 return window.supabase?window.supabase.createClient(SB_URL,SB_KEY):null}
function msg(m){m=String(m||'');
 if(/รุ่นข้อกำหนดไม่ตรง/.test(m))return 'หน้านี้เป็นรุ่นเก่า รีเฟรชหน้าแล้วลองใหม่อีกครั้ง';
 if(/fetch|network/i.test(m))return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองอีกครั้ง';
 return m||'ไม่สำเร็จ ลองใหม่อีกครั้ง'}

function show(c){return new Promise(function(res){
 busy=true;
 var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 var el=document.createElement('div');el.id='mwtg';el.innerHTML=HTML;document.body.appendChild(el);
 var root=document.documentElement,prev=root.style.overflow;root.style.overflow='hidden';
 var ck=el.querySelector('#mwtg-ck'),ok=el.querySelector('#mwtg-ok'),lo=el.querySelector('#mwtg-lo'),er=el.querySelector('#mwtg-er');
 function done(v){el.remove();st.remove();root.style.overflow=prev;busy=false;res(v);var w=waiters;waiters=[];w.forEach(function(f){f(v)})}
 function lock(b){ok.disabled=b||!ck.checked;lo.disabled=b}
 ck.onchange=function(){ok.disabled=!ck.checked};
 ok.onclick=function(){if(!ck.checked)return;er.textContent='';lock(true);
  c.rpc('accept_terms',{p_version:V}).then(function(r){
   if(r&&r.error){er.textContent=msg(r.error.message);lock(false);return}
   done(true)},function(){er.textContent=msg('network');lock(false)})};
 lo.onclick=function(){lock(true);
  c.auth.signOut().then(function(){
   done(false);
   if(!/(^|\/)(index\.html)?$/.test(location.pathname))location.replace('index.html')},
  function(){er.textContent=msg('network');lock(false)})};
 try{ck.focus()}catch(e){}})}

/* ตรวจรุ่นที่ผู้เล่นยอมรับ: ยังไม่ล็อกอิน/ยังไม่มีโปรไฟล์/อ่านไม่ได้ = ไม่ขวาง (true) · ยังไม่ยอมรับรุ่นปัจจุบัน = แสดงแผ่น แล้วคืน true เมื่อกดยอมรับ หรือ false เมื่อออกจากระบบ */
function check(){
 if(busy)return new Promise(function(r){waiters.push(r)});
 var c=client();if(!c)return Promise.resolve(true);
 return c.auth.getSession().then(function(r){
  var s=r&&r.data&&r.data.session;if(!s)return true;
  return c.from('profiles').select('terms_version').eq('id',s.user.id).maybeSingle().then(function(p){
   if(!p||p.error||!p.data)return true;
   if(p.data.terms_version===V)return true;
   return show(c)})
 }).catch(function(){return true})}
window.mwTermsCheck=check;
function boot(){check()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
