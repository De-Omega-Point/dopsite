import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {auditBindings,syncBindings,elements} from '../scripts/ai-safety-html.mjs';
import {renderPanels} from '../ai-safety/panels.mjs';
const html=await readFile(new URL('../ai-safety/index.html',import.meta.url),'utf8');
const feed=JSON.parse(await readFile(new URL('../ai-safety/data/latest.json',import.meta.url),'utf8'));
test('canonical baseline binds every text and source link',()=>assert.deepEqual(auditBindings(html,feed),[]));
test('rejects stale metric text despite matching headline and date',()=>{const d=structuredClone(feed);d.metrics[0].value='TEST FIXTURE ONLY: changed value';assert(auditBindings(html,d).includes('Static text differs: metrics.0.value'));});
test('supports qualitative values after synchronisation',()=>{const d=structuredClone(feed);d.metrics.forEach(m=>m.value='NOT SCORED THIS RUN');assert.deepEqual(auditBindings(syncBindings(html,d),d),[]);});
test('rejects missing metric binding',()=>assert(auditBindings(html.replace('data-bind="metrics.0.value"','data-unused="metrics.0.value"'),feed).some(x=>x.includes('Missing metric binding'))));
test('rejects missing report binding',()=>assert(auditBindings(html.replace('data-bind="report.sections.0.body"','data-unused="report.sections.0.body"'),feed).some(x=>x.includes('Missing report/story binding'))));
test('rejects stale source href',()=>{const d=structuredClone(feed);d.sources[0].url='https://example.invalid/fixture';assert(auditBindings(html,d).some(x=>x.includes('Static link differs')));});
test('source href sync never modifies data-bind-href',()=>{const d=structuredClone(feed);d.sources[0].url='https://example.invalid/?a=1&b=2';const s=syncBindings(html,d);assert(s.includes('data-bind-href="sources.0.url"'));assert.deepEqual(auditBindings(s,d),[]);});
test('rejects source row count drift',()=>{const d=structuredClone(feed);d.sources.pop();assert(auditBindings(html,d).includes('Source row count differs'));});
test('rejects stale report body',()=>{const d=structuredClone(feed);d.report.sections[0].body='TEST FIXTURE ONLY';assert(auditBindings(html,d).includes('Static text differs: report.sections.0.body'));});
test('rejects mismatched visible date',()=>{const d=structuredClone(feed);d.edition.displayDate='Published 1 January 2026';assert(auditBindings(html,d).includes('Display date does not match Adelaide publication date'));});
test('escapes new headline in HTML and JSON-LD and roundtrips entities',()=>{const d=structuredClone(feed);d.lead.headline='Fixture <tag> & "quoted"';const s=syncBindings(html,d);assert(!s.includes('Fixture <tag>'));assert.deepEqual(auditBindings(s,d),[]);});
test('missing optional fields fail sync instead of silently carrying old text',()=>{const d=structuredClone(feed);delete d.report.title;assert.throws(()=>syncBindings(html,d),/Supply or remove optional binding/);});
test('missing panels are marked unverified',()=>assert(renderPanels({}).includes('NOT VERIFIED THIS RUN')));
test('panel text is escaped and unsafe links excluded',()=>{const s=renderPanels({roboticsAssessment:{scope:'TEST',assessedAt:'TEST',status:'TEST',entries:[{title:'<img src=x>',sources:[{title:'x',url:'javascript:alert(1)'}]}]}});assert(s.includes('&lt;img'));assert(!s.includes('javascript:'));assert(s.includes('Not publication-ready'));});
test('archive cannot fetch newer editions',async()=>{const archive=await readFile(new URL('../ai-safety/archive/edition-14/index.html',import.meta.url),'utf8');assert(!/<script[^>]+src="app.js"/.test(archive));assert(!archive.includes('<base'));assert(archive.includes('src="../../assets/de-omega-point-emblem-v2.png"'));assert(archive.includes('href="#capability-story"'));assert(archive.includes('href="#i-shield"'));const old=JSON.parse(await readFile(new URL('../ai-safety/archive/edition-14/latest.json',import.meta.url),'utf8'));assert.equal(old.edition.number,14);});
test('synchronisation is idempotent',()=>{const once=syncBindings(html,feed);assert.equal(syncBindings(once,feed),once);});
test('recovery edition preserves scheduling date separately from actual publication',()=>{if(feed.edition.number!==15)return;assert.equal(feed.edition.scheduledFor.slice(0,10),'2026-11-09');assert.equal(feed.edition.publishedAt.slice(0,10),'2026-11-10');});
test('unscored recovery shows no active legacy threat tier',()=>{if(feed.threat.status!=='methodology-unverified')return;assert.equal(feed.threat.currentTier,null);assert(!/data-tier="[^"]+"[^>]*class="[^"]*current/.test(html));assert(html.includes('SIX-TIER DISPLAY PENDING VERIFICATION'));});
test('current page removes prior incident and score assertions',()=>{if(feed.edition.number!==15)return;for(const old of ['86 / 100','74 / 100','60 / 100','95 / 100','Threat 86','Control Debt +12','Cursor marketplace','Tencent Hy4','I4C warning'])assert(!html.includes(old),old);});
test('report citations refer to canonical source ids',()=>{for(const s of feed.report.sections){assert(s.sourceIds.length>0);for(const id of s.sourceIds)assert(feed.sources.some(x=>x.id===id));}});

test("unscored indicators link to their actual basis",()=>{const expected=["method-story","capability-story","method-story","human-agency-tracker","sources"];for(let i=0;i<5;i++)assert.match(html,new RegExp(`data-metric-index="${i}" href="#${expected[i]}"`));});

test("main publication pushes verify the live page before closing alerts",async()=>{const workflow=await readFile(new URL("../.github/workflows/ai-safety-publication.yml",import.meta.url),"utf8");assert(workflow.includes("branches: [main]"));const check=workflow.slice(workflow.indexOf("      - name: Wait for and confirm"),workflow.indexOf("      - name: Open or update"));assert(check.includes("node scripts/verify-ai-safety.mjs public"));assert(check.includes("{1..10}"));assert(!check.includes("if: github.event_name"));const close=workflow.slice(workflow.indexOf("      - name: Close the alert"));assert(close.includes("if: success()"));});

test('Edition 16 recovery separates schedule, release and source-assessment dates',()=>{
  if(feed.edition.number!==16)return;
  assert.equal(feed.edition.scheduledFor,'2026-11-12T06:00:00+10:30');
  assert.equal(feed.publicationManifest.scheduledFor,feed.edition.scheduledFor);
  assert(Date.parse(feed.edition.publishedAt)>Date.parse(feed.edition.scheduledFor));
  assert.equal(feed.publicationManifest.previousEdition,'archive/edition-15/');
  assert.equal(feed.roboticsAssessment.assessedAt,'2026-11-12');
  assert(feed.sources.some(s=>s.id==='ifr-tiago'));
  for(const stale of ['US$1.5m','Test the application boundary, not just the model’s answer.'])assert(!html.includes(stale));
});
test('Edition 15 archive is frozen with original dates and working local assets',async()=>{
  const root=new URL('../ai-safety/archive/edition-15/',import.meta.url);
  const old=JSON.parse(await readFile(new URL('latest.json',root),'utf8'));
  const page=await readFile(new URL('index.html',root),'utf8');
  assert.equal(old.edition.number,15);
  assert.equal(old.edition.publishedAt.slice(0,10),'2026-11-10');
  assert(!/<script[^>]+src=/.test(page));
  assert(page.includes('src="../../assets/de-omega-point-emblem-v2.png"'));
  assert(page.includes('href="../edition-14/"'));
});
