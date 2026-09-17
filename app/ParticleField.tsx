"use client";

import { useEffect, useRef } from "react";

type Shape = "circle" | "diamond" | "square" | "spark";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  colour: string;
  shape: Shape;
  rotation: number;
  rotationSpeed: number;
};

const colours = [
  "85,255,47",
  "157,255,138",
  "231,255,226",
  "60,255,184",
  "96,210,255",
  "190,255,220",
];

const shapes: Shape[] = ["circle", "circle", "diamond", "square", "spark"];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -1000, y: -1000, active: false, energy: 0 };
    let particles: Particle[] = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const makeParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: 0.08 + Math.random() * 0.3,
      size: 0.7 + Math.random() * 2.8,
      alpha: 0.18 + Math.random() * 0.72,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.025,
      colour: colours[Math.floor(Math.random() * colours.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const density = width < 700 ? 7200 : 5600;
      const count = Math.min(210, Math.max(70, Math.round((width * height) / density)));
      particles = Array.from({ length: count }, makeParticle);
    };

    const drawShape = (particle: Particle, brightness: number) => {
      const size = particle.size * (1 + brightness * 0.55);
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);

      if (particle.shape === "circle") {
        context.beginPath();
        context.arc(0, 0, size, 0, Math.PI * 2);
        context.fill();
      } else if (particle.shape === "diamond") {
        context.beginPath();
        context.moveTo(0, -size * 1.5);
        context.lineTo(size, 0);
        context.lineTo(0, size * 1.5);
        context.lineTo(-size, 0);
        context.closePath();
        context.fill();
      } else if (particle.shape === "square") {
        context.fillRect(-size, -size, size * 2, size * 2);
      } else {
        context.fillRect(-size * 2.3, -0.45, size * 4.6, 0.9);
        context.fillRect(-0.45, -size * 2.3, 0.9, size * 4.6);
      }
      context.restore();
    };

    const render = () => {
      context.clearRect(0, 0, width, height);
      pointer.energy *= 0.94;

      if (pointer.active) {
        const radius = 130 + pointer.energy * 145;
        const glow = context.createRadialGradient(
          pointer.x, pointer.y, 0, pointer.x, pointer.y, radius,
        );
        glow.addColorStop(0, `rgba(157,255,138,${0.11 + pointer.energy * 0.17})`);
        glow.addColorStop(0.34, `rgba(60,255,184,${0.06 + pointer.energy * 0.1})`);
        glow.addColorStop(1, "rgba(2,4,3,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = `rgba(157,255,138,${pointer.energy * 0.24})`;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 38 + pointer.energy * 72, 0, Math.PI * 2);
        context.stroke();
      }

      for (const particle of particles) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const withinField = pointer.active && distance < 285;
        const influence = withinField ? 1 - distance / 285 : 0;

        if (!reduceMotion) {
          particle.pulse += particle.pulseSpeed;
          particle.rotation += particle.rotationSpeed;

          if (withinField && distance > 0) {
            const force = influence * (0.035 + pointer.energy * 0.075);
            const swirl = influence * (0.018 + pointer.energy * 0.035);
            particle.vx -= (dx / distance) * force + (dy / distance) * swirl;
            particle.vy -= (dy / distance) * force - (dx / distance) * swirl;
          }

          particle.vx *= 0.985;
          particle.vy = particle.vy * 0.988 + 0.002;
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.y > height + 12) particle.y = -12;
          if (particle.x > width + 12) particle.x = -12;
          if (particle.x < -12) particle.x = width + 12;
        }

        const shimmer = 0.68 + Math.sin(particle.pulse) * 0.32;
        const opacity = Math.min(1, particle.alpha * shimmer + influence * 0.78);

        context.fillStyle = `rgba(${particle.colour},${opacity})`;
        context.shadowColor = `rgba(${particle.colour},${0.35 + influence * 0.65})`;
        context.shadowBlur = particle.size * 2 + influence * (18 + pointer.energy * 18);
        drawShape(particle, influence * (1.25 + pointer.energy));

        if (withinField && distance < 210) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(pointer.x, pointer.y);
          context.strokeStyle = `rgba(${particle.colour},${influence * (0.12 + pointer.energy * 0.22)})`;
          context.lineWidth = 0.75;
          context.stroke();
        }
      }

      context.shadowBlur = 0;
      if (!reduceMotion) animationFrame = requestAnimationFrame(render);
    };

    let previousX = -1000;
    let previousY = -1000;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = event.pointerType !== "touch";
      if (previousX > -900) {
        const speed = Math.hypot(event.clientX - previousX, event.clientY - previousY);
        pointer.energy = Math.min(1, pointer.energy + speed / 72);
      }
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-particles" aria-hidden="true" />;
}
