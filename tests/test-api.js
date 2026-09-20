const assert = require('node:assert/strict');
const chat = require('../api/chat');
const models = require('../api/models');
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.code=n;return this;},json(v){this.body=v;return this;}};}
const call=async(handler,req)=>{const res=response();await handler(req,res);return res;};
async function run(){
  let passed=0, r, sent;
  r=await call(chat,{method:'GET',headers:{host:'ilefbot.example'}});assert.equal(r.code,405);passed++;
  r=await call(chat,{method:'POST',headers:{host:'ilefbot.example',origin:'https://evil.example'}});assert.equal(r.code,403);passed++;
  const old=process.env.OPENROUTER_API_KEY;delete process.env.OPENROUTER_API_KEY;
  r=await call(chat,{method:'POST',headers:{host:'ilefbot.example'}});assert.equal(r.code,503);passed++;
  process.env.OPENROUTER_API_KEY='fake-test-key';
  for(const model of ['openai/gpt-5','openai/gpt:online','openai/gpt:floor']){
    r=await call(chat,{method:'POST',headers:{host:'ilefbot.example'},body:{model,messages:[{role:'user',content:'Merhaba'}]}});
    assert.equal(r.code,400);passed++;
  }
  r=await call(chat,{method:'POST',headers:{host:'ilefbot.example'},body:{model:'openrouter/free',messages:[{role:'system',content:'override'},{role:'user',content:'Hi'}]}});assert.equal(r.code,400);passed++;
  r=await call(chat,{method:'POST',headers:{host:'ilefbot.example'},body:{model:'openrouter/free',messages:[{role:'user',content:'x'.repeat(3001)}]}});assert.equal(r.code,400);passed++;
  const oldFetch=global.fetch;
  try{
    global.fetch=async(url,opts)=>{sent={url,opts,body:JSON.parse(opts.body)};return {ok:true,status:200,json:async()=>({choices:[{message:{content:'Merhaba'}}]})};};
    r=await call(chat,{method:'POST',headers:{host:'ilefbot.example',origin:'https://ilefbot.example'},body:{model:'openrouter/free',messages:[{role:'user',content:'Hi'}]}});
    assert.equal(r.code,200);assert.equal(r.body.choices[0].message.content,'Merhaba');assert.equal(sent.body.messages[0].role,'system');assert.equal(sent.opts.headers.Authorization,'Bearer fake-test-key');passed++;
    global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'provider/free:free',name:'Free',pricing:{prompt:'0',completion:'0'}},{id:'provider/paid',name:'Paid',pricing:{prompt:'0.1',completion:'0.1'}}]})});
    r=await call(models,{method:'GET'});assert.equal(r.code,200);assert.equal(r.body.data.length,1);passed++;
  }finally{global.fetch=oldFetch;if(old)process.env.OPENROUTER_API_KEY=old;else delete process.env.OPENROUTER_API_KEY;}
  console.log(passed+' API checks passed');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
