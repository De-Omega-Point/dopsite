// Isolated staging API for De-Omega-Point AI Visibility.
// Deployment: Wrangler, with D1 binding DB. Never store scanned page contents.
const ALLOWED_ORIGINS = new Set(["https://de-omega-point.com","https://www.de-omega-point.com"]);
const DENY = /^(localhost|0\.0\.0\.0|127(?:\.|$)|10(?:\.|$)|192\.168(?:\.|$)|169\.254(?:\.|$)|172\.(?:1[6-9]|2\d|3[01])(?:\.|$)|0x[0-9a-f]+|\d+|\[.*\]|.*\.local|.*\.internal)$/i;
const badHost = host => DENY.test(host) || host.includes(":") || host.endsWith(".localhost") || host.endsWith(".test") || host.endsWith(".invalid") || !host.includes(".");
function validateWebsite(raw){
  if(typeof raw!=="string" || raw.length>260)throw Error("Enter a public business website URL.");
  const url=new URL(/^https?:\/\//i.test(raw)?raw:"https://"+raw);
  if(!["https:","http:"].includes(url.protocol) || url.username || url.password || url.port || badHost(url.hostname))throw Error("Enter a public website without credentials or custom ports.");
  // Resolve redirects manually so a public URL cannot redirect to a private network.
  url.hash="";return url;
}
function cors(origin){return {"access-control-allow-origin":ALLOWED_ORIGINS.has(origin)?origin:"https://de-omega-point.com","access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"content-type","vary":"Origin","cache-control":"no-store","x-content-type-options":"nosniff"}}
function json(data,status=200,origin=""){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8",...cors(origin)}})}
async function readWebsite(raw,limit=450000){
 let url=validateWebsite(raw);
 for(let redirect=0;redirect<3;redirect++){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),8000);
  let res;try{res=await fetch(url.toString(),{redirect:"manual",signal:ctrl.signal,headers:{"accept":"text/html, text/plain;q=0.8"}})}finally{clearTimeout(timer)}
  if([301,302,303,307,308].includes(res.status)){const next=res.headers.get("location");if(!next)throw Error("Website redirect missing destination.");url=validateWebsite(new URL(next,url).href);continue;}
  if(!res.ok)throw Error("Website returned HTTP "+res.status);
  const type=res.headers.get("content-type")||"";if(!/text\/html|text\/plain|application\/xml|text\/xml/i.test(type))throw Error("Website content is not readable HTML.");
  const claimed=Number(res.headers.get("content-length")||0);if(claimed>limit)throw Error("Website response is too large.");
  // Bound network read memory; disallow large files and stream indefinite content.
  if(!res.body)throw Error("Website returned empty content.");
  const reader=res.body.getReader();const chunks=[];let total=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit)throw Error("Website response is too large.");chunks.push(value)}}finally{reader.cancel().catch(()=>{})}
  const merged=new Uint8Array(total);let offset=0;for(const piece of chunks){merged.set(piece,offset);offset+=piece.byteLength}
  return {html:new TextDecoder().decode(merged),url};
 }
 throw Error("Website redirected too many times.");
}
async function optionalText(url){try{return await readWebsite(url,120000)}catch{return null}}
const matched=(s,r)=>r.test(s);
async function scan(raw,hint="Business"){
 const {html,url}=await readWebsite(raw);
 const title=html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()||"";
 const flags={
  desc:matched(html,/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{45,}/i)||matched(html,/<meta[^>]+content=["'][^"']{45,}["'][^>]+name=["']description["']/i),
  jsonld:matched(html,/application\/ld\+json/i),identity:matched(html,/LocalBusiness|Organization|Corporation|Store|Restaurant|ProfessionalService/i),
  product:matched(html,/Product|Offer|priceCurrency|availability|itemprop=["']price/i),
  location:matched(html,/address|streetAddress|postalCode|openingHours|Adelaide|South Australia|\bSA\b/i),
  trust:matched(html,/review|testimonial|rating|case stud|ABN|privacy policy|facebook\.com|instagram\.com|linkedin\.com/i),
  conversion:matched(html,/add to cart|buy now|book now|get a quote|request a quote|checkout|shop now|order online/i)&&matched(html,/mailto:|tel:|contact/i)
 };
 const [robots,sitemap]=await Promise.all([optionalText(new URL("/robots.txt",url).href),optionalText(new URL("/sitemap.xml",url).href)]);
 const f=[
 ["Clear page title",title.length>=12,8,title?"Found: "+title.slice(0,80):"No useful title found"],
 ["Useful meta description",flags.desc,8,"Description can be found in page metadata"],
 ["Machine-readable structured data",flags.jsonld,16,"JSON-LD markup presence"],
 ["Business identity signals",flags.identity,14,"Organisation or business identity markup"],
 ["Products, offers or services",flags.product,14,"Commercial attributes detected"],
 ["Location and service-area clarity",flags.location,10,"Location or service-area signals"],
 ["Trust and reputation evidence",flags.trust,10,"Public trust signals"],
 ["Conversion path",flags.conversion,12,"Commercial call-to-action and contact"],
 ["Crawler access",robots!==null,4,"robots.txt readability (not permission)"],
 ["Sitemap discovery",sitemap!==null,4,"sitemap.xml readability"]
 ];
 const findings=f.map(([label,passed,weight,detail])=>({label,passed,weight,detail:passed?detail:"Not detected; check page content or markup"}));
 const sum=a=>a.reduce((t,x)=>t+x.weight*(x.passed?1:0),0);
 const portion=indices=>{const g=indices.map(i=>findings[i]);return Math.round(sum(g)/g.reduce((s,x)=>s+x.weight,0)*100)};
 return {name:title.split(/[|–—-]/)[0]?.trim().slice(0,100)||hint,url:url.origin,score:sum(findings),findings,
 dimensions:{understanding:portion([0,1,2,3]),trust:portion([5,6]),commerce:portion([4,8,9]),conversion:portion([7])}};
}
async function rateLimit(db,key,kind,max){
 const now=Math.floor(Date.now()/60000);const bucket=kind+":"+key+":"+now;
 await db.prepare("INSERT INTO rate_limits (bucket,hits,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1").bind(bucket,now+2).run();
 const row=await db.prepare("SELECT hits FROM rate_limits WHERE bucket=?").bind(bucket).first();return (row?.hits||0)<=max;
}
export default {async fetch(request,env){
 const origin=request.headers.get("origin")||"";
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(!ALLOWED_ORIGINS.has(origin))return json({error:"Origin not permitted."},403,origin);
 const path=new URL(request.url).pathname;
 if(request.method!=="POST"||!["/scan","/lead"].includes(path))return json({error:"Not found."},404,origin);
 if(!env.DB)return json({error:"Service configuration unavailable."},503,origin);
 if(Number(request.headers.get("content-length")||0)>3500)return json({error:"Request too large."},413,origin);
 const ip=request.headers.get("cf-connecting-ip")||"unknown";
 const encoder=new TextEncoder();const digest=await crypto.subtle.digest("SHA-256",encoder.encode(ip+":"+new Date().toISOString().slice(0,10)));
 const key=Array.from(new Uint8Array(digest)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("");
 if(!await rateLimit(env.DB,key,path,path==="/scan"?8:3))return json({error:"Too many requests. Please try again shortly."},429,origin);
 try{
  const body=await request.text();if(body.length>3500)throw Error("Request too large.");
  const p=JSON.parse(body);
  if(path==="/lead"){
   const email=String(p.email||"").trim().toLowerCase();
   if(!p.consent||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>200)throw Error("Valid email and consent are required.");
   const url=validateWebsite(p.businessUrl);
   const name=String(p.businessName||"").slice(0,100),category=String(p.category||"").slice(0,100),location=String(p.location||"").slice(0,120);
   const score=Number(p.score);
   if(!Number.isFinite(score)||score<0||score>100)throw Error("Invalid scan result.");
   await env.DB.prepare("INSERT INTO visibility_leads(email,business_url,business_name,category,location,score,consented_at) VALUES(?,?,?,?,?,?,?)")
    .bind(email,url.origin,name,category,location,score,Math.floor(Date.now()/1000)).run();
   return json({ok:true},200,origin);
  }
  const url=validateWebsite(p.businessUrl);
  const category=String(p.category||"").trim().slice(0,100),location=String(p.location||"").trim().slice(0,120);
  if(!category||!location)throw Error("Business category and location are required.");
  const competitors=Array.isArray(p.competitors)?p.competitors.slice(0,3):[];
  const business=await scan(url.href);
  const checks=await Promise.all(competitors.map(async x=>{try{return await scan(String(x))}catch{return {name:String(x).slice(0,80),url:"",score:null}}}));
  const queryPack=[`Best ${category} in ${location}`,`${category} near me with strong reviews`,`Which ${category} in ${location} should I choose?`,`Compare local ${category} options in ${location}`,`Recommended ${category} in ${location}`];
  return json({business,competitors:checks,queryPack,measuredAt:new Date().toISOString()},200,origin);
 }catch(e){return json({error:e instanceof Error?e.message:"Request could not be completed."},400,origin)}
}}};
