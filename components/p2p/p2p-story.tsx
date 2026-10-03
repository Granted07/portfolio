"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import PixelCard from "@/components/ui/pixel-card";
import { Lab } from "./lab";

gsap.registerPlugin(ScrollTrigger);

const C = "#11a8cd";
const CYANS = ["#11a8cd", "#0d82a0", "#095a70"];
const REPO = "https://github.com/Granted07/p2pchat";
const P = ({ children }: { children: React.ReactNode }) => <p className="rv">{children}</p>;
const Code = ({ children }: { children: string }) => (
  <pre className="rv w-fit max-w-full overflow-x-auto border-l-2 bg-black/60 px-4 py-3 text-xs text-foreground/80 md:text-sm" style={{ borderColor: C }}>{children}</pre>
);
const files = [
  { f: "main.cpp", note: "the retries, the two threads, the chat loop" },
  { f: "upnp.cpp", note: "asking the router for a door" },
  { f: "socket.cpp", note: "a small wrapper around Winsock" },
];
const caveats = [
  "It runs on Windows only. The sockets are Winsock.",
  "Nothing is encrypted. And a long message is read in pieces, so it can arrive as several.",
  "The door stays open. The code asks the router for a lease of 0, meant to last until someone closes it. A function to close it exists. main never calls it.",
];

export function P2PStory() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hi", { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" });
        gsap.utils.toArray<HTMLElement>(".rv").forEach((el) =>
          gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 62%", scrub: true } }),
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative">
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-16 md:px-16">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[18%] z-0 opacity-60">
          <svg viewBox="0 0 400 60" className="w-full">
            <line x1={40} x2={360} y1={30} y2={30} stroke="#333" strokeDasharray="3 5" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} r={3} fill={C}>
                <animateMotion dur="3.2s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={i % 2 ? "M360,30 L40,30" : "M40,30 L360,30"} />
              </circle>
            ))}
            <circle cx={40} cy={30} r={7} fill="none" stroke="#ededed" />
            <circle cx={360} cy={30} r={7} fill="none" stroke="#ededed" />
          </svg>
        </div>
        <div className="relative z-10">
          <p className="hi text-dim"><Scramble text="granted07@kolkata:~/p2pchat$ ./p2pchat" /></p>
          <h1 className="hi mt-6 text-[clamp(3rem,12vw,11rem)] font-medium leading-[.9] tracking-tighter">p2pchat</h1>
          <p className="hi mt-6 max-w-xl text-lg text-foreground/70">A chat between two computers with nothing in the middle. No account, no server. The two dots above are the whole architecture.</p>
          <p className="hi cursor mt-16 text-sm" style={{ color: C }}>scroll</p>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>Most chat apps have a computer in the middle. You send to it, and it sends to them.</P>
        <P>Here, you type and the words go straight to the other screen.</P>
        <P>The hard part is getting in. Your router hides everything behind it, so a stranger cannot just knock. To be reachable, the program has to ask the router to open one door.</P>
        <Code>{"upnp->add_port_mapping(my_port);"}</Code>
        <P>Routers understand that request through a protocol called UPnP. Not every router does.</P>
      </section>

      <section id="lab" className="pt-16">
        <div className="mx-auto max-w-3xl px-6 text-xl md:text-3xl">
          <p className="rv text-sm" style={{ color: C }}>now make the call</p>
          <p className="rv mt-6">Two people, two routers, and one of them is late. Take UPnP away, or make the peer slow, and see what the program says.</p>
        </div>
        <Lab />
      </section>

      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>Chatting is two jobs at once: waiting for you to type, and waiting for them to write. So the program does them side by side.</P>
        <Code>{"std::thread receiver([&] {\n    while (running) { inbound.receive(); sleep(100ms); }\n});\nwhile (getline(cin, message)) outbound.send(message);"}</Code>
        <P>Paste something very long into the chat above. Then go find out why the other side gets it in pieces.</P>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <p className="rv text-dim">where to look</p>
        <ul className="mt-8 divide-y divide-white/10">
          {files.map((x) => (
            <li key={x.f} className="rv">
              <a href={`${REPO}/blob/HEAD/${x.f}`} target="_blank" rel="noreferrer" className="group flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-6">
                <span className="shrink-0 text-lg group-hover:underline md:w-56 md:text-2xl" style={{ color: C }}>{x.f}</span>
                <span className="text-dim">{x.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <PixelCard colors={CYANS} className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-24">
        <p className="rv text-dim">what it does not claim</p>
        <div className="mt-8 max-w-4xl space-y-8">
          {caveats.map((c) => <p key={c} className="rv flex gap-4 text-xl md:text-3xl"><span style={{ color: "#e5e510" }}>!</span>{c}</p>)}
        </div>
      </PixelCard>

      <footer className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end gap-3 px-6 pb-16 md:px-16">
        <a href={REPO} target="_blank" rel="noreferrer" className="w-fit text-3xl hover:underline md:text-6xl">read the code</a>
        <Link href="/#work" className="w-fit text-dim hover:text-white">← home</Link>
      </footer>
    </div>
  );
}