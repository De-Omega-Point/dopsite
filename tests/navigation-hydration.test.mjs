import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {staticPublicHtml} from '../scripts/static-public-html.mjs';
for(const file of ['index.html','404.html'])test(`${file}: static navigation has no client-router interception`,()=>{
 const html=readFileSync(file,'utf8');
 for(const route of ['/de4humanity/','/bridging-light/','/lightbridge/'])assert.ok(html.includes(`href="${route}"`));
 assert.ok(html.includes('id="bridge-entry-title"'));
 assert.ok(html.includes('BL-Game'));
 assert.ok(!html.includes('__VINEXT_RSC_'));
 assert.ok(!html.includes('id="_R_"'));
 assert.ok(!html.includes('href="/ai-visibility"'));
 assert.ok(html.includes('/assets/public-particles.js'));
});
test('export removes router bootstrap but preserves page content and unrelated scripts',()=>{
 const input='<main class="site-header"><canvas class="interactive-particles"></canvas><a href="/lightbridge/">BL-Game</a></main><script id="_R_">import("router.js")</script><script>self.__VINEXT_RSC_CHUNKS__=[]</script><script type="application/ld+json">{"name":"test"}</script></body>';
 const output=staticPublicHtml(input);
 assert.ok(output.includes('href="/lightbridge/"'));
 assert.ok(output.includes('application/ld+json'));
 assert.ok(!output.includes('router.js'));
 assert.ok(!output.includes('__VINEXT_RSC_'));
});
