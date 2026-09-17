type Finding = { label: string; passed: boolean; weight: number; detail: string };
type Scan = {
  name: string;
  url: string;
  score: number;
  findings: Finding[];
  dimensions: { understanding: number; trust: number; commerce: number; conversion: number };
};

const blockedHost = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

function safeUrl(input: string) {
  const value = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol) || blockedHost.test(parsed.hostname) || parsed.hostname.endsWith(".local")) {
    throw new Error("Use a public business website URL.");
  }
  parsed.hash = "";
  return parsed;
}

function has(html: string, pattern: RegExp) { return pattern.test(html); }

async function fetchText(url: URL) {
  const response = await fetch(url.toString(), { redirect: "follow" });
  if (!response.ok) throw new Error(`Website returned ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("xml")) {
    throw new Error("Website did not return a readable page.");
  }
  return (await response.text()).slice(0, 1_000_000);
}

async function scanSite(rawUrl: string, nameHint = "Business"): Promise<Scan> {
  const url = safeUrl(rawUrl);
  const html = await fetchText(url);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  const jsonLd = has(html, /application\/ld\+json/i);
  const localEntity = has(html, /LocalBusiness|Organization|Corporation|Store|Restaurant|ProfessionalService/i);
  const product = has(html, /Product|Offer|priceCurrency|availability|itemprop=["']price/i);
  const metaDescription = has(html, /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{45,}/i) || has(html, /<meta[^>]+content=["'][^"']{45,}["'][^>]+name=["']description["']/i);
  const contact = has(html, /mailto:|tel:|contact/i);
  const trust = has(html, /review|testimonial|rating|case stud|ABN|privacy policy/i);
  const conversion = has(html, /add to cart|buy now|book now|get a quote|request a quote|checkout|shop now|order online/i);
  const location = has(html, /address|streetAddress|postalCode|openingHours|Adelaide|South Australia|\bSA\b/i);
  const social = has(html, /facebook\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com/i);
  const [robots, sitemap] = await Promise.allSettled([
    fetchText(new URL("/robots.txt", url)),
    fetchText(new URL("/sitemap.xml", url)),
  ]);

  const findings: Finding[] = [
    { label: "Clear page title", passed: Boolean(title && title.length >= 12), weight: 8, detail: title ? `Found: ${title.slice(0, 80)}` : "No useful title found" },
    { label: "Useful meta description", passed: metaDescription, weight: 8, detail: metaDescription ? "Description is available to search and AI systems" : "Add a specific 120–160 character description" },
    { label: "Machine-readable structured data", passed: jsonLd, weight: 16, detail: jsonLd ? "JSON-LD is present" : "No JSON-LD structured data detected" },
    { label: "Business identity signals", passed: localEntity, weight: 14, detail: localEntity ? "Organisation or local-business entity detected" : "Business type and identity are not explicit in markup" },
    { label: "Products, offers or services", passed: product, weight: 14, detail: product ? "Commercial attributes are machine-readable" : "Price, availability or offer data is weak or missing" },
    { label: "Location and service-area clarity", passed: location, weight: 10, detail: location ? "Location signals detected" : "Make address, suburb and service area explicit" },
    { label: "Trust and reputation evidence", passed: trust || social, weight: 10, detail: trust || social ? "Trust or reputation evidence detected" : "Reviews, credentials and proof are difficult to find" },
    { label: "Conversion path", passed: conversion && contact, weight: 12, detail: conversion && contact ? "A clear next step and contact route are present" : "The next commercial action is unclear" },
    { label: "Crawler access", passed: robots.status === "fulfilled", weight: 4, detail: robots.status === "fulfilled" ? "robots.txt is reachable" : "robots.txt was not readable" },
    { label: "Sitemap discovery", passed: sitemap.status === "fulfilled", weight: 4, detail: sitemap.status === "fulfilled" ? "sitemap.xml is reachable" : "sitemap.xml was not found at the standard address" },
  ];
  const score = findings.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0);
  const pct = (labels: string[]) => {
    const selected = findings.filter((f) => labels.includes(f.label));
    const total = selected.reduce((sum, f) => sum + f.weight, 0);
    return Math.round(selected.reduce((sum, f) => sum + (f.passed ? f.weight : 0), 0) / total * 100);
  };
  return {
    name: title?.split(/[|–—-]/)[0]?.trim() || nameHint,
    url: url.origin,
    score,
    findings,
    dimensions: {
      understanding: pct(["Clear page title", "Useful meta description", "Machine-readable structured data", "Business identity signals"]),
      trust: pct(["Location and service-area clarity", "Trust and reputation evidence"]),
      commerce: pct(["Products, offers or services", "Crawler access", "Sitemap discovery"]),
      conversion: pct(["Conversion path"]),
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.action === "lead") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
      const { env } = await import("cloudflare:workers");
      await env.DB.prepare("INSERT INTO visibility_leads (email, business_url, business_name, category, location, score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(email, String(body.businessUrl ?? ""), String(body.businessName ?? ""), String(body.category ?? ""), String(body.location ?? ""), Number(body.score ?? 0), Math.floor(Date.now() / 1000)).run();
      return Response.json({ ok: true });
    }

    const businessUrl = String(body.businessUrl ?? "").trim();
    const category = String(body.category ?? "").trim();
    const location = String(body.location ?? "").trim();
    const competitors = Array.isArray(body.competitors) ? body.competitors.map(String).map((v) => v.trim()).filter(Boolean).slice(0, 3) : [];
    if (!businessUrl || !category || !location) return Response.json({ error: "Website, category and location are required." }, { status: 400 });

    const business = await scanSite(businessUrl);
    const competitorResults = await Promise.all(competitors.map(async (entry) => {
      try { return await scanSite(entry, entry); } catch { return { name: entry, url: entry, score: null }; }
    }));
    const queryPack = [
      `Best ${category} in ${location}`,
      `${category} near me with strong reviews`,
      `Which ${category} in ${location} should I choose?`,
      `Compare local ${category} options in ${location}`,
      `Recommended ${category} in ${location}`,
    ];
    return Response.json({ business, competitors: competitorResults, queryPack, measuredAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
