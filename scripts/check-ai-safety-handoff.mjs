#!/usr/bin/env node
// Read-only acceptance for a reopened editorial packet and a prepared site payload.
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { checkPacket } from './check-ai-safety-package.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const requireCheck = (condition, message) => {
  if (!condition) throw new Error(message);
};
async function file(path) {
  requireCheck((await lstat(path)).isFile(), 'Expected regular file: ' + path);
  return readFile(path);
}
async function inventory(dir, prefix = '') {
  requireCheck((await lstat(dir)).isDirectory(), 'Expected regular directory: ' + dir);
  const entries = (await readdir(dir, { withFileTypes: true }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    const name = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await inventory(path, name + '/'));
    else {
      const bytes = await file(path);
      files.push({ path: name, bytes: bytes.length, sha256: hash(bytes) });
    }
  }
  return files;
}
function instant(value, label) {
  requireCheck(typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value)), 'Missing or invalid ' + label);
  return Date.parse(value);
}

export async function checkHandoff({ editorialDir, preparedDir, expectedEdition, expectedScheduledFor }) {
  requireCheck(Number.isInteger(expectedEdition) && expectedEdition > 0, 'Supply expected edition');
  const scheduled = instant(expectedScheduledFor, 'expected scheduled occurrence');
  const editorialRoot = resolve(editorialDir);
  const preparedRoot = resolve(preparedDir);
  requireCheck(editorialRoot !== preparedRoot, 'Editorial and site directories must be distinct');
  const approved = await checkPacket(join(editorialRoot, 'release-manifest.json'));
  requireCheck(approved.edition === expectedEdition, 'Editorial edition differs from expected edition');
  const siteManifest = JSON.parse(await file(join(preparedRoot, 'release-manifest.json')));
  requireCheck(siteManifest.schemaVersion === 1 && siteManifest.kind === 'prepared-not-published',
    'Wrong prepared site manifest type');
  const siteRoot = join(preparedRoot, 'site');
  const files = await inventory(siteRoot);
  requireCheck(isDeepStrictEqual(files, siteManifest.files) &&
    hash(JSON.stringify(files)) === siteManifest.payloadSha256, 'Prepared site inventory does not match disk');
  const feedEntry = files.find(entry => entry.path === 'data/latest.json');
  requireCheck(feedEntry?.sha256 === approved.feedSha256, 'Prepared feed differs from approved editorial feed');
  const feed = JSON.parse(await file(join(siteRoot, 'data', 'latest.json')));
  requireCheck(isDeepStrictEqual(feed.edition, siteManifest.edition) && feed.edition.number === expectedEdition,
    'Prepared site metadata differs from the verified edition');
  requireCheck(instant(feed.edition.scheduledFor, 'feed scheduled occurrence') === scheduled,
    'Feed belongs to a different scheduled occurrence');
  const website = await file(join(editorialRoot, 'website.html'));
  requireCheck(files.find(entry => entry.path === 'index.html')?.sha256 === hash(website),
    'Prepared HTML differs from the reopened editorial fallback');
  return { edition: approved.edition, scheduledFor: new Date(scheduled).toISOString(),
    feedSha256: approved.feedSha256, htmlSha256: hash(website),
    payloadSha256: siteManifest.payloadSha256, handoffChecked: true, publicationVerified: false };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const [editorialDir, preparedDir, edition, expectedScheduledFor, ...extra] = process.argv.slice(2);
    requireCheck(editorialDir && preparedDir && edition && expectedScheduledFor && extra.length === 0,
      'Usage: node scripts/check-ai-safety-handoff.mjs <reopened-editorial-dir> <prepared-site-dir> <edition> <scheduledFor-with-offset>');
    console.log(JSON.stringify(await checkHandoff({ editorialDir, preparedDir,
      expectedEdition: Number(edition), expectedScheduledFor })));
  } catch (error) {
    console.error('AI Safety handoff blocked: ' + error.message);
    process.exitCode = 1;
  }
}
