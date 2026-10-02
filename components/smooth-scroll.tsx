"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.085 });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    lenis.current?.scrollTo(hash || 0, { immediate: true, force: true });
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}