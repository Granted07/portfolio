"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import PixelCard from "@/components/ui/pixel-card";
import { chapters, repos, research } from "@/lib/story";
import { profile } from "@/lib/profile";

gsap.registerPlugin(ScrollTrigger);
const NAME = "anjishnu dey";
const contacts = [
  { k: "mail", v: profile.email, href: `mailto:${profile.email}`, color: "#0dbc79" },
  { k: "linkedin", v: "anjishnu-dey", href: profile.linkedin, color: "#2472c8" },
  { k: "instagram", v: "granted.api", href: "https://instagram.com/granted.api", color: "#bc3fbc" },
];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hc", {
          y: () => gsap.utils.random(-320, 320), rotate: () => gsap.utils.random(-50, 50),
          opacity: 0, ease: "none", stagger: { each: 0.03, from: "center" },
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 15%", scrub: true },
        });

        // scroll-linked reveals for everything outside the pinned track
        gsap.utils.toArray<HTMLElement>(".rv").forEach((el) =>
          gsap.fromTo(el, { opacity: 0, y: 48 }, {
            opacity: 1, y: 0, ease: "none",
            scrollTrigger: { trigger: el, start: "top 92%", end: "top 62%", scrub: true },
          }),
        );
        gsap.fromTo(".rule", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".rule", start: "top 90%", end: "top 50%", scrub: true } });

        const track = root.current!.querySelector<HTMLElement>(".track")!;
        const dist = () => track.scrollWidth - window.innerWidth;
        const travel = gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: ".pin", pin: true, scrub: 0.5, end: () => "+=" + dist(), invalidateOnRefresh: true },
        });
        gsap.to(".bar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".pin", start: "top top", end: () => "+=" + dist(), scrub: true } });
        gsap.utils.toArray<HTMLElement>(".line").forEach((l) =>
          gsap.fromTo(l, { opacity: 0.1, x: 80 }, {
            opacity: 1, x: 0, ease: "none",
            scrollTrigger: { trigger: l, containerAnimation: travel, start: "left 88%", end: "left 50%", scrub: true },
          }),
        );
        gsap.utils.toArray<HTMLElement>(".panel").forEach((p) =>
          gsap.fromTo(p.querySelector(".ghost"), { x: 260 }, {
            x: -260, ease: "none",
            scrollTrigger: { trigger: p, containerAnimation: travel, start: "left right", end: "right left", scrub: true },
          }),
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} id="top">
      <section className="hero flex min-h-screen flex-col justify-end px-6 pb-16 md:px-16">
        <p className="text-dim"><Scramble text="granted07@kolkata:~$ whoami" /></p>
        <h1 aria-label={NAME} className="mt-4 text-[clamp(3rem,13vw,13rem)] font-medium leading-[.9] tracking-tighter">
          {[...NAME].map((c, i) => (
            <span key={i} aria-hidden className="hc inline-block">{c === " " ? "\u00a0" : c}</span>
          ))}
        </h1>
        <p className="mt-6 text-dim"><Scramble text="shhh, the better scripter is speaking" delay={700} /></p>
        <p className="cursor mt-24 text-sm">cd ~/research</p>
      </section>

      <PixelCard id="research" variant="terminal" className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-24">
        <p className="rv text-sm" style={{ color: "#0dbc79" }}><span className="animate-pulse">●</span> running</p>
        <h2 className="rv mt-4 max-w-5xl text-3xl font-medium leading-tight tracking-tight md:text-6xl">
          gpu scheduling for hosted neural-network inference
        </h2>
        <div className="rule mt-10 h-px w-full origin-left bg-white/30" />
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="space-y-4 text-lg md:text-2xl">
            {research.lines.map((l) => <p key={l} className="rv">{l}</p>)}
          </div>
          <pre className="rv overflow-x-auto border border-white/15 bg-black/50 p-5 text-xs leading-6 text-foreground/80 md:text-sm">{research.code}</pre>
        </div>
        <p className="rv mt-10 text-dim">{research.teaser}</p>
        <Link href={research.href} className="rv mt-3 w-fit border-b pb-1" style={{ color: "#0dbc79", borderColor: "#0dbc79" }}>
          cd ~/research && cat gamma →
        </Link>
      </PixelCard>

      <section id="work" className="pin relative h-screen overflow-hidden">
        <div className="track flex h-full w-max">
          {chapters.map((c) => (
            <article key={c.name} className="panel relative flex h-screen w-screen shrink-0 flex-col justify-center overflow-hidden px-6 md:px-24">
              <span className="ghost pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[28vw] font-bold leading-none">{c.name}</span>
              <div className="relative max-w-3xl">
                <p style={{ color: c.color }}><Scramble text={`${c.path}  .${c.ext}`} /></p>
                <div className="mt-8 space-y-4 text-xl leading-tight md:text-4xl">
                  {c.lines.map((l) => <p key={l} className="line">{l}</p>)}
                </div>
                <pre className="mt-8 hidden border-l-2 pl-4 text-sm text-dim md:block" style={{ borderColor: c.color }}>{c.code}</pre>
                <a href={c.href} target={c.href.startsWith("/") ? undefined : "_blank"} rel="noreferrer" className="mt-8 inline-block border-b pb-1" style={{ borderColor: c.color }}>open →</a>
              </div>
            </article>
          ))}
        </div>
        <div className="bar absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white" />
      </section>

      <section id="git" className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-24">
        <p className="rv text-dim">git remote -v</p>
        <a href={profile.github} target="_blank" rel="noreferrer" className="rv mt-4 w-fit text-3xl hover:underline md:text-6xl">github.com/granted07</a>
        <ul className="mt-12 divide-y divide-white/10">
          {repos.map((r) => (
            <li key={r.name} className="rv">
              <a href={r.href} target="_blank" rel="noreferrer" className="group flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-6">
                <span className="w-24 shrink-0 text-xs uppercase" style={{ color: r.color }}>{r.tag}</span>
                <span className="shrink-0 text-lg group-hover:underline md:w-80 md:text-2xl">{r.name}</span>
                <span className="text-dim">{r.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer id="contact" className="flex min-h-screen flex-col justify-end gap-6 px-6 pb-16 md:px-24">
        <p className="rv cursor text-dim">send</p>
        {contacts.map((c) => (
          <a key={c.k} href={c.href} target="_blank" rel="noreferrer" className="rv group flex flex-col md:flex-row md:items-baseline md:gap-8">
            <span className="w-28 shrink-0 text-sm" style={{ color: c.color }}>{c.k}</span>
            <span className="break-all text-2xl group-hover:underline md:text-5xl">{c.v}</span>
          </a>
        ))}
        <p className="mt-8 text-xs text-dim">© {new Date().getFullYear()} anjishnu dey · kolkata</p>
      </footer>
    </div>
  );
}