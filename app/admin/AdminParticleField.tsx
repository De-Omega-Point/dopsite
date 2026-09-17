"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number; y: number; vx: number; vy: number; size: number;
  alpha: number; colour: string; phase: number; depth: number;
};

const earthSpaceColours = [
  "245,240,228", "215,198,163", "154,173,123",
  "184,117,79", "111,143,97", "198,218,199",
];

export default function AdminParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -999, y: -999, active: false, energy: 0 };
    let stars: Star[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;

    const makeStar = (): Star => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .16,
      vy: (Math.random() - .5) * .12,
      size: .7 + Math.random() * 2.6,
      alpha: .2 + Math.random() * .65,
      colour: earthSpaceColours[Math.floor(Math.random() * earthSpaceColours.length)],
      phase: Math.random() * Math.PI * 2,
      depth: .35 + Math.random() * .9,
    });

    const resize = () => {
      width = innerWidth; height = innerHeight;
      ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(230, Math.max(90, Math.round(width * height / 5200)));
      stars = Array.from({ length: count }, makeStar);
    };

    const render = (time = 0) => {
      context.clearRect(0, 0, width, height);
      pointer.energy *= .94;

      if (pointer.active) {
        const radius = 105 + pointer.energy * 85;
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        glow.addColorStop(0, `rgba(215,198,163,${.14 + pointer.energy * .14})`);
        glow.addColorStop(.35, `rgba(111,143,97,${.08 + pointer.energy * .08})`);
        glow.addColorStop(1, "rgba(23,42,34,0)");
        context.fillStyle = glow;
        context.beginPath(); context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2); context.fill();
      }

      for (const star of stars) {
        star.phase += .012 * star.depth;
        const dx = pointer.x - star.x;
        const dy = pointer.y - star.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const influence = pointer.active && distance < 260 ? 1 - distance / 260 : 0;

        if (!reducedMotion) {
          if (influence > 0) {
            const pull = influence * (.018 + pointer.energy * .038);
            const swirl = influence * .018;
            star.vx += dx / distance * pull - dy / distance * swirl;
            star.vy += dy / distance * pull + dx / distance * swirl;
          }
          star.vx *= .978; star.vy *= .978;
          star.x += star.vx * star.depth; star.y += star.vy * star.depth;
          if (star.x < -20) star.x = width + 20;
          if (star.x > width + 20) star.x = -20;
          if (star.y < -20) star.y = height + 20;
          if (star.y > height + 20) star.y = -20;
        }

        const pulse = .72 + Math.sin(star.phase + time * .0008) * .28;
        const alpha = Math.min(1, star.alpha * pulse + influence * .7);
        const size = star.size * (1 + influence * 2.2 + pointer.energy * influence);
        context.fillStyle = `rgba(${star.colour},${alpha})`;
        context.shadowColor = `rgba(${star.colour},${.35 + influence * .65})`;
        context.shadowBlur = 3 + influence * 22;
        context.beginPath(); context.arc(star.x, star.y, size, 0, Math.PI * 2); context.fill();

        if (influence > .28) {
          context.strokeStyle = `rgba(${star.colour},${influence * .28})`;
          context.lineWidth = .7;
          context.beginPath(); context.moveTo(star.x, star.y); context.lineTo(pointer.x, pointer.y); context.stroke();
        }
      }

      context.shadowBlur = 0;
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };

    let lastX = -999, lastY = -999;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const speed = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true;
      pointer.energy = Math.min(1, pointer.energy + speed / 80);
      lastX = event.clientX; lastY = event.clientY;
    };
    const leave = () => { pointer.active = false; };

    resize(); render();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="admin-particle-field" aria-hidden="true" />;
}
