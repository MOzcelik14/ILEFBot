// Public list of models that are explicitly free for both input and output.
module.exports = async function handler(req,res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Yalnızca GET desteklenir.'});
  res.setHeader('Cache-Control','public, max-age=600, s-maxage=600');
  try {
    const response=await fetch('https://openrouter.ai/api/v1/models');
    if(!response.ok)throw new Error('Catalog unavailable');
    const result=await response.json();
    const data=(result.data||[]).filter(m=>typeof m.id==='string'&&m.id.endsWith(':free')&&Number(m.pricing?.prompt)===0&&Number(m.pricing?.completion)===0).map(m=>({id:m.id,name:m.name,pricing:{prompt:'0',completion:'0'}}));
    res.status(200).json({data});
  } catch(e) {res.status(502).json({error:'Model listesi alınamadı.',data:[]});}
};
