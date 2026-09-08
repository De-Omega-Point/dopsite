"use client";

import { useEffect, useRef } from "react";

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: -9999, y: -9999 };
    const particles = Array.from({ length: 190 }, () => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0007,
      vy: (Math.random() - .5) * .0007, r: Math.random() * 1.5 + .35,
    }));
    const streaks = Array.from({ length: 8 }, () => ({
      x: Math.random(), y: Math.random(), speed: Math.random() * .0012 + .0005,
      length: Math.random() * 90 + 55, opacity: Math.random() * .28 + .12,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    const leave = () => { pointer.x = -9999; pointer.y = -9999; };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const x = p.x * width, y = p.y * height;
        const dx = x - pointer.x, dy = y - pointer.y, dist = Math.hypot(dx, dy);
        if (dist < 150) { p.x += (dx / Math.max(dist, 1)) * .001; p.y += (dy / Math.max(dist, 1)) * .001; }
        ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0 ? "rgba(197,255,109,.9)" : "rgba(42,255,129,.55)"; ctx.fill();
        for (let j = i + 1; j < Math.min(i + 9, particles.length); j++) {
          const q = particles[j], qx = q.x * width, qy = q.y * height;
          const d = Math.hypot(x - qx, y - qy);
          if (d < 105) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(qx, qy); ctx.strokeStyle = `rgba(30,255,119,${(1-d/105)*.13})`; ctx.stroke(); }
        }
      }
      for (const streak of streaks) {
        streak.x += streak.speed; streak.y += streak.speed * .22;
        if (streak.x > 1.12 || streak.y > 1.08) { streak.x = -.12; streak.y = Math.random() * .8; }
        const x = streak.x * width, y = streak.y * height;
        const gradient = ctx.createLinearGradient(x - streak.length, y - streak.length * .22, x, y);
        gradient.addColorStop(0, "rgba(37,255,122,0)");
        gradient.addColorStop(1, `rgba(152,255,194,${streak.opacity})`);
        ctx.beginPath(); ctx.moveTo(x - streak.length, y - streak.length * .22); ctx.lineTo(x, y);
        ctx.strokeStyle = gradient; ctx.lineWidth = .75; ctx.stroke();
      }
      frame = requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener("resize", resize); window.addEventListener("pointermove", move); window.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); window.removeEventListener("pointerleave", leave); };
  }, []);
  return <canvas ref={canvasRef} className="particles" aria-hidden="true" />;
}

function InterfaceEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (event: PointerEvent) => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
      root.style.setProperty("--pointer-nx", `${event.clientX / innerWidth}`);
      root.style.setProperty("--pointer-ny", `${event.clientY / innerHeight}`);
      if (!reduced) {
        root.style.setProperty("--ship-x", `${((event.clientX / innerWidth) - .5) * -14}px`);
        root.style.setProperty("--ship-y", `${((event.clientY / innerHeight) - .5) * -10}px`);
      }
    };
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty("--scroll-progress", `${total > 0 ? (scrollY / total) * 100 : 0}%`);
    };
    const targets = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
    }, { threshold: .12 });
    targets.forEach((target) => reduced ? target.classList.add("is-visible") : observer.observe(target));
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => { observer.disconnect(); window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);
  return <><div className="scroll-progress"/><div className="cursor-aura"/><div className="hud-grid"/><div className="scan-beam"/><div className="edge-code edge-code-left">DΩP / HUMAN VALUE PROTOCOL / 34.9285°S</div><div className="edge-code edge-code-right">SIGNAL LOCKED / FORWARD ALWAYS / 2026</div></>;
}

function HyperspaceField() {
  return <div className="hyperspace-field" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index}/>)}</div>;
}

function Logo2Wordmark({ className = "" }: { className?: string }) {
  return <span className={`logo2-lockup ${className}`.trim()}><img src="/logo2-wordmark.png" alt="DE-OMEGA-POINT"/></span>;
}

export default function Home() {
  return (
    <main>
      <ParticleField />
      <InterfaceEffects />
      <div className="ambient" aria-hidden="true" />
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="De-Omega-Point home"><Logo2Wordmark className="nav-logo2"/><small>AUSTRALIA · EARTH</small></a>
        <div className="nav-links"><a href="#mission">Mission</a><a href="#flagship">Flagship</a><a href="#pillars">Systems</a></div>
        <a className="nav-cta" href="#signal">Join the mission <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <HyperspaceField />
        <div className="eyebrow"><span/> HUMAN VALUE · PLANETARY SCALE</div>
        <h1>Intelligence for<br/><strong>humanity’s next horizon.</strong></h1>
        <p className="hero-copy">We develop human-value-centric intelligence, research emerging technologies and shape responsible exploration concepts that solve real-world problems — helping humanity move towards a sustainable future among the stars.</p>
        <div className="hero-actions"><a className="primary" href="#mission">Explore the mission <span>↓</span></a><a className="text-link" href="#pillars">View our systems <span>→</span></a></div>
        <div className="fleet-scene">
          <img className="fleet-art" src="/de-omega-canonical-flagship-space.png" alt="The canonical De-Omega-Point flagship travelling through deep space" />
          <div className="fleet-tag"><img src="/brand-logo.png" alt=""/><span>DE–OMEGA–POINT FLAGSHIP<small><span className="dop-id dop-id-small">D<img src="/brand-logo.png" alt="Omega"/>P–01</span> · MISSION READY</small></span></div>
        </div>
        <div className="telemetry" aria-label="Mission telemetry"><div><span>ORIGIN</span><b>34.9285° S</b><small>Adelaide, Australia</small></div><div><span>OPERATING MODE</span><b className="online">● ACTIVE</b><small>Human-value protocol</small></div><div><span>TRAJECTORY</span><b>EARTH → BEYOND</b><small>Forward, always.</small></div></div>
      </section>

      <div className="mission-ticker" aria-hidden="true"><div><span>HUMAN VALUE FIRST</span><i>◆</i><span>INTELLIGENCE WITH PURPOSE</span><i>◆</i><span>PLANETARY STEWARDSHIP</span><i>◆</i><span>FORWARD, ALWAYS</span><i>◆</i><span>HUMAN VALUE FIRST</span><i>◆</i><span>INTELLIGENCE WITH PURPOSE</span><i>◆</i><span>PLANETARY STEWARDSHIP</span><i>◆</i><span>FORWARD, ALWAYS</span><i>◆</i></div></div>

      <section className="identity-signal shell reveal" aria-label="De-Omega-Point identity signal">
        <div className="identity-hud" aria-hidden="true"><i/><i/><i/><i/></div>
        <div className="identity-orbits" aria-hidden="true"><i/><i/><i/><b/><b/></div>
        <p><span>IDENTITY SIGNAL</span> · VERIFIED</p>
        <Logo2Wordmark className="identity-logo2"/>
        <div className="identity-meta"><span>HUMAN-VALUE FRONTIER TECHNOLOGY</span><span>ADELAIDE · AUSTRALIA · EARTH</span><span>SIGNAL DΩP–01</span></div>
        <div className="identity-sweep" aria-hidden="true"/>
      </section>

      <section className="flagship-showcase shell reveal" id="flagship">
        <img src="/de-omega-canonical-flagship-space.png" alt="Full view of the De-Omega-Point flagship with its Omega emblems and illuminated hangar" />
        <div className="holo-corners" aria-hidden="true"><i/><i/><i/><i/></div>
        <div className="target-reticle" aria-hidden="true"><span/><span/></div>
        <div className="flagship-panel">
          <p className="flagship-kicker">02 — THE FLAGSHIP</p>
          <h2><span className="dop-id">D<img src="/brand-logo.png" alt="Omega"/>P–01</span><br/><strong>Forward, always.</strong></h2>
          <p>Our command vessel embodies the De‑Omega‑Point mission: advanced human-centred systems, planetary stewardship and a responsible trajectory towards the stars.</p>
          <div className="flagship-status"><span><b>CLASS</b>OMEGA FLAGSHIP</span><span><b>STATUS</b>MISSION READY</span><span><b>ORIGIN</b>AUSTRALIA · EARTH</span></div>
        </div>
      </section>

      <section className="manifesto shell reveal" id="mission">
        <div className="mission-mark">
          <div className="section-index">01 — THE MISSION</div>
          <img className="mission-ship" src="/de-omega-point-ship.png" alt="A De-Omega-Point fleet vessel" />
        </div>
        <div><h2>Technology should not merely advance.<br/><strong>It should elevate.</strong></h2><p>De-Omega-Point exists at the convergence of artificial intelligence, human-centred innovation and a long-term vision for humanity. We research how emerging technologies can improve life on Earth and inform responsible exploration beyond it — with ethics embedded from the beginning, not added afterwards.</p></div>
      </section>

      <section className="pillars shell reveal" id="pillars">
        <article><span>01</span><div className="glyph">◉</div><h3>Human dignity<br/>& consent</h3><p>People remain the authors of their future. Agency, privacy and meaningful choice are first-order requirements.</p></article>
        <article><span>02</span><div className="glyph">⌁</div><h3>Intelligence<br/>with purpose</h3><p>AI is a multiplier. We direct it towards measurable human outcomes, real-world utility and shared prosperity.</p></article>
        <article><span>03</span><div className="glyph">△</div><h3>Earth to<br/>the stars</h3><p>Space is not an escape from Earth. It is a frontier for protecting it, understanding it and extending humanity responsibly.</p></article>
        <article><span>04</span><div className="glyph">∞</div><h3>Regenerative<br/>prosperity</h3><p>We design systems that compound knowledge, access and opportunity without extracting the future to fund the present.</p></article>
      </section>

      <section className="signal shell reveal" id="signal"><div className="signal-orbit"><i/><i/><img src="/brand-logo.png" alt=""/></div><p>THE SIGNAL IS CLEAR</p><h2>Build what humanity<br/><strong>deserves next.</strong></h2><a className="primary" href="mailto:mission@deomegapoint.com">Connect with De-Omega-Point <span>↗</span></a></section>
      <footer className="shell"><span>© 2026 DE–OMEGA–POINT</span><span>HUMAN VALUE · FORWARD, ALWAYS.</span><span>ADELAIDE, AUSTRALIA 🇦🇺</span></footer>
    </main>
  );
}
