"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scramble } from "@/components/scramble";
import PixelCard from "@/components/ui/pixel-card";
import { create } from "@/lib/nn/net";
import { MatrixLab } from "./matrix-lab";
import { Lab } from "./lab";
import { Backprop } from "./backprop";
import type { Holder } from "./net-scene";

const NetScene = dynamic(() => import("./net-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

const Y = "#e5e510";
const YELLOWS = ["#e5e510", "#a8a80b", "#6f6f07"];
const P = ({ children }: { children: React.ReactNode }) => <p className="rv">{children}</p>;
const Code = ({ children }: { children: string }) => (
  <pre className="rv w-fit max-w-full overflow-x-auto border-l-2 bg-black/60 px-4 py-3 text-xs text-foreground/80 md:text-sm" style={{ borderColor: Y }}>{children}</pre>
);
const rules = [
  "Every matrix is heap-allocated. Whoever creates one frees it.",
  "network_forward returns a matrix the last layer owns. Copy it if you want to keep it.",
  "-Wall -Wextra -Werror: a warning is a failed build.",
  "Tests for matrices, activations, layer forward and backward, network forward and loss, run with ctest.",
  "The library builds as nncore. Programs in apps/ only link against it.",
];
const open = [
  "One example at a time. Mini-batches mean teaching the matrices to hold many columns.",
  "Plain gradient descent. Momentum and Adam need state stored next to each layer.",
  "Weights start uniform in [−1, 1]. Larger networks want Xavier or He.",
  "Matrices are arrays of row pointers. One contiguous block would be faster.",
  "No saving or loading a trained network yet.",
];

export function NNStory() {
  const root = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(4);
  const sizes = useMemo(() => [2, hidden, 1], [hidden]);
  const [H] = useState<Holder>(() => ({ net: create([2, 4, 1], ["sigmoid", "sigmoid"]) }));

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
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-70">
          <NetScene H={H} sizes={sizes} />
        </div>
        <div className="relative z-10">
          <p className="hi text-dim"><Scramble text="granted07@kolkata:~/NeuralNetworkInC$ cmake --build build" /></p>
          <h1 className="hi mt-6 text-[clamp(2.4rem,9vw,8rem)] font-medium leading-[.9] tracking-tighter">neural-network-in-c</h1>
          <p className="hi mt-6 max-w-xl text-lg text-foreground/70">A neural network in C, built from the matrix up. The one behind this text runs the same arithmetic in your browser. By the end of the page you will have taught it something.</p>
          <p className="hi cursor mt-16 text-sm" style={{ color: Y }}>scroll</p>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>Everything in the library is one struct.</P>
        <Code>{"typedef struct {\n    int rows;\n    int cols;\n    double **matrix;\n} Matrix;"}</Code>
        <P>Inputs, weights, biases and gradients are all matrices. Add, subtract, multiply, transpose, scale, apply a function to every entry. Around a dozen operations, and nothing underneath them.</P>
        <P>A layer is one multiplication and one function.</P>
        <Code>{"z = W x + b\na = activation(z)"}</Code>
        <P>Move the inputs below. Each row of W scales the inputs, adds a bias and produces one number. The activation then bends it.</P>
      </section>

      <MatrixLab />

      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-32 text-xl md:text-3xl">
        <P>The activation is a function pointer.</P>
        <Code>{"double (*activation)(double);\ndouble (*activation_derivative)(double);"}</Code>
        <P>Every layer carries its own pair. Switching from sigmoid to relu a moment ago changed one pointer and no line of the layer.</P>
        <P>Stack layers and you have a network. The sizes array is the whole blueprint.</P>
        <Code>{"int sizes[] = {2, 4, 1};\nnetwork_create(sizes, 2, activations, derivatives);"}</Code>
        <P>Two numbers in, four in the middle, one out. That is two layers, and the picture at the top of the page.</P>
      </section>

      <section id="lab" className="pt-16">
        <div className="mx-auto max-w-3xl px-6 text-xl md:text-3xl">
          <p className="rv text-sm" style={{ color: Y }}>now teach it</p>
          <p className="rv mt-6">XOR is 1 when exactly one input is 1. Nobody writes that rule into the network. It gets four examples, guesses, is told how wrong it was, and every weight moves a little. Press train.</p>
        </div>
        <Lab H={H} sizes={sizes} hidden={hidden} onHidden={setHidden} />
      </section>

      <section className="pt-24">
        <div className="mx-auto max-w-3xl px-6 text-xl md:text-3xl">
          <P>That was network_forward then network_backward, four examples at a time. This is what one backward call does, layer by layer.</P>
        </div>
        <Backprop />
      </section>

      <PixelCard colors={YELLOWS} className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-24">
        <p className="rv text-dim">the rules it keeps</p>
        <ul className="mt-8 max-w-4xl space-y-5 text-lg md:text-2xl">
          {rules.map((r) => <li key={r} className="rv">{r}</li>)}
        </ul>
        <Code>{"free_matrix(m);\nfree_layer(layer);\nnetwork_free(network);"}</Code>
      </PixelCard>

      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 px-6 py-24">
        <p className="rv text-dim">still open</p>
        {open.map((o) => (
          <p key={o} className="rv flex gap-4 text-xl md:text-3xl"><span style={{ color: Y }}>?</span>{o}</p>
        ))}
      </section>

      <footer className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end gap-3 px-6 pb-16 md:px-16">
        <a href="https://github.com/Granted07/NeuralNetworkInC" target="_blank" rel="noreferrer" className="w-fit text-3xl hover:underline md:text-6xl">read the code</a>
        <Link href="/#work" className="w-fit text-dim hover:text-white">← home</Link>
      </footer>
    </div>
  );
}