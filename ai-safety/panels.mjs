// Same renderer is used at publication time and in the browser.
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function link(s){try{if(new URL(s.url).protocol!=='https:'||!s.title)return '';return `<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.title)}</a>`;}catch{return '';}}
export function renderPanels(data){return [['roboticsAssessment','robotics-assessment','Robotics News & Safety'],['humanAgencyTracker','human-agency-tracker','Human Agency Tracker']].map(([key,id,title])=>{
 const p=data[key];let body;
 if(!p?.scope||!p?.assessedAt||!p?.status)body='<p>NOT VERIFIED THIS RUN · Assessment metadata unavailable.</p>';
 else{body=`<p><strong>${e(p.status)}</strong></p><p>${e(p.scope)}</p><p>Assessed: ${e(p.assessedAt)}</p><p>${e(p.methodologyNote||'Qualitative assessment; no numeric score assigned.')}</p>`;
 body+=(p.entries||[]).map(x=>{const sources=(x.sources||[]).map(link).filter(Boolean);return `<article class="assessment-card"><h4>${e(x.title)}</h4>${['id','affectedGroup','finding','evidenceStatus','controlGap','nextVerification'].filter(k=>x[k]).map(k=>`<p><strong>${e({id:'Case',affectedGroup:'Affected people',finding:'Finding',evidenceStatus:'Evidence',controlGap:'Control gap',nextVerification:'Next verification'}[k])}:</strong> ${e(x[k])}</p>`).join('')}<p>${sources.length?sources.join(' · '):'EVIDENCE LINK MISSING · Not publication-ready.'}</p></article>`;}).join('');
 if(!p.entries?.length)body+='<p>INSUFFICIENT EVIDENCE · No assessed cases supplied.</p>';}
 return `<section class="report-section" id="${id}" aria-labelledby="${id}-title"><h3 id="${id}-title">${title}</h3>${body}</section>`;
}).join('\n');}
export function renderSources(data){return (data.sources||[]).map((s,i)=>{
 let url='';try{if(new URL(s.url).protocol==='https:')url=s.url;}catch{}
 return `<li data-source-index="${i}"><span>${String(i+1).padStart(2,'0')}</span><a data-bind-href="sources.${i}.url"${url?` href="${e(url)}"`:''} target="_blank" rel="noopener noreferrer"><strong data-bind="sources.${i}.publisher">${e(s.publisher)}</strong><em data-bind="sources.${i}.title">${e(s.title)}</em><small data-bind="sources.${i}.date">${e(s.date)}</small></a></li>`;
}).join('\n');}
export function renderEditorial(data){
 const voice=(data.voices||[]).map(v=>`<article><h3>${e(v.speaker)}</h3><small>${e(v.role)} · ${e(v.date)}</small><blockquote>“${e(v.quote)}”</blockquote><p>${e(v.context)}</p>${v.url?.startsWith('#')?`<a href="${e(v.url==='#human-agency'?'#human-agency-tracker':v.url)}">Read the agency assessment</a>`:link({url:v.url,title:'Verify original evidence ↗'})}</article>`).join('');
 const incidents=(data.incidents||[]).map(v=>`<article><h3>${e(v.name)}</h3><small>${e(v.date)}</small><div><span class="tag">${e(v.classification)}</span><span class="tag">${e(v.severity)}</span></div><p><b>Known:</b> ${e(v.known)}</p><p><b>Uncertain:</b> ${e(v.unknown)}</p><p><b>Control lesson:</b> ${e(v.lesson)}</p>${link({url:v.url,title:'Original evidence ↗'})}</article>`).join('');
 return `<section class="dop-editorial" id="community-voices"><div class="k">Evidence and perspective</div><h2>Source perspectives and DΩP analysis</h2><div class="g">${voice}</div></section><section class="dop-editorial" id="incident-watch"><div class="k">Incident watch</div><h2>Current Incident Watch</h2><p>Event dates, disclosure dates and remediation are distinct. No I0–I5 rating is assigned without approved anchors.</p><div class="g">${incidents}</div></section><section class="dop-editorial" id="investigative-summary"><div class="k">Source-based investigative brief</div><h2>A scoped review, not a comprehensive product audit</h2><p>${e(data.investigativeSummary)}</p><p><strong>${e(data.methodology?.status)}</strong> · ${e(data.methodology?.version)}</p></section>`;
}
export function renderReportSources(data,index){return (data.report?.sections?.[index]?.sourceIds||[]).map(id=>{const s=data.sources.find(s=>s.id===id);return s?link({url:s.url,title:s.publisher}):`<strong>MISSING SOURCE: ${e(id)}</strong>`;}).join(' · ');}
