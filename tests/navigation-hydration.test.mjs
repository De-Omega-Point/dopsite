import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
for(const file of ['index.html','404.html'])test(`${file}: navigation survives hydration`,()=>{
 const html=readFileSync(file,'utf8');
 assert.equal((html.match(/href="\/de4humanity\/"/g)||[]).length,2);
 const chunks=[...html.matchAll(/self\.__VINEXT_RSC_CHUNKS__\.push\(("(?:\\.|[^"\\])*")\)/g)].map(m=>JSON.parse(m[1])).join('');
 assert.ok(chunks.includes('"href":"/de4humanity/"'));
 assert.equal((chunks.match(/"href":"\/de4humanity\/"/g)||[]).length,2);
 assert.ok(!chunks.includes('"href":"/ai-visibility"'));
 assert.ok(!html.includes('href="/ai-visibility"'));
 assert.ok(html.includes('interactive-particles'));
 assert.ok(html.includes('href="/bridging-light/"'));
 assert.ok(chunks.includes('"href":"/bridging-light/"'));
 assert.ok(chunks.includes('"id":"bridge-entry-title"'));
 assert.ok(html.includes('id="bridge-entry-title"'));
 assert.ok(chunks.includes('Bridging-Lights'));
});
