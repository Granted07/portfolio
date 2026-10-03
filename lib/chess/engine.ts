import { VALUE, PST } from "./tables";

// squares are row*8+col, row 0 = rank 8. white = +1..+6 (P N B R Q K), black = negative.
export const LETTERS = ["", "P", "N", "B", "R", "Q", "K"];
export type Move = { f: number; t: number; k: number }; // k: 0 quiet, 1 double push, 2 en passant, 3 castle, 4 promotion
export type Pos = { b: Int8Array; side: 1 | -1; cr: number; ep: number; h1: number; h2: number };
export type Stats = { depth: number; score: number; nodes: number; cutoffs: number; ttHits: number; ms: number; best: Move | null };

const N8 = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], K8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const DIAG = [[1,1],[1,-1],[-1,1],[-1,-1]], ORTH = [[1,0],[-1,0],[0,1],[0,-1]];

let seed = 20241229;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return (t ^ (t >>> 14)) | 0; };
const Z1 = Array.from({ length: 13 * 64 }, rnd), Z2 = Array.from({ length: 13 * 64 }, rnd);
const ZS1 = rnd(), ZS2 = rnd(), ZC1 = Array.from({ length: 16 }, rnd), ZC2 = Array.from({ length: 16 }, rnd), ZE1 = Array.from({ length: 9 }, rnd), ZE2 = Array.from({ length: 9 }, rnd);
const zi = (p: number, s: number) => (p + 6) * 64 + s;
export const hashKey = (p: Pos) => (p.h1 >>> 0) * 2097152 + (p.h2 & 0x1fffff);
export const hashHex = (p: Pos) => (p.h1 >>> 0).toString(16).padStart(8, "0") + (p.h2 >>> 0).toString(16).padStart(8, "0");

export function start(): Pos {
  const b = new Int8Array(64), back = [4, 2, 3, 5, 6, 3, 2, 4];
  for (let c = 0; c < 8; c++) { b[c] = -back[c]; b[8 + c] = -1; b[48 + c] = 1; b[56 + c] = back[c]; }
  const p: Pos = { b, side: 1, cr: 15, ep: -1, h1: 0, h2: 0 };
  rehash(p);
  return p;
}
export function rehash(p: Pos) {
  let a = 0, c = 0;
  for (let s = 0; s < 64; s++) if (p.b[s]) { a ^= Z1[zi(p.b[s], s)]; c ^= Z2[zi(p.b[s], s)]; }
  a ^= ZC1[p.cr] ^ ZE1[p.ep < 0 ? 8 : p.ep & 7]; c ^= ZC2[p.cr] ^ ZE2[p.ep < 0 ? 8 : p.ep & 7];
  if (p.side < 0) { a ^= ZS1; c ^= ZS2; }
  p.h1 = a; p.h2 = c;
}

export function attacked(b: Int8Array, sq: number, by: 1 | -1): boolean {
  const r = sq >> 3, c = sq & 7, pr = r + by; // a white pawn attacks up the board, so it sits one row below its target
  for (const dc of [-1, 1]) { const cc = c + dc; if (pr >= 0 && pr < 8 && cc >= 0 && cc < 8 && b[pr * 8 + cc] === by) return true; }
  for (const [dr, dc] of N8) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === 2 * by) return true; }
  for (const [dr, dc] of K8) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === 6 * by) return true; }
  for (const [ds, pcs] of [[DIAG, [3, 5]], [ORTH, [4, 5]]] as [number[][], number[]][])
    for (const [dr, dc] of ds) {
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { const v = b[rr * 8 + cc]; if (v) { if (v * by > 0 && pcs.includes(v * by)) return true; break; } rr += dr; cc += dc; }
    }
  return false;
}
const kingSq = (b: Int8Array, side: number) => b.indexOf(6 * side);
export const inCheck = (p: Pos, side: 1 | -1) => attacked(p.b, kingSq(p.b, side), (-side) as 1 | -1);

export function pseudo(p: Pos, caps = false): Move[] {
  const out: Move[] = [], { b, side } = p, push = (f: number, t: number, k = 0) => out.push({ f, t, k });
  for (let s = 0; s < 64; s++) {
    const v = b[s];
    if (!v || v * side < 0) continue;
    const r = s >> 3, c = s & 7, a = v * side;
    if (a === 1) {
      const nr = r - side, last = nr === 0 || nr === 7;
      if (!caps && b[nr * 8 + c] === 0) {
        push(s, nr * 8 + c, last ? 4 : 0);
        if (r === (side > 0 ? 6 : 1) && b[(r - 2 * side) * 8 + c] === 0) push(s, (r - 2 * side) * 8 + c, 1);
      }
      for (const dc of [-1, 1]) {
        const cc = c + dc; if (cc < 0 || cc > 7) continue;
        const t = nr * 8 + cc;
        if (b[t] * side < 0) push(s, t, last ? 4 : 0); else if (t === p.ep) push(s, t, 2);
      }
    } else if (a === 2 || a === 6) {
      for (const [dr, dc] of a === 2 ? N8 : K8) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] * side <= 0 && (!caps || b[rr * 8 + cc])) push(s, rr * 8 + cc);
      }
      if (a === 6 && !caps && s === (side > 0 ? 60 : 4)) {
        const row = r * 8, en = (-side) as 1 | -1, ks = side > 0 ? 1 : 4, qs = side > 0 ? 2 : 8;
        if (!attacked(b, s, en)) {
          if (p.cr & ks && !b[row + 5] && !b[row + 6] && b[row + 7] === 4 * side && !attacked(b, row + 5, en) && !attacked(b, row + 6, en)) push(s, row + 6, 3);
          if (p.cr & qs && !b[row + 1] && !b[row + 2] && !b[row + 3] && b[row] === 4 * side && !attacked(b, row + 3, en) && !attacked(b, row + 2, en)) push(s, row + 2, 3);
        }
      }
    } else {
      for (const [dr, dc] of a === 3 ? DIAG : a === 4 ? ORTH : [...DIAG, ...ORTH]) {
        let rr = r + dr, cc = c + dc;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
          const t = b[rr * 8 + cc];
          if (t * side <= 0 && (!caps || t)) push(s, rr * 8 + cc);
          if (t) break;
          rr += dr; cc += dc;
        }
      }
    }
  }
  return out;
}

type Undo = { cap: number; cr: number; ep: number; h1: number; h2: number; moved: number };

// make/unmake in place; the fingerprint is updated with a handful of XORs, nothing is copied
export function make(p: Pos, m: Move): Undo {
  const { b } = p, v = b[m.f], u: Undo = { cap: b[m.t], cr: p.cr, ep: p.ep, h1: p.h1, h2: p.h2, moved: v };
  let a = p.h1, c = p.h2;
  const x = (pc: number, s: number) => { a ^= Z1[zi(pc, s)]; c ^= Z2[zi(pc, s)]; };
  a ^= ZC1[p.cr] ^ ZE1[p.ep < 0 ? 8 : p.ep & 7]; c ^= ZC2[p.cr] ^ ZE2[p.ep < 0 ? 8 : p.ep & 7];
  x(v, m.f);
  if (u.cap) x(u.cap, m.t);
  b[m.f] = 0;
  let put = v;
  if (m.k === 4) put = 5 * p.side;
  b[m.t] = put; x(put, m.t);
  if (m.k === 2) { const cs = m.t + 8 * p.side; x(b[cs], cs); u.cap = b[cs]; b[cs] = 0; }
  if (m.k === 3) {
    const row = m.t & ~7, [rf, rt] = (m.t & 7) === 6 ? [row + 7, row + 5] : [row, row + 3], rk = b[rf];
    b[rf] = 0; b[rt] = rk; x(rk, rf); x(rk, rt);
  }
  let cr = p.cr;
  const clear = (s: number) => { if (s === 60) cr &= ~3; else if (s === 4) cr &= ~12; else if (s === 63) cr &= ~1; else if (s === 56) cr &= ~2; else if (s === 7) cr &= ~4; else if (s === 0) cr &= ~8; };
  clear(m.f); clear(m.t);
  p.cr = cr;
  p.ep = m.k === 1 ? (m.f + m.t) >> 1 : -1;
  a ^= ZC1[p.cr] ^ ZE1[p.ep < 0 ? 8 : p.ep & 7]; c ^= ZC2[p.cr] ^ ZE2[p.ep < 0 ? 8 : p.ep & 7];
  a ^= ZS1; c ^= ZS2;
  p.h1 = a; p.h2 = c; p.side = (-p.side) as 1 | -1;
  return u;
}
export function unmake(p: Pos, m: Move, u: Undo) {
  const { b } = p;
  p.side = (-p.side) as 1 | -1;
  b[m.f] = u.moved; b[m.t] = 0;
  if (m.k === 2) { b[m.t + 8 * p.side] = u.cap; }
  else if (u.cap) b[m.t] = u.cap;
  if (m.k === 3) { const row = m.t & ~7, [rf, rt] = (m.t & 7) === 6 ? [row + 7, row + 5] : [row, row + 3]; b[rf] = b[rt]; b[rt] = 0; }
  p.cr = u.cr; p.ep = u.ep; p.h1 = u.h1; p.h2 = u.h2;
}
export function legal(p: Pos): Move[] {
  const side = p.side, out: Move[] = [];
  for (const m of pseudo(p)) { const u = make(p, m); if (!inCheck(p, side)) out.push(m); unmake(p, m, u); }
  return out;
}

export function evaluate(b: Int8Array) {
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const v = b[i]; if (!v) continue;
    const L = LETTERS[Math.abs(v)], r = i >> 3, c = i & 7;
    s += v > 0 ? VALUE[L] + PST[L][r][c] : -(VALUE[L] + PST[L][7 - r][c]);
  }
  return s;
}

type TT = { d: number; s: number; f: number; m: Move | null };
export function search(p: Pos, opt: { depth: number; ms: number; prune: boolean }, onDepth: (s: Stats) => void): Stats {
  const t0 = performance.now(), tt = new Map<number, TT>();
  let nodes = 0, cuts = 0, hits = 0, best: Move | null = null, score = 0;
  const INF = 1e9, stop = () => performance.now() - t0 > opt.ms;
  const order = (ms: Move[], b: Int8Array, ttm: Move | null) =>
    ms.map((m) => ({ m, v: ttm && ttm.f === m.f && ttm.t === m.t ? 1e9 : b[m.t] ? 1e5 + Math.abs(b[m.t]) * 10 - Math.abs(b[m.f]) : 0 })).sort((a, c) => c.v - a.v).map((e) => e.m);

  const q = (a: number, bt: number, ply: number): number => {
    nodes++;
    const sp = evaluate(p.b) * p.side;
    if (ply >= 8 || stop()) return sp;
    if (opt.prune) { if (sp >= bt) { cuts++; return bt; } if (sp > a) a = sp; }
    let bestq = sp;
    const side = p.side;
    for (const m of order(pseudo(p, true), p.b, null)) {
      const u = make(p, m);
      if (inCheck(p, side)) { unmake(p, m, u); continue; }
      const sc = -q(-bt, -a, ply + 1);
      unmake(p, m, u);
      if (sc > bestq) bestq = sc;
      if (opt.prune) { if (sc >= bt) { cuts++; return bt; } if (sc > a) a = sc; }
    }
    return opt.prune ? a : bestq;
  };

  const nega = (d: number, a: number, bt: number, ply: number): number => {
    nodes++;
    const key = hashKey(p), e = tt.get(key), a0 = a;
    if (e && e.d >= d && opt.prune) {
      hits++;
      if (e.f === 0) return e.s;
      if (e.f === 1) a = Math.max(a, e.s); else bt = Math.min(bt, e.s);
      if (a >= bt) return e.s;
    }
    if (d === 0) return q(a, bt, 0);
    const ms = legal(p);
    if (!ms.length) return inCheck(p, p.side) ? -INF + ply : 0;
    let bs = -INF, bm: Move | null = null;
    for (const m of order(ms, p.b, e?.m ?? null)) {
      const u = make(p, m);
      const sc = -nega(d - 1, -bt, -a, ply + 1);
      unmake(p, m, u);
      if (stop()) return bs === -INF ? 0 : bs;
      if (sc > bs) { bs = sc; bm = m; }
      if (opt.prune) { if (sc > a) a = sc; if (a >= bt) { cuts++; break; } }
    }
    if (opt.prune) tt.set(key, { d, s: bs, f: bs <= a0 ? 2 : bs >= bt ? 1 : 0, m: bm });
    if (ply === 0) best = bm;
    return bs;
  };

  for (let d = 1; d <= opt.depth; d++) {
    const prevBest = best;
    score = nega(d, -INF, INF, 0);
    if (stop() && d > 1) { best = prevBest; break; }
    onDepth({ depth: d, score: score * p.side, nodes, cutoffs: cuts, ttHits: hits, ms: performance.now() - t0, best });
  }
  return { depth: opt.depth, score: score * p.side, nodes, cutoffs: cuts, ttHits: hits, ms: performance.now() - t0, best };
}

export function perft(p: Pos, d: number): number {
  if (d === 0) return 1;
  let n = 0;
  for (const m of legal(p)) { const u = make(p, m); n += perft(p, d - 1); unmake(p, m, u); }
  return n;
}
