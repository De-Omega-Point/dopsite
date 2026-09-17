import { spawn } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const basePath = "/dopsite";
const fullApplication = "https://de-omega-point.sammielee.chatgpt.site";
const assetsDirectory = path.join(projectRoot, "assets");
const serverUrl = "http://127.0.0.1:3000";

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${serverUrl}/`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("The production server did not start in time.");
}

function rewriteHtml(html) {
  return html
    .replace(/<meta name="codex-preview"[^>]*>/g, "")
    .replaceAll("/assets/", `${basePath}/assets/`)
    .replaceAll("/workspace/sites/de-omega-point/.vinext/fonts/geist-8ac0455e797f/", `${basePath}/assets/fonts/`)
    .replaceAll("/workspace/sites/de-omega-point/.vinext/fonts/geist-mono-00e989178794/", `${basePath}/assets/fonts/`)
    .replaceAll('href="/ai-visibility"', `href="${fullApplication}/ai-visibility"`)
    .replaceAll('href="/admin"', `href="${fullApplication}/admin"`)
    .replaceAll('href="/platform"', `href="${basePath}/platform/"`)
    .replaceAll('href="/#', `href="${basePath}/#`)
    .replaceAll('href="/"', `href="${basePath}/"`);
}

async function exportRoute(route, outputPath) {
  const response = await fetch(`${serverUrl}${route}`);
  if (!response.ok) {
    throw new Error(`Could not render ${route}: HTTP ${response.status}`);
  }
  const html = rewriteHtml(await response.text());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

async function copyFonts(sourceDirectory) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    if (entry.isDirectory()) {
      await copyFonts(sourcePath);
    } else if (entry.name.endsWith(".woff2")) {
      await cp(sourcePath, path.join(assetsDirectory, "fonts", entry.name));
    }
  }
}

await rm(assetsDirectory, { recursive: true, force: true });
await rm(path.join(projectRoot, "platform"), { recursive: true, force: true });
await cp(path.join(projectRoot, "dist", "client", "assets"), assetsDirectory, { recursive: true });
await mkdir(path.join(assetsDirectory, "fonts"), { recursive: true });
await copyFonts(path.join(projectRoot, ".vinext", "fonts"));

const server = spawn(path.join(projectRoot, "node_modules", ".bin", "vinext"), ["start"], {
  cwd: projectRoot,
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk; });
server.stderr.on("data", (chunk) => { serverLog += chunk; });

try {
  await waitForServer();
  await exportRoute("/", path.join(projectRoot, "index.html"));
  await exportRoute("/platform", path.join(projectRoot, "platform", "index.html"));
  await cp(path.join(projectRoot, "index.html"), path.join(projectRoot, "404.html"));
  await writeFile(path.join(projectRoot, ".nojekyll"), "");

  const homepage = await readFile(path.join(projectRoot, "index.html"), "utf8");
  if (!homepage.includes("De-Omega-Point | Engineering Humanity Forward")) {
    throw new Error("The exported homepage is not the De-Omega-Point site.");
  }
} catch (error) {
  if (serverLog) process.stderr.write(serverLog);
  throw error;
} finally {
  server.kill("SIGTERM");
}

console.log("GitHub Pages export created successfully.");
