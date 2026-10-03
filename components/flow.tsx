"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import { Seats } from "@/components/seats";
import { steps, open } from "@/lib/flow";

gsap.registerPlugin(ScrollTrigger);

export function Flow() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hi", { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" });
        const trig = { trigger: ".flow", start: "top 60%", end: "bottom 60%", scrub: true };
        gsap.fromTo(".spine-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: trig });
        gsap.fromTo(".packet", { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: trig });
        gsap.utils.toArray<HTMLElement>(".node").forEach((n) => {
          gsap.fromTo(n.querySelector(".body"), { opacity: 0, y: 70 }, {
            opacity: 1, y: 0, ease: "none",
            scrollTrigger: { trigger: n, start: "top 88%", end: "top 55%", scrub: true },
          });
          const dot = n.querySelector<HTMLElement>(".dot")!;
          ScrollTrigger.create({
            trigger: n, start: "top 60%",
            onEnter: () => gsap.to(dot, { scale: 2.4, backgroundColor: dot.dataset.c, duration: 0.3 }),
            onLeaveBack: () => gsap.to(dot, { scale: 1, backgroundColor: "#333", duration: 0.3 }),
          });
        });
        gsap.utils.toArray<HTMLElement>(".op").forEach((o) =>
          gsap.fromTo(o, { opacity: 0, x: -40 }, { opacity: 1, x: 0, ease: "none",
            scrollTrigger: { trigger: o, start: "top 92%", end: "top 65%", scrub: true } }),
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative">
      <Seats />
      <p id="hud" className="fixed bottom-6 right-6 z-20 text-xs" />
      <div className="relative z-10">
        <section className="flex min-h-screen flex-col justify-end px-6 pb-16 md:px-16">
          <p className="hi text-dim"><Scramble text="granted07@kolkata:~/research$ cat gamma" /></p>
          <h1 className="hi mt-6 max-w-6xl text-[clamp(2.2rem,8vw,7rem)] font-medium leading-[.95] tracking-tighter">
            How long would you wait for a fuller ferry?
          </h1>
          <p className="hi mt-8 max-w-xl text-lg text-foreground/70">
            A GPU answers questions in groups. Bigger groups are cheaper per person, but everyone waits for the boat to fill. I am teaching it to decide, live.
          </p>
          <p className="hi cursor mt-16 text-sm" style={{ color: "#0dbc79" }}>scroll</p>
        </section>

        <section className="flow relative mx-auto max-w-6xl space-y-[26vh] px-6 py-32">
          <div className="spine absolute bottom-0 left-3 top-0 w-px bg-white/15 md:left-1/2">
            <div className="spine-fill h-full w-full origin-top bg-white" />
          </div>
          <div className="packet absolute left-3 z-10 h-3 w-3 -translate-x-1/2 bg-white md:left-1/2" />
          {steps.map((s, i) => (
            <article key={s.tag} className={`node relative pl-10 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-16" : "md:pr-16 md:text-right"}`}>
              <span data-c={s.color} className={`dot absolute top-3 h-2 w-2 bg-[#333] left-2 ${i % 2 ? "md:-left-1" : "md:left-auto md:-right-1"}`} />
              <div className="body">
                <p className="text-sm" style={{ color: s.color }}>{s.tag}</p>
                <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">{s.title}</h2>
                <p className="mt-5 text-lg leading-snug text-foreground/70">{s.line}</p>
                <pre className={`mt-6 inline-block overflow-x-auto border-white/20 bg-black/60 px-4 py-3 text-left text-xs text-dim md:text-sm ${i % 2 ? "border-l-2" : "border-l-2 md:border-l-0 md:border-r-2"}`} style={{ borderColor: s.color }}>{s.formula}</pre>
              </div>
            </article>
          ))}
        </section>

        <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 px-6 py-24">
          <p className="op text-dim">still open</p>
          {open.map((o) => (
            <p key={o} className="op flex gap-4 text-xl md:text-3xl"><span style={{ color: "#e5e510" }}>?</span>{o}</p>
          ))}
          <p className="op mt-10 flex gap-8 text-sm">
            <Link href="/#research" className="text-dim hover:text-white">← home</Link>
            <a href="https://github.com/Granted07/DES_GPUQueueingModel" target="_blank" rel="noreferrer" style={{ color: "#0dbc79" }}>read the code →</a>
          </p>
        </section>
      </div>
    </div>
  );
}