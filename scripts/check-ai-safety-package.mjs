#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';

const text = value => typeof value === 'string' && value.trim().length > 0;
const ok = (condition, message) => { if (!condition) throw new Error(message); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const roles = ['report', 'linkedinArticle', 'banner', 'infographic', 'whitePaper', 'podcastSynthesis'];

export function checkFeed(feed, expectedEdition) {
  ok(Number.isInteger(expectedEdition) && expectedEdition > 0 && feed?.edition?.number === expectedEdition, 'Wrong or missing edition');
  for (const key of ['outlook','report','lead','voices','incidents','investigativeSummary','reportRail','focusAreas','roboticsAssessment','humanAgencyTracker','methodology']) {
    const value = feed[key];
    const valid = key === 'investigativeSummary' ? text(value) :
      ['voices','incidents'].includes(key) ? Array.isArray(value) :
      value && typeof value === 'object' && Object.keys(value).length > 0;
    ok(valid, 'Missing or empty feed field: ' + key);
  }
  ok(!/candidate|draft|not published|not validated/i.test(feed.editorialStatus ?? ''), 'Draft feed cannot be released');
  ok(feed.report.sections?.length >= 5, 'Missing investigative report sections');
  const ledger = new Set(feed.sources?.map(source => source.id));
  for (const section of feed.report.sections) {
    ok(section.sourceIds?.length && section.sourceIds.every(id => ledger.has(id)), 'Incomplete report section source mapping');
  }
}

export async function checkPacket(path) {
  const root = await realpath(dirname(path));
  const inside = async name => {
    ok(text(name) && !isAbsolute(name), 'Artifact path must be relative');
    const resolved = await realpath(resolve(root,name));
    const rel = relative(root,resolved);
    ok(rel && rel !== '..' && !rel.startsWith('../') && !isAbsolute(rel), 'Artifact outside packet');
    return resolved;
  };
  const packet = JSON.parse(await readFile(path,'utf8'));
  ok(packet.review?.editorial === 'passed' && packet.review?.visualBrand === 'passed', 'Editorial and brand reviews required');
  const feedBytes = await readFile(await inside(packet.feed));
  checkFeed(JSON.parse(feedBytes), packet.edition);
  ok(Array.isArray(packet.artifacts) && packet.artifacts.length === roles.length, 'Incomplete artifact manifest');
  const files = new Set(), digests = new Set();
  for (const role of roles) {
    const entries = packet.artifacts.filter(entry => entry.role === role);
    ok(entries.length === 1, 'Expected one artifact: ' + role);
    const artifact = entries[0];
    const file = await inside(artifact.file);
    const bytes = await readFile(file);
    const sha = hash(bytes);
    ok(bytes.length > 0 && sha === artifact.sha256 && !files.has(file) && !digests.has(sha), 'Empty, altered or duplicated artifact: ' + role);
    if (role === 'banner' || role === 'infographic') {
      ok(bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) &&
        bytes.length >= 33 && bytes.toString('ascii',12,16) === 'IHDR' &&
        bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0, 'Expected a PNG visual: ' + role);
    }
    files.add(file);
    digests.add(sha);
  }
  return { edition: packet.edition, feedSha256: hash(feedBytes), packageChecked: true, publicationVerified: false };
}

const targets = [
  'https://de-omega-point.com/ai-safety/',
  'https://dop-ai-safety-observatory.sammielee.chatgpt.site/'
];

export async function verifyLive(path, packetResult, request = fetch) {
  const packet = JSON.parse(await readFile(path, 'utf8'));
  const bytes = await readFile(resolve(dirname(path), packet.feed));
  ok(hash(bytes) === packetResult.feedSha256, 'Approved feed changed during verification');
  const approved = JSON.parse(bytes);
  const date = approved.edition.publishedAt?.slice(0,10);
  ok(/^\d{4}-\d{2}-\d{2}$/.test(date ?? ''), 'Missing publication date');
  const receipts = await Promise.all(targets.map(async target => {
    const read = async suffix => {
      const url = new URL(suffix + '?preflight=' + Date.now(),target);
      const response = await request(url, { cache:'no-store', redirect:'error', signal:AbortSignal.timeout(15000) });
      ok(response.ok, 'Destination unavailable: ' + target);
      return response;
    };
    const [json, html] = await Promise.all([read('data/latest.json'), read('')]);
    const remote = await json.json();
    ok(isDeepStrictEqual(remote, approved), 'Destination feed does not match approved edition: ' + target);
    const page = await html.text();
    ok(page.includes(approved.edition.displayDate) && page.includes('"datePublished": "' + date + '"'),
      'Destination HTML does not match approved publication date: ' + target);
    return { target, edition:packetResult.edition, verifiedAt:new Date().toISOString(), feedSha256:packetResult.feedSha256 };
  }));
  return {...packetResult, publicationVerified:true, receipts};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [, , path, mode] = process.argv;
    ok(path && (mode === undefined || mode === '--verify-live') && process.argv.length <= 4, 'Usage: node scripts/check-ai-safety-package.mjs path/to/manifest.json [--verify-live]');
    const result = await checkPacket(path);
    console.log(JSON.stringify(mode ? await verifyLive(path, result) : result));
  } catch (error) {
    console.error('AI Safety package preflight failed: ' + error.message);
    process.exitCode = 1;
  }
}
