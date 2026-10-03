"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ACT, type Act } from "@/lib/nn/net";

const W = [[0.8, -0.6], [-0.4, 0.9], [0.5, 0.7]], B = [0.1, -0.2, 0.05];
const COL = ["#0dbc79", "#e5e510", "#bc3fbc"];
const n2 = (n: number) => (n < 0 ? "−" : "") + Math.abs(n).toFixed(2);
const PW = 300, PH = 150;
const px = (z: number) => ((Math.max(-4, Math.min(4, z)) + 4) / 8) * PW;
const py = (a: number) => PH - 10 - ((Math.max(-0.2, Math.min(2, a)) + 0.2) / 2.2) * (PH - 20);

export function MatrixLab() {
  const [x, setX] = useState([1.2, 0.5]);
  const [act, setAct] = useState<Act>("sigmoid");
  const [hot, setHot] = useState<number | null>(null);
  const z = W.map((r, i) => r[0] * x[0] + r[1] * x[1] + B[i]);
  const a = z.map(ACT[act].f);
  const curve = Array.from({ length: 41 }, (_, k) => { const v = -4 + k * 0.2; return `${k ? "L" : "M"}${px(v).toFixed(1)},${py(ACT[act].f(v)).toFixed(1)}`; }).join("");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:px-16">
      <div className="flex flex-col gap-6 text-sm">
        {[0, 1].map((k) => (
          <label key={k} className="flex items-center gap-4">
            <span className="w-8 text-dim">x{k + 1}</span>
            <input type="range" min={-2} max={2} step={0.05} value={x[k]} onChange={(e) => setX((p) => p.map((v, i) => (i === k ? +e.target.value : v)))} className="flex-1 accent-[#0dbc79]" />
            <span className="w-14 text-right">{n2(x[k])}</span>
          </label>
        ))}
        <div className="flex gap-2" role="group" aria-label="Activation">
          {(["sigmoid", "relu"] as Act[]).map((k) => (
            <button key={k} onClick={() => setAct(k)} aria-pressed={act === k} className="border px-3 py-1 transition-colors" style={{ borderColor: act === k ? "#0dbc79" : "#333", color: act === k ? "#0dbc79" : "#a1a1aa" }}>{k}</button>
          ))}
        </div>
        <div className="space-y-3">
          {W.map((r, i) => (
            <motion.div key={i} onHoverStart={() => setHot(i)} onHoverEnd={() => setHot(null)} animate={{ x: hot === i ? 8 : 0 }} className="border-l-2 py-1 pl-4" style={{ borderColor: COL[i] }}>
              <p className="text-dim">
                {n2(r[0])} × {n2(x[0])} + {n2(r[1])} × {n2(x[1])} + {n2(B[i])}
              </p>
              <p className="mt-1 flex items-center gap-3">
                <span>z = {n2(z[i])}</span><span className="text-dim">→</span><span style={{ color: COL[i] }}>a = {n2(a[i])}</span>
              </p>
              <div className="mt-2 h-1 w-full bg-white/10">
                <motion.div className="h-full origin-left" style={{ background: COL[i] }} animate={{ scaleX: Math.min(1, Math.abs(a[i]) / (act === "relu" ? 2 : 1)) }} transition={{ type: "spring", stiffness: 220, damping: 26 }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <svg viewBox={`0 0 ${PW} ${PH}`} className="w-full border border-white/15 bg-black/50" role="img" aria-label={`${act} curve with the three z values marked`}>
          <line x1={PW / 2} x2={PW / 2} y1={0} y2={PH} stroke="#fff" strokeOpacity={0.15} />
          <line x1={0} x2={PW} y1={py(0)} y2={py(0)} stroke="#fff" strokeOpacity={0.15} />
          <path d={curve} fill="none" stroke="#ededed" strokeOpacity={0.6} />
          {z.map((v, i) => (
            <motion.circle key={i} r={hot === i ? 7 : 5} fill={COL[i]} animate={{ cx: px(v), cy: py(a[i]) }} transition={{ type: "spring", stiffness: 260, damping: 28 }} />
          ))}
        </svg>
        <p className="text-xs text-dim">Each dot is one row. Its position along the bottom is z, its height is what the activation turns z into. Move the sliders and watch them slide along the curve.</p>
      </div>
    </div>
  );
}