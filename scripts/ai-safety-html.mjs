// Narrow parser for this controlled static template, not a general browser parser.
export const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const resolve = (data,path) => path.split('.').reduce((v,k)=>v?.[k],data);
const decode = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,v)=>v[0]==='#'?String.fromCodePoint(v[1].toLowerCase()==='x'?parseInt(v.slice(2),16):Number(v.slice(1))):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0'}[v.toLowerCase()]));
const voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
export function elements(html) {
 const found=[],stack=[];
 for (const m of html.matchAll(/<!--[\s\S]*?-->|<\/?[a-z][^>]*>/gi)) {
  if(m[0].startsWith('<!--'))continue;
  const closing=m[0][1]==='/',tag=/^<\/?([^\s/>]+)/.exec(m[0])[1].toLowerCase();
  if(closing){let i=stack.length-1;while(i>=0&&stack[i].tag!==tag)i--;if(i>=0){const node=stack[i];node.end=m.index;node.closeEnd=m.index+m[0].length;node.inner=html.slice(node.contentStart,node.end);stack.length=i;}continue;}
  const attrs=Object.fromEntries([...m[0].matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(a=>[a[1],decode(a[2]??a[3])]));
  const node={tag,attrs,start:m.index,contentStart:m.index+m[0].length,open:m[0]};found.push(node);
  if(!voids.has(tag)&&!m[0].endsWith('/>'))stack.push(node);
 }
 return found;
}
const visible = html => decode(html.replace(/<[^>]+>/g,''));
export function auditBindings(html,data) {
 const nodes=elements(html),errors=[];
 for(const node of nodes){
  const path=node.attrs['data-bind'];
  if(path){const expected=resolve(data,path);if(expected===undefined||expected===null)errors.push('Missing bound field '+path);else if(visible(node.inner??'').trim()!==String(expected).trim())errors.push('Static text differs: '+path);}
  const href=node.attrs['data-bind-href'];if(href&&node.attrs.href!==resolve(data,href))errors.push('Static link differs: '+href);
 }
 for(let i=0;i<5;i++)for(const key of ['label','value','trend','note'])if(!nodes.some(n=>n.attrs['data-bind']===`metrics.${i}.${key}`))errors.push(`Missing metric binding metrics.${i}.${key}`);
 for(const path of ['lead.headline','lead.summary','report.title','report.standfirst','report.intro',...Array.from({length:5},(_,i)=>['title','summary'].map(k=>`stories.${i}.${k}`)).flat(),...Array.from({length:5},(_,i)=>['kicker','heading','body'].map(k=>`report.sections.${i}.${k}`)).flat()])if(!nodes.some(n=>n.attrs['data-bind']===path))errors.push('Missing report/story binding '+path);
 const rows=nodes.filter(n=>'data-source-index'in n.attrs);if(rows.length!==data.sources.length)errors.push('Source row count differs');
 for(let i=0;i<data.sources.length;i++){
  if(!rows.some(n=>n.attrs['data-source-index']===String(i)))errors.push('Missing source row '+i);
  for(const key of ['publisher','title','date'])if(!nodes.some(n=>n.attrs['data-bind']===`sources.${i}.${key}`))errors.push(`Missing source binding sources.${i}.${key}`);
  if(!nodes.some(n=>n.attrs['data-bind-href']===`sources.${i}.url`))errors.push('Missing source link '+i);
 }
 const articles=nodes.filter(n=>n.tag==='script'&&n.attrs.type==='application/ld+json');
 try{const a=JSON.parse(articles[0]?.inner??'');if(a.headline!==data.lead.headline)errors.push('Structured headline differs');if(a.datePublished!==data.edition.publishedAt.slice(0,10))errors.push('Structured publication date differs');if(a.dateModified!==data.edition.lastUpdatedAt.slice(0,10))errors.push('Structured modification date differs');}catch{errors.push('Invalid NewsArticle metadata');}
 const times=nodes.filter(n=>n.tag==='time'&&n.attrs['data-bind']==='edition.displayDate');if(!times.length||times.some(n=>n.attrs.datetime!==data.edition.publishedAt.slice(0,10)))errors.push('Visible date datetime differs');
 const expectedDate='Published '+new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Adelaide',day:'numeric',month:'long',year:'numeric'}).format(new Date(data.edition.publishedAt));
 if(data.edition.displayDate!==expectedDate)errors.push('Display date does not match Adelaide publication date');
 return errors;
}
export function syncBindings(html,data){
 const changes=[];
 for(const n of elements(html)){
  const p=n.attrs['data-bind'];if(p){const v=resolve(data,p);if(v==null)throw Error('Supply or remove optional binding: '+p);changes.push({start:n.contentStart,end:n.end,value:escapeHTML(v)});}
  let open=n.open;
  const hp=n.attrs['data-bind-href'];if(hp){const v=resolve(data,hp);if(typeof v!=='string'||!v.startsWith('https://'))throw Error('Invalid source URL '+hp);open=open.replace(/\shref="[^"]*"/,' href="'+escapeHTML(v)+'"');}
  if(n.tag==='time'&&p==='edition.displayDate')open=open.replace(/datetime="[^"]*"/,'datetime="'+data.edition.publishedAt.slice(0,10)+'"');
  if(open!==n.open)changes.push({start:n.start,end:n.contentStart,value:open});
  if(n.tag==='script'&&n.attrs.type==='application/ld+json'){const a=JSON.parse(n.inner);a.headline=data.lead.headline;a.datePublished=data.edition.publishedAt.slice(0,10);a.dateModified=data.edition.lastUpdatedAt.slice(0,10);changes.push({start:n.contentStart,end:n.end,value:'\n'+JSON.stringify(a,null,2).replace(/</g,'\\u003c')+'\n'});}
 }
 for(const c of changes.sort((a,b)=>b.start-a.start))html=html.slice(0,c.start)+c.value+html.slice(c.end);
 return html;
}
