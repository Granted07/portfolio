"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const Y = "#e5e510";
const steps = [
  { t: "start at the end", f: "dMSE/da = 2/n · (prediction − target)", s: "How far off each output was, and in which direction.", reads: ["a"] },
  { t: "through the activation", f: "dL/dz = dL/da · activation'(z)", s: "The activation's derivative is evaluated at the z the forward pass saw. That is why forward has to run first.", reads: ["z"] },
  { t: "blame the weights", f: "dL/dW = dL/dz · xᵀ", s: "A weight matters in proportion to the input that went through it.", reads: ["x"] },
  { t: "blame the bias", f: "dL/db = dL/dz", s: "A bias adds straight into z, so it gets the gradient as it is.", reads: [] },
  { t: "pass it back", f: "dL/dx = Wᵀ · dL/dz", s: "This layer's input is the previous layer's output, so this becomes its starting point. Repeat to the first layer.", reads: ["W"] },
  { t: "step", f: "W = W − lr · dL/dW\nb = b − lr · dL/db", s: "Move every weight a little in the direction that lowers the error. Then the next example.", reads: [] },
];

export function Backprop() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setI((v) => (v + 1) % steps.length), 3600);
    return () => clearInterval(id);
  }, [auto]);
  const s = steps[i];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-[minmax(0,320px)_1fr] md:px-16">
      <ol className="flex flex-col text-sm">
        {steps.map((st, k) => (
          <li key={st.t}>
            <button onClick={() => { setAuto(false); setI(k); }} aria-current={i === k} className="flex w-full items-center gap-3 border-l-2 py-2 pl-4 text-left transition-colors" style={{ borderColor: i === k ? Y : "#333", color: i === k ? Y : "#707070" }}>
              {st.t}
            </button>
          </li>
        ))}
      </ol>
      <div className="flex min-h-[18rem] flex-col gap-6">
        <div className="flex gap-3" aria-label="Values the layer cached on the way forward">
          {["x", "z", "a", "W"].map((k) => (
            <motion.span key={k} animate={{ opacity: s.reads.includes(k) ? 1 : 0.25, scale: s.reads.includes(k) ? 1.15 : 1, borderColor: s.reads.includes(k) ? Y : "#333" }} className="flex h-10 w-10 items-center justify-center border text-sm">{k}</motion.span>
          ))}
          <span className="self-center pl-2 text-xs text-dim">what this step reads</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="flex flex-col gap-5">
            <pre className="w-fit max-w-full overflow-x-auto border-l-2 bg-black/60 px-4 py-3 text-base md:text-2xl" style={{ borderColor: Y }}>{s.f}</pre>
            <p className="max-w-xl text-lg text-foreground/70 md:text-xl">{s.s}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}