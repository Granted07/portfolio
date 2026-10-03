// A TypeScript copy of the simulator's model, so it can run in the browser.
// Model: Poisson arrivals, a finite buffer, one GPU that serves a batch of a..b requests at a time,
// gamma-distributed batch time with mean = icpt + slope * batch size, optional synthetic cache hits,
// warm-up removal, and the Little's Law cross-check. Times are in milliseconds.
//
// ASSUMPTIONS to check against the C code (I could only read the README):
//  - N is the waiting buffer, not counting the batch on the GPU. If yours counts both, change the
//    `queue.length >= N` test in onArrive().
//  - A cache hit is answered instantly (latency 0) and never enters the queue.
//  - slope / icpt below are PLACEHOLDERS. Replace them with the line fitted to your GoogLeNet timings.

export type Cfg = { lambda: number; a: number; b: number; N: number; cov: number; slope: number; icpt: number; pHit: number; warm: number };
export const DEFAULT: Cfg = { lambda: 120, a: 1, b: 8, N: 24, cov: 0.5, slope: 0.6, icpt: 2.5, pHit: 0, warm: 200 };

export type Req = { id: number; t0: number; counted: boolean };
export type Trace = { k: "arrive" | "block" | "hit" | "start" | "depart"; id: number };
export type Sim = {
  cfg: Cfg; seed: number; rng: () => number;
  t: number; nextArr: number; departAt: number; startT: number;
  queue: Req[]; serving: Req[]; id: number; arrivals: number;
  on: boolean; t0: number; aq: number; as: number;
  hits: number; blocked: number; admitted: number; done: number; sumW: number; counted: number;
  trace: Trace[] | null; series: { t: number; w: number; c: boolean }[];
};

export const mulberry = (s: number) => () => {
  s |= 0; s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const expo = (r: () => number, rate: number) => -Math.log(1 - r()) / rate;
const norm = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
function gam(r: () => number, k: number): number {
  if (k < 1) return gam(r, k + 1) * Math.pow(1 - r(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do { x = norm(r); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const u = 1 - r();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
// CoV 0 is "identical every time". Otherwise shape = 1/CoV², scale = mean·CoV².
export const gamma = (r: () => number, mean: number, cov: number) => (cov < 1e-9 ? mean : (mean * cov * cov) * gam(r, 1 / (cov * cov)));

export function makeSim(cfg: Cfg, seed = 1, trace = false): Sim {
  const rng = mulberry(seed);
  return {
    cfg: { ...cfg }, seed, rng, t: 0, nextArr: expo(rng, cfg.lambda / 1000), departAt: Infinity, startT: 0,
    queue: [], serving: [], id: 0, arrivals: 0, on: false, t0: 0, aq: 0, as: 0,
    hits: 0, blocked: 0, admitted: 0, done: 0, sumW: 0, counted: 0, trace: trace ? [] : null, series: [],
  };
}

const accum = (s: Sim, to: number) => {
  if (s.on) { const dt = to - s.t; s.aq += dt * s.queue.length; s.as += dt * (s.queue.length + s.serving.length); }
  s.t = to;
};

function tryStart(s: Sim) {
  const need = Math.max(1, Math.min(s.cfg.a, s.cfg.N));
  if (s.serving.length || s.queue.length < need) return;
  const n = Math.min(s.queue.length, s.cfg.b);
  s.serving = s.queue.splice(0, n);
  s.startT = s.t;
  s.departAt = s.t + gamma(s.rng, s.cfg.icpt + s.cfg.slope * n, s.cfg.cov);
  if (s.trace) for (const r of s.serving) s.trace.push({ k: "start", id: r.id });
}

function onArrive(s: Sim) {
  s.arrivals++;
  if (!s.on && s.arrivals > s.cfg.warm) { s.on = true; s.t0 = s.t; s.aq = 0; s.as = 0; } // warm-up over: start measuring
  const r: Req = { id: ++s.id, t0: s.t, counted: s.on };
  const hit = s.cfg.pHit > 0 && s.rng() < s.cfg.pHit; // no random number is drawn when caching is off
  if (s.on) s.counted++;
  if (hit) { if (s.on) s.hits++; s.trace?.push({ k: "hit", id: r.id }); return; }
  if (s.queue.length >= s.cfg.N) { if (s.on) s.blocked++; s.trace?.push({ k: "block", id: r.id }); return; }
  s.queue.push(r);
  if (s.on) s.admitted++;
  s.trace?.push({ k: "arrive", id: r.id });
  tryStart(s);
}

function onDepart(s: Sim) {
  for (const r of s.serving) {
    const w = s.t - r.t0;
    s.series.push({ t: s.t, w, c: r.counted });
    if (r.counted) { s.done++; s.sumW += w; }
    s.trace?.push({ k: "depart", id: r.id });
  }
  if (s.series.length > 600) s.series.splice(0, s.series.length - 600);
  s.serving = []; s.departAt = Infinity;
  tryStart(s);
}

// There are only ever two things that can happen next.
export function step(s: Sim): "arrive" | "depart" {
  if (s.nextArr <= s.departAt) {
    accum(s, s.nextArr); onArrive(s);
    s.nextArr = s.t + expo(s.rng, s.cfg.lambda / 1000);
    return "arrive";
  }
  accum(s, s.departAt); onDepart(s);
  return "depart";
}
export function advance(s: Sim, dt: number) {
  const to = s.t + dt;
  while (Math.min(s.nextArr, s.departAt) <= to) step(s);
  accum(s, to);
}
export function fast(s: Sim, arrivals: number) {
  s.trace = null;
  const goal = s.arrivals + arrivals;
  while (s.arrivals < goal) step(s);
}

export function metrics(s: Sim) {
  const win = s.t - s.t0;
  if (!s.on || win <= 0) return { warming: true, n: 0, miss: 0, overall: 0, Lq: 0, L: 0, block: 0, hit: 0, lamEff: 0, little: 0 };
  const lam = s.admitted / win;
  return {
    warming: false, n: s.counted,
    miss: s.sumW / Math.max(1, s.done), overall: s.sumW / Math.max(1, s.done + s.hits),
    Lq: s.aq / win, L: s.as / win,
    block: s.blocked / Math.max(1, s.blocked + s.admitted), hit: s.hits / Math.max(1, s.counted),
    lamEff: lam * 1000, little: lam > 0 ? s.as / win / lam : 0, // Little's Law: W = L / λ_eff
  };
}