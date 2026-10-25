#!/usr/bin/env node
/**
 * De-Omega-Point AI Safety edition gate.
 * Read-only: it never fabricates an edition, alters scores or republishes old news.
 * Usage: node scripts/verify-ai-safety.mjs [local|public]
 */
import { readFile } from "node:fs/promises";

const mode = process.argv[2] || "local";
const publicUrl = process.env.AI_SAFETY_PUBLIC_URL || "https://de-omega-point.com/ai-safety/";
const jsonPath = new URL("../ai-safety/data/latest.json", import.meta.url);
const htmlPath = new URL("../ai-safety/index.html", import.meta.url);
const local = JSON.parse(await readFile(jsonPath, "utf8"));
const html = await readFile(htmlPath, "utf8");

function assert(ok, message) {
  if (!ok) throw new Error("AI Safety publication gate: " + message);
}
function localDate(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Adelaide",
    year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", hourCycle: "h23"
  }).formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return { date: parts.year + "-" + parts.month + "-" + parts.day,
    day: parts.weekday, hour: Number(parts.hour) };
}
function latestDueDate(now = new Date()) {
  for (let daysAgo = 0; daysAgo < 8; daysAgo++) {
    const d = localDate(new Date(now.getTime() - daysAgo * 86400000));
    if ((d.day === "Mon" || d.day === "Thu") && (daysAgo > 0 || d.hour >= 6)) return d.date;
  }
  throw new Error("Cannot resolve Monday/Thursday schedule for Adelaide.");
}
function checkEdition(data, where) {
  assert(data && typeof data === "object", where + " feed is missing.");
  assert(Number.isInteger(data.edition?.number) && data.edition.number > 0, where + " edition number is invalid.");
  assert(typeof data.edition?.publishedAt === "string" && !Number.isNaN(Date.parse(data.edition.publishedAt)), where + " publishedAt is invalid.");
  assert(typeof data.edition?.lastUpdatedAt === "string" && !Number.isNaN(Date.parse(data.edition.lastUpdatedAt)), where + " lastUpdatedAt is invalid.");
  assert(Date.parse(data.edition.lastUpdatedAt) >= Date.parse(data.edition.publishedAt), where + " modification date predates publication.");
  assert(/^Published \d{1,2} [A-Za-z]+ \d{4}$/.test(data.edition.displayDate), where + " display date is invalid.");
  assert(Array.isArray(data.metrics) && data.metrics.length === 5, where + " must contain five indicators.");
  assert(Array.isArray(data.stories) && data.stories.length === 5, where + " must contain five key stories.");
  assert(Array.isArray(data.sources) && data.sources.length >= 5, where + " needs a source ledger.");
  assert(data.metrics.every(m => m.label && m.value && m.note), where + " indicator fields missing.");
  assert(data.stories.every(s => s.title && s.summary), where + " story fields missing.");
  assert(data.sources.every(s => {
    try { const u = new URL(s.url); return u.protocol === "https:" && Boolean(s.title && s.publisher); }
    catch { return false; }
  }), where + " source URLs or attribution missing.");
  assert(data.lead?.headline && data.lead?.summary && data.report?.title && data.report?.intro, where + " main reporting is incomplete.");
  assert(Array.isArray(data.report?.sections) && data.report.sections.length >= 5, where + " investigative sections missing.");
  const published = data.edition.publishedAt.slice(0, 10);
  const updated = data.edition.lastUpdatedAt.slice(0, 10);
  assert(html.includes('"datePublished": "' + published + '"'), "static NewsArticle datePublished differs from feed.");
  assert(html.includes('"dateModified": "' + updated + '"'), "static NewsArticle dateModified differs from feed.");
  assert(html.includes('datetime="' + published + '"'), "static date fallback differs from feed.");
  assert(html.includes(data.edition.displayDate), "static visible publication date differs from feed.");
  assert(html.includes(data.lead.headline), "static lead story fallback differs from feed.");
  assert(html.includes(data.report.title), "static report title differs from feed.");
  for (const m of [...html.matchAll(/<(?:a)\b[^>]*href="#([^"]+)"[^>]*data-(?:metric|story)-index=/g),
    ...html.matchAll(/<(?:a)\b[^>]*data-(?:metric|story)-index="[^"]+"[^>]*href="#([^"]+)"/g)]) {
    assert(html.includes('id="' + m[1] + '"'), "dashboard/story anchor #" + m[1] + " is broken.");
  }
  return { published, updated, edition: data.edition.number };
}

const baseline = checkEdition(local, "Repository");
console.log("Local AI Safety edition valid:", JSON.stringify(baseline));
if (mode === "local") process.exit(0);
assert(mode === "public", "Use local or public.");
const due = latestDueDate();
assert(baseline.published >= due, "Repository edition " + baseline.published + " is stale; expected " + due + " (Mon/Thu 06:00 Australia/Adelaide).");
async function get(url) {
  const response = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(15000) });
  assert(response.ok, "Public URL failed (" + response.status + "): " + url);
  return response;
}
const url = new URL(publicUrl);
assert(url.protocol === "https:", "Public URL must use HTTPS.");
const remoteFeed = new URL("data/latest.json?gate=" + Date.now(), url);
const remoteHtml = new URL("?gate=" + Date.now(), url);
const [feedResponse, pageResponse] = await Promise.all([get(remoteFeed), get(remoteHtml)]);
const remote = await feedResponse.json();
const page = await pageResponse.text();
checkEdition(remote, "Public");
assert(remote.edition.publishedAt === local.edition.publishedAt, "Public JSON date differs from approved repository feed.");
assert(remote.edition.number === local.edition.number, "Public JSON edition number differs from approved repository feed.");
assert(remote.lead.headline === local.lead.headline, "Public lead headline differs from approved repository feed.");
assert(page.includes('"datePublished": "' + baseline.published + '"'), "Public HTML metadata is out of sync.");
assert(page.includes(local.edition.displayDate), "Public HTML date fallback is out of sync.");
assert(page.includes(local.lead.headline), "Public HTML lead story fallback is out of sync.");
console.log("PASS: public AI Safety edition " + baseline.edition + " (" + baseline.published + ") matches verified repository content.");
console.log("Note: this tests publication and internal anchor references, NOT external source uptime or a separate Sites mirror.");
