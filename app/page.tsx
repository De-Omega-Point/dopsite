import ParticleField from "./ParticleField";

const projects = [
  {
    index: "01",
    label: "Human intelligence",
    title: "AI that strengthens people.",
    copy: "Human-controlled systems designed to expand capability, dignity and agency—not quietly replace them.",
  },
  {
    index: "02",
    label: "Earth systems",
    title: "Technology that earns its place.",
    copy: "Practical platforms for care, mobility, commerce and sustainable infrastructure, measured by real-world value.",
  },
  {
    index: "03",
    label: "Space frontier",
    title: "A future beyond one world.",
    copy: "Space technologies and intelligent systems that help humanity build a resilient, sustainable future among the stars.",
  },
];

const products = [
  {
    type: "Toolkit / Founders",
    title: "AI Proof-First Product Kit",
    copy: "A practical system for testing an AI product, finding its paid wedge and reaching evidence before expensive development.",
    status: "Launching soon",
  },
  {
    type: "Templates / Creators",
    title: "Future Systems Content Pack",
    copy: "Research prompts, visual frameworks and publishing templates for credible content across AI, space, robotics and quantum.",
    status: "In development",
  },
  {
    type: "Learning / Everyone",
    title: "Quantum From Zero",
    copy: "A plain-language micro-learning path that makes the mathematics and core ideas of quantum computing genuinely approachable.",
    status: "Coming soon",
  },
];

export default function Home() {
  return (
    <main>
      <ParticleField />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="De-Omega-Point home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/de-omega-point-logo.png" alt="" />
          </span>
          <span>De-Omega-Point</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="/ai-visibility">AI Visibility</a>
          <a href="#mission">Mission</a>
          <a href="#store">Store</a>
          <a href="#systems">Systems</a>
          <a href="#quantum">Quantum</a>
        </nav>
        <a className="nav-cta" href="/ai-visibility">Free AI check <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> Technology company + digital product platform</p>
          <h1 id="hero-title">
            Ideas for the future.<br />
            Tools for <em>right now.</em>
          </h1>
          <p className="hero-intro">
            De‑Omega‑Point builds human-value technology and sells original digital
            products that help founders, creators and curious minds turn future-facing
            ideas into useful action.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#store">Explore digital products <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#mission">Discover the company <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero-status" aria-label="Company focus">
          <span>Adelaide, Earth</span>
          <span className="signal">Signal active</span>
          <span>34.9285° S</span>
        </div>
        <p className="scroll-cue" aria-hidden="true">Scroll to initialise <span>↓</span></p>
      </section>

      <section className="flagship section-shell" aria-labelledby="flagship-title">
        <figure>
          <div className="flagship-image">
            <img
              src="/assets/de-omega-point-flagship.jpeg"
              alt="The De-Omega-Point flagship travelling through deep space"
              width="1536"
              height="1024"
            />
          </div>
          <figcaption>
            <div>
              <p className="kicker">The flagship / Human value in motion</p>
              <h2 id="flagship-title">Engineering humanity forward.</h2>
            </div>
            <p>
              A visual statement of the De‑Omega‑Point mission: ambitious technology,
              human intelligence at the centre, and a future built to carry people
              forward—not leave them behind.
            </p>
          </figcaption>
        </figure>
      </section>

      <section className="store" id="store" aria-labelledby="store-title">
        <div className="store-heading section-shell">
          <div>
            <p className="kicker">De‑Omega‑Point store / Original releases</p>
            <h2 id="store-title">Digital products built<br />for human <span>leverage.</span></h2>
          </div>
          <p>
            Practical tools, learning systems and creative assets made by us—not a
            crowded marketplace of random uploads. Every release must save time,
            sharpen thinking or increase capability.
          </p>
        </div>
        <div className="product-grid section-shell">
          {products.map((product, index) => (
            <article className="product-card" key={product.title}>
              <div className="product-meta"><span>0{index + 1}</span><span>{product.type}</span></div>
              <div className="product-glyph" aria-hidden="true">
                <img src="/assets/de-omega-point-logo.png" alt="" />
              </div>
              <div>
                <p className="product-status">{product.status}</p>
                <h3>{product.title}</h3>
                <p>{product.copy}</p>
                <a href="#contact" aria-label={`Register interest in ${product.title}`}>Register interest <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </div>
        <p className="store-note section-shell">First releases are being prepared now. Join the launch list for early access and founding prices.</p>
      </section>

      <section className="visibility-callout section-shell" aria-labelledby="visibility-title">
        <div>
          <p className="kicker">AI commerce / Australian SMBs</p>
          <h2 id="visibility-title">Is AI recommending you—or your competitors?</h2>
        </div>
        <div>
          <p>Run a practical check of the signals AI systems use to understand, compare and recommend your business. See the gaps before they become lost customers.</p>
          <a className="button primary" href="/ai-visibility">Run the free check <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="mission section-shell" id="mission" aria-labelledby="mission-title">
        <div className="section-index">00 / Mission</div>
        <div className="mission-main">
          <p className="kicker">The Omega directive</p>
          <h2 id="mission-title">
            Intelligence should not diminish humanity.<br />
            <span>It should help us become more human.</span>
          </h2>
          <div className="mission-copy">
            <p>
              De-Omega-Point sits at the intersection of artificial intelligence,
              human potential and space. We turn ambitious ideas into practical
              systems with measurable value today and compounding possibility tomorrow.
            </p>
            <p>
              Every system begins with one test: does this technology genuinely improve
              human agency, wellbeing and our long-term future?
            </p>
          </div>
        </div>
      </section>

      <section className="systems" id="systems" aria-labelledby="systems-title">
        <div className="systems-heading section-shell">
          <div>
            <p className="kicker">Three operating horizons</p>
            <h2 id="systems-title">From human need<br />to planetary scale.</h2>
          </div>
          <p className="systems-lede">
            One mission. Three connected horizons. Each creates value now while
            building capability for what comes next.
          </p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.index}>
              <div className="card-top">
                <span>{project.index}</span>
                <span>{project.label}</span>
              </div>
              <div className="card-orbit" aria-hidden="true">
                <span className="orbital-core">
                  <img src="/assets/de-omega-point-logo.png" alt="" />
                </span>
              </div>
              <div>
                <h3>{project.title}</h3>
                <p>{project.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="quantum" id="quantum" aria-labelledby="quantum-title">
        <div className="quantum-inner section-shell">
          <div className="quantum-copy">
            <p className="kicker">Quantum frontier / Q‑01</p>
            <h2 id="quantum-title">
              Where possibility<br />
              <span>becomes architecture.</span>
            </h2>
            <p className="quantum-lede">
              Quantum is not magic. It is probability, information and nature
              operating by deeper rules. De‑Omega‑Point explores how quantum
              computation, sensing and simulation could strengthen human
              intelligence and future space systems.
            </p>
            <p className="quantum-note">
              Our position is deliberate: learn rigorously, prototype honestly
              and pursue useful advantage—not quantum theatre.
            </p>
            <div className="quantum-domains" aria-label="Quantum exploration domains">
              <span>Computation</span>
              <span>Sensing</span>
              <span>Simulation</span>
            </div>
          </div>

          <div className="quantum-visual" aria-hidden="true">
            <div className="quantum-hud">
              <span>Q‑STATE</span>
              <span>COHERENCE / ACTIVE</span>
            </div>
            <div className="bloch-sphere">
              <span className="axis axis-x" />
              <span className="axis axis-y" />
              <span className="axis axis-z" />
              <span className="orbit orbit-a" />
              <span className="orbit orbit-b" />
              <span className="state-vector" />
              <span className="qubit-core">|ψ⟩</span>
              <span className="state-label state-zero">|0⟩</span>
              <span className="state-label state-one">|1⟩</span>
            </div>
            <div className="quantum-equation">
              |ψ⟩ = α|0⟩ + β|1⟩
            </div>
          </div>
        </div>
      </section>

      <section className="artifact section-shell" aria-labelledby="artifact-title">
        <div className="artifact-image">
          <img
            src="/assets/de-omega-command-ship.png"
            alt="The De-Omega-Point command ship in three-quarter view"
          />
          <span className="ship-designation" aria-hidden="true">DOP / COMMAND 01</span>
          <span className="corner top-left" aria-hidden="true" />
          <span className="corner top-right" aria-hidden="true" />
          <span className="corner bottom-left" aria-hidden="true" />
          <span className="corner bottom-right" aria-hidden="true" />
        </div>
        <div className="artifact-copy">
          <p className="kicker">Command vessel / 01</p>
          <h2 id="artifact-title">The flagship of<br /><span>the long horizon.</span></h2>
          <p>
            The De-Omega-Point command ship represents our operating philosophy:
            disciplined engineering, human intelligence at the centre and the
            courage to build beyond familiar orbit.
          </p>
          <div className="coordinate-row">
            <span>Origin / Adelaide</span>
            <span>Status / Mission ready</span>
          </div>
        </div>
      </section>

      <section className="principles section-shell" id="principles" aria-labelledby="principles-title">
        <div className="section-index">03 / Principles</div>
        <div>
          <p className="kicker">Our operating code</p>
          <h2 id="principles-title">Human value is not a feature.<br /><span>It is the architecture.</span></h2>
          <div className="principle-list">
            <div><strong>01</strong><h3>Human agency first</h3><p>People retain control, choice and meaningful participation.</p></div>
            <div><strong>02</strong><h3>Proof over spectacle</h3><p>Real outcomes, measurable utility and honest evidence.</p></div>
            <div><strong>03</strong><h3>Systems that compound</h3><p>Build reusable intelligence, infrastructure and capability.</p></div>
            <div><strong>04</strong><h3>Future generations count</h3><p>Optimise beyond the immediate transaction and the present moment.</p></div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="contact-orbit" aria-hidden="true">
          <img src="/assets/de-omega-point-logo.png" alt="" />
        </div>
        <p className="eyebrow"><span /> Transmission open</p>
        <h2 id="contact-title">The future needs<br /><em>builders.</em></h2>
        <p>
          Get early access to our first original digital products—or talk with us
          about building a consequential human-value system.
        </p>
        <a className="button primary" href="mailto:hello@de-omega-point.com?subject=De-Omega-Point%20early%20access">
          Join the launch list <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/de-omega-point-logo.png" alt="" />
          </span>
          <span>De-Omega-Point</span>
        </a>
        <p>Humanity is the mission.</p>
        <p>© 2026 De-Omega-Point</p>
      </footer>
    </main>
  );
}
