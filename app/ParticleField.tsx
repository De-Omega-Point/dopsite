"use client";

import { useEffect, useRef } from "react";

type OrbitingBody = {
  radius: number;
  angle: number;
  speed: number;
  size: number;
  colour: string;
  tilt: number;
};

type StarSystem = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  colour: string;
  drift: number;
  burst: number;
  planets: OrbitingBody[];
};

type Shockwave = {
  x: number;
  y: number;
  age: number;
  life: number;
  colour: string;
  strength: number;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  colour: string;
};

type GravitySource = {
  x: number;
  y: number;
  energy: number;
};

const starColours = [
  "85,255,47",
  "157,255,138",
  "231,255,226",
  "60,255,184",
  "116,218,255",
  "255,239,184",
];

const planetColours = [
  "85,255,47",
  "107,223,255",
  "192,255,178",
  "230,238,229",
  "255,208,126",
];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -1000, y: -1000, active: false, energy: 0 };
    const touches = new Map<number, GravitySource>();
    let systems: StarSystem[] = [];
    let shockwaves: Shockwave[] = [];
    let meteors: Meteor[] = [];
    let animationFrame = 0;
    let previousFrame = performance.now();
    let nextCosmicEvent = previousFrame + 1800 + Math.random() * 2600;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const makePlanet = (systemSize: number, index: number): OrbitingBody => ({
      radius: 5 + systemSize * 2.4 + index * (4.5 + Math.random() * 3),
      angle: Math.random() * Math.PI * 2,
      speed: (0.0022 + Math.random() * 0.0065) * (Math.random() > 0.12 ? 1 : -1),
      size: 0.55 + Math.random() * 1.15,
      colour: planetColours[Math.floor(Math.random() * planetColours.length)],
      tilt: 0.34 + Math.random() * 0.52,
    });

    const makeSystem = (): StarSystem => {
      const size = 0.65 + Math.random() * 2.25;
      const inhabited = Math.random() > 0.43;
      const planetCount = inhabited ? 1 + (Math.random() > 0.68 ? 1 : 0) + (Math.random() > 0.9 ? 1 : 0) : 0;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.13,
        vy: 0.035 + Math.random() * 0.13,
        size,
        alpha: 0.3 + Math.random() * 0.67,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.017,
        colour: starColours[Math.floor(Math.random() * starColours.length)],
        drift: Math.random() * Math.PI * 2,
        burst: 0,
        planets: Array.from({ length: planetCount }, (_, index) => makePlanet(size, index)),
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const density = width < 700 ? 14200 : 11200;
      const count = Math.min(105, Math.max(45, Math.round((width * height) / density)));
      systems = Array.from({ length: count }, makeSystem);
    };

    const drawSystem = (system: StarSystem, shimmer: number, influence: number) => {
      const flare = system.size * (1 + influence * 0.85 + system.burst * 1.8);
      const orbitVisibility = system.alpha * (0.1 + influence * 0.24 + system.burst * 0.18);

      context.save();
      context.translate(system.x, system.y);

      for (const planet of system.planets) {
        context.save();
        context.rotate(system.drift);
        context.scale(1, planet.tilt);
        context.beginPath();
        context.arc(0, 0, planet.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${system.colour},${orbitVisibility})`;
        context.lineWidth = 0.45;
        context.stroke();
        context.restore();

        const orbitX = Math.cos(planet.angle) * planet.radius;
        const orbitY = Math.sin(planet.angle) * planet.radius * planet.tilt;
        const cos = Math.cos(system.drift);
        const sin = Math.sin(system.drift);
        const planetX = orbitX * cos - orbitY * sin;
        const planetY = orbitX * sin + orbitY * cos;

        context.beginPath();
        context.arc(planetX, planetY, planet.size * (1 + influence * 0.25), 0, Math.PI * 2);
        context.fillStyle = `rgba(${planet.colour},${Math.min(0.94, system.alpha + influence * 0.35)})`;
        context.shadowColor = `rgba(${planet.colour},0.75)`;
        context.shadowBlur = 3 + influence * 5 + system.burst * 7;
        context.fill();
      }

      const corona = context.createRadialGradient(0, 0, 0, 0, 0, flare * 6.8);
      corona.addColorStop(0, `rgba(${system.colour},${Math.min(1, system.alpha * shimmer)})`);
      corona.addColorStop(0.2, `rgba(${system.colour},${system.alpha * 0.34})`);
      corona.addColorStop(1, `rgba(${system.colour},0)`);
      context.fillStyle = corona;
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(0, 0, flare * 6.8, 0, Math.PI * 2);
      context.fill();

      if (system.size > 1.45 || influence > 0.18) {
        context.strokeStyle = `rgba(${system.colour},${Math.min(0.72, system.alpha * 0.34 + influence * 0.4)})`;
        context.lineWidth = 0.55;
        context.beginPath();
        context.moveTo(-flare * 4.5, 0);
        context.lineTo(flare * 4.5, 0);
        context.moveTo(0, -flare * 4.5);
        context.lineTo(0, flare * 4.5);
        context.stroke();
      }

      context.fillStyle = `rgba(${system.colour},${Math.min(1, system.alpha * shimmer + influence * 0.48)})`;
      context.shadowColor = `rgba(${system.colour},${0.65 + influence * 0.35})`;
      context.shadowBlur = flare * 3.2 + influence * 14;
      context.beginPath();
      context.arc(0, 0, flare, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const addShockwave = (x: number, y: number, strength = 1, colour = "157,255,138") => {
      shockwaves.push({ x, y, age: 0, life: 900 + strength * 380, colour, strength });
    };

    const triggerCosmicEvent = (now: number) => {
      if (Math.random() < 0.58 && systems.length) {
        const star = systems[Math.floor(Math.random() * systems.length)];
        star.burst = 1;
        addShockwave(star.x, star.y, 0.72, star.colour);

        for (const system of systems) {
          const dx = system.x - star.x;
          const dy = system.y - star.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 210) {
            const force = (1 - distance / 210) * 0.16;
            system.vx += (dx / distance) * force;
            system.vy += (dy / distance) * force;
          }
        }
      } else {
        const fromLeft = Math.random() > 0.5;
        meteors.push({
          x: fromLeft ? -80 : width + 80,
          y: Math.random() * height * 0.7,
          vx: (fromLeft ? 1 : -1) * (5.5 + Math.random() * 3.5),
          vy: 2.2 + Math.random() * 2.2,
          age: 0,
          life: 1100 + Math.random() * 700,
          colour: starColours[Math.floor(Math.random() * starColours.length)],
        });
      }

      nextCosmicEvent = now + 2600 + Math.random() * 5200;
    };

    const drawShockwaves = (elapsed: number) => {
      shockwaves = shockwaves.filter((wave) => {
        wave.age += elapsed;
        if (wave.age >= wave.life) return false;

        const progress = wave.age / wave.life;
        const radius = 16 + progress * (90 + wave.strength * 135);
        const opacity = Math.sin(progress * Math.PI) * 0.34 * wave.strength;
        context.strokeStyle = `rgba(${wave.colour},${opacity})`;
        context.lineWidth = 1.25 - progress * 0.75;
        context.beginPath();
        context.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        context.stroke();
        return true;
      });
    };

    const drawMeteors = (elapsed: number) => {
      meteors = meteors.filter((meteor) => {
        meteor.age += elapsed;
        if (meteor.age >= meteor.life) return false;

        meteor.x += meteor.vx * (elapsed / 16.67);
        meteor.y += meteor.vy * (elapsed / 16.67);
        const opacity = Math.sin((meteor.age / meteor.life) * Math.PI) * 0.75;
        const length = 34 + Math.hypot(meteor.vx, meteor.vy) * 5;
        const magnitude = Math.hypot(meteor.vx, meteor.vy);

        const gradient = context.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - (meteor.vx / magnitude) * length,
          meteor.y - (meteor.vy / magnitude) * length,
        );
        gradient.addColorStop(0, `rgba(${meteor.colour},${opacity})`);
        gradient.addColorStop(1, `rgba(${meteor.colour},0)`);
        context.strokeStyle = gradient;
        context.lineWidth = 1.25;
        context.beginPath();
        context.moveTo(meteor.x, meteor.y);
        context.lineTo(
          meteor.x - (meteor.vx / magnitude) * length,
          meteor.y - (meteor.vy / magnitude) * length,
        );
        context.stroke();

        context.fillStyle = `rgba(${meteor.colour},${opacity})`;
        context.shadowColor = `rgba(${meteor.colour},0.9)`;
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(meteor.x, meteor.y, 1.8, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
        return true;
      });
    };

    const drawGravityWell = (source: GravitySource, isTouch: boolean) => {
      const radius = (isTouch ? 150 : 125) + source.energy * 150;
      const gravityWell = context.createRadialGradient(source.x, source.y, 0, source.x, source.y, radius);
      gravityWell.addColorStop(0, `rgba(157,255,138,${0.08 + source.energy * 0.14})`);
      gravityWell.addColorStop(0.42, `rgba(60,255,184,${0.04 + source.energy * 0.08})`);
      gravityWell.addColorStop(1, "rgba(2,4,3,0)");
      context.fillStyle = gravityWell;
      context.beginPath();
      context.arc(source.x, source.y, radius, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = `rgba(157,255,138,${0.1 + source.energy * 0.18})`;
      context.lineWidth = isTouch ? 1.2 : 0.8;
      context.beginPath();
      context.ellipse(
        source.x,
        source.y,
        45 + source.energy * 70,
        16 + source.energy * 26,
        -0.34,
        0,
        Math.PI * 2,
      );
      context.stroke();
    };

    const render = (now = performance.now()) => {
      const elapsed = Math.min(40, now - previousFrame);
      previousFrame = now;
      context.clearRect(0, 0, width, height);
      pointer.energy *= 0.94;

      if (!reduceMotion && now >= nextCosmicEvent) triggerCosmicEvent(now);

      const gravitySources: GravitySource[] = [];
      if (pointer.active) {
        gravitySources.push(pointer);
        drawGravityWell(pointer, false);
      }
      for (const touch of touches.values()) {
        gravitySources.push(touch);
        drawGravityWell(touch, true);
      }

      for (const system of systems) {
        let influence = 0;
        let closestSource: GravitySource | null = null;
        let closestDx = 0;
        let closestDy = 0;
        let closestDistance = Infinity;

        for (const source of gravitySources) {
          const dx = system.x - source.x;
          const dy = system.y - source.y;
          const distance = Math.hypot(dx, dy);
          const sourceInfluence = distance < 320 ? (1 - distance / 320) * source.energy : 0;
          if (sourceInfluence > influence) {
            influence = sourceInfluence;
            closestSource = source;
            closestDx = dx;
            closestDy = dy;
            closestDistance = distance;
          }
        }

        if (!reduceMotion) {
          system.pulse += system.pulseSpeed;
          system.drift += 0.0007;
          system.burst *= 0.965;
          for (const planet of system.planets) {
            planet.angle += planet.speed * (1 + influence * 7.5);
          }

          if (closestSource && closestDistance > 0) {
            const gravity = influence * (0.018 + closestSource.energy * 0.052);
            const tangent = influence * (0.012 + closestSource.energy * 0.034);
            system.vx -= (closestDx / closestDistance) * gravity + (closestDy / closestDistance) * tangent;
            system.vy -= (closestDy / closestDistance) * gravity - (closestDx / closestDistance) * tangent;
          }

          system.vx *= 0.989;
          system.vy = system.vy * 0.991 + 0.0007;
          system.x += system.vx;
          system.y += system.vy;

          const margin = 34;
          if (system.y > height + margin) system.y = -margin;
          if (system.x > width + margin) system.x = -margin;
          if (system.x < -margin) system.x = width + margin;
        }

        const shimmer = 0.76 + Math.sin(system.pulse) * 0.24;
        drawSystem(system, shimmer, influence);
      }

      if (!reduceMotion) {
        drawShockwaves(elapsed);
        drawMeteors(elapsed);
      }

      context.shadowBlur = 0;
      if (!reduceMotion) animationFrame = requestAnimationFrame(render);
    };

    let previousX = -1000;
    let previousY = -1000;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        const touch = touches.get(event.pointerId);
        if (touch) {
          const speed = Math.hypot(event.clientX - touch.x, event.clientY - touch.y);
          touch.x = event.clientX;
          touch.y = event.clientY;
          touch.energy = Math.min(1.35, 0.82 + speed / 38);
        }
        return;
      }

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (previousX > -900) {
        const speed = Math.hypot(event.clientX - previousX, event.clientY - previousY);
        pointer.energy = Math.min(1, pointer.energy + speed / 72);
      }
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        touches.set(event.pointerId, { x: event.clientX, y: event.clientY, energy: 1.2 });
        addShockwave(event.clientX, event.clientY, 1.1);
      } else {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
        pointer.energy = 1;
        addShockwave(event.clientX, event.clientY, 0.75);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      const touch = touches.get(event.pointerId);
      if (touch) addShockwave(touch.x, touch.y, 0.65, "60,255,184");
      touches.delete(event.pointerId);
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-particles" aria-hidden="true" />;
}
