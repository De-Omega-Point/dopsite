#!/usr/bin/env node
// Observe BOTH destinations independently. Never infer mirror success from main.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const mirror=process.env.AI_SAFETY_MIRROR_URL;
if(!mirror || new URL(mirror).protocol!=='https:')throw new Error('Set the verified existing HTTPS mirror URL in AI_SAFETY_MIRROR_URL.');
const main=process.env.AI_SAFETY_PUBLIC_URL||'https://de-omega-point.com/ai-safety/';
if(new URL(main).origin===new URL(mirror).origin)throw new Error('Main and mirror must be different destinations.');
const feed=await readFile(new URL('../ai-safety/data/latest.json',import.meta.url));
const receipt={schemaVersion:1,checkedAt:new Date().toISOString(),edition:JSON.parse(feed).edition,feedSha256:createHash('sha256').update(feed).digest('hex'),destinations:{}};
for(const [name,url] of Object.entries({main,mirror})){
 const result=spawnSync(process.execPath,['scripts/verify-ai-safety.mjs','public'],{cwd:root,encoding:'utf8',env:{...process.env,AI_SAFETY_PUBLIC_URL:url},timeout:60000,maxBuffer:1024*1024});
 const record={url,status:result.status===0?'verified':'failed',exitCode:result.status,output:(result.stdout||'')+(result.stderr||''),error:result.error?.message||null};
 receipt.destinations[name]=record;
 console.log(name+': '+record.status+'\n'+record.output);
}
receipt.status=Object.values(receipt.destinations).every(x=>x.status==='verified')?'both-verified':'incomplete';
const output=resolve(process.env.AI_SAFETY_RECEIPT_PATH||'/tmp/ai-safety-publication-receipt.json');
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(receipt,null,2)+'\n');
console.log('Receipt: '+output+' ('+receipt.status+')');
process.exitCode=receipt.status==='both-verified'?0:1;
