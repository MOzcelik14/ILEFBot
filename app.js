(()=>{
'use strict';
const $=id=>document.getElementById(id),DB='ilefbot.v2',OLD='ilefbot.chat.v1',K='ilefbot.openrouter.key';
const SYSTEM="Sen İLEFBot'sun. BAİBÜ İletişim Fakültesi öğrencileri için bağımsız, samimi ve doğru Türkçe yanıt veren bir asistansın. Sinema, radyo, televizyon, gazetecilik, halkla ilişkiler, Erasmus ve yaratıcı projeler hakkında yardımcı ol. Fakültenin resmî sitesi https://ilef.ibu.edu.tr/ . Güncel akademik takvim, ders kayıtları ve mevzuatta doğrulamadığın kural, tarih veya kişi uydurma; resmî duyuruya veya danışmana yönlendir. Fakülteyi temsil ettiğini iddia etme. Kişisel şifre veya kimlik numarası isteme.";
const E={chat:$('chat'),scroll:$('chat-scroll'),list:$('thread-list'),count:$('chat-count'),title:$('conversation-title'),input:$('question'),model:$('model'),key:$('api-key'),settings:$('settings'),sidebar:$('sidebar'),overlay:$('overlay')};
const suggestions=[
['🎬 Film projem','Kısa film fikrimi geliştirmeme yardımcı ol.','Bir kısa film projesi için fikir geliştirelim.'],
['📚 Ders & kayıt','Ders seçimiyle ilgili nereden başlamalıyım?','BAİBÜ ders kaydı ve danışman onayı hakkında güncel bilgiyi nereden öğrenebilirim?'],
['🌍 Erasmus','Başvurular ve ders eşleştirme','BAİBÜ İletişim Fakültesi Erasmus sürecini genel hatlarıyla anlatır mısın?'],
['✍️ Yaratıcı üretim','Senaryo, metin, kurgu ve daha fazlası','Kısa film senaryosu geliştirmek için yol göster.']];
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const now=()=>Date.now();
function load(){
 try{const x=JSON.parse(localStorage.getItem(DB));if(x&&Array.isArray(x.threads)){const threads=x.threads.filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&Array.isArray(t.messages)).slice(0,30).map(t=>({id:t.id,title:t.title.slice(0,80),updated:Number(t.updated)||now(),messages:t.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<15000).slice(-60)}));return {threads,active:threads.some(t=>t.id===x.active)?x.active:(threads[0]?.id||null),model:validModel(x.model)?x.model:'openrouter/free',theme:['dark','light','system'].includes(x.theme)?x.theme:'dark'};}}
 catch(e){console.warn('Sohbet geçmişi okunamadı',e);}
 let old=[];try{const x=JSON.parse(localStorage.getItem(OLD));if(Array.isArray(x))old=x.filter(m=>m&&['user','bot'].includes(m.role)&&typeof m.text==='string').map(m=>({role:m.role==='bot'?'assistant':'user',content:m.text,time:now()})).slice(-60);}catch(e){}
 const t=old.length?[{id:uid(),title:'Önceki sohbet',updated:now(),messages:old}]:[];
 return {threads:t,active:t[0]?.id||null,model:'openrouter/free',theme:'dark'};
}
function validModel(m){return typeof m==='string'&&(m==='openrouter/free'||m.length<=110&&/^[\w./-]+:free$/.test(m));}
let state=load(),pending=null,key='';
try{key=sessionStorage.getItem(K)||'';}catch(e){}
E.key.value=key;
const save=()=>{try{localStorage.setItem(DB,JSON.stringify(state));}catch(e){console.warn('Kaydedilemedi',e);}};
const active=()=>state.threads.find(t=>t.id===state.active);
function btn(text,action,title){const b=document.createElement('button');b.type='button';b.textContent=text;if(title)b.title=title;b.addEventListener('click',action);return b;}
function closeMenu(){E.sidebar.classList.remove('open');E.overlay.hidden=true;}
function newChat(){if(pending)return;const t={id:uid(),title:'Yeni sohbet',updated:now(),messages:[]};state.threads.unshift(t);state.threads=state.threads.slice(0,30);state.active=t.id;save();render();closeMenu();E.input.focus();return t;}
function renderThreads(){
 E.list.replaceChildren();E.count.textContent=state.threads.length;
 if(!state.threads.length){const p=document.createElement('p');p.className='empty-threads';p.textContent='Henüz sohbetin yok. Yeni bir konu açabilirsin.';E.list.append(p);}
 for(const t of [...state.threads].sort((a,b)=>b.updated-a.updated)){
 const row=document.createElement('div');row.className='thread'+(t.id===state.active?' active':'');
 const select=btn('▤  '+t.title,()=>{if(pending)return;state.active=t.id;save();render();closeMenu();},'Sohbeti aç');select.className='thread-select';select.setAttribute('aria-current',t.id===state.active?'page':'false');
 const actions=document.createElement('div');actions.className='thread-actions';
 actions.append(btn('✎',()=>{if(pending)return;const name=prompt('Sohbet adı',t.title);if(name?.trim()){t.title=name.trim().slice(0,80);save();render();}},'Adlandır'),btn('×',()=>{if(pending||!confirm('Bu sohbet silinsin mi?'))return;state.threads=state.threads.filter(s=>s.id!==t.id);if(state.active===t.id)state.active=state.threads[0]?.id||null;save();render();},'Sil'));
 row.append(select,actions);E.list.append(row);
 }
}
function welcome(){
 const box=document.createElement('section');box.className='welcome';
 const symbol=document.createElement('div');symbol.className='welcome-symbol';symbol.textContent='✳';
 const h=document.createElement('h2');h.textContent='Selam! Ben ';const green=document.createElement('span');green.textContent='İLEFBot.';h.append(green);
 const p=document.createElement('p');p.textContent='Fakülte hayatından yaratıcı projelerine kadar merak ettiklerini konuşalım. Ne üzerinde çalışıyoruz?';
 const grid=document.createElement('div');grid.className='suggestions';
 for(const [title,subtitle,text]of suggestions){const b=btn('',()=>send(text));b.className='suggestion';const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('small');small.textContent=subtitle;b.append(strong,small);grid.append(b);}
 box.append(symbol,h,p,grid);return box;
}
function node(m){
 const item=document.createElement('article');item.className='message '+(m.role==='user'?'user':'assistant');
 const avatar=document.createElement('div');avatar.className='avatar';avatar.textContent=m.role==='user'?'S':'✳';
 const main=document.createElement('div');main.className='message-main';const head=document.createElement('div');head.className='message-head';
 head.textContent=(m.role==='user'?'Sen':'İLEFBot')+' · '+new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(m.time||now());
 const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=m.content;const actions=document.createElement('div');actions.className='message-actions';
 actions.append(btn('⧉ Kopyala',async()=>{try{await navigator.clipboard.writeText(m.content);}catch(e){console.warn('Kopyalanamadı',e);}}));
 main.append(head,bubble,actions);item.append(avatar,main);return item;
}
function render(){renderThreads();const t=active();E.title.textContent=t?.title||'Yeni sohbet';E.chat.replaceChildren();if(!t?.messages.length)E.chat.append(welcome());else t.messages.forEach(m=>E.chat.append(node(m)));requestAnimationFrame(()=>E.scroll.scrollTop=E.scroll.scrollHeight);}
function status(message,busy=false){$('connection-label').textContent=message;$('connection-label').parentElement.className='status'+(busy?' busy':'');}
function busy(){E.input.disabled=!!pending;$('send').hidden=!!pending;$('stop').hidden=!pending;status(pending?'Yanıt hazırlanıyor':'Hazır',!!pending);}
function resize(){E.input.style.height='auto';E.input.style.height=Math.min(160,E.input.scrollHeight)+'px';}
async function ask(messages,signal){
 const direct=!!key.trim(),url=direct?'https://openrouter.ai/api/v1/chat/completions':'/api/chat';
 const body=direct?{model:state.model,messages:[{role:'system',content:SYSTEM},...messages],max_tokens:900,temperature:0.65}:{model:state.model,messages};
 let response;try{response=await fetch(url,{method:'POST',signal,headers:{'Content-Type':'application/json',...(direct?{'Authorization':'Bearer '+key.trim(),'X-Title':'ILEFBot'}:{})},body:JSON.stringify(body)});}
 catch(e){if(e.name==='AbortError')throw e;throw Error('Bağlantı kurulamadı. İnternetini veya API ayarlarını kontrol et.');}
 let data={};try{data=await response.json();}catch(e){}
 if(!response.ok){
 if(!direct&&response.status===404)throw Error('Yerel deneme için Ayarlar’dan kişisel API anahtarı gir. Vercel için OPENROUTER_API_KEY ortam değişkenini ekle.');
 if(response.status===429)throw Error('Ücretsiz istek limiti dolmuş veya sunucu meşgul. Daha sonra dene.');
 if(response.status===401)throw Error(!direct&&typeof data.error==='string'?data.error:'OpenRouter kişisel API anahtarını reddetti. Anahtarı ve yetkilerini kontrol et.');
 throw Error(typeof data.error==='string'?data.error:(data.error?.message||'API hatası ('+response.status+').'));
 }
 let content=data?.choices?.[0]?.message?.content;if(Array.isArray(content))content=content.filter(c=>c.type==='text').map(c=>c.text).join('\n');
 if(typeof content!=='string'||!content.trim())throw Error('Model boş yanıt verdi. Tekrar deneyebilirsin.');
 return content.trim();
}
async function send(value){
 const text=value.trim().slice(0,3000);if(!text||pending)return;
 const t=active()||newChat();if(!t)return;
 if(!t.messages.length)t.title=text.length>38?text.slice(0,38)+'…':text;
 t.messages.push({role:'user',content:text,time:now()});t.messages=t.messages.slice(-60);t.updated=now();save();render();E.input.value='';resize();
 const controller=new AbortController();pending=controller;busy();
 const wait=document.createElement('article');wait.className='message assistant';const av=document.createElement('div');av.className='avatar';av.textContent='✳';const main=document.createElement('div');main.className='message-main';const h=document.createElement('div');h.className='message-head';h.textContent='İLEFBot düşünüyor';const dots=document.createElement('div');dots.className='bubble thinking';for(let i=0;i<3;i++)dots.append(document.createElement('i'));main.append(h,dots);wait.append(av,main);E.chat.append(wait);E.scroll.scrollTop=E.scroll.scrollHeight;
 try{const reply=await ask(t.messages.slice(-22).map(m=>({role:m.role,content:m.content.slice(0,3000)})),controller.signal);t.messages.push({role:'assistant',content:reply,time:now()});t.messages=t.messages.slice(-60);t.updated=now();save();render();}
 catch(e){wait.remove();if(e.name!=='AbortError'){const notice=document.createElement('div');notice.className='error-note';notice.textContent=e.message;const retry=btn('Yeniden dene',()=>{if(pending||active()?.id!==t.id||t.messages.at(-1)?.role!=='user')return;const m=t.messages.pop();save();render();send(m.content);});E.chat.append(notice,retry);}}
 finally{if(pending===controller){pending=null;busy();E.input.focus();}}
}
function theme(){const selected=state.theme;document.documentElement.dataset.theme=selected==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):selected;save();}
async function models(){
 const b=$('refresh-models');b.disabled=true;b.textContent='Yükleniyor…';
 try{const r=await fetch(key.trim()?'https://openrouter.ai/api/v1/models':'/api/models');if(!r.ok)throw Error();const result=await r.json();const list=(result.data||[]).filter(m=>m.id?.endsWith(':free')&&Number(m.pricing?.prompt)===0&&Number(m.pricing?.completion)===0).sort((a,b)=>(a.name||a.id).localeCompare(b.name||b.id,'tr'));E.model.replaceChildren(new Option('Otomatik · OpenRouter Free','openrouter/free'));for(const m of list)E.model.add(new Option(m.name||m.id,m.id));if(![...E.model.options].some(o=>o.value===state.model))state.model='openrouter/free';E.model.value=state.model;$('model-label').textContent=E.model.selectedOptions[0]?.textContent||'OpenRouter Free';save();b.textContent=list.length+' ücretsiz model yüklendi';}
 catch(e){b.textContent='Liste alınamadı · Yeniden dene';}finally{b.disabled=false;}
}
function exportChat(){const threads=active()?[active()]:state.threads;if(!threads.length)return;const text=threads.map(t=>t.title+'\n'+'='.repeat(24)+'\n'+t.messages.map(m=>(m.role==='user'?'Sen':'İLEFBot')+': '+m.content).join('\n\n')).join('\n\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='ilefbot-sohbet.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
$('new-chat').addEventListener('click',newChat);
$('open-sidebar').addEventListener('click',()=>{E.sidebar.classList.add('open');E.overlay.hidden=false;});
$('close-sidebar').addEventListener('click',closeMenu);E.overlay.addEventListener('click',closeMenu);
function settings(){closeMenu();E.settings.showModal();}
$('settings-open').addEventListener('click',settings);$('settings-open-mobile').addEventListener('click',settings);$('settings-close').addEventListener('click',()=>E.settings.close());
E.key.addEventListener('input',()=>{key=E.key.value;try{if(key)sessionStorage.setItem(K,key);else sessionStorage.removeItem(K);}catch(e){}});
$('toggle-key').addEventListener('click',()=>{const show=E.key.type==='password';E.key.type=show?'text':'password';$('toggle-key').textContent=show?'Gizle':'Göster';});
E.model.addEventListener('change',()=>{state.model=E.model.value;$('model-label').textContent=E.model.selectedOptions[0].textContent;save();});
$('theme').addEventListener('change',()=>{state.theme=$('theme').value;theme();});$('refresh-models').addEventListener('click',models);
$('export').addEventListener('click',exportChat);
$('clear-all').addEventListener('click',()=>{if(pending||!confirm('Tüm İLEFBot sohbetleri silinsin mi?'))return;state.threads=[];state.active=null;save();render();E.settings.close();});
$('form').addEventListener('submit',e=>{e.preventDefault();send(E.input.value);});
E.input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send(E.input.value);}});
E.input.addEventListener('input',resize);$('stop').addEventListener('click',()=>pending?.abort());
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();newChat();}if(e.key==='Escape')closeMenu();});
$('theme').value=state.theme;theme();render();busy();models();
})();
