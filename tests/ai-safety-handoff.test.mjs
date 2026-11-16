import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
test('release payload preserves canonical bytes and hashes without publication claims',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'safety-handoff-'));const out=join(dir,'release');
 try{
  execFileSync(process.execPath,['scripts/prepare-ai-safety-release.mjs',out],{cwd:root});
  const m=JSON.parse(await readFile(join(out,'release-manifest.json'),'utf8'));
  assert.equal(m.kind,'prepared-not-published');assert.equal(m.publication.mirror,'not-verified');
  for(const f of m.files){const b=await readFile(join(out,'site',f.path));assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);}
  assert.deepEqual(await readFile(join(out,'site/data/latest.json')),await readFile(new URL('ai-safety/data/latest.json',root)));
  const repeat=spawnSync(process.execPath,['scripts/prepare-ai-safety-release.mjs',out],{cwd:root});assert.notEqual(repeat.status,0);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('preparation refuses output inside checkout',()=>{const r=spawnSync(process.execPath,['scripts/prepare-ai-safety-release.mjs','..evil-output'],{cwd:root});assert.notEqual(r.status,0);});
test('dual verification refuses omitted and same-origin mirror',()=>{for(const url of ['', 'https://de-omega-point.com/ai-safety/']){const r=spawnSync(process.execPath,['scripts/verify-ai-safety-destinations.mjs'],{cwd:root,env:{...process.env,AI_SAFETY_MIRROR_URL:url}});assert.notEqual(r.status,0);}});
