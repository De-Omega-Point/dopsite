#!/usr/bin/env node
// Synchronise existing template from a reviewed canonical feed. Never writes JSON.
// Call only after removing/replacing unbound editorial content and obsolete bindings.
import {readFile,writeFile} from 'node:fs/promises';
import {elements,escapeHTML as e,syncBindings,auditBindings} from './ai-safety-html.mjs';
import {renderPanels,renderSources,renderEditorial,renderReportSources} from '../ai-safety/panels.mjs';
const hp=new URL('../ai-safety/index.html',import.meta.url);
const data=JSON.parse(await readFile(new URL('../ai-safety/data/latest.json',import.meta.url),'utf8'));
let html=await readFile(hp,'utf8');
const sourceSection=elements(html).find(n=>n.attrs.id==='sources');
if(!sourceSection)throw Error('Missing evidence ledger');
const list=elements(html).find(n=>n.tag==='ol'&&n.start>sourceSection.start&&n.end<sourceSection.end);
if(!list)throw Error('Missing source list');
const rows=renderSources(data);
html=html.slice(0,list.contentStart)+'\n'+rows+'\n'+html.slice(list.end);
html=syncBindings(html,data);
if(!html.includes('<!-- ASSESSMENTS:START -->'))throw Error('Missing qualitative panel mount');
html=html.replace(/<!-- ASSESSMENTS:START -->[\s\S]*?<!-- ASSESSMENTS:END -->/,'<!-- ASSESSMENTS:START -->'+renderPanels(data)+'<!-- ASSESSMENTS:END -->');
html=html.replace(/<!-- EDITORIAL:START -->[\s\S]*?<!-- EDITORIAL:END -->/,'<!-- EDITORIAL:START -->'+renderEditorial(data)+'<!-- EDITORIAL:END -->');
for(let i=0;i<5;i++)html=html.replace(new RegExp('<!-- REPORT-SOURCES:'+i+':START -->[\\s\\S]*?<!-- REPORT-SOURCES:'+i+':END -->'),'<!-- REPORT-SOURCES:'+i+':START -->'+renderReportSources(data,i)+'<!-- REPORT-SOURCES:'+i+':END -->');
if(data.edition.description)html=html.replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${e(data.edition.description)}" />`);
html=html.replace(/<meta name="dop-deploy" content="[^"]*"\s*\/>/,`<meta name="dop-deploy" content="edition-${data.edition.number}-${data.edition.publishedAt.slice(0,10)}" />`);
const errors=auditBindings(html,data);if(errors.length)throw Error(errors.join('\n'));
await writeFile(hp,html);console.log('Synced canonical fields and qualitative panels; unbound editorial content still requires review.');
