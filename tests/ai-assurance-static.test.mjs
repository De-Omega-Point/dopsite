import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const assurancePath = new URL("../ai-assurance/index.html", import.meta.url);
const safetyPath = new URL("../ai-safety/index.html", import.meta.url);
const logoPath = new URL("../assets/de-omega-point-emblem-v2.png", import.meta.url);

function extractIds(html) {
  return [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
}

test("AI assurance page keeps core conversion and navigation intact", async () => {
  const html = await readFile(assurancePath, "utf8");
  const ids = extractIds(html);
  const idSet = new Set(ids);
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

  assert.equal(new Set(ids).size, ids.length, "duplicate ids found");
  for (const anchor of anchors) {
    assert.ok(idSet.has(anchor), `missing internal anchor target #${anchor}`);
  }

  assert.match(html, /id="assessment"/);
  assert.match(html, /id="sprint"/);
  assert.match(html, /id="results"/);
  assert.match(html, /id="scoreButton"/);
  assert.match(html, /id="resetButton"/);
  assert.match(html, /id="copyButton"/);
  assert.match(html, /id="printButton"/);
  assert.match(html, /A\$2,500/);
  assert.match(html, /mailto:hello@de-omega-point\.com/);
});

test("AI assurance scoring keeps exposure separate from assurance", async () => {
  const html = await readFile(assurancePath, "utf8");

  assert.equal((html.match(/id:"q\d+"/g) ?? []).length, 12);
  assert.ok((html.match(/critical:true/g) ?? []).length >= 5);
  assert.match(html, /const exposure=/);
  assert.match(html, /const assurance=/);
  assert.match(html, /Control Debt = Exposure Index minus Assurance Index/);
  assert.match(html, /dop-agent-check-v2/);

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(scripts.length > 0, "interactive script missing");
  for (const script of scripts) {
    assert.doesNotThrow(() => new Function(script), "browser script has a syntax error");
  }
});

test("AI assurance page retains accessibility and local-first safeguards", async () => {
  const html = await readFile(assurancePath, "utf8");

  assert.match(html, /<fieldset class="question">/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /try \{[\s\S]*localStorage\.getItem/);
  assert.match(html, /try \{ localStorage\.setItem/);
  await access(logoPath);
});

test("AI Safety Observatory points to the assurance diagnostic", async () => {
  const html = await readFile(safetyPath, "utf8");

  assert.match(html, /href="\/ai-assurance\/"/);
  assert.match(html, /display:flex;flex-wrap:wrap/);
});
