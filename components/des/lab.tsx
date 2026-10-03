"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { motion } from "motion/react";
import { fast, makeSim, metrics, type Cfg } from "@/lib/des/sim";
import type { Ctl } from "@/components/des/queue-scene";

const QueueScene = dynamic(() => import("@/components/des/queue-scene"), { ssr: false });
const G = "#0dbc79", Y = "#e5e510", R = "#cd3131";

const presets: { name: string; patch: Partial<Cfg> }[] = [
  { name: "calm", patch: { lambda: 1000, a: 5, b: 40, N: 24, cov: 0.5, pHit: 0 } },
  { name: "crowded", patch: { lambda: 900, a: 1, b: 8, N: 24, cov: 0.5, pHit: 0 } },
  { name: "make it wait for 8", patch: { lambda: 60, a: 8, b: 16, N: 24, cov: 0.5, pHit: 0 } },
  { name: "unpredictable GPU", patch: { lambda: 300, a: 1, b: 16, N: 32, cov: 1.4, pHit: 0 } },
];


export function Lab({ ctl }: { ctl: Ctl }) {
  const calmPatch = presets.find((p) => p.name === "calm")?.patch || {};
  const initialCfg: Cfg = { ...ctl.sim.cfg, ...calmPatch };
  const [cfg, setCfg] = useState<Cfg>(() => {
    // Apply calm patch to simulation instance on load
    ctl.sim = makeSim(initialCfg, 1, true);
    return initialCfg;
  });
  const [seed, setSeed] = useState(1);
  const [run, setRun] = useState(true);
  const [speed, setSpeed] = useState(ctl.speed);
  const [m, setM] = useState(metrics(ctl.sim));
  const [evps, setEvps] = useState("");
  const chart = useRef<HTMLCanvasElement>(null);

  const restart = (c: Cfg, s: number) => { ctl.sim = makeSim(c, s, true); };
  const apply = (patch: Partial<Cfg>, s = seed) => {
    const n = { ...cfg, ...patch };
    n.a = Math.max(1, Math.min(n.a, n.b, n.N));
    setCfg(n); restart(n, s);
  };

  useEffect(() => {
    let f = 0;
    const tick = () => {
      if (++f % 8) return;
      setM(metrics(ctl.sim));
      const c = chart.current;
      if (!c) return;
      const g = c.getContext("2d")!, ser = ctl.sim.series;
      g.clearRect(0, 0, c.width, c.height);
      if (!ser.length) return;
      const top = Math.max(...ser.map((p) => p.w)) * 1.05, t0 = ser[0].t, span = Math.max(1, ser[ser.length - 1].t - t0);
      const X = (t: number) => ((t - t0) / span) * (c.width - 4) + 2, Yv = (w: number) => c.height - 4 - (w / top) * (c.height - 8);
      const firstOn = ser.findIndex((p) => p.c);
      if (firstOn !== 0) { g.fillStyle = "rgba(205,49,49,.12)"; g.fillRect(0, 0, firstOn < 0 ? c.width : X(ser[firstOn].t), c.height); }
      for (const p of ser) { g.fillStyle = p.c ? "rgba(13,188,121,.55)" : "rgba(205,49,49,.6)"; g.fillRect(X(p.t), Yv(p.w), 2, 2); }
      g.strokeStyle = Y; g.lineWidth = 2; g.beginPath();
      let sum = 0, n = 0, started = false;
      for (const p of ser) { if (!p.c) continue; sum += p.w; n++; const x = X(p.t), y = Yv(sum / n); started ? g.lineTo(x, y) : g.moveTo(x, y); started = true; }
      g.stroke();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [ctl]);

  const ff = () => {
    const t = performance.now(), before = ctl.sim.arrivals;
    fast(ctl.sim, 10000);
    ctl.sim.trace = [];
    setEvps(`${(ctl.sim.arrivals - before).toLocaleString()} requests simulated in ${(performance.now() - t).toFixed(0)} ms`);
    setM(metrics(ctl.sim));
  };
  const ratio = m.miss > 0 ? m.little / m.miss : 0;
  const btn = "border px-3 py-1 text-sm transition-colors";
  const sl = (label: string, k: keyof Cfg, lo: number, hi: number, st: number, fmt = (v: number) => String(v)) => (
    <label key={k} className="flex items-center gap-4 text-sm">
      <span className="w-32 shrink-0 text-dim">{label}</span>
      <input type="range" min={lo} max={hi} step={st} value={cfg[k]} onChange={(e) => apply({ [k]: +e.target.value })} className="flex-1 accent-[#0dbc79]" />
      <span className="w-12 text-right">{fmt(cfg[k])}</span>
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-16">
      <div className="relative aspect-video w-full border border-white/15 bg-black/50">
        <QueueScene ctl={ctl} orbit />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 text-xs text-dim">
          <span className="absolute left-[3%]">arrivals</span>
          <span className="absolute left-[23%] -translate-x-1/2">buffer (N)</span>
          <span className="absolute left-[67%] -translate-x-1/2" style={{ color: Y }}>GPU</span>
          <span className="absolute right-[3%]">done</span>
        </div>
        <p aria-hidden className="pointer-events-none absolute left-3 top-3 text-xs text-dim">red = turned away · blue = cache hit</p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { ctl.run = !run; setRun(!run); }} className={btn} style={{ borderColor: G, color: G }}>{run ? "pause" : "play"}</button>
            <button onClick={ff} className={btn} style={{ borderColor: Y, color: Y }}>simulate 10,000 requests now</button>
            <button onClick={() => restart(cfg, seed)} className={btn} style={{ borderColor: "#333" }}>restart</button>
          </div>
          {evps && <p className="text-xs" style={{ color: Y }}>{evps}</p>}
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => <button key={p.name} onClick={() => apply(p.patch)} className={btn} style={{ borderColor: "#333" }}>{p.name}</button>)}
          </div>
          {sl("requests / s", "lambda", 20, 1500, 10)}
          {sl("min batch (a)", "a", 1, 16, 1)}
          {sl("max batch (b)", "b", 1, 64, 1)}
          {sl("buffer (N)", "N", 1, 64, 1)}
          {sl("cache hit chance", "pHit", 0, 0.9, 0.05, (v) => v.toFixed(2))}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-32 shrink-0 text-dim">spread (CoV)</span>
            {[0, 0.5, 1.4].map((c) => <button key={c} onClick={() => apply({ cov: c })} aria-pressed={cfg.cov === c} className={btn} style={{ borderColor: cfg.cov === c ? G : "#333", color: cfg.cov === c ? G : "#a1a1aa" }}>{c}</button>)}
          </div>
          <label className="flex items-center gap-4 text-sm">
            <span className="w-32 shrink-0 text-dim">speed</span>
            <input type="range" min={1} max={500} step={5} value={speed} onChange={(e) => { setSpeed(+e.target.value); ctl.speed = +e.target.value; }} className="flex-1 accent-[#0dbc79]" />
            <span className="w-12 text-right">{speed}×</span>
          </label>
          <label className="flex items-center gap-4 text-sm">
            <span className="w-32 shrink-0 text-dim">seed</span>
            <input type="number" min={1} value={seed} onChange={(e) => { const s = Math.max(1, +e.target.value || 1); setSeed(s); restart(cfg, s); }} className="w-24 border border-white/20 bg-black px-2 py-1" />
            <span className="text-xs text-dim">same seed, same run</span>
          </label>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <pre className="border-l-2 bg-black/60 px-4 py-3 leading-6 text-foreground/80" style={{ borderColor: G }}>
{m.warming ? `warming up: ${ctl.sim.arrivals}/${cfg.warm} requests thrown away` : `measured over ${m.n.toLocaleString()} requests
latency, all        ${m.overall.toFixed(2)} ms
latency, misses     ${m.miss.toFixed(2)} ms
queue length        ${m.Lq.toFixed(2)}
turned away         ${(m.block * 100).toFixed(1)} %
cache hits          ${(m.hit * 100).toFixed(1)} %
arrivals admitted   ${m.lamEff.toFixed(0)} / s`}
          </pre>
          <div>
            <canvas ref={chart} width={600} height={160} className="w-full border border-white/15 bg-black/50" aria-label="Latency of each finished request over time" />
            <p className="mt-2 text-xs text-dim">Each dot is one finished request. Red ones are the warm-up, which the simulator throws away because the system started empty. Green ones are kept. The yellow line is their running average settling down.</p>
          </div>
          <div className="space-y-2">
            <p className="text-dim">Little&apos;s Law check</p>
            {[["measured wait", m.miss, G], ["people inside ÷ rate in", m.little, Y]].map(([l, v, c]) => (
              <div key={l as string}>
                <div className="flex justify-between text-xs"><span>{l as string}</span><span>{(v as number).toFixed(2)} ms</span></div>
                <div className="h-1 bg-white/10"><motion.div className="h-full origin-left" style={{ background: c as string }} animate={{ scaleX: Math.min(1, (v as number) / (Math.max(m.miss, m.little, 1e-9) * 1.0)) }} transition={{ type: "spring", stiffness: 200, damping: 28 }} /></div>
              </div>
            ))}
            <p className="text-xs" style={{ color: m.warming || !ratio ? "#707070" : Math.abs(ratio - 1) < 0.03 ? G : R }}>
              {m.warming || !ratio ? "waiting for numbers" : `the two ways of measuring differ by ${(Math.abs(ratio - 1) * 100).toFixed(1)}%`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}