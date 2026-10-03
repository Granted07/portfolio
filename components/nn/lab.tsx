"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { XOR, backward, create, forward, mse, type Act } from "@/lib/nn/net";
import type { Holder } from "./net-scene";

const NetScene = dynamic(() => import("./net-scene"), { ssr: false });
const G = "#0dbc79";
const clamp = (v: number) => Math.min(1, Math.max(0, v));

type Props = { H: Holder; sizes: number[]; hidden: number; onHidden: (n: number) => void };

export function Lab({ H, sizes, hidden, onHidden }: Props) {
  const probe = useRef([1, 0]);
  const hist = useRef<number[]>([]);
  const ep = useRef(0);
  const lr = useRef(0.5);
  const board = useRef<HTMLCanvasElement>(null);
  const curve = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState(false);
  const [rate, setRate] = useState(0.5);
  const [hAct, setHAct] = useState<Act>("sigmoid");
  const [stat, setStat] = useState({ epoch: 0, loss: NaN, out: [0, 0, 0, 0] });

  const epoch = useCallback(() => {
    let l = 0;
    for (const [x, t] of XOR) { l += mse(forward(H.net, x), t); backward(H.net, t, lr.current); }
    ep.current++;
    hist.current.push(l / XOR.length);
    return l / XOR.length;
  }, [H]);

  const paint = useCallback(() => {
    const c = board.current, d = curve.current;
    if (!c || !d) return;
    const g = c.getContext("2d")!, N = 32, s = c.width / N;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const o = forward(H.net, [(i + 0.5) / N, 1 - (j + 0.5) / N])[0], v = Number.isFinite(o) ? clamp(o) : 0;
      g.fillStyle = `rgb(${(80 - 67 * v) | 0},${(20 + 168 * v) | 0},${(20 + 101 * v) | 0})`;
      g.fillRect(i * s, j * s, s + 1, s + 1);
    }
    g.lineWidth = 2;
    for (const [x, t] of XOR) {
      g.beginPath(); g.arc(8 + x[0] * (c.width - 16), 8 + (1 - x[1]) * (c.height - 16), 7, 0, 7);
      g.fillStyle = t[0] ? "#fff" : "#000"; g.strokeStyle = "#fff"; g.fill(); g.stroke();
    }
    const [px, py] = probe.current;
    g.strokeStyle = "#e5e510"; g.strokeRect(px * c.width - 6, (1 - py) * c.height - 6, 12, 12);

    const q = d.getContext("2d")!, h = hist.current, n = h.length;
    q.clearRect(0, 0, d.width, d.height);
    q.strokeStyle = G; q.lineWidth = 2; q.beginPath();
    const top = Math.max(0.3, h[0] ?? 0.3);
    for (let k = 0; k < Math.min(n, 300); k++) {
      const v = h[Math.floor((k / Math.max(1, Math.min(n, 300) - 1)) * (n - 1))];
      const X = (k / 299) * d.width, Y = d.height - 4 - Math.min(1, v / top) * (d.height - 8);
      k ? q.lineTo(X, Y) : q.moveTo(X, Y);
    }
    q.stroke();
  }, [H]);

  useEffect(() => {
    let f = 0;
    const tick = () => {
      if (run) {
        let l = 0;
        for (let k = 0; k < 20; k++) l = epoch();
        if (!Number.isFinite(l)) setRun(false);
      }
      paint();
      if (++f % 6 === 0) setStat({ epoch: ep.current, loss: hist.current[hist.current.length - 1] ?? NaN, out: XOR.map(([x]) => forward(H.net, x)[0]) });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [run, epoch, paint, H]);

  const reset = (h = hidden, a = hAct) => {
    H.net = create([2, h, 1], [a, "sigmoid"]);
    hist.current = []; ep.current = 0; setRun(false); onHidden(h);
  };
  const drag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.type === "pointermove" && !e.buttons) return;
    const r = e.currentTarget.getBoundingClientRect();
    probe.current = [clamp((e.clientX - r.left) / r.width), clamp(1 - (e.clientY - r.top) / r.height)];
  };
  const btn = "border px-3 py-1 text-sm transition-colors";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:px-16">
      <div>
        <div className="aspect-[4/3] w-full border border-white/15 bg-black/50">
          <NetScene H={H} sizes={sizes} probe={probe} orbit />
        </div>
        <p className="mt-3 text-xs text-dim">Green lines are positive weights, red are negative. Light moving along a line is input × weight. Drag to rotate.</p>
      </div>

      <div className="flex flex-col gap-5 text-sm">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setRun((r) => !r)} className={btn} style={{ borderColor: G, color: G }}>{run ? "pause" : "train"}</button>
          <button onClick={() => { if (!run) epoch(); }} className={btn} style={{ borderColor: "#333" }}>one epoch</button>
          <button onClick={() => reset()} className={btn} style={{ borderColor: "#333" }}>new random weights</button>
        </div>
        <label className="flex items-center gap-4">
          <span className="w-28 text-dim">learning rate</span>
          <input type="range" min={0.02} max={2} step={0.02} value={rate} onChange={(e) => { setRate(+e.target.value); lr.current = +e.target.value; }} className="flex-1 accent-[#0dbc79]" />
          <span className="w-10 text-right">{rate.toFixed(2)}</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-28 text-dim">hidden</span>
          {[2, 3, 4, 6, 8].map((h) => (
            <button key={h} onClick={() => reset(h)} aria-pressed={hidden === h} className={btn} style={{ borderColor: hidden === h ? G : "#333", color: hidden === h ? G : "#a1a1aa" }}>{h}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-28 text-dim">hidden act.</span>
          {(["sigmoid", "relu"] as Act[]).map((a) => (
            <button key={a} onClick={() => { setHAct(a); reset(hidden, a); }} aria-pressed={hAct === a} className={btn} style={{ borderColor: hAct === a ? G : "#333", color: hAct === a ? G : "#a1a1aa" }}>{a}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <canvas ref={board} width={256} height={256} onPointerDown={drag} onPointerMove={drag} className="aspect-square w-full border border-white/20" style={{ imageRendering: "pixelated", touchAction: "none" }} aria-label="What the network answers for every input. Drag to move the probe." />
            <p className="mt-2 text-xs text-dim">Every possible input. Green means it answers 1, red means 0. White dots should be green, black dots red. Drag here to feed it your own input.</p>
          </div>
          <div>
            <canvas ref={curve} width={256} height={256} className="aspect-square w-full border border-white/20 bg-black/50" aria-label="Loss over epochs" />
            <p className="mt-2 text-xs text-dim">How wrong it is, per epoch.</p>
          </div>
        </div>

        <pre className="border-l-2 bg-black/60 px-4 py-3 leading-6 text-foreground/80" style={{ borderColor: G }}>
{`epoch ${stat.epoch}   loss ${Number.isFinite(stat.loss) ? stat.loss.toFixed(4) : "—"}
${XOR.map(([x], i) => `${x[0]} xor ${x[1]} → ${Number.isFinite(stat.out[i]) ? stat.out[i].toFixed(3) : "nan"}`).join("\n")}`}
        </pre>
        <p className="text-xs text-dim">This runs a TypeScript copy of the same arithmetic, one example at a time, like the C training loop.</p>
      </div>
    </div>
  );
}