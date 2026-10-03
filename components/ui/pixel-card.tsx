"use client";
import { useEffect, useRef } from "react";

type Props = {
  variant?: "terminal";
  gap?: number;
  colors?: string[];
  id?: string;
  className?: string;
  children: React.ReactNode;
};

type Px = { x: number; y: number; col: string; d: number; s: number; m: number; a: number };

// Pixel opacity at the very top and bottom edge, and in the middle.
// FADE is how much of the height (from each edge) the blend takes.
const EDGE = 0, MID = 0.6, FADE = 0.4;

// Pixel field behind the content. The canvas is absolutely positioned with
// utility classes, so it can never push content around, and it sits behind
// the children through a stacking context (isolate + -z-10), not a CSS rule
// that targets children.
export default function PixelCard({
  gap = 12,
  colors = ["#0dbc79", "#0a8f5d", "#075f3d"],
  id,
  className = "",
  children,
}: Props) {
  const box = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current!;
    const c = cv.current!;
    const ctx = c.getContext("2d");
    if (!ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let px: Px[] = [];
    let maxD = 0, raf = 0, dir = 0, t0 = 0;

    const build = () => {
      const w = el.clientWidth, h = el.clientHeight;
      c.width = w;
      c.height = h;
      px = [];
      for (let x = 0; x < w; x += gap)
        for (let y = 0; y < h; y += gap) {
          const k = Math.min(1, Math.min(y, h - y) / (h * FADE));
          const a = EDGE + (MID - EDGE) * k * k * (3 - 2 * k);
          px.push({ x, y, col: colors[(Math.random() * colors.length) | 0], d: Math.hypot(x - w / 2, y - h / 2), s: 0, m: 1 + Math.random() * 2, a });
        }
      maxD = Math.hypot(w / 2, h / 2) * 1.2;
      if (dir > 0 && !raf) raf = requestAnimationFrame(frame);
    };

    const frame = (t: number) => {
      const elapsed = t - t0;
      let moving = false;
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of px) {
        const target = dir > 0 && elapsed > p.d * 1.2 ? p.m : 0;
        if (p.s < target) { p.s = Math.min(target, p.s + 0.12); moving = true; }
        else if (p.s > target) { p.s = Math.max(target, p.s - 0.12); moving = true; }
        if (p.s > 0.05) {
          ctx.globalAlpha = p.a;
          ctx.fillStyle = p.col;
          ctx.fillRect(p.x, p.y, p.s, p.s);
        }
      }
      raf = moving || (dir > 0 && elapsed < maxD) ? requestAnimationFrame(frame) : 0;
    };

    const go = (d: 1 | -1) => {
      dir = d;
      t0 = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);

    const touch = matchMedia("(hover: none)").matches;
    const enter = () => go(1), leave = () => go(-1);
    let io: IntersectionObserver | undefined;
    if (touch) {
      io = new IntersectionObserver(([e]) => go(e.isIntersecting ? 1 : -1), { threshold: 0.4 });
      io.observe(el);
    } else {
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
    }

    return () => {
      ro.disconnect();
      io?.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [gap, colors]);

  return (
    <section id={id} ref={box} className={`relative isolate overflow-hidden ${className}`}>
      <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {children}
    </section>
  );
}