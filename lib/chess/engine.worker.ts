/// <reference lib="webworker" />
import { search, rehash, type Pos } from "./engine";

const ctx = self as unknown as Worker;
ctx.onmessage = (e: MessageEvent<{ b: number[]; side: 1 | -1; cr: number; ep: number; depth: number; ms: number; prune: boolean }>) => {
  const { b, side, cr, ep, depth, ms, prune } = e.data;
  const p: Pos = { b: Int8Array.from(b), side, cr, ep, h1: 0, h2: 0 };
  rehash(p);
  const res = search(p, { depth, ms, prune }, (s) => ctx.postMessage({ type: "depth", ...s }));
  ctx.postMessage({ type: "done", ...res });
};
