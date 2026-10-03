"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import PixelCard from "@/components/ui/pixel-card";
import { DEFAULT, makeSim } from "@/lib/des/sim";
import { Stepper } from "@/components/des/stepper";
import { Dists, Batching } from "@/components/des/dists";
import { Lab } from "./lab";
import { Sweep } from "./sweep";
import type { Ctl } from "@/components/des/queue-scene";

const QueueScene = dynamic(() => import("@/components/des/queue-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

const G = "#0dbc79";
const GREENS = ["#0dbc79", "#0a8f5d", "#075f3d"];
const P = ({ children }: { children: React.ReactNode }) => <p className="rv">{children}</p>;
const Code = ({ children }: { children: string }) => (
  <pre className="rv w-fit max-w-full overflow-x-auto border-l-2 bg-black/60 px-4 py-3 text-xs text-foreground/80 md:text-sm" style={{ borderColor: G }}>{children}</pre>
);
const pipeline = [
  "Download GoogLeNet and time it on a real GPU, for batch sizes 1, 2, 4, 8, 16, 32 and 64.",
  "Check that the GPU is really doing the work, not the CPU.",
  "Turn those timings into the mean batch time the simulator uses.",
  "Run the simulator with three amounts of run-time spread: 0, 0.5 and 1.4.",
  "Plot the distributions, the latency and the blocking.",
];
const caveats = [
  "The timings come from a Kaggle GPU. They are not the hardware in the BatOpt paper, so absolute numbers are not directly comparable.",
  "The CUDA benchmark times a stand-in workload. The GoogLeNet run uses the real model.",
  "Random numbers come from the C standard library generator, and every repetition has an explicit seed.",
  "The numbers in this page's sliders are placeholders, not your measurements.",
];

export function DESStory() {
  const root = useRef<HTMLDivElement>(null);
  const [hero] = useState<Ctl>(() => ({ sim: makeSim({ ...DEFAULT, lambda: 160, b: 8, N: 32 }, 7, true), speed: 250, run: true }));
  const [lab] = useState<Ctl>(() => ({ sim: makeSim(DEFAULT, 1, true), speed: 200, run: true }));

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
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-60"><QueueScene ctl={hero} /></div>
        <div className="relative z-10">
          <p className="hi text-dim"><Scramble text="granted07@kolkata:~/DES_GPUQueueingModel$ build/DES_GPUQueingModel" /></p>
          <h1 className="hi mt-6 text-[clamp(2.4rem,9vw,8rem)] font-medium leading-[.9] tracking-tighter">des-gpu-queue</h1>
          <p className="hi mt-6 max-w-xl text-lg text-foreground/70">A simulator, written in C, of requests waiting for a GPU. The dots behind this text are a copy of it, running live in your browser. Each dot is one request.</p>
          <p className="hi cursor mt-16 text-sm" style={{ color: G }}>scroll</p>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>A simulator does not tick. It jumps.</P>
        <P>Between two things happening, nothing happens, so there is no reason to look. It skips straight to the next thing.</P>
        <P>Here there are only ever two things that can happen next. A new request arrives, or the GPU finishes a batch.</P>
        <Code>{"next = min(next_arrival, batch_done)\nclock = next"}</Code>
        <P>That is the whole engine. Step through it.</P>
      </section>
      <Stepper />

      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>Where do the two times come from? Random numbers, shaped on purpose.</P>
        <P>Gaps between arrivals are exponential. Batch run times are gamma. The only dial on the second is how much they spread.</P>
        <Code>{"arrivals   exp(λ)\nservice    gamma(mean, cov)"}</Code>
      </section>
      <Dists />

      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>Why batch at all?</P>
        <P>A GPU pays a fixed cost to start a batch, then a small cost per request. The mean batch time is a straight line in the batch size.</P>
        <Code>{"mean = slope * b + intercept;\ndeparture = start + gamma(mean, cov);"}</Code>
        <P>In the repo, the slope and intercept are fitted to timings of a real network on a real GPU.</P>
      </section>
      <Batching />

      <section id="lab" className="pt-24">
        <div className="mx-auto max-w-3xl px-6 text-xl md:text-3xl">
          <p className="rv text-sm" style={{ color: G }}>now break it</p>
          <p className="rv mt-6">Everything above, running together. Push the load past what the GPU can sustain and watch the buffer fill and requests get turned away. Then ask it to wait for 8 requests while only a few arrive.</p>
        </div>
        <Lab ctl={lab} />
      </section>

      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-24 text-xl md:text-3xl">
        <P>How do you know it is right?</P>
        <P>Two independent ways of measuring the same wait have to agree. Add up the wait of every finished request, or take the average number of requests inside and divide by how fast they get in. That is Little&apos;s Law, and the simulator computes both.</P>
        <P>It also throws away the first requests. The system starts empty, so those waits are unusually short, and they would drag the average. The red dots in the chart are that stretch.</P>
        <P>And one more trick. With the same seed you get the same run, every time. Try it in the lab.</P>
      </section>

      <section className="pt-8">
        <div className="mx-auto max-w-3xl px-6 text-xl md:text-3xl">
          <P>The C program does not run one setting. It sweeps all of them, many seeds each, and writes one row per combination to a CSV. This is that, live.</P>
        </div>
        <Sweep ctl={lab} />
      </section>

      <PixelCard colors={GREENS} className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-24">
        <p className="rv text-dim">where the real numbers come from</p>
        <ol className="mt-8 max-w-4xl list-decimal space-y-5 pl-6 text-lg md:text-2xl">
          {pipeline.map((p) => <li key={p} className="rv">{p}</li>)}
        </ol>
        <Code>{"scripts/run_googlenet_experiment.sh"}</Code>
        <p className="rv mt-10 max-w-3xl text-foreground/70">While it simulates, the C program allocates no memory. Everything lives in fixed-size storage set up beforehand.</p>
      </PixelCard>

      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 px-6 py-24">
        <p className="rv text-dim">what it does not claim</p>
        {caveats.map((c) => <p key={c} className="rv flex gap-4 text-xl md:text-3xl"><span style={{ color: "#e5e510" }}>!</span>{c}</p>)}
      </section>

      <footer className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end gap-3 px-6 pb-16 md:px-16">
        <a href="https://github.com/Granted07/DES_GPUQueueingModel" target="_blank" rel="noreferrer" className="w-fit text-3xl hover:underline md:text-6xl">read the code</a>
        <Link href="/current" className="w-fit" style={{ color: G }}>the research this feeds →</Link>
        <Link href="/#work" className="w-fit text-dim hover:text-white">← home</Link>
      </footer>
    </div>
  );
}