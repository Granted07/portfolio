"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import { chapters, others } from "@/lib/story";
import { profile } from "@/lib/profile";

gsap.registerPlugin(ScrollTrigger);
const NAME = "anjishnu dey";

export default function Home() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // the name comes apart as you leave
        gsap.to(".hc", {
          y: () => gsap.utils.random(-320, 320), rotate: () => gsap.utils.random(-50, 50),
          opacity: 0, ease: "none", stagger: { each: 0.03, from: "center" },
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 15%", scrub: true },
        });

        // vertical scroll becomes horizontal travel
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
    <div ref={root}>
      <section className="hero flex min-h-screen flex-col justify-end px-6 pb-16 md:px-16">
        <p className="text-dim"><Scramble text="granted07@kolkata:~$ whoami" /></p>
        <h1 aria-label={NAME} className="mt-4 text-[clamp(3rem,13vw,13rem)] font-medium leading-[.9] tracking-tighter">
          {[...NAME].map((c, i) => (
            <span key={i} aria-hidden className="hc inline-block">{c === " " ? "\u00a0" : c}</span>
          ))}
        </h1>
        <p className="mt-6 text-dim"><Scramble text="shhh, the better scripter is speaking" delay={700} /></p>
        <p className="cursor mt-24 text-sm">cd ~/things-i-made</p>
      </section>

      <section className="pin relative h-screen overflow-hidden">
        <div className="track flex h-full w-max">
          {chapters.map((c) => (
            <article key={c.name} className="panel relative flex h-screen w-screen shrink-0 flex-col justify-center overflow-hidden px-6 md:px-24">
              <span className="ghost pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[28vw] font-bold leading-none">{c.name}</span>
              <div className="relative max-w-3xl">
                <p className="text-dim"><Scramble text={`${c.path}  .${c.ext}`} /></p>
                <div className="mt-8 space-y-4 text-xl leading-tight md:text-4xl">
                  {c.lines.map((l) => <p key={l} className="line">{l}</p>)}
                </div>
                <a href={c.href} target="_blank" rel="noreferrer" className="mt-10 inline-block border-b border-white/40 pb-1 hover:border-white">cat README</a>
              </div>
            </article>
          ))}
        </div>
        <div className="bar absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-white" />
      </section>

      <section className="flex min-h-screen flex-col justify-center px-6 md:px-24">
        <p className="text-dim">ls ~/other</p>
        <ul className="mt-8 space-y-3 text-lg md:text-2xl">
          {others.map((o) => (
            <li key={o.name}>
              <a href={o.href} target="_blank" rel="noreferrer" className="group flex flex-col gap-1 text-foreground/70 hover:text-white md:flex-row md:gap-6">
                <span className="shrink-0 md:w-64">{o.name}</span>
                <span className="text-dim group-hover:text-foreground">{o.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex min-h-[70vh] flex-col justify-end gap-3 px-6 pb-16 md:px-24">
        <p className="cursor text-dim">mail</p>
        <a className="text-3xl hover:underline md:text-6xl" href={`mailto:${profile.email}`}>{profile.email}</a>
        <p className="flex gap-6 text-dim">
          <a className="hover:text-white" href={profile.github}>github</a>
          <a className="hover:text-white" href={profile.linkedin}>linkedin</a>
        </p>
        <p className="mt-8 text-sm text-dim">may or may not take commissions, who knows?</p>
      </footer>
    </div>
  );
}
