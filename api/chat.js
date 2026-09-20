// Vercel serverless function. Never expose OPENROUTER_API_KEY to the browser.
const SYSTEM = `Sen İLEFBot'sun. Bolu Abant İzzet Baysal Üniversitesi (BAİBÜ) İletişim Fakültesi öğrencileri için bağımsız, samimi, doğru ve öz Türkçe yanıt veren bir asistansın. Sinema, radyo, televizyon, gazetecilik, halkla ilişkiler, yaratıcı projeler, Erasmus ve öğrencilik hakkında yardımcı ol. Fakültenin resmî sitesi: https://ilef.ibu.edu.tr/ . Resmî akademik takvim, ders kayıtları, yönetmelikler, burslar ve kişiye özel öğrenci işlemlerinde güncel veriye erişimin yoksa tarih, kural, kişi veya link uydurma; ilgili resmî duyuruya ya da danışmana yönlendir. Fakülteyi temsil ettiğini söyleme. Başka konularda da yardımcı ol. Kullanıcıyı kişisel bilgi veya şifre paylaşmaya teşvik etme.`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Yalnızca POST desteklenir.'});
  const origin = req.headers.origin;
  const host = req.headers.host;
  // A browser origin check reduces accidental cross-site use; it is NOT authentication.
  if (origin) {
    try {if (new URL(origin).host !== host) return res.status(403).json({error:'Bu kaynaktan istek kabul edilmiyor.'});}
    catch(e) {return res.status(403).json({error:'Geçersiz kaynak.'});}
  }
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({error:'Sunucuda OPENROUTER_API_KEY tanımlanmamış. Vercel ortam değişkenlerini kontrol et.'});
  const body = typeof req.body === 'string' ? (()=>{try{return JSON.parse(req.body)}catch(e){return null}})() : req.body;
  const model = body?.model || 'openrouter/free';
  const allowed = model === 'openrouter/free' || (typeof model === 'string' && model.length <= 110 && /^[\w./-]+:free$/.test(model));
  if (!allowed) return res.status(400).json({error:'Yalnızca ücretsiz OpenRouter modelleri desteklenir.'});
  if (!Array.isArray(body?.messages) || body.messages.length < 1 || body.messages.length > 22 || body.messages.some(m => !m || !['user','assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 3000) || body.messages.at(-1).role !== 'user') return res.status(400).json({error:'Geçersiz veya çok uzun sohbet.'});
  const messages = [{role:'system',content:SYSTEM},...body.messages.map(m=>({role:m.role,content:m.content}))];
  const abort = new AbortController();const timer = setTimeout(()=>abort.abort(),45000);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',signal:abort.signal,
      headers:{'Authorization':'Bearer '+process.env.OPENROUTER_API_KEY,'Content-Type':'application/json','X-Title':'ILEFBot'},
      body:JSON.stringify({model,messages,max_tokens:900,temperature:0.65})
    });
    const json = await response.json().catch(()=>({}));
    if (!response.ok) return res.status(response.status >= 400 && response.status <= 599 ? response.status : 502).json({error:response.status===429?'Ücretsiz istek limiti doldu. Daha sonra tekrar dene.':response.status===401?'Sunucu API anahtarı geçersiz.':'OpenRouter isteği başarısız.',details:json?.error?.message?.slice?.(0,180)});
    return res.status(200).json({choices:[{message:{content:json?.choices?.[0]?.message?.content||''}}]});
  } catch(e) {return res.status(502).json({error:abort.signal.aborted?'Model zaman aşımına uğradı.':'OpenRouter bağlantısı başarısız.'});}
  finally {clearTimeout(timer);}
};
