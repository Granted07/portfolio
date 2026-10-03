"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import PixelCard from "@/components/ui/pixel-card";
import { Lab, ambient, line } from "./lab";

gsap.registerPlugin(ScrollTrigger);

const B = "#2472c8";
const BLUES = ["#2472c8", "#1a5494", "#113963"];
const REPO = "https://github.com/Granted07/mc-console";
const P = ({ children }: { children: React.ReactNode }) => <p className="rv">{children}</p>;
const Code = ({ children }: { children: string }) => (
  <pre className="rv w-fit max-w-full overflow-x-auto border-l-2 bg-black/60 px-4 py-3 text-xs text-foreground/80 md:text-sm" style={{ borderColor: B }}>{children}</pre>
);
const files = [
  { f: "app/api/command/route.ts", note: "the gates, in order" },
  { f: "lib/tmux.ts", note: "the one place a command leaves" },
  { f: "server/logTail.ts", note: "watching a file and sending only what is new" },
  { f: "server/index.ts", note: "the live connection, the token check, the heartbeat" },
];
const caveats = [
  "There is one shared token. Anyone who has it can do everything the console can.",
  "The live connection carries the token in its address, so this should only ever be served over HTTPS.",
  "Rate limits are counted per token and per address. The address comes from a proxy header, so that only holds behind a proxy you trust.",
];

// a made-up log, scrolling behind the title. The real one is a copy of the server's output.
function Ticker() {
  const [l, setL] = useState<string[]>([]);
  useEffect(() => {
    const id = setInterval(() => setL((x) => [...x, line(ambient[(Math.random() * ambient.length) | 0])].slice(-12)), 900);
    return () => clearInterval(id);
  }, []);
  return <pre aria-hidden className="pointer-events-none absolute inset-x-0 top-24 z-0 overflow-hidden px-6 text-xs leading-6 text-foreground/25 md:px-16 md:text-sm">{l.join("\n")}</pre>;
}

export function MCStory() {
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
        <Ticker />
        <div className="relative z-10">
          <p className="hi text-dim"><Scramble text="granted07@kolkata:~/mc-console$ npm start" /></p>
          <h1 className="hi mt-6 text-[clamp(2.8rem,11vw,10rem)] font-medium leading-[.9] tracking-tighter">mc-console</h1>
          <p className="hi mt-6 max-w-xl text-lg text-foreground/70">A web page that shows a Minecraft server&apos;s log as it happens, and lets the right people type into it. The lines behind this text are made up, but they scroll the way the real ones do.</p>
          <p className="hi cursor mt-16 text-sm" style={{ color: B }}>scroll</p>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>A Minecraft server is a program with a text window. To watch it, or talk to it, you have to be sitting at that window.</P>
        <P>That normally means logging in to the machine it runs on. I wanted a link instead.</P>
        <P>The server lives inside tmux, which can copy everything it prints into a file.</P>
        <Code>{"tmux pipe-pane -t minecraft -o 'cat >> ~/session.log'"}</Code>
        <P>Reading is the easy half. The page watches that file, and whenever it grows it sends only the new bytes to every open browser. Someone who arrives late gets the last 500 lines first, so they join mid-sentence rather than a blank screen.</P>
        <Code>{"log file → websocket → browser"}</Code>
        <P>Writing is the dangerous half.</P>
      </section>

      <section id="lab" className="pt-16">
        <div className="mx-auto max-w-3xl px-6 text-xl md:text-3xl">
          <p className="rv text-sm" style={{ color: B }}>now get a command through</p>
          <p className="rv mt-6">Whatever is typed here goes into a live server. So it passes six checks, in order, before it gets anywhere near it. Try the wrong token. Send six in a row. Send nothing. Notice which check stops you, and which ones you never reach.</p>
        </div>
        <Lab />
      </section>

      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>The last step is small on purpose. The command goes to tmux as a single argument. No shell, no string stitching.</P>
        <Code>{"spawn(\"tmux\", [\"send-keys\", \"-t\", session, command, \"Enter\"]);"}</Code>
        <P>No SSH is exposed. The only thing this page can do to the server is press keys.</P>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <p className="rv text-dim">where to look</p>
        <ul className="mt-8 divide-y divide-white/10">
          {files.map((x) => (
            <li key={x.f} className="rv">
              <a href={`${REPO}/blob/HEAD/${x.f}`} target="_blank" rel="noreferrer" className="group flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-6">
                <span className="shrink-0 break-all text-lg group-hover:underline md:w-96 md:text-2xl" style={{ color: B }}>{x.f}</span>
                <span className="text-dim">{x.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <PixelCard colors={BLUES} className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-24">
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