"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { expo, gamma, mulberry } from "@/lib/des/sim";

const G = "#0dbc79", Y = "#e5e510";
const BINS = 40;

function hist(xs: number[]) {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
  const p99 = [...xs].sort((a, b) => a - b)[Math.floor(xs.length * 0.99)];
  const hi = Math.max(p99, mean * 1.5), bins = Array<number>(BINS).fill(0);
  xs.forEach((x) => { bins[Math.min(BINS - 1, Math.floor((x / hi) * BINS))]++; });
  return { bins, hi, mean, cov: sd / mean };
}

function Bars({ h, color }: { h: ReturnType<typeof hist>; color: string }) {
  const top = Math.max(...h.bins), w = 400 / BINS;
  return (
    <svg viewBox="0 0 400 120" className="w-full border border-white/15 bg-black/50">
      {h.bins.map((c, i) => {
        const bh = (c / top) * 110;
        return <motion.rect key={i} x={i * w + 1} width={w - 2} fill={color} initial={false} animate={{ y: 118 - bh, height: bh }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />;
      })}
    </svg>
  );
}

export function Dists() {
  const [lam, setLam] = useState(200);
  const [cov, setCov] = useState(0.5);
  const [mean, setMean] = useState(12);
  const [seed, setSeed] = useState(1);
  const d = useMemo(() => {
    const r = mulberry(seed);
    const gaps = Array.from({ length: 4000 }, () => expo(r, lam / 1000));
    const svc = Array.from({ length: 4000 }, () => gamma(r, mean, cov));
    let t = 0;
    const ticks = gaps.slice(0, 50).map((g) => (t += g));
    return { g: hist(gaps), s: hist(svc), ticks, span: t };
  }, [lam, cov, mean, seed]);
  const btn = "border px-3 py-1 transition-colors";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:px-16">
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-lg">arrival gaps</p>
        <label className="flex items-center gap-4">
          <span className="w-28 text-dim">requests / s</span>
          <input type="range" min={20} max={1000} step={10} value={lam} onChange={(e) => setLam(+e.target.value)} className="flex-1 accent-[#0dbc79]" />
          <span className="w-12 text-right">{lam}</span>
        </label>
        <Bars h={d.g} color={G} />
        <svg viewBox="0 0 400 24" className="w-full" aria-label="The first 50 arrivals on a timeline">
          {d.ticks.map((t, i) => <line key={i} x1={(t / d.span) * 396 + 2} x2={(t / d.span) * 396 + 2} y1={2} y2={22} stroke={G} strokeOpacity={0.8} />)}
        </svg>
        <p className="text-dim">Mean gap {d.g.mean.toFixed(2)} ms. The strip is the first 50 arrivals on a timeline. Gaps pile up near zero, so requests arrive in clumps with long quiet stretches. That is what no pattern looks like.</p>
      </div>

      <div className="flex flex-col gap-4 text-sm">
        <p className="text-lg">batch run times</p>
        <label className="flex items-center gap-4">
          <span className="w-28 text-dim">mean (ms)</span>
          <input type="range" min={3} max={50} step={1} value={mean} onChange={(e) => setMean(+e.target.value)} className="flex-1 accent-[#e5e510]" />
          <span className="w-12 text-right">{mean}</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-28 text-dim">spread (CoV)</span>
          {[0, 0.5, 1.4].map((c) => (
            <button key={c} onClick={() => setCov(c)} aria-pressed={cov === c} className={btn} style={{ borderColor: cov === c ? Y : "#333", color: cov === c ? Y : "#a1a1aa" }}>{c}</button>
          ))}
          <input type="range" min={0} max={2} step={0.05} value={cov} onChange={(e) => setCov(+e.target.value)} className="w-24 accent-[#e5e510]" aria-label="CoV" />
        </div>
        <Bars h={d.s} color={Y} />
        <p className="text-dim">Measured from 4,000 draws: mean {d.s.mean.toFixed(2)} ms, CoV {d.s.cov.toFixed(2)}. CoV is spread divided by mean. At 0 every batch takes exactly the mean. At 1.4 some batches take several times longer than others.</p>
        <button onClick={() => setSeed((s) => s + 1)} className={`${btn} w-fit`} style={{ borderColor: "#333" }}>draw again (seed {seed})</button>
      </div>
    </div>
  );
}

// slope and intercept: mean batch time = icpt + slope * b
export function Batching() {
  const [icpt, setIcpt] = useState(2.5);
  const [slope, setSlope] = useState(0.6);
  const [b, setB] = useState(8);
  const per = (n: number) => (icpt + slope * n) / n;
  const cap = (n: number) => (1000 * n) / (icpt + slope * n);
  const top = per(1), X = (n: number) => 8 + ((n - 1) / 63) * 384, Yp = (v: number) => 112 - (v / top) * 100;
  const path = Array.from({ length: 64 }, (_, i) => `${i ? "L" : "M"}${X(i + 1).toFixed(1)},${Yp(per(i + 1)).toFixed(1)}`).join("");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:px-16">
      <div className="flex flex-col gap-5 text-sm">
        {[["fixed cost (ms)", icpt, setIcpt, 0.5, 10, 0.1, "#e5e510"], ["cost per request (ms)", slope, setSlope, 0.05, 2, 0.05, "#e5e510"], ["batch size", b, setB, 1, 64, 1, "#0dbc79"]].map(([l, v, set, lo, hi, st, c]) => (
          <label key={l as string} className="flex items-center gap-4">
            <span className="w-40 text-dim">{l as string}</span>
            <input type="range" min={lo as number} max={hi as number} step={st as number} value={v as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="flex-1" style={{ accentColor: c as string }} />
            <span className="w-12 text-right">{(v as number).toFixed(l === "batch size" ? 0 : 2)}</span>
          </label>
        ))}
        <pre className="border-l-2 bg-black/60 px-4 py-3 leading-6 text-foreground/80" style={{ borderColor: Y }}>
{`one batch of ${b}     ${(icpt + slope * b).toFixed(1)} ms
per request        ${per(b).toFixed(2)} ms
GPU can sustain    ${cap(b).toFixed(0)} requests/s`}
        </pre>
      </div>
      <div className="flex flex-col gap-3">
        <svg viewBox="0 0 400 124" className="w-full border border-white/15 bg-black/50" role="img" aria-label="Time per request against batch size">
          <path d={path} fill="none" stroke={Y} strokeWidth={2} />
          <motion.line y1={0} y2={124} stroke="#fff" strokeOpacity={0.3} initial={false} animate={{ x1: X(b), x2: X(b) }} />
          <motion.circle r={5} fill={G} initial={false} animate={{ cx: X(b), cy: Yp(per(b)) }} transition={{ type: "spring", stiffness: 260, damping: 28 }} />
        </svg>
        <p className="text-xs text-dim">Time per request as the batch grows. Alone, a request pays the whole fixed cost. In a batch of 64 it pays a sixty-fourth of it. Sustainable load goes from {cap(1).toFixed(0)}/s at batch 1 to {cap(64).toFixed(0)}/s at batch 64. Send more than that and the queue only grows. These numbers are placeholders until your GoogLeNet fit goes into lib/des/sim.ts.</p>
      </div>
    </div>
  );
}