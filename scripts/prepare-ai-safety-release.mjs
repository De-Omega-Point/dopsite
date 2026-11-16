#!/usr/bin/env node
// Produce one validated, portable payload BEFORE handing research to publishing.
// This command does not publish, verify sources, or declare assets complete.
import {readFile,mkdir,cp,readdir,writeFile} from 'node:fs/promises';
import {resolve,relative,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=process.argv[2];
if(!out)throw new Error('Supply a NEW output directory outside this checkout.');
const dest=resolve(out);
const rel=relative(root,dest);
if(!(rel==='..'||rel.startsWith('..'+sep)))throw new Error('Output must be outside the source checkout.');
execFileSync(process.execPath,['scripts/verify-ai-safety.mjs','local'],{cwd:root,stdio:'inherit'});
await mkdir(dest,{recursive:false});
const site=join(dest,'site');
await cp(join(root,'ai-safety'),site,{recursive:true});
// Copy no repository metadata, credentials, runtime caches or historical build tarballs.
async function inventory(dir,prefix=''){
 const files=[];
 for(const ent of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  const path=join(dir,ent.name),name=prefix+ent.name;
  if(ent.isSymbolicLink())throw new Error('Release must not contain symlinks: '+name);
  if(ent.isDirectory())files.push(...await inventory(path,name+'/'));
  else if(ent.isFile()){const bytes=await readFile(path);files.push({path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
 }
 return files;
}
const files=await inventory(site);
const data=JSON.parse(await readFile(join(site,'data/latest.json'),'utf8'));
const manifest={schemaVersion:1,kind:'prepared-not-published',edition:data.edition,preparedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceDirty:Boolean(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()),payloadSha256:createHash('sha256').update(JSON.stringify(files)).digest('hex'),files,publication:{main:'not-verified',mirror:'not-verified'},limitations:['Source truth and editorial approval are not proved by this manifest.','Generated assets and full package completeness must be recorded separately.','Publish identical site payload to both existing destinations, then run dual verification.']};
await writeFile(join(dest,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({directory:dest,edition:data.edition.number,files:files.length,payloadSha256:manifest.payloadSha256,status:manifest.kind}));
