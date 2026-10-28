import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
}

const COLORS = ["139,92,246", "45,212,191", "34,211,238"];

export function ParticleBrainHero({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let raf = 0;

    function makeParticles() {
      const count = width < 640 ? 55 : 90;
      const cx = width / 2;
      const cy = height / 2;
      const rx = width * 0.34;
      const ry = height * 0.36;
      particles = Array.from({ length: count }, () => {
        // organic brain-ish blob: sample inside a wobbly ellipse
        const angle = Math.random() * Math.PI * 2;
        const radiusFactor = Math.pow(Math.random(), 0.55);
        const wobble = 0.85 + Math.random() * 0.3;
        const x = cx + Math.cos(angle) * rx * radiusFactor * wobble;
        const y = cy + Math.sin(angle) * ry * radiusFactor * wobble;
        return { x, y, ox: x, oy: y, vx: 0, vy: 0, r: 1.4 + Math.random() * 1.8 };
      });
    }

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : 480;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;

      for (const p of particles) {
        const dxHome = p.ox - p.x;
        const dyHome = p.oy - p.y;
        p.vx += dxHome * 0.006;
        p.vy += dyHome * 0.006;

        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const distM = Math.hypot(dxm, dym);
        const influence = 110;
        if (distM < influence) {
          const force = (1 - distM / influence) * 1.8;
          p.vx += (dxm / (distM || 1)) * force;
          p.vy += (dym / (distM || 1)) * force;
        }

        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;
      }

      // connective lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 70) {
            const alpha = (1 - d / 70) * 0.35;
            ctx!.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // particles
      particles.forEach((p, i) => {
        const color = COLORS[i % COLORS.length];
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},0.9)`;
        ctx!.shadowColor = `rgba(${color},0.9)`;
        ctx!.shadowBlur = 8;
        ctx!.fill();
      });
      ctx!.shadowBlur = 0;

      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
