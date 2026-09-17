"use client";

import { FormEvent, useMemo, useState } from "react";
import "./visibility.css";

type Finding = { label: string; passed: boolean; weight: number; detail: string };
type ScanResult = {
  business: {
    name: string;
    url: string;
    score: number;
    findings: Finding[];
    dimensions: { understanding: number; trust: number; commerce: number; conversion: number };
  };
  competitors: Array<{ name: string; url: string; score: number | null }>;
  queryPack: string[];
  measuredAt: string;
};

const levels = [
  { min: 75, label: "Agent-ready foundation", copy: "Your core signals are strong. The next move is controlled recommendation testing and conversion optimisation." },
  { min: 50, label: "Visible, but leaking", copy: "AI can understand parts of the business, but important gaps may send recommendations elsewhere." },
  { min: 0, label: "Hard for AI to trust", copy: "Critical identity, offer or conversion signals are missing or difficult for machines to interpret." },
];

export default function AIVisibilityPage() {
  const [businessUrl, setBusinessUrl] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("Adelaide, SA");
  const [competitors, setCompetitors] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [leadState, setLeadState] = useState<"idle" | "sending" | "sent">("idle");

  const level = useMemo(() => result ? levels.find((item) => result.business.score >= item.min)! : levels[2], [result]);

  async function runScan(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/ai-visibility", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessUrl,
          category,
          location,
          competitors: competitors.split(/,|\n/).map((item) => item.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The scan could not be completed.");
      setResult(data);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "The scan could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  async function requestAudit(event: FormEvent) {
    event.preventDefault();
    if (!result) return;
    setLeadState("sending");
    setError("");
    try {
      const response = await fetch("/api/ai-visibility", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "lead", email, businessUrl, businessName: result.business.name, category, location, score: result.business.score }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not save your request.");
      setLeadState("sent");
    } catch (leadError) {
      setError(leadError instanceof Error ? leadError.message : "We could not save your request.");
      setLeadState("idle");
    }
  }

  return (
    <main className="visibility-page">
      <header className="visibility-header">
        <a className="visibility-brand" href="/" aria-label="De-Omega-Point home">
          <span><img src="/assets/de-omega-point-logo.png" alt="" /></span>
          <strong>De‑Omega‑Point</strong>
        </a>
        <p>AI Visibility Lab <span>Beta</span></p>
        <a href="/">Company site ↗</a>
      </header>

      <section className="scan-shell" aria-labelledby="scan-title">
        <div className="scan-intro">
          <p className="scan-kicker">Australian SMB diagnostic / Live website scan</p>
          <h1 id="scan-title">Will AI choose<br /><em>your business?</em></h1>
          <p>Check whether your website gives AI systems enough evidence to understand, trust and recommend you. The scan uses measurable site signals—not invented rankings.</p>
          <div className="trust-strip"><span>Live signals</span><span>Competitor check</span><span>Action plan</span></div>
        </div>

        <form className="scan-form" onSubmit={runScan}>
          <div className="form-status"><span>Free diagnostic</span><span>About 20 seconds</span></div>
          <label>Business website<input type="text" inputMode="url" placeholder="yourbusiness.com.au" value={businessUrl} onChange={(e) => setBusinessUrl(e.target.value)} required /></label>
          <div className="field-row">
            <label>Business category<input type="text" placeholder="e.g. running shoe store" value={category} onChange={(e) => setCategory(e.target.value)} required /></label>
            <label>Location<input type="text" placeholder="Adelaide, SA" value={location} onChange={(e) => setLocation(e.target.value)} required /></label>
          </div>
          <label>Competitor websites <small>Optional · up to 3, separated by commas</small><textarea rows={3} placeholder="competitor-one.com.au, competitor-two.com.au" value={competitors} onChange={(e) => setCompetitors(e.target.value)} /></label>
          <button type="submit" disabled={loading}>{loading ? "Scanning live signals…" : "Run my AI visibility check"}<span aria-hidden="true">↗</span></button>
          <p className="form-note">We inspect public website signals only. No passwords, accounts or private data.</p>
          {error && <p className="scan-error" role="alert">{error}</p>}
        </form>
      </section>

      {result && (
        <section className="results-shell" id="results" aria-live="polite">
          <div className="results-heading">
            <div><p className="scan-kicker">Measured result / {result.business.name}</p><h2>Your AI commerce<br />readiness baseline.</h2></div>
            <p>Scanned {new Date(result.measuredAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>

          <div className="score-grid">
            <article className="main-score">
              <div className="score-orbit" style={{ "--score": `${result.business.score * 3.6}deg` } as React.CSSProperties}>
                <strong>{result.business.score}</strong><span>/ 100</span>
              </div>
              <div><p>AI commerce readiness</p><h3>{level.label}</h3><span>{level.copy}</span></div>
            </article>
            {Object.entries(result.business.dimensions).map(([name, score]) => (
              <article className="dimension" key={name}><div><span>{name}</span><strong>{score}</strong></div><div className="meter"><i style={{ width: `${score}%` }} /></div></article>
            ))}
          </div>

          <div className="evidence-grid">
            <article className="evidence-card">
              <div className="card-heading"><h3>Verified signals</h3><span>{result.business.findings.filter((f) => f.passed).length} / {result.business.findings.length} passed</span></div>
              <div className="finding-list">
                {result.business.findings.map((finding) => <div key={finding.label} className={finding.passed ? "pass" : "gap"}><b>{finding.passed ? "✓" : "!"}</b><span><strong>{finding.label}</strong><small>{finding.detail}</small></span><em>+{finding.weight}</em></div>)}
              </div>
            </article>

            <div className="right-stack">
              <article className="competitor-card">
                <div className="card-heading"><h3>Competitor readiness</h3><span>Website signals</span></div>
                <div className="comparison-row you"><span>You</span><i><b style={{ width: `${result.business.score}%` }} /></i><strong>{result.business.score}</strong></div>
                {result.competitors.length ? result.competitors.map((item) => <div className="comparison-row" key={item.name}><span>{item.name.slice(0, 24)}</span><i><b style={{ width: `${item.score ?? 0}%` }} /></i><strong>{item.score ?? "—"}</strong></div>) : <p className="empty-copy">Add competitor websites in a new scan to compare technical readiness.</p>}
                <p className="method-note">This compares observable website readiness. It does not claim to measure live AI recommendation share.</p>
              </article>
              <article className="query-card"><div className="card-heading"><h3>Your buying-intent query pack</h3><span>Full audit input</span></div>{result.queryPack.map((query, index) => <p key={query}><span>0{index + 1}</span>{query}</p>)}</article>
            </div>
          </div>

          <section className="audit-cta">
            <div><p className="scan-kicker">Next layer / Controlled AI testing</p><h2>Website-ready is not the same as <em>being recommended.</em></h2><p>A full benchmark tests your business and competitors across commercial-intent prompts, records mention frequency and recommendation context, then turns the gaps into a ranked fix plan.</p></div>
            {leadState === "sent" ? <div className="success-box"><strong>Request received.</strong><p>We’ll use this baseline to prepare the next-step benchmark.</p></div> : <form onSubmit={requestAudit}><label>Email for the benchmark plan<input type="email" placeholder="you@business.com.au" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><button type="submit" disabled={leadState === "sending"}>{leadState === "sending" ? "Saving…" : "Request the full benchmark"}<span>↗</span></button><small>Founding audit from A$249 · no subscription required</small></form>}
          </section>

          <div className="methodology"><strong>What this score means</strong><p>The free score is a De‑Omega‑Point readiness benchmark based on public website signals. It is not a Google score and does not impersonate live results from Google AI Mode, Gemini or another AI platform. Live AI Share of Voice requires controlled prompt testing and, where authorised, platform data.</p></div>
        </section>
      )}

      <footer className="visibility-footer"><a href="/">De‑Omega‑Point</a><span>Human-value intelligence</span><span>Adelaide, Australia</span></footer>
    </main>
  );
}
