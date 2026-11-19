import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkFeed, checkPacket, roles, verifyLive } from '../scripts/check-ai-safety-package.mjs';

const feed = {
  edition: { number: 18, publishedAt: '2026-11-19T06:00:00+10:30', displayDate:'Published 19 November 2026' },
  ...Object.fromEntries(['outlook','lead','reportRail','focusAreas','roboticsAssessment','humanAgencyTracker','methodology'].map(k => [k,{ value: true }])),
  voices: [], incidents: [], investigativeSummary:'Sourced summary.',
  report: {sections: Array.from({length:5},()=>({sourceIds:['source']}))},
  sources:[{id:'source'}]
};

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(),'package-test-'));
  t.after(() => rm(dir,{recursive:true,force:true}));
  const manifest = {edition:18, feed:'latest.json', review:{editorial:'passed',visualBrand:'passed'}, artifacts:[]};
  await writeFile(join(dir,'latest.json'),JSON.stringify(feed));
  for(const role of roles) {
    const visual = ['banner','infographic'].includes(role);
    const bytes = visual ? Buffer.from('89504e470d0a1a0a0000000d494844520000000100000001000000000000000000','hex') : Buffer.from(role);
    if(role === 'infographic') bytes[19] = 2;
    const file = role + (visual ? '.png' : '.md');
    await writeFile(join(dir,file),bytes);
    manifest.artifacts.push({role,file,sha256:createHash('sha256').update(bytes).digest('hex')});
  }
  const path = join(dir,'manifest.json');
  const save = () => writeFile(path,JSON.stringify(manifest));
  await save();
  return {dir,path,manifest,save};
}

test('rejects missing feed sections, draft status and unmapped sources', () => {
  assert.throws(() => checkFeed({...feed,reportRail:null},18), /reportRail/);
  assert.throws(() => checkFeed({...feed,editorialStatus:'Draft candidate'},18), /Draft/);
  assert.throws(() => checkFeed({...feed,sources:[]},18), /source mapping/);
});
test('preflight verifies six distinct artifacts but does not claim publication', async t => {
  const {path} = await fixture(t);
  assert.equal((await checkPacket(path)).publicationVerified,false);
});
test('refuses a changed or missing artifact', async t => {
  const {path,dir,manifest,save} = await fixture(t);
  await writeFile(join(dir,'report.md'),'changed');
  await assert.rejects(checkPacket(path),/altered artifact|altered or duplicated/);
  manifest.artifacts.pop();
  await save();
  await assert.rejects(checkPacket(path),/Incomplete artifact/);
});
test('requires exact edition feed and matching HTML at both destinations', async t => {
  const {path} = await fixture(t);
  const packet = await checkPacket(path);
  const live = async url => url.pathname.endsWith('.json') ?
    Response.json(feed) : new Response('Published 19 November 2026 "datePublished": "2026-11-19"');
  const result = await verifyLive(path,packet,live);
  assert.equal(result.publicationVerified,true);
  assert.equal(result.receipts.length,2);
  assert.equal(new Set(result.receipts.map(receipt => receipt.target)).size,2);
  await assert.rejects(verifyLive(path,packet,async url => url.host.endsWith('chatgpt.site') ?
    Response.json({edition:{number:17}}) : live(url)),/does not match/);
});
