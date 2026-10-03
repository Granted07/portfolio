"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DEFAULT, makeSim, step, type Cfg } from "@/lib/des/sim";

const Y = "#e5e510", G = "#0dbc79", R = "#cd3131";
const CFG: Cfg = { ...DEFAULT, lambda: 320, a: 1, b: 4, N: 5, cov: 0.5, warm: 0 };
const f1 = (n: number) => n.toFixed(1);

export function Stepper() {
  const [sim, setSim] = useState(() => makeSim(CFG, 3, true));
  const [log, setLog] = useState<{ n: number; text: string; jump: number }[]>([]);
  const [, bump] = useState(0);

  const go = (times: number) => {
    const out: { n: number; text: string; jump: number }[] = [];
    for (let i = 0; i < times; i++) {
      const before = sim.t, kind = step(sim), tr = sim.trace!.splice(0);
      const has = (k: string) => tr.filter((e) => e.k === k).length;
      const text = kind === "arrive"
        ? has("block") ? "a request arrives, the buffer is full, it is turned away"
          : has("start") ? `a request arrives, the GPU is idle, a batch of ${has("start")} starts` : "a request arrives and joins the queue"
        : `the GPU finishes ${has("depart")}${has("start") ? `, then starts a batch of ${has("start")}` : ", and goes idle"}`;
      out.push({ n: sim.arrivals + sim.series.length, text, jump: sim.t - before });
    }
    setLog((l) => [...out.reverse(), ...l].slice(0, 6));
    bump((v) => v + 1);
  };
  const reset = () => { setSim(makeSim(CFG, 3, true)); setLog([]); };

  const cal = [
    { key: "arr", label: "next arrival", at: sim.nextArr },
    { key: "dep", label: "GPU finishes", at: sim.departAt },
  ].sort((a, b) => a.at - b.at);
  const blocked = sim.blocked;
  const chip = (id: number, c: string) => (
    <motion.span key={id} layout initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex h-8 w-8 items-center justify-center border text-xs" style={{ borderColor: c, color: c }}>{id}</motion.span>
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:px-16">
      <div className="flex flex-col gap-6 text-sm">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => go(1)} className="border px-3 py-1" style={{ borderColor: Y, color: Y }}>next event</button>
          <button onClick={() => go(10)} className="border px-3 py-1" style={{ borderColor: "#333" }}>skip 10 events</button>
          <button onClick={reset} className="border px-3 py-1" style={{ borderColor: "#333" }}>restart</button>
        </div>
        <p className="text-3xl md:text-5xl">t = {f1(sim.t)} ms</p>

        <div>
          <p className="mb-2 text-dim">the whole future, sorted</p>
          <div className="flex flex-col gap-2">
            {cal.map((c, i) => (
              <motion.div key={c.key} layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex justify-between border px-4 py-3" style={{ borderColor: i === 0 ? Y : "#333", opacity: i === 0 ? 1 : 0.6 }}>
                <span>{c.label}</span><span>{Number.isFinite(c.at) ? `${f1(c.at)} ms` : "nothing running"}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-2 text-xs text-dim">The top one happens next. The clock jumps straight to it.</p>
        </div>

        <div className="space-y-3">
          <div><p className="mb-2 text-dim">queue (buffer holds {sim.cfg.N})</p><div className="flex min-h-8 flex-wrap gap-1"><AnimatePresence>{sim.queue.map((r) => chip(r.id, G))}</AnimatePresence></div></div>
          <div><p className="mb-2 text-dim">on the GPU</p><div className="flex min-h-8 flex-wrap gap-1"><AnimatePresence>{sim.serving.map((r) => chip(r.id, Y))}</AnimatePresence></div></div>
          <p style={{ color: blocked ? R : "#707070" }}>turned away so far: {blocked}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <p className="text-dim">what just happened</p>
        {log.length === 0 && <p className="text-foreground/70">Press next event. Nothing has happened yet, and the first thing on the list is an arrival.</p>}
        <AnimatePresence initial={false}>
          {log.map((l, i) => (
            <motion.div key={l.n} layout initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1 - i * 0.14, y: 0 }} exit={{ opacity: 0 }} className="border-l-2 pl-4" style={{ borderColor: i === 0 ? Y : "#333" }}>
              <p>{l.text}</p>
              <p className="text-xs text-dim">the clock skipped {f1(l.jump)} ms of nothing</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}