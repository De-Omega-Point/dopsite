import "./platform.css";

const modules = [
  { code: "01", title: "Discover", copy: "Explore original De‑Omega‑Point products, tools and learning systems." },
  { code: "02", title: "My Library", copy: "Keep purchases, downloads, licences and future updates organised." },
  { code: "03", title: "Interactive Tools", copy: "Launch selected AI utilities and guided systems inside the platform." },
  { code: "04", title: "Updates", copy: "Receive improved editions and new releases without hunting through emails." },
];

export default function PlatformPage() {
  return (
    <main className="platform-page">
      <header className="platform-header">
        <a className="platform-brand" href="/" aria-label="Return to De-Omega-Point homepage">
          <span className="platform-mark"><img src="/assets/de-omega-point-logo.png" alt="" /></span>
          <span><strong>De‑Omega‑Point</strong><small>Digital Platform</small></span>
        </a>
        <nav aria-label="Platform navigation">
          <a className="active" href="#discover">Discover</a>
          <a href="#library">My Library</a>
          <a href="#tools">Tools</a>
          <a href="#updates">Updates</a>
        </nav>
        <div className="platform-header-actions"><a href="/admin">Admin login</a><a className="platform-exit" href="/">Company site <span aria-hidden="true">↗</span></a></div>
      </header>

      <section className="platform-hero" id="discover">
        <div className="platform-grid" aria-hidden="true" />
        <div className="platform-hero-copy">
          <p className="platform-kicker">Platform status / Early access</p>
          <h1>Your digital<br /><em>command centre.</em></h1>
          <p>
            Discover, purchase and use original De‑Omega‑Point digital products
            from one focused platform—built for human capability, not digital clutter.
          </p>
          <div className="platform-actions">
            <a className="platform-button" href="/#store">Browse products <span aria-hidden="true">↗</span></a>
            <a href="mailto:hello@de-omega-point.com?subject=De-Omega-Point%20platform%20early%20access">Request early access</a>
          </div>
        </div>
        <div className="platform-orbit" aria-hidden="true">
          <span className="ring ring-one" />
          <span className="ring ring-two" />
          <span className="platform-core"><img src="/assets/de-omega-point-logo.png" alt="" /></span>
          <span className="orbit-label label-one">Products</span>
          <span className="orbit-label label-two">Knowledge</span>
          <span className="orbit-label label-three">Tools</span>
        </div>
      </section>

      <section className="platform-workspace" aria-labelledby="workspace-title">
        <div className="workspace-heading">
          <div><p>Platform architecture / V1</p><h2 id="workspace-title">Everything you own.<br /><span>Ready when you are.</span></h2></div>
          <p>One account will connect the catalogue, your personal library, interactive products and every future update.</p>
        </div>
        <div className="module-grid">
          {modules.map((module, index) => (
            <article id={index === 1 ? "library" : index === 2 ? "tools" : index === 3 ? "updates" : undefined} key={module.code}>
              <span>{module.code} / MODULE</span>
              <strong>{module.title}</strong>
              <p>{module.copy}</p>
              <small>{index === 0 ? "OPEN" : "COMING SOON"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-cta">
        <p>First transmission</p>
        <h2>The platform opens<br />with our <em>first release.</em></h2>
        <p>Join the early-access list for founding prices and priority access.</p>
        <a className="platform-button" href="mailto:hello@de-omega-point.com?subject=Join%20De-Omega-Point%20platform">Join early access <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="platform-footer"><a href="/">De‑Omega‑Point</a><span>Human-value digital systems</span><span>© 2026</span></footer>
    </main>
  );
}
